# PicMe – Online Photobooth
### **1. Executive Summary**


With the increase of popularity in photo booths due to the entertainment and source of instant, shareable memories they offer, the issue of rising costs and inaccessibility emerges. 

PicMe is a browser-based photo booth built to tackle these issues. The app lets users take photos directly from their webcam, apply filters, choose layouts, add simple frames, and download the final image, all inside the browser. The website is free and accessible through a deployed URL. 

Everything is containerized, easy to run, and designed to be fully reproducible with either a single command or a click of a URL.

---

## 2. System Overview

PicMe uses **WebRTC** for webcam access, **HTML Canvas** for processing images, and a lightweight **Flask** backend for routing and logging.  
The whole project runs inside Docker using a one-command `./run.sh` script. 

### Core Features
- Live webcam preview  
- Countdown before capturing  
- Filters: None, Black & White, Warm, Cool  
- Layouts: Single photo, Photo strip, 2×2 grid  
- Frames: Color wheel to choose frame color
- Download final image as PNG  
- Backend logging (layout, filter, frame, timestamp)  

This setup matches DS 2022 learning outcomes (APIs, environment variables, logging, Docker reproducibility).

---

**System Architecture**

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

**Repository Structure**

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

## 3. Running the Project

### Docker

From the repo root:

1) Build the image
```
docker build -t picme .
```

2) Run the container
```
docker run --rm -p 8080:8080 picme
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

### URL Deployment
You can also run PicMe directly in your browser: 
 
- Live URL: https://picme-ahcj.onrender.com

Note: Render free instances may "sleep" when inactive, so the first load can take up to 1 minute. 

This is just for development; Docker is the official way.
---

## 4. Design Decisions

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

### Security and Privacy
1) Camera Access: PicMe only requests camera permission in your browser when you click **Start Photobooth**. 
2) No photo uploads by default: Captured photos are processed client-side in the browser, the server does not receive or store image files. 
3) The app does not require accounts, passwords, or access to files on your device. 
4) The deployed Render site utilizes HTTPS, so traffic between the browser and server is encrypted in transit. 

---

## 5. Results

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

## 6. Future Improvements

If we expanded the project further, we’d consider:
- PNG overlay frames (Polaroid / party frames)
- Stickers and draggable elements
- QR code sharing or link-based sharing
- Saving a local gallery to the backend

---

## 7. Links
- [GitHub Repository](https://github.com/Alish-12/PicMe)
- [Public Cloud App](https://picme-ahcj.onrender.com)