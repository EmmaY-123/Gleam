export const CANVAS_WIDTH = 1440;
export const CANVAS_HEIGHT = 960;

export function createId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createBoard(title = 'Untitled board') {
  const now = new Date().toISOString();
  return {
    id: createId('board'),
    title,
    background: 'wood-cork',
    photos: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function createPhotoItem({
  src,
  name,
  naturalWidth,
  naturalHeight,
  canvasWidth = CANVAS_WIDTH,
  canvasHeight = CANVAS_HEIGHT,
  zIndex = 1,
}) {
  const maxWidth = 320;
  const maxHeight = 320;
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
  const width = Math.round(naturalWidth * scale);
  const height = Math.round(naturalHeight * scale);

  return {
    id: createId('photo'),
    src,
    name,
    x: Math.round((canvasWidth - width) / 2),
    y: Math.round((canvasHeight - height) / 2),
    width,
    height,
    rotation: 0,
    zIndex,
    edge: 'thin',
  };
}

export function getPhotoEdge(photo) {
  if (photo.edge === 'thick') {
    return {
      className: 'edge-thick',
      borderWidth: 12,
      inset: 12,
    };
  }
  return {
    className: 'edge-thin',
    borderWidth: 1,
    inset: 0,
  };
}

export function updatePhotoSize(photo, nextWidth) {
  const ratio = photo.height / photo.width;
  const width = Math.round(nextWidth);
  return {
    width,
    height: Math.round(width * ratio),
  };
}

export function getPhotoPlacement(photo, canvasWidth = CANVAS_WIDTH, canvasHeight = CANVAS_HEIGHT) {
  return {
    left: `${formatPercent((photo.x / canvasWidth) * 100)}%`,
    top: `${formatPercent((photo.y / canvasHeight) * 100)}%`,
    width: `${formatPercent((photo.width / canvasWidth) * 100)}%`,
    height: `${formatPercent((photo.height / canvasHeight) * 100)}%`,
    rotation: `${photo.rotation}deg`,
    zIndex: String(photo.zIndex + 2),
  };
}

function formatPercent(value) {
  return Number(value.toFixed(4)).toString();
}

export function moveLayer(photos, photoId, direction) {
  const ordered = [...photos].sort((a, b) => a.zIndex - b.zIndex);
  const index = ordered.findIndex((photo) => photo.id === photoId);
  if (index === -1) return ordered;

  const [photo] = ordered.splice(index, 1);
  if (direction === 'front') {
    ordered.push(photo);
  } else if (direction === 'back') {
    ordered.unshift(photo);
  } else if (direction === 'up') {
    ordered.splice(Math.min(index + 1, ordered.length), 0, photo);
  } else if (direction === 'down') {
    ordered.splice(Math.max(index - 1, 0), 0, photo);
  } else {
    ordered.splice(index, 0, photo);
  }

  return ordered.map((item, nextIndex) => ({
    ...item,
    zIndex: nextIndex + 1,
  }));
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function sortBoardSummaries(boards, sort = 'recent') {
  return [...boards].sort((a, b) => {
    const createdA = dateValue(a.created_at || a.updated_at);
    const createdB = dateValue(b.created_at || b.updated_at);
    const editedA = dateValue(a.updated_at || a.created_at);
    const editedB = dateValue(b.updated_at || b.created_at);
    if (sort === 'oldest') return createdA - createdB;
    if (sort === 'edited') return editedB - editedA;
    return createdB - createdA;
  });
}

function dateValue(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}
