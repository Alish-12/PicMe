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

// NEW (from your updated index.html)
const frameColorInput = document.getElementById("frame-color");

// OPTIONAL legacy support (if you still have it in HTML)
const frameSelect = document.getElementById("frame-select");

const videoWrapper = document.querySelector(".pb-video-wrapper"); // for preview cropping

let mediaStream = null;
let lastDataUrl = null;

/** Change this if you want the saved image NOT mirrored */
const MIRROR_OUTPUT = true;

/** ---------- Filters ---------- */
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

function applyLiveFilter() {
  video.style.filter = getCssFilterForValue(filterSelect.value);
}
filterSelect.addEventListener("change", applyLiveFilter);

/** ---------- Frame color (color wheel) ---------- */
function getSelectedFrameColor() {
  // Prefer color wheel if present
  if (frameColorInput && frameColorInput.value) return frameColorInput.value;

  // Fallback: old dropdown mapping if you kept it
  if (frameSelect) {
    const v = String(frameSelect.value || "").toLowerCase();
    if (v === "gold") return "#FFD700";
    if (v === "simple") return "#FFFFFF";
    // interpret "none" as black frame (your earlier request)
    return "#000000";
  }

  // default
  return "#FFFFFF";
}

if (frameColorInput) {
  // Not required, but nice: restarting forces next capture to include new frame color
  frameColorInput.addEventListener("input", () => {
    statusEl.textContent = "Frame color updated (next capture).";
  });
}

/** ---------- Camera ---------- */
async function startCamera() {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    video.srcObject = mediaStream;

    video.addEventListener("loadedmetadata", () => {
      applyLiveFilter();
      syncPreviewCrop();
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

/** ---------- Countdown ---------- */
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
        clearInterval(interval);
        setTimeout(() => {
          countdownEl.classList.add("hidden");
          resolve();
        }, 350);
      }
    }, 1000);
  });
}

async function waitForVideoReady() {
  while (!video.videoWidth || !video.videoHeight) {
    await new Promise((r) => setTimeout(r, 30));
  }
}

/** ---------- Layout + Preview cropping ---------- */
function normalizeLayoutValue(v) {
  return String(v || "").toLowerCase();
}

function getShotCountForLayout(layoutValue) {
  const v = normalizeLayoutValue(layoutValue);
  if (v.includes("strip")) return 3;
  if (v.includes("grid") || v.includes("2x2") || v.includes("2×2")) return 4;
  return 1;
}

// single: 4/3 preview; multi: square preview (cropped, no distortion)
function syncPreviewCrop() {
  if (!videoWrapper) return;
  const shots = getShotCountForLayout(layoutSelect.value);
  videoWrapper.classList.toggle("is-square", shots > 1);
}

layoutSelect.addEventListener("change", () => {
  syncPreviewCrop();
  restart(); // reset when switching layouts
});

/** ---------- Capture a single frame into an offscreen canvas ---------- */
async function captureFrameCanvas() {
  await waitForVideoReady();

  const w = video.videoWidth;
  const h = video.videoHeight;

  const shot = document.createElement("canvas");
  shot.width = w;
  shot.height = h;

  const ctx = shot.getContext("2d");

  // apply filter to saved pixels (not just live video)
  const filter = getCssFilterForValue(filterSelect.value);
  ctx.filter = filter;

  if (MIRROR_OUTPUT) {
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -w, 0, w, h);
    ctx.restore();
  } else {
    ctx.drawImage(video, 0, 0, w, h);
  }

  ctx.filter = "none";
  return shot;
}

/** ---------- Cover-crop drawing (no stretching) ---------- */
function drawCover(ctx, img, dx, dy, dw, dh) {
  const sw = img.width;
  const sh = img.height;

  const srcAspect = sw / sh;
  const dstAspect = dw / dh;

  let sx = 0,
    sy = 0,
    sWidth = sw,
    sHeight = sh;

  if (srcAspect > dstAspect) {
    // crop left/right
    sWidth = sh * dstAspect;
    sx = (sw - sWidth) / 2;
  } else {
    // crop top/bottom
    sHeight = sw / dstAspect;
    sy = (sh - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dw, dh);
}

/** ---------- Helpers for “frame + paper” look ---------- */
function fillFrameAndPaper(ctx, outW, outH, frameColor, frameBorder) {
  // Make *everything* the chosen color (no white paper region)
  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, outW, outH);
}


function drawPhotoOutline(ctx, x, y, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = Math.max(2, Math.round(Math.min(w, h) * 0.004));
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}


/** ---------- Compose final output image ---------- */
function composeStrip(shots) {
  const frameColor = getSelectedFrameColor();

  const base = Math.min(shots[0].width, shots[0].height);
  const cell = Math.min(720, base); // cap size
  const gap = Math.round(cell * 0.06);
  const paperPad = Math.round(cell * 0.08);
  const footer = Math.round(cell * 0.20);

  const frameBorder = Math.max(12, Math.round(cell * 0.06));

  const paperW = cell + paperPad * 2;
  const paperH = paperPad * 2 + (cell * 3) + (gap * 2) + footer;

  const outW = paperW + frameBorder * 2;
  const outH = paperH + frameBorder * 2;

  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d");
  fillFrameAndPaper(ctx, outW, outH, frameColor, frameBorder);

  const startX = frameBorder + paperPad;
  let y = frameBorder + paperPad;

  for (let i = 0; i < 3; i++) {
    drawCover(ctx, shots[i], startX, y, cell, cell);
    drawPhotoOutline(ctx, startX, y, cell, cell);
    y += cell + gap;
  }

  return canvas.toDataURL("image/png");
}

