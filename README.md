# 📸 PicMe – Online Photobooth

PicMe is a browser-based photobooth built for **DS 2022**.  
The app lets users take photos directly from their webcam, apply filters, choose layouts, add simple frames, and download the final image — all inside the browser.

Everything is containerized, easy to run, and designed to be fully reproducible with a single command.

---

## 1. Overview

PicMe uses **WebRTC** for webcam access, **HTML Canvas** for processing images, and a lightweight **Flask** backend for routing and logging.  
The whole project runs inside Docker using a one-command `./run.sh` script.

### Core Features
- Live webcam preview  
- Countdown before capturing  
- Filters: None, Black & White, Warm, Cool  
- Layouts: Single photo, Photo strip, 2×2 grid  
- Frames: Simple borders  
- Download final image as PNG  
- Backend logging (layout, filter, frame, timestamp)  

This setup matches DS 2022 learning outcomes (APIs, environment variables, logging, Docker reproducibility).

---

## 2. System Architecture

```
Frontend (HTML/CSS/JS)
│
│  - WebRTC camera feed
│  - Canvas-based capture + filtering
│  - Layout and frame rendering
│  - Sends metadata to Flask API
│
▼ fetch()
Flask Backend
│
│  - Serves index.html
│  - /api/health → health check
│  - /api/log-event → structured logging
│  - Uses Config() for environment variables
│
▼
Docker Runtime
│
│  - python:3.12-slim base
│  - Gunicorn to serve Flask
│  - Fully reproducible via ./run.sh
```

---

## 3. Repository Structure

```
PicMe/
├── src/
│   ├── app.py                # Flask app / routing
│   ├── config.py             # Env variable configuration
│   ├── templates/
│   │   └── index.html        # Main UI
│   └── static/
│       ├── css/styles.css    # Styling
│       └── js/main.js        # Frontend logic (filters, layouts, canvas)
├── tests/                    # Basic health endpoint tests
├── requirements.txt
├── Dockerfile
├── run.sh                    # One-command run script
├── .env.example
└── README.md
```

---

## 4. Running the Project

### ⭐ Recommended (used for grading): Docker

From the repo root:

```bash
./run.sh
```

Then visit:

```
http://localhost:8080
```

If the script is not yet executable:

```bash
chmod +x run.sh
./run.sh
```

Docker builds the image, installs dependencies, and launches the app using Gunicorn.

---

### Optional: Run locally (without Docker)

This is just for development; Docker is the official way.

```bash
python -m venv venv
source venv/bin/activate       # Mac/Linux
# or .\venv\Scripts\activate   # Windows
pip install -r requirements.txt
export FLASK_APP=src.app
flask run --port 8080
```

---

## 5. Design Decisions

### Flask Backend
We purposely kept the backend small and readable. It handles:
- The homepage  
- Logging API (`/api/log-event`)  
- Health check endpoint (`/api/health`)  
- Environment variables via `config.py`  

This keeps the focus on system behavior rather than heavy backend logic.

### Frontend Image Processing
All image processing happens entirely in the browser:
- Webcam feed via `getUserMedia`
- Filters applied using CSS + canvas filters
- Layouts created by drawing the frame multiple times on canvas
- Frames drawn as rectangles on top of the final image
- Final PNG exported using `canvas.toDataURL()`

This approach is fast, private, and avoids sending images to the server.

### Logging & Observability
Each capture triggers a JSON POST request containing data like:

```json
{
  "layout": "strip",
  "filter": "bw",
  "frame": "simple",
  "timestamp": "2025-11-18T02:34:56.789Z"
}
```

This satisfies DS 2022’s structured logging and simple API criteria.

### Docker
The project is fully containerized:
- Uses `python:3.12-slim`
- Installs dependencies
- Runs Flask through Gunicorn
- Exposes port 8080
- Starts with `./run.sh`

This ensures the grader’s environment matches ours exactly.

---

## 6. Results

### What Works
- Smooth real-time webcam preview  
- Filters apply to both preview and final image  
- Layouts (single, strip, grid) are rendered correctly  
- Simple frames draw cleanly on top of the photo  
- Download is instant  
- Logging functions as expected  
- Whole app launches reliably with one command  

### Sample Output
(Add screenshots here)

---

## 7. Future Improvements

If we expanded the project further, we’d consider:
- Multi-shot real photo strips
- PNG overlay frames (Polaroid / party frames)
- Stickers and draggable elements
- QR code sharing or link-based sharing
- Saving a local gallery to the backend
- Cloud deployment using our existing Docker setup

---

## 8. References

- [Flask Documentation](https://flask.palletsprojects.com/)
- [MDN WebRTC – getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D)
- [Docker Documentation](https://docs.docker.com/)
- DS 2022 Final Case Project Spec (provided separately)
- [GitHub Repository](https://github.com/Alish-12/PicMe)