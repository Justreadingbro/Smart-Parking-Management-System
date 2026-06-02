"""
demo_generator.py - Generate demo parking lot image
Creates a simple parking lot layout for testing if you don't have a real image
"""

import cv2
import numpy as np

def create_demo_parking_lot():
    """Create a demo parking lot image with grid layout"""
    # Create image
    width, height = 1280, 720
    img = np.ones((height, width, 3), dtype=np.uint8) * 240
    
    # Draw title
    cv2.putText(img, "Smart Parking Lot - Demo Layout", (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.5, (0, 0, 0), 2)
    
    # Draw parking slots grid (4x4 layout)
    slot_width = 200
    slot_height = 120
    start_x = 100
    start_y = 120
    gap = 20
    
    slot_number = 1
    for row in range(4):
        for col in range(4):
            x = start_x + col * (slot_width + gap)
            y = start_y + row * (slot_height + gap)
            
            # Draw slot rectangle
            cv2.rectangle(img, (x, y), (x + slot_width, y + slot_height), (100, 100, 100), 2)
            
            # Draw slot number
            text = f"Slot {slot_number}"
            cv2.putText(img, text, (x + 50, y + 70),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (50, 50, 50), 1)
            
            slot_number += 1
    
    # Save image
    output_path = "parking_lot_img.png"
    cv2.imwrite(output_path, img)
    print(f"✅ Demo parking lot image created: {output_path}")
    print(f"   Size: {width}x{height} pixels")
    print(f"   Slots: 4x4 grid (16 slots)")
    print("\nNow run: python picker.py")

if __name__ == "__main__":
    create_demo_parking_lot()
