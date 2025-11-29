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

function getCssFilterForValue(filter) {
  switch (filter) {
    case "bw":
      return "grayscale(1)";
    case "warm":
      return "sepia(0.4) saturate(1.2)";
    case "cool":
      return "contrast(1.1) saturate(1.1) hue-rotate(200deg)";
    default:
      return "none";
  }
}

async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });

    video.srcObject = mediaStream;

    video.addEventListener("loadedmetadata", () => {
      console.log("VIDEO READY:", video.videoWidth, video.videoHeight);
      applyLiveFilter();
    });

    statusEl.textContent = "Camera is ready!";
    captureBtn.disabled = false;
    restartBtn.disabled = false;

  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "Could not access camera. Check permissions and reload the page.";
  }
}

function applyLiveFilter() {
  const filter = filterSelect.value;
  video.style.filter = getCssFilterForValue(filter);
}

filterSelect.addEventListener("change", applyLiveFilter);

applyLiveFilter();

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


async function captureSingleShot() {
  while (video.videoWidth === 0 || video.videoHeight === 0) {
    await new Promise(r => setTimeout(r, 30));
  }

  const width = video.videoWidth;
  const height = video.videoHeight;

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");

  const cssFilter = getCssFilterForValue(filterSelect.value);
  try {
    ctx.filter = cssFilter;
  } catch (e) {
    console.warn("ctx.filter not supported or invalid:", e, "filter:", cssFilter);
    ctx.filter = "none";
  }

  ctx.save();
  ctx.scale(-1, 1);
  ctx.drawImage(video, -width, 0, width, height);
  ctx.restore();

  ctx.filter = "none";

  lastDataUrl = canvas.toDataURL("image/png");
  resultImage.src = lastDataUrl;

  resultImage.classList.remove("hidden");
  canvas.classList.add("hidden");

  downloadBtn.disabled = false;
}


async function capture() {
  if (!mediaStream) {
    statusEl.textContent = "Start the photobooth first!";
    return;
  }

  statusEl.textContent = "Get ready...";
  await showCountdown(3);

  await captureSingleShot();

  statusEl.textContent = "Photo captured!";
  await logEvent();
}


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
