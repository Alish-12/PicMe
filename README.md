# 📸 PicMe – Online Photobooth
*A containerized Flask + WebRTC photobooth for our Systems Final Project.*

---

## 1. Executive Summary

PicMe is a browser-based photobooth application that allows users to take photos directly from their webcam, apply filters, choose layouts, and download the final image.

This project includes:

- **Frontend:** HTML, CSS, JavaScript, WebRTC (`getUserMedia()`)
- **Backend:** Flask API with JSON logging
- **Infrastructure:** Docker containerization with a one-command reproducible run
- **Course Concepts Implemented:** Flask API, logging/observability, environment variables, Docker containerization

---

## 2. System Overview

### 📐 Architecture Diagram (Text Version)
┌──────────────────────────────────────────────┐
│ Frontend │
│ - index.html │
│ - styles.css │
│ - main.js │
│ Uses camera → draws to canvas → download │
│ Sends JSON metadata to backend /api/log-event│
└──────────────────────────────────────────────┘
↓ fetch()
┌──────────────────────────────────────────────┐
│ Flask API │
│ /api/health → health check │
│ /api/log-event → logs capture metadata │
│ Structured JSON logging │
└──────────────────────────────────────────────┘
↓
┌──────────────────────────────────────────────┐
│ Docker Runtime │
│ - python:3.12-slim │
│ - Gunicorn │
│ - Fully reproducible run via run.sh │
└──────────────────────────────────────────────┘

---

### ✨ Functional Features

- 📷 Live webcam preview  
- ⏳ Countdown (3 → 2 → 1 → Smile!)  
- 🎨 Filters: None, B&W, Warm, Cool  
- 🖼️ Layout selector (single implemented; others planned)  
- 💾 Download final image  
- 🧾 Backend logging of layout/filter/frame/timestamp  
- 🐳 One-command Docker run  

---

## 3. How to Run

### ▶️ Using Docker (Recommended)

```bash
./run.sh

Then visit:
http://localhost:8080

If the script isn't executable yet, then:
chmod +x run.sh
./run.sh

## 4. Design Decisions

### 🧩 Flask API
Flask was chosen for simplicity, clarity, and direct alignment with course material.

Flask is responsible for:
- **Health endpoint** (`/api/health`)
- **JSON logging endpoint** (`/api/log-event`)
- **Template rendering** (serving `index.html`)
- **Static asset routing** (CSS, JS, images)
- **Environment-variable configuration** using the `Config` class

---

### 🖥️ Client-Side Processing
All image capture, filtering, and rendering occurs **entirely inside the browser**, using:

- `getUserMedia()` for webcam access  
- `<canvas>` for image rendering  
- CSS filters applied in real time  

This approach provides:
- Faster performance  
- Higher privacy (no image upload to server)  
- Reduced backend complexity  
- A lightweight design suitable for this project  

---

### 📝 Logging
The backend logs structured metadata for every capture event, including:

- Selected **layout**
- Selected **filter**
- Selected **frame**
- **Timestamp** (client-side)

Logs are formatted as **JSON**, making them:
- Easy to parse  
- Clear for grading  
- More aligned with real monitoring/observability practices  

---

### 🐳 Docker
Docker guarantees a fully reproducible environment.

Key choices:
- Base image: `python:3.12-slim`  
- Uses **Gunicorn** to serve the Flask app  
- Loads configuration using environment variables  
- Includes a **single-command run script** (`run.sh`) required by the course  

Benefits:
- Consistent behavior across all machines  
- Clean dependency management  
- Matches real-world deployment pipelines  

---

## 5. Results & Evaluation

### ✔️ Performance
- Instant load time (static assets are lightweight)  
- Stable camera access in Chrome/Safari  
- Responsive UI and smooth capture flow  
- Backend logs correctly stored in JSON format  

### 📸 Sample Output
*(Add screenshots here later)*


---

## 6. What’s Next

Future enhancements may include:
- Multi-photo **strips** & **2×2 grids**  
- PNG **frame overlays**  
- Drag-and-drop **stickers / emojis**  
- Backend **photo storage**  
- Shareable **QR codes**  
- Deployment to **Render**, **Fly.io**, or **Azure**  

---

## 7. References & Links

- Flask Documentation  
- WebRTC MediaDevices API  
- Docker Documentation  
- UVA Systems Final Case Project Specification  
- Repository Link: *(add your GitHub repo link here)*

