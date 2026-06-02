"""
picker.py - Smart Parking System Setup Script
Allows manual marking of parking slot rectangles on an image using mouse clicks.
Left-Click: Add rectangle (parking slot)
Right-Click: Remove last rectangle
Outputs: slot_coordinates.pickle
"""

import cv2
import pickle
import os
from typing import List, Tuple

class ParkingSlotPicker:
    def __init__(self, image_path: str):
        self.image_path = image_path
        self.original_image = cv2.imread(image_path)
        if self.original_image is None:
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        self.image = self.original_image.copy()
        self.rectangles: List[Tuple[int, int, int, int]] = []
        self.drawing = False
        self.start_point = None
        
    def mouse_callback(self, event, x, y, flags, param):
        """Mouse callback for drawing rectangles"""
        if event == cv2.EVENT_LBUTTONDOWN:
            # Left click - start drawing rectangle
            self.start_point = (x, y)
            self.drawing = True
            
        elif event == cv2.EVENT_MOUSEMOVE:
            if self.drawing and self.start_point:
                # Show preview of rectangle
                self.image = self.original_image.copy()
                self.redraw_rectangles()
                cv2.rectangle(self.image, self.start_point, (x, y), (0, 255, 0), 2)
                cv2.imshow("Parking Slot Picker", self.image)
                
        elif event == cv2.EVENT_LBUTTONUP:
            if self.drawing and self.start_point:
                # Complete rectangle
                x1, y1 = self.start_point
                x2, y2 = x, y
                
                # Normalize coordinates
                x_min, x_max = min(x1, x2), max(x1, x2)
                y_min, y_max = min(y1, y2), max(y1, y2)
                
                self.rectangles.append((x_min, y_min, x_max, y_max))
                self.drawing = False
                self.start_point = None
                
                self.image = self.original_image.copy()
                self.redraw_rectangles()
                cv2.imshow("Parking Slot Picker", self.image)
                print(f"✓ Slot added! Total slots: {len(self.rectangles)}")
                
        elif event == cv2.EVENT_RBUTTONDOWN:
            # Right click - remove last rectangle
            if self.rectangles:
                self.rectangles.pop()
                self.image = self.original_image.copy()
                self.redraw_rectangles()
                cv2.imshow("Parking Slot Picker", self.image)
                print(f"✗ Last slot removed! Total slots: {len(self.rectangles)}")
    
    def redraw_rectangles(self):
        """Draw all saved rectangles on the image"""
        for i, (x1, y1, x2, y2) in enumerate(self.rectangles, 1):
            cv2.rectangle(self.image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(self.image, f"#{i}", (x1 + 5, y1 + 25), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    def run(self):
        """Main execution method"""
        cv2.namedWindow("Parking Slot Picker")
        cv2.setMouseCallback("Parking Slot Picker", self.mouse_callback)
        cv2.imshow("Parking Slot Picker", self.image)
        
        print("\n" + "="*50)
        print("🅿️ PARKING SLOT PICKER")
        print("="*50)
        print("Left-Click: Add parking slot rectangle")
        print("Right-Click: Remove last slot")
        print("Press 'S' to save and exit")
        print("Press 'ESC' to exit without saving")
        print("="*50 + "\n")
        
        while True:
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord('s'):
                # Save coordinates
                self.save_coordinates()
                break
            elif key == 27:  # ESC
                print("❌ Exiting without saving...")
                break
        
        cv2.destroyAllWindows()
    
    def save_coordinates(self):
        """Save slot coordinates to pickle file"""
        output_file = "slot_coordinates.pickle"
        with open(output_file, 'wb') as f:
            pickle.dump(self.rectangles, f)
        print(f"\n✅ Saved {len(self.rectangles)} parking slots to '{output_file}'")
        print(f"Coordinates: {self.rectangles}")


if __name__ == "__main__":
    # Change this to your parking lot image
    IMAGE_PATH = "parking_lot_img.png"
    
    try:
        picker = ParkingSlotPicker(IMAGE_PATH)
        picker.run()
    except FileNotFoundError as e:
        print(f"Error: {e}")
