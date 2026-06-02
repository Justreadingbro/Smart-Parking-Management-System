import subprocess
import os
import sys
import time
import platform

def check_dependencies():
    """Check if required Python packages are installed"""
    print("\n" + "="*60)
    print("SMART PARKING SYSTEM - Dependency Check")
    print("="*60 + "\n")
    
    required_packages = ['cv2', 'ultralytics', 'easyocr', 'numpy']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"✓ {package} is installed")
        except ImportError:
            print(f"✗ {package} is NOT installed")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("\nInstall with:")
        print("  pip install -r requirements.txt")
        return False
    
    print("\n✅ All dependencies are installed!\n")
    return True

def start_backend():
    """Start the backend vision system"""
    print("="*60)
    print("Starting Smart Parking Backend")
    print("="*60 + "\n")
    
    print("Prerequisites:")
    print("1. Save your parking lot image as 'parking_lot_img.png' in this directory")
    print("2. Run 'python picker.py' to define parking slots (if not done)")
    print("3. Connect your IP Webcam and update the URL in backend.py")
    print("\n")
    
    response = input("Press Enter to start the backend, or 'Q' to quit: ").strip().upper()
    
    if response == 'Q':
        print("Exiting setup...")
        return False
    
    try:
        print("\nStarting backend.py...")
        print("(Press Ctrl+C to stop the backend)\n")
        subprocess.run([sys.executable, 'backend_v2.py'])
    except KeyboardInterrupt:
        print("\n\nBackend stopped by user.")
    except Exception as e:
        print(f"Error starting backend: {e}")
    
    return True

def main():
    """Main execution"""
    print("\n")
    print("""
    ╔══════════════════════════════════════════════════════════╗
    ║          SMART PARKING SYSTEM - Setup & Launch           ║
    ║      University Project using YOLOv8 & EasyOCR          ║
    ╚══════════════════════════════════════════════════════════╝
    """)
    
    # Check dependencies
    if not check_dependencies():
        print("\n❌ Please install missing dependencies first:")
        print("   pip install -r requirements.txt")
        sys.exit(1)
    
    # Show setup options
    print("\nAvailable Tools:")
    print("1. Start Backend Vision System")
    print("2. Setup Parking Slots (Picker Tool)")
    print("3. View Dashboard (Frontend Instructions)")
    print("4. Exit")
    
    choice = input("\nSelect an option (1-4): ").strip()
    
    if choice == "1":
        start_backend()
    elif choice == "2":
        print("\nStarting Parking Slot Picker...")
        print("(Define parking slots on your parking lot image)\n")
        try:
            subprocess.run([sys.executable, 'picker.py'])
        except Exception as e:
            print(f"Error: {e}")
    elif choice == "3":
        print("\n" + "="*60)
        print("FRONTEND DASHBOARD - Setup Instructions")
        print("="*60)
        print("""
The React dashboard is already running!

1. Open your browser and go to: http://localhost:3000

2. Pages available:
   - Dashboard: Main parking slot overview
   - Live Feeds: Camera streams from all angles
   - History: Transaction and parking history
   - Analytics: Revenue and occupancy reports
   - Settings: Configure camera URLs and billing

3. To use real camera feeds:
   - Update IP Webcam URL in Settings page
   - Or edit backend.py line: camera_url = 'http://192.168.X.X:8080/video'

4. Features:
   - Real-time slot occupancy (Green=Free, Red=Occupied)
   - License plate detection via EasyOCR
   - Live billing calculation (₹50 + ₹1 per second)
   - Dark Mode & Cappuccino Mode themes
   - Click any slot to see camera feed and billing details
        """)
        input("\nPress Enter to continue...")
    elif choice == "4":
        print("Goodbye!")
        sys.exit(0)
    else:
        print("Invalid option. Please try again.")

if __name__ == "__main__":
    main()
