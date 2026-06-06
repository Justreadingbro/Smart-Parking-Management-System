import os
import time
import json
import pickle
import random
import string
import threading
from datetime import datetime
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import easyocr
from flask import Flask, Response
from flask_cors import CORS
from collections import defaultdict, Counter


CAMERA_URL = 'http://192.0.0.4:8080/video'  # For home wifi IP Webcam app
# CAMERA_URL = 'http://192.0.0.4:8080/video'  # Need to change in university
SLOT_FILE = 'slot_coordinates.pickle'
STREAM_HOST = '0.0.0.0'
STREAM_PORT = 8000
STREAM_CAM_ID = 1


latest_frames = {}
parking_slots = {}
parking_data = {}
# plate_cache = {}
parking_changed = False
DETECT_EVERY_N_FRAMES = 5
last_detection = []
# last_ocr_time = {}
OCR_INTERVAL = 2  # seconds
# OCR_RETRY_INTERVAL = 1  # seconds
# MAX_OCR_ATTEMPTS = 5
last_ocr_attempt = {}
last_seen_time = {}
FREE_GRACE_SECONDS = 60
ocr_history = defaultdict(list)
OCR_CONFIRM_COUNT = 3
OCR_HISTORY_LIMIT = 5
parking_history = []


def generate_random_plate():
    state = random.choice(['DL', 'MH', 'KA', 'TN', 'UP', 'GJ'])
    number = ''.join(random.choices(string.digits, k=2))
    letters = ''.join(random.choices(string.ascii_uppercase, k=2))
    final = ''.join(random.choices(string.digits, k=4))
    return f"{state}-{number}-{letters}-{final}"


def point_in_rectangle(point, rect):
    x, y = point
    xs = [p[0] for p in rect]
    ys = [p[1] for p in rect]
    return min(xs) <= x <= max(xs) and min(ys) <= y <= max(ys)


def init_parking_slots(slot_file=SLOT_FILE):

    global parking_slots

    def normalize_coords(coords):
        if all(isinstance(pt, (list, tuple)) and len(pt) == 2 for pt in coords):
            return [(int(pt[0]), int(pt[1])) for pt in coords]
        if all(isinstance(n, int) or str(n).isdigit() for n in coords):
            if len(coords) % 2 != 0:
                raise ValueError("Odd number of coordinates in slot file")
            it = iter(coords)
            pairs = [(int(x), int(y)) for x, y in zip(it, it)]
            return pairs
        raise ValueError(f"Unknown coordinate format: {coords}")
    parking_slots = {}
    if os.path.exists(slot_file):
        with open(slot_file, "rb") as f:
            raw = pickle.load(f)
        # if dict format
        if isinstance(raw, dict):
            for slot_id, data in raw.items():
                coords = data.get("coords", data)
                parking_slots[slot_id] = {"coords": normalize_coords(coords)}
        elif isinstance(raw, list):
            for i, coords in enumerate(raw):
                slot_id = f"A-{i+1:03d}"
                parking_slots[slot_id] = {"coords": normalize_coords(coords)}
        else:
            print(" Slot file unreadable, switching to demo defaults")
    else:
        print(" Slot file not found, creating demo slots")
        for i in range(1, 17):
            sid = f"A-{i:03d}"
            parking_slots[sid] = {
                "coords": [(100 + (i-1)*50, 100),
                           (150 + (i-1)*50, 100),
                           (150 + (i-1)*50, 150),
                           (100 + (i-1)*50, 150)]
            }
    print(f" Loaded {len(parking_slots)} parking slots (normalized)")

# Initialize models


print(" Checking CUDA availability...")
USE_CUDA = torch.cuda.is_available()
print(f" torch.cuda.is_available(): {USE_CUDA}")
if USE_CUDA:
    print(f" Device: {torch.cuda.get_device_name(0)}")

