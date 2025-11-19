📸 PicMe – Online Photobooth
A containerized Flask + WebRTC photobooth for our Systems Final Project.

1. Executive Summary

PicMe is a browser-based photobooth application that allows users to take photos directly from their webcam, apply filters, choose layouts, and download the final image. The app is built using:
Frontend: HTML, CSS, JavaScript, WebRTC (getUserMedia())
Backend: Flask + JSON logging
Infrastructure: Docker containerization with a one-command reproducible run
Course Concepts Implemented: Flask API, logging/observability, environment variables, Docker containerization.

2. System Overview
Architecture Diagram (Text Version)
┌──────────────────────────────────────────────┐
│                   Frontend                   │
│  - index.html                                 │
│  - styles.css                                 │
│  - main.js                                    │
│  Uses camera → draws to canvas → download     │
│  Sends JSON metadata to backend /api/log-event│
└──────────────────────────────────────────────┘
                     ↓ fetch()
┌──────────────────────────────────────────────┐
│                  Flask API                   │
│   /api/health  → health check                 │
│   /api/log-event → logs capture metadata      │
│   Structured JSON logging                     │
└──────────────────────────────────────────────┘
                     ↓
┌──────────────────────────────────────────────┐
│                  Docker Runtime               │
│   - python:3.12-slim                          │
│   - Gunicorn                                  │
│   - Fully reproducible run via run.sh         │
└──────────────────────────────────────────────┘

Functional Features:
📷 Live webcam preview
⏳ Countdown (3 → 2 → 1 → Smile!)
🎨 Filters: None, B&W, Warm, Cool
🖼️ Layout selector (single implemented, others prepared in UI)
💾 Download final image
🧾 Backend logging of layout/filter/frame/timestamp
🐳 One-command Docker run

3. How to Run
Using Docker (Recommended)
./run.sh
Then visit:
http://localhost:8080
If the script isn't executable yet:
chmod +x run.sh
./run.sh

4. Design Decisions
Flask API
Chosen for simplicity, clarity, and alignment with course material. It handles:
Health endpoint
JSON logging endpoint
Template + static file routing
Configurable environment variables
Client-Side Processing

All image data stays inside the browser:
Faster
More private
Reduces backend complexity
Perfect for a lightweight systems project
Logging
Logs capture metadata from the user session, formatted as JSON for readability and grading.
Docker
Ensures a reproducible, consistent environment
Mirrors real deployment pipelines
Matches the “one-command run” requirement

5. Results & Evaluation Performance
Instant load time (static assets served by Flask)
Stable camera access in Chrome/Safari
Responsive UI and smooth capture flow

Sample Output: 
(ADD HERE)

6. What’s Next
Potential extensions include:
Multi-photo strips & 2×2 grid
PNG frame overlays
Sticker/emoji layer
Saving images to server
QR code sharing
Cloud deployment (Render/Fly.io/Azure)

7. References & Links
Flask Documentation
WebRTC MediaDevices API
Docker Documentation
UVA Systems Final Case Project Spec
Repository Link: (ADD your repo link here once finalized)
