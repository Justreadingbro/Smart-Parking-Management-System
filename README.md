# Smart Parking Management System

## Overview

The Smart Parking Management System is an AI-powered solution designed to automate parking space monitoring and management. The system uses Computer Vision techniques with YOLOv8 and OpenCV to detect vehicles in real time, determine parking slot occupancy, and provide accurate parking status information through a web-based interface.

This project aims to improve parking space utilization, reduce manual monitoring efforts, and provide a scalable foundation for intelligent parking management systems.

---

## Features

* Real-time vehicle detection using YOLOv8
* Parking slot occupancy monitoring
* Automatic identification of vacant and occupied spaces
* Live parking status updates
* Web-based dashboard for monitoring
* Efficient parking space utilization
* Scalable and cost-effective architecture

---

## Technologies Used

### Backend

* Python
* Flask

### Computer Vision & AI

* YOLOv8
* OpenCV
* NumPy

### Frontend

* HTML
* CSS
* JavaScript

---

## System Architecture

1. Video stream is captured from a camera source.
2. Frames are processed using OpenCV.
3. YOLOv8 detects vehicles within the parking area.
4. Parking slots are analyzed to determine occupancy status.
5. Occupancy information is updated in real time.
6. Results are displayed through a web-based dashboard.

---

## Project Objectives

* Automate parking space monitoring.
* Reduce time spent searching for parking slots.
* Improve parking management efficiency.
* Provide accurate occupancy information in real time.
* Develop a scalable intelligent parking solution.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/Justreadingbro/Smart-Parking-Management-System.git
cd Smart-Parking-Management-System
```

### Create a Virtual Environment

```bash
python -m venv venv
```

### Activate the Environment

#### Windows

```bash
venv\Scripts\activate
```

#### Linux/macOS

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run the Application

```bash
python app.py
```

---

## Project Structure

```text
Smart-Parking-Management-System/
│
├── app.py
├── requirements.txt
├── README.md
├── static/
├── templates/
├── models/
├── parking_data/
└── parking_images/
```

---

## Future Enhancements

* Mobile application integration
* Reservation and booking system
* Cloud-based deployment
* Parking analytics and reporting
* Multi-camera support
* License plate recognition
* IoT sensor integration

---

## Academic Information

**Project Title:** Smart Parking Management System

**Degree:** Bachelor of Technology (B.Tech) in Computer Science and Engineering

**Institution:** Assam down town University

---

## License

This project is licensed under the MIT License.