print(" Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')

try:
    if USE_CUDA:
        model.to('cuda')
        print(" Moved YOLOv8 model to CUDA")
    else:
        print(" YOLOv8 running on CPU")
except Exception as e:
    print(f" Warning: could not move model to cuda: {e}")

print(" Loading EasyOCR reader...")

try:
    reader = easyocr.Reader(['en'], gpu=USE_CUDA)
    print(f" EasyOCR reader initialized (gpu={USE_CUDA})")
except Exception as e:
    print(f" EasyOCR initialization error: {e}")
    try:
        reader = easyocr.Reader(['en'], gpu=False)
        print(" EasyOCR fallback to CPU")
    except Exception as e2:
        print(f" EasyOCR fallback failed: {e2}")
        reader = None

stream_app = Flask("video_stream_proxy")
CORS(stream_app)

camera_status = {"1": "offline"}


@stream_app.route("/camera_status")
def api_camera_status():
    """Return real-time camera health for frontend."""
    return json.dumps(camera_status), 200, {"Content-Type": "application/json"}


def jpeg_generator(cam_id):
    boundary = "--frame"
    while True:
        jpg = latest_frames.get(cam_id)
        if jpg is None:
            placeholder = np.zeros((480, 640, 3), dtype=np.uint8)
            _, buf = cv2.imencode('.jpg', placeholder)
            jpg = buf.tobytes()
        yield (b'%s\r\nContent-Type: image/jpeg\r\nContent-Length: %d\r\n\r\n' % (boundary.encode(), len(jpg))) + jpg + b'\r\n'


@stream_app.route('/video_feed/<int:cam_id>')
def video_feed(cam_id: int):
    return Response(jpeg_generator(cam_id),
                    mimetype='multipart/x-mixed-replace; boundary=--frame')


def run_stream_app(host=STREAM_HOST, port=STREAM_PORT):
    stream_app.run(host=host, port=port, threaded=True, use_reloader=False)


def extract_license_plate(frame, car_bbox, debug_save=False):
    if car_bbox is None or reader is None:
        return None
    x1, y1, x2, y2 = car_bbox
    h, w = frame.shape[:2]
    x1i = max(0, int(x1))
    y1i = max(0, int(y1))
    x2i = min(w - 1, int(x2))
    y2i = min(h - 1, int(y2))
    if x2i <= x1i or y2i <= y1i:
        return None
    car_roi = frame[y1i:y2i, x1i:x2i]
    if car_roi.size == 0:
        return None
    height = car_roi.shape[0]
    candidates = [
        car_roi[int(height * 0.6):, :],
        car_roi
    ]
    for idx, plate_roi in enumerate(candidates):
        try:
            gray = cv2.cvtColor(plate_roi, cv2.COLOR_BGR2GRAY)
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            gray = clahe.apply(gray)
            _, th = cv2.threshold(
                gray, 120, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            feed_img = th
            if debug_save:
                dbg_name = f"debug_plate_{int(time.time())}_{idx}.jpg"
                cv2.imwrite(dbg_name, feed_img)
                print(f" Saved OCR debug ROI: {dbg_name}")
            results = reader.readtext(feed_img)
            if results:
                plate_text = ''.join([t[1] for t in results])
                plate_text = ''.join(
                    c for c in plate_text if c.isalnum() or c == '-')
                plate_text = plate_text.strip().upper()
                if len(plate_text) > 3:
                    print(f" OCR result: {plate_text} raw:{results}")
                    return plate_text
                else:
                    print(f" OCR too short: '{plate_text}' raw:{results}")
        except Exception as e:
            print(f" OCR Exception on ROI {idx}: {e}")
    return None


def detect_cars_and_occupancy(frame):
    results = model(frame, conf=0.5)
    current_occupancy = {}
    detections = []
    for result in results:
        for box in result.boxes:
            try:
                cls_id = int(box.cls)
            except Exception:
                cls_id = int(box.cls.cpu().numpy()) if hasattr(
                    box.cls, 'cpu') else int(box.cls)
            if cls_id == 2:  # car
                xy_raw = box.xyxy[0]
                if hasattr(xy_raw, 'cpu'):
                    xy = xy_raw.cpu().numpy()
                else:
                    xy = np.array(xy_raw)
                x1, y1, x2, y2 = float(xy[0]), float(
                    xy[1]), float(xy[2]), float(xy[3])
                cx, cy = (x1 + x2) / 2.0, (y1 + y2) / 2.0
                detections.append({'bbox': (x1, y1, x2, y2), 'center': (
                    cx, cy), 'confidence': float(box.conf)})
    for slot_id, slot_info in parking_slots.items():
        is_occupied = False
        occupied_car = None
        coords = slot_info.get('coords') if isinstance(
            slot_info, dict) else slot_info
        try:
            pts = [(int(p[0]), int(p[1])) for p in coords]
        except Exception:
            pts = coords
        for detection in detections:
            if point_in_rectangle(detection['center'], pts):
                is_occupied = True
                occupied_car = detection
                break
        current_occupancy[slot_id] = {
            'occupied': is_occupied, 'car': occupied_car}
    return current_occupancy, detections


def async_ocr(frame, bbox, slot_id):
    global parking_changed
    try:
        text = extract_license_plate(frame, bbox, debug_save=True)
        if not text:
            return
        # Normalize common OCR mistakes
        text = text.replace(' ', '')
        text = text.replace('O', '0').replace('I', '1')
        history = ocr_history[slot_id]
        history.append(text)
        # keep history short
        if len(history) > OCR_HISTORY_LIMIT:
            history.pop(0)
        counts = Counter(history)
        best_plate, freq = counts.most_common(1)[0]
        print(f"OCR TRY: {text} | Best so far: {best_plate} ({freq})")
        # ✅ Lock plate only if repeated enough times
        if freq >= OCR_CONFIRM_COUNT:
            parking_data[slot_id]['license_plate'] = best_plate
            parking_data[slot_id]['licensePlate'] = best_plate
            parking_changed = True
            print(f"✅ OCR LOCKED: {best_plate}")
    except Exception as e:
        print(f"OCR thread error: {e}")


def update_parking_data(occupancy_data, frame):
    global parking_changed
    now = time.time()
    timestamp = datetime.now()
    for slot_id, info in occupancy_data.items():
        is_occupied = info['occupied']
        car = info['car']
        if slot_id not in parking_data:
            parking_data[slot_id] = {
                'status': 'available',
                'license_plate': '',
                'licensePlate': '',
                'entry_time': None,
                'entryTime': None,
                'amount': 0,
                'bill': 0
            }
        current_status = parking_data[slot_id]['status']
        if is_occupied:
            last_seen_time[slot_id] = now
            if current_status != 'occupied':
                print(f" Slot {slot_id} is now OCCUPIED")
                parking_data[slot_id].update({
                    'status': 'occupied',
                    'entry_time': timestamp.isoformat(),
                    'entryTime': timestamp.isoformat(),
                    'amount': 50,
                    'bill': 50
                })
                last_ocr_attempt[slot_id] = 0
                parking_changed = True
            # OCR retry while car present
            last_try = last_ocr_attempt.get(slot_id, 0)
            plate = parking_data[slot_id]['licensePlate']
            confirmed = (
                plate != '' and
                ocr_history[slot_id].count(plate) >= OCR_CONFIRM_COUNT
            )
            if not confirmed and car is not None and (now - last_try) >= OCR_INTERVAL:
                last_ocr_attempt[slot_id] = now
                threading.Thread(
                    target=async_ocr,
                    args=(frame.copy(), car['bbox'], slot_id),
                    daemon=True
                ).start()
            # Billing
            entry = datetime.fromisoformat(parking_data[slot_id]['entryTime'])
            elapsed = int((timestamp - entry).total_seconds())
            parking_data[slot_id]['amount'] = 50 + elapsed
            parking_data[slot_id]['bill'] = 50 + elapsed

        # ================= FREE =================
        else:
            last_seen = last_seen_time.get(slot_id, 0)
            if current_status == 'occupied' and (now - last_seen) > FREE_GRACE_SECONDS:
                print(f" Slot {slot_id} is now FREE")

                parking_history.append({
                    "id": str(int(time.time() * 1000)),
                    "slotId": slot_id,
                    "licensePlate": parking_data[slot_id]["licensePlate"],
                    "entryTime": parking_data[slot_id]["entryTime"],
                    "exitTime": timestamp.isoformat(),
                    "amount": parking_data[slot_id]["amount"],
                    "status": "completed"
                })

                parking_data[slot_id]['status'] = 'available'

                parking_changed = True

    # ================= SAVE JSON =================
    if parking_changed:
        out_path = os.path.join(os.path.dirname(__file__), 'parking_data.json')
        with open(out_path, 'w') as f:
            json.dump({
                "slots": parking_data,
                "history": parking_history
            }, f, indent=2)
        parking_changed = False


def draw_visualization(frame, occupancy_data, detections):
    for det in detections:
        x1, y1, x2, y2 = det['bbox']
        x1i, y1i, x2i, y2i = int(x1), int(y1), int(x2), int(y2)
        cv2.rectangle(frame, (x1i, y1i), (x2i, y2i), (0, 255, 0), 2)
        cv2.putText(frame, f"{det['confidence']:.2f}", (x1i, y1i - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
    # Draw one big slot state (full-frame mode)
    for slot_id, info in occupancy_data.items():
        occupied = info.get("occupied", False)
        color = (0, 0, 255) if occupied else (0, 255, 0)
        status = "OCCUPIED" if occupied else "AVAILABLE"
        cv2.putText(
            frame,
            f"{slot_id} : {status}",
            (10, 35),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            color,
            3
        )
        # Full-frame border (visual clarity)
        cv2.rectangle(frame, (5, 5), (635, 475), color, 3)
    return frame


def main():
    init_parking_slots(SLOT_FILE)
    CAMERA_MAP = {}
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        camera_map_path = os.path.join(script_dir, "camera_map.json")
        if os.path.exists(camera_map_path):
            with open(camera_map_path, "r") as f:
                CAMERA_MAP = json.load(f)
            print(f" Loaded camera_map.json: {CAMERA_MAP}")
        else:
            CAMERA_MAP = {str(STREAM_CAM_ID): f"A-{1:03d}"}
            print(
                f" No camera_map.json found. Using default map: {CAMERA_MAP}")
    except Exception as e:
        print(f" Error loading camera_map.json: {e}")
        CAMERA_MAP = {str(STREAM_CAM_ID): f"A-{1:03d}"}
    stream_thread = threading.Thread(target=run_stream_app, kwargs={
                                     'host': STREAM_HOST, 'port': STREAM_PORT}, daemon=True)
    stream_thread.start()
    print(
        f" Video stream proxy started at http://{STREAM_HOST}:{STREAM_PORT}/video_feed/{STREAM_CAM_ID}")
    print(f" Connecting to camera: {CAMERA_URL}")
    cap = cv2.VideoCapture(CAMERA_URL)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    if not cap.isOpened():
        print(" ERROR: Cannot open camera stream. Check URL and network.")
        print(" Using demo mode with placeholder...")
        demo_mode = True
    else:
        demo_mode = False
    frame_count = 0
    try:
        while True:
            if demo_mode:
                frame = np.ones((480, 640, 3), dtype=np.uint8) * 50
                cv2.putText(frame, "Camera Feed Demo (Connect IP Webcam)",
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                camera_status[str(STREAM_CAM_ID)] = "offline"
                detections = []
            else:
                for _ in range(3):
                    cap.grab()
                ret, frame = cap.retrieve()
                if not ret or frame is None:
                    camera_status[str(STREAM_CAM_ID)] = "offline"
                    print("Failed to read frame")
                    time.sleep(1.0)
                    continue
                camera_status[str(STREAM_CAM_ID)] = "ok"
                try:
                    frame = cv2.resize(frame, (640, 480))
                except Exception:
                    pass
                try:
                    global last_detection
                    if frame_count % DETECT_EVERY_N_FRAMES == 0:
                        occ_from_detector, detections = detect_cars_and_occupancy(
                            frame)
                        last_detection = detections
                    else:
                        detections = last_detection
                    if isinstance(detections, dict) and 'car' in detections:
                        detections_list = []
                        for v in occ_from_detector.values():
                            if v and isinstance(v, dict) and v.get('car'):
                                detections_list.append(v['car'])
                        detections = detections_list
                except Exception as e:
                    print(f" Detection error: {e}")
                    detections = []
            slot_id = CAMERA_MAP.get(str(STREAM_CAM_ID), f"A-{1:03d}")
            is_occupied = len(detections) > 0
            occupied_car = detections[0] if len(detections) > 0 else None
            occupancy_data = {
                slot_id: {
                    'occupied': is_occupied,
                    'car': occupied_car
                }
            }
            update_parking_data(occupancy_data, frame)
            frame = draw_visualization(frame, occupancy_data, detections)
            try:
                _, jpeg_buf = cv2.imencode('.jpg', frame)
                latest_frames[STREAM_CAM_ID] = jpeg_buf.tobytes()
            except Exception as e:
                print(f" Error encoding frame for stream: {e}")
            # try:
            #    cv2.imshow('Smart Parking System - Backend', frame) # need to remove
            # except Exception:
            #    pass
            frame_count += 1
            if frame_count % 30 == 0:
                print(
                    f" Processed {frame_count} frames - camera_status={camera_status.get(str(STREAM_CAM_ID))}")
            # if cv2.waitKey(1) & 0xFF == ord('q'):
            #    break
            # time.sleep(0.03)
    except KeyboardInterrupt:
        print(" Interrupted by user")
    finally:
        if not demo_mode and cap is not None:
            cap.release()
        cv2.destroyAllWindows()
        print(" Backend shutdown complete")


if __name__ == "__main__":
    main()
