const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 960;
const EXPORT_SCALE = 2;
const STORAGE_KEY = "gleam-v1-board";

const backgrounds = [
  ["wood-cork", "Wood cork"],
  ["linen", "Linen"],
  ["dark-wall", "Dark wall"],
  ["white-wall", "White wall"],
  ["soft-blush", "Soft blush"],
];

const state = {
  board: null,
  selectedId: null,
  drag: null,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function createId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID().slice(0, 8)}`;
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBoard(title = "My vision board") {
  const now = new Date().toISOString();
  return {
    id: createId("board"),
    title,
    background: "wood-cork",
    photos: [],
    createdAt: now,
    updatedAt: now,
  };
}

function createPhotoItem({ src, name, naturalWidth, naturalHeight, zIndex }) {
  const maxWidth = 320;
  const maxHeight = 320;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  const width = Math.round(naturalWidth * scale);
  const height = Math.round(naturalHeight * scale);
  return {
    id: createId("photo"),
    src,
    name,
    x: Math.round((CANVAS_WIDTH - width) / 2 + (Math.random() * 140 - 70)),
    y: Math.round((CANVAS_HEIGHT - height) / 2 + (Math.random() * 100 - 50)),
    width,
    height,
    rotation: Math.round(Math.random() * 4 - 2),
    zIndex,
    edge: "thin",
  };
}

function loadBoard() {
  try {
    state.board = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createBoard();
  } catch {
    state.board = createBoard();
  }
}

function saveBoard() {
  state.board.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.board));
  const saveStatus = $("#saveStatus");
  if (saveStatus) saveStatus.textContent = "Saved locally";
}

function init() {
  if (!$("#boardCanvas")) return;

  loadBoard();
  if (shouldStartNewBoard()) {
    state.board = createBoard();
    state.selectedId = null;
    saveBoard();
    window.history.replaceState({}, "", window.location.pathname);
  }
  renderBackgroundTabs();
  bindEvents();
  render();
}

function shouldStartNewBoard() {
  return new URLSearchParams(window.location.search).get("new") === "1";
}

function renderBackgroundTabs() {
  $("#backgroundTabs").innerHTML = backgrounds
    .map(([id, label]) => `<button type="button" data-background="${id}">${label}</button>`)
    .join("");
}

function render() {
  $("#boardTitle").value = state.board.title;
  $("#saveStatus").textContent = "Saved locally";
  renderBackground();
  renderPhotos();
  renderSelectedPanel();
  renderTray();
}

function renderBackground() {
  const canvas = $("#boardCanvas");
  canvas.className = `board-canvas bg-${state.board.background}`;
  $$("[data-background]").forEach((button) => {
    button.classList.toggle("active", button.dataset.background === state.board.background);
  });
}

function renderPhotos() {
  $$(".board-photo").forEach((node) => node.remove());
  const ordered = [...state.board.photos].sort((a, b) => a.zIndex - b.zIndex);
  for (const photo of ordered) {
    const node = document.createElement("div");
    node.className = `board-photo ${photoEdgeClass(photo)}${state.selectedId === photo.id ? " selected" : ""}`;
    node.dataset.photoId = photo.id;
    applyPhotoStyle(node, photo);
    node.innerHTML = `<img src="${photo.src}" alt="${escapeHtml(photo.name)}" draggable="false"><i class="resize-handle" data-resize="true"></i>`;
    $("#boardCanvas").appendChild(node);
  }
  $("#emptyState").classList.toggle("hidden", state.board.photos.length > 0);
}

function applyPhotoStyle(node, photo) {
  node.style.setProperty("--left", `${(photo.x / CANVAS_WIDTH) * 100}%`);
  node.style.setProperty("--top", `${(photo.y / CANVAS_HEIGHT) * 100}%`);
  node.style.setProperty("--w", `${(photo.width / CANVAS_WIDTH) * 100}%`);
  node.style.setProperty("--h", `${(photo.height / CANVAS_HEIGHT) * 100}%`);
  node.style.setProperty("--r", `${photo.rotation}deg`);
  node.style.setProperty("--z", photo.zIndex + 2);
}

function renderSelectedPanel() {
  const photo = selectedPhoto();
  const panel = $("#selectedPanel");
  if (!photo) {
    panel.innerHTML = `<p>Select a picture to resize, rotate, delete, or move through layers.</p>`;
    return;
  }
  panel.innerHTML = `
    <label>Size <input type="range" min="90" max="620" value="${Math.round(photo.width)}" data-edit="size"><output>${Math.round(photo.width)}</output></label>
    <label>Rotate <input type="range" min="-18" max="18" value="${Math.round(photo.rotation)}" data-edit="rotation"><output>${Math.round(photo.rotation)}</output></label>
    <div class="edge-control" aria-label="Photo edge style">
      <span>Edge</span>
      <button type="button" data-edge="thin" class="${photo.edge !== "thick" ? "active" : ""}">Thin</button>
      <button type="button" data-edge="thick" class="${photo.edge === "thick" ? "active" : ""}">Thick</button>
    </div>
    <div class="selected-actions">
      <button type="button" data-delete-photo>Delete</button>
    </div>
  `;
}

function renderTray() {
  const tray = $("#trayGrid");
  if (!state.board.photos.length) {
    tray.innerHTML = "";
    return;
  }
  tray.innerHTML = [...state.board.photos]
    .sort((a, b) => b.zIndex - a.zIndex)
    .map((photo) => `<button type="button" class="tray-thumb" data-select-photo="${photo.id}" aria-label="Select ${escapeHtml(photo.name)}"><img src="${photo.src}" alt=""></button>`)
    .join("");
}

function bindEvents() {
  $$(".js-create-board").forEach((button) => {
    button.addEventListener("click", () => {
      state.board = createBoard();
      state.selectedId = null;
      saveBoard();
      render();
    });
  });

  $("#boardTitle").addEventListener("input", (event) => {
    state.board.title = event.target.value || "Untitled board";
    saveBoard();
  });

  $("#backgroundTabs").addEventListener("click", (event) => {
    const button = event.target.closest("[data-background]");
    if (!button) return;
    state.board.background = button.dataset.background;
    saveBoard();
    renderBackground();
  });

  $("#imageUpload").addEventListener("change", async (event) => {
    const files = [...event.target.files].filter((file) => file.type.startsWith("image/"));
    await addFiles(files);
    event.target.value = "";
  });

  $("#boardCanvas").addEventListener("pointerdown", startPointerAction);
  $("#boardCanvas").addEventListener("click", (event) => {
    if (event.target.id === "boardCanvas" || event.target.id === "emptyState") {
      state.selectedId = null;
      render();
    }
  });

  $("#selectedPanel").addEventListener("input", (event) => {
    const input = event.target.closest("[data-edit]");
    const photo = selectedPhoto();
    if (!input || !photo) return;
    if (input.dataset.edit === "size") {
      const ratio = photo.height / photo.width;
      photo.width = Number(input.value);
      photo.height = Math.round(photo.width * ratio);
    }
    if (input.dataset.edit === "rotation") {
      photo.rotation = Number(input.value);
    }
    saveBoard();
    render();
  });

  $("#selectedPanel").addEventListener("click", (event) => {
    const edgeButton = event.target.closest("[data-edge]");
    const photo = selectedPhoto();
    if (edgeButton && photo) {
      photo.edge = edgeButton.dataset.edge;
      saveBoard();
      render();
      return;
    }

    if (!event.target.closest("[data-delete-photo]")) return;
    state.board.photos = state.board.photos.filter((photo) => photo.id !== state.selectedId);
    state.selectedId = null;
    normalizeLayers();
    saveBoard();
    render();
  });

  $("#trayGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-select-photo]");
    if (!button) return;
    state.selectedId = button.dataset.selectPhoto;
    render();
  });

  $(".toolbar").addEventListener("click", (event) => {
    const button = event.target.closest("[data-layer]");
    if (!button) return;
    moveSelectedLayer(button.dataset.layer);
  });

  $("#exportButton").addEventListener("click", exportBoard);
}

async function addFiles(files) {
  for (const file of files) {
    const src = await readFile(file);
    const image = await loadImage(src);
    const photo = createPhotoItem({
      src,
      name: file.name,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      zIndex: nextZIndex(),
    });
    state.board.photos.push(photo);
    state.selectedId = photo.id;
  }
  normalizeLayers();
  saveBoard();
  render();
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function nextZIndex() {
  return Math.max(0, ...state.board.photos.map((photo) => photo.zIndex)) + 1;
}

function selectedPhoto() {
  return state.board.photos.find((photo) => photo.id === state.selectedId);
}

function boardPoint(event) {
  const rect = $("#boardCanvas").getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
  };
}

function startPointerAction(event) {
  const photoNode = event.target.closest(".board-photo");
  if (!photoNode) return;
  event.preventDefault();
  const photo = state.board.photos.find((item) => item.id === photoNode.dataset.photoId);
  if (!photo) return;

  state.selectedId = photo.id;
  renderPhotos();
  renderSelectedPanel();
  renderTray();
  const activeNode = $(`[data-photo-id="${photo.id}"]`);
  const start = boardPoint(event);
  const original = { ...photo };
  const mode = event.target.dataset.resize ? "resize" : "move";

  const move = (moveEvent) => {
    const point = boardPoint(moveEvent);
    if (mode === "move") {
      photo.x = clamp(original.x + point.x - start.x, -original.width + 40, CANVAS_WIDTH - 40);
      photo.y = clamp(original.y + point.y - start.y, -original.height + 40, CANVAS_HEIGHT - 40);
    } else {
      const delta = Math.max(point.x - start.x, point.y - start.y);
      const ratio = original.height / original.width;
      photo.width = clamp(original.width + delta, 70, 680);
      photo.height = Math.round(photo.width * ratio);
    }
    if (activeNode) applyPhotoStyle(activeNode, photo);
  };

  const end = () => {
    window.removeEventListener("pointermove", move);
    saveBoard();
    render();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end, { once: true });
}

function moveSelectedLayer(direction) {
  if (!state.selectedId) return;
  const ordered = [...state.board.photos].sort((a, b) => a.zIndex - b.zIndex);
  const index = ordered.findIndex((photo) => photo.id === state.selectedId);
  if (index === -1) return;

  const [photo] = ordered.splice(index, 1);
  if (direction === "front") {
    ordered.push(photo);
  } else if (direction === "back") {
    ordered.unshift(photo);
  } else if (direction === "up") {
    ordered.splice(Math.min(index + 1, ordered.length), 0, photo);
  } else if (direction === "down") {
    ordered.splice(Math.max(index - 1, 0), 0, photo);
  }
  state.board.photos = ordered.map((item, nextIndex) => ({ ...item, zIndex: nextIndex + 1 }));
  saveBoard();
  render();
}

function normalizeLayers() {
  state.board.photos = [...state.board.photos]
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((photo, index) => ({ ...photo, zIndex: index + 1 }));
}

async function exportBoard() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH * EXPORT_SCALE;
  canvas.height = CANVAS_HEIGHT * EXPORT_SCALE;
  const ctx = canvas.getContext("2d");
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);
  drawBackground(ctx, state.board.background);

  const photos = [...state.board.photos].sort((a, b) => a.zIndex - b.zIndex);
  for (const photo of photos) {
    const image = await loadImage(photo.src);
    ctx.save();
    ctx.translate(photo.x + photo.width / 2, photo.y + photo.height / 2);
    ctx.rotate((photo.rotation * Math.PI) / 180);
    ctx.shadowColor = "rgba(39, 33, 30, 0.24)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;
    drawPhotoWithEdge(ctx, image, photo);
    ctx.restore();
  }

  const link = document.createElement("a");
  link.download = `${slugify(state.board.title) || "gleam-board"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function photoEdgeClass(photo) {
  return photo.edge === "thick" ? "edge-thick" : "edge-thin";
}

function photoEdgeMetrics(photo) {
  if (photo.edge === "thick") {
    return {
      inset: 12,
      borderWidth: 12,
    };
  }
  return {
    inset: 0,
    borderWidth: 1,
  };
}

function drawPhotoWithEdge(ctx, image, photo) {
  const { inset, borderWidth } = photoEdgeMetrics(photo);
  const x = -photo.width / 2;
  const y = -photo.height / 2;

  if (inset > 0) {
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(x, y, photo.width, photo.height);
  }

  ctx.drawImage(image, x + inset, y + inset, photo.width - inset * 2, photo.height - inset * 2);

  if (borderWidth > 0) {
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = inset > 0 ? "#fffdf7" : "rgba(255, 253, 247, 0.55)";
    ctx.strokeRect(x + borderWidth / 2, y + borderWidth / 2, photo.width - borderWidth, photo.height - borderWidth);
  }
}

function drawBackground(ctx, background) {
  if (background === "dark-wall") {
    ctx.fillStyle = "#172025";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawSpeckles(ctx, "#e9d595", 38, 2.6, 0.86);
    drawFineTexture(ctx, "rgba(255,255,255,0.035)", 900);
    return;
  }

  if (background === "linen") {
    ctx.fillStyle = "#b7ab9e";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawThreads(ctx, "rgba(255,255,255,0.12)", "rgba(70,54,42,0.08)");
    return;
  }

  if (background === "white-wall") {
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    gradient.addColorStop(0, "#faf4ec");
    gradient.addColorStop(1, "#e9ded4");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawFineTexture(ctx, "rgba(95,75,60,0.035)", 700);
    return;
  }

  if (background === "soft-blush") {
    ctx.fillStyle = "#ead3cc";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawFineTexture(ctx, "rgba(255,255,255,0.12)", 800);
    return;
  }

  ctx.fillStyle = "#a77d58";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawCorkTexture(ctx);
}

function drawCorkTexture(ctx) {
  ctx.strokeStyle = "rgba(99,63,38,0.13)";
  ctx.lineWidth = 3;
  for (let i = -CANVAS_HEIGHT; i < CANVAS_WIDTH; i += 38) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + CANVAS_HEIGHT, CANVAS_HEIGHT);
    ctx.stroke();
  }
  drawFineTexture(ctx, "rgba(255,255,255,0.09)", 1100);
  drawFineTexture(ctx, "rgba(75,49,31,0.12)", 650);
}

function drawThreads(ctx, light, dark) {
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 9) {
    ctx.strokeStyle = x % 18 === 0 ? light : dark;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, CANVAS_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < CANVAS_HEIGHT; y += 7) {
    ctx.strokeStyle = y % 14 === 0 ? light : dark;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
}

function drawSpeckles(ctx, color, count, radius, alpha) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i += 1) {
    ctx.beginPath();
    ctx.arc(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFineTexture(ctx, color, count) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i += 1) {
    ctx.fillRect(Math.random() * CANVAS_WIDTH, Math.random() * CANVAS_HEIGHT, 2, 1);
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

init();
