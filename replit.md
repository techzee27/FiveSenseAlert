# Emergency Alert Application

## Overview
A Flask-based emergency alert web application that uses AI-powered hand gesture detection to trigger emergency alerts. When a user shows 5 fingers to the camera, the app automatically records a 5-second video, captures the user's location, and sends an emergency message with the video to a WhatsApp number via the WhatsApp Cloud API.

## Tech Stack
- **Backend**: Flask (Python 3.11)
- **Frontend**: HTML5, CSS3, JavaScript
- **AI Detection**: MediaPipe Hands (client-side)
- **APIs**: WhatsApp Cloud API, Browser Geolocation API
- **Video**: MediaRecorder API (browser-native)

## Features
- Automatic camera activation on page load
- Real-time 5-finger gesture detection using MediaPipe Hands
- Automatic 5-second video recording when gesture detected
- Browser-based geolocation capture
- WhatsApp Cloud API integration for emergency alerts
- Live status display and visual feedback
- Success confirmation after alert sent

## Project Structure
```
/
├── app.py                 # Flask backend
├── requirements.txt       # Python dependencies
├── static/
│   ├── css/
│   │   └── style.css     # Styling
│   └── js/
│       └── app.js        # Frontend logic & MediaPipe
├── templates/
│   └── index.html        # Main page
└── uploads/              # Temporary video storage
```

## Setup Requirements
1. WhatsApp Cloud API credentials:
   - WHATSAPP_PHONE_NUMBER_ID
   - WHATSAPP_ACCESS_TOKEN
   - WHATSAPP_RECIPIENT_NUMBER

## Recent Changes
- Initial project setup (November 02, 2025)
- Flask backend created
- MediaPipe Hands integration for gesture detection
- Video recording and location capture implemented
- WhatsApp Cloud API integration added
