const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const resultImage = document.getElementById("result-image");
const countdownEl = document.getElementById("countdown");
const statusEl = document.getElementById("status");

const startBtn = document.getElementById("start-btn");
const captureBtn = document.getElementById("capture-btn");
const downloadBtn = document.getElementById("download-btn");
const restartBtn = document.getElementById("restart-btn");

const layoutSelect = document.getElementById("layout-select");
const filterSelect = document.getElementById("filter-select");
const frameSelect = document.getElementById("frame-select");

let mediaStream = null;
let lastDataUrl = null;

// Map filter name → CSS filter string (for live <video>)
function getCssFilterForValue(filter) {
  switch (filter) {
    case "bw":
      return "grayscale(100%)";
    case "warm":
      return "sepia(40%) saturate(120%)";
    case "cool":
      return "contrast(110%) saturate(110%) hue-rotate(200deg)";
    default:
      return "none";
  }
}

// Ask for camera access
async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    video.srcObject = mediaStream;
    statusEl.textContent = "Camera is ready!";
    captureBtn.disabled = false;
    restartBtn.disabled = false;
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Could not access camera. Check permissions and reload the page.";
  }
}

// Apply filter in real time to <video>
function applyLiveFilter() {
  const filter = filterSelect.value;
  video.style.filter = getCssFilterForValue(filter);
}

filterSelect.addEventListener("change", applyLiveFilter);

function showCountdown(seconds = 3) {
  return new Promise((resolve) => {
    let remaining = seconds;
    countdownEl.classList.remove("hidden");
    countdownEl.textContent = remaining;

    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        countdownEl.textContent = remaining;
      } else {
        countdownEl.textContent = "Smile!";
        setTimeout(() => {
          countdownEl.classList.add("hidden");
          resolve();
        }, 500);
        clearInterval(interval);
      }
    }, 700);
  });
}

// Apply filter to the pixels currently on the canvas (so the saved image is filtered)
function applyFilterToCanvas(width, height) {
  const filter = filterSelect.value;
  if (filter === "none") return;

  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (filter === "bw") {
      const avg = (r + g + b) / 3;
      r = g = b = avg;
    } else if (filter === "warm") {
      r = r * 1.1;
      g = g * 1.02;
      b = b * 0.9;
    } else if (filter === "cool") {
      r = r * 0.9;
      g = g * 1.02;
      b = b * 1.1;
    }

    // clamp 0–255
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imageData, 0, 0);
}

// MVP: capture a single shot
async function captureSingleShot() {
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, width, height);

  // 🔥 Now actually apply the filter to the pixels on canvas
  applyFilterToCanvas(width, height);

  // TODO later: draw frame overlays here using frameSelect.value

  lastDataUrl = canvas.toDataURL("image/png");
  resultImage.src = lastDataUrl;
  resultImage.classList.remove("hidden");
  canvas.classList.add("hidden");

  downloadBtn.disabled = false;
}

// Main capture handler
async function capture() {
  if (!mediaStream) {
    statusEl.textContent = "Start the photobooth first!";
    return;
  }

  statusEl.textContent = "Get ready...";
  await showCountdown(3);

  const layout = layoutSelect.value;

  // For now, all layouts just capture a single shot.
  // Later: implement separate behavior for "strip" and "grid2x2".
  await captureSingleShot();

  statusEl.textContent = "Photo captured!";
  await logEvent();
}

// Log metadata to backend
async function logEvent() {
  const payload = {
    layout: layoutSelect.value,
    filter: filterSelect.value,
    frame: frameSelect.value,
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to log event", await res.text());
    }
  } catch (err) {
    console.error("Error logging event", err);
  }
}

function downloadImage() {
  if (!lastDataUrl) return;
  const a = document.createElement("a");
  a.href = lastDataUrl;
  a.download = "picme_photobooth.png";
  a.click();
}

function restart() {
  lastDataUrl = null;
  resultImage.src = "";
  resultImage.classList.add("hidden");
  statusEl.textContent = "Ready for another shot!";
}

startBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", capture);
downloadBtn.addEventListener("click", downloadImage);
restartBtn.addEventListener("click", restart);