function composeGrid2x2(shots) {
  const frameColor = getSelectedFrameColor();

  const base = Math.min(shots[0].width, shots[0].height);
  const cell = Math.min(620, base);
  const gap = Math.round(cell * 0.06);
  const paperPad = Math.round(cell * 0.08);
  const footer = Math.round(cell * 0.18);

  const frameBorder = Math.max(12, Math.round(cell * 0.06));

  const paperW = paperPad * 2 + cell * 2 + gap;
  const paperH = paperPad * 2 + cell * 2 + gap + footer;

  const outW = paperW + frameBorder * 2;
  const outH = paperH + frameBorder * 2;

  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d");
  fillFrameAndPaper(ctx, outW, outH, frameColor, frameBorder);

  const x0 = frameBorder + paperPad;
  const y0 = frameBorder + paperPad;

  const positions = [
    [x0, y0],
    [x0 + cell + gap, y0],
    [x0, y0 + cell + gap],
    [x0 + cell + gap, y0 + cell + gap],
  ];

  for (let i = 0; i < 4; i++) {
    const [x, y] = positions[i];
    drawCover(ctx, shots[i], x, y, cell, cell);
    drawPhotoOutline(ctx, x, y, cell, cell);
  }

  return canvas.toDataURL("image/png");
}

function composeSingle(shot) {
  const frameColor = getSelectedFrameColor();

  const w = shot.width;
  const h = shot.height;

  const pad = Math.max(18, Math.round(Math.min(w, h) * 0.04));
  const frameBorder = Math.max(14, Math.round(Math.min(w, h) * 0.05));

  const paperW = w + pad * 2;
  const paperH = h + pad * 2;

  const outW = paperW + frameBorder * 2;
  const outH = paperH + frameBorder * 2;

  canvas.width = outW;
  canvas.height = outH;

  const ctx = canvas.getContext("2d");
  fillFrameAndPaper(ctx, outW, outH, frameColor, frameBorder);

  const x = frameBorder + pad;
  const y = frameBorder + pad;

  ctx.drawImage(shot, x, y, w, h);
  drawPhotoOutline(ctx, x, y, w, h);

  return canvas.toDataURL("image/png");
}

/** ---------- Main capture flow (single / strip / grid) ---------- */
async function capture() {
  if (!mediaStream) {
    statusEl.textContent = "Start the photobooth first!";
    return;
  }

  captureBtn.disabled = true;
  startBtn.disabled = true;

  try {
    const layout = layoutSelect.value;
    const shotCount = getShotCountForLayout(layout);

    const shots = [];
    for (let i = 0; i < shotCount; i++) {
      statusEl.textContent =
        shotCount === 1 ? "Get ready..." : `Get ready... (${i + 1}/${shotCount})`;

      await showCountdown(3);
      shots.push(await captureFrameCanvas());

      statusEl.textContent =
        shotCount === 1 ? "Captured!" : `Captured ${i + 1}/${shotCount}`;
    }

    statusEl.textContent = "Composing...";

    const v = normalizeLayoutValue(layout);
    let dataUrl;
    if (shotCount === 1) dataUrl = composeSingle(shots[0]);
    else if (v.includes("strip")) dataUrl = composeStrip(shots);
    else dataUrl = composeGrid2x2(shots);

    lastDataUrl = dataUrl;
    resultImage.src = lastDataUrl;
    resultImage.classList.remove("hidden");
    downloadBtn.disabled = false;

    statusEl.textContent = "Done!";
    await logEvent();
  } catch (e) {
    console.error(e);
    statusEl.textContent = "Something went wrong during capture.";
  } finally {
    captureBtn.disabled = false;
    startBtn.disabled = false;
  }
}

/** ---------- Backend log ---------- */
async function logEvent() {
  const payload = {
    layout: layoutSelect.value,
    filter: filterSelect.value,
    // keep backend happy: still send a "frame" field
    frame: getSelectedFrameColor(),
    timestamp: new Date().toISOString(),
  };

  try {
    const res = await fetch("/api/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error("Failed to log event", await res.text());
  } catch (err) {
    console.error("Error logging event", err);
  }
}

/** ---------- Download + Restart ---------- */
function downloadImage() {
  if (!lastDataUrl) return;

  const layout = normalizeLayoutValue(layoutSelect.value);
  const filename =
    layout.includes("strip") ? "picme_strip.png" :
    (layout.includes("grid") || layout.includes("2x2") || layout.includes("2×2")) ? "picme_grid.png" :
    "picme_single.png";

  const a = document.createElement("a");
  a.href = lastDataUrl;
  a.download = filename;
  a.click();
}

function restart() {
  lastDataUrl = null;
  resultImage.src = "";
  resultImage.classList.add("hidden");
  statusEl.textContent = "Ready!";
  downloadBtn.disabled = true;
}

startBtn.addEventListener("click", startCamera);
captureBtn.addEventListener("click", capture);
downloadBtn.addEventListener("click", downloadImage);
restartBtn.addEventListener("click", restart);

// init once
applyLiveFilter();
syncPreviewCrop();
restart();
