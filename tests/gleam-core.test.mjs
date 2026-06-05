import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createBoard,
  createPhotoItem,
  getPhotoEdge,
  getPhotoPlacement,
  moveLayer,
  updatePhotoSize,
} from '../gleam-core.mjs';

test('new boards default to wood cork and start empty', () => {
  const board = createBoard('My year');

  assert.equal(board.title, 'My year');
  assert.equal(board.background, 'wood-cork');
  assert.deepEqual(board.photos, []);
});

test('uploaded photos are scaled into a collage-friendly starting size', () => {
  const portrait = createPhotoItem({
    src: 'data:image/png;base64,one',
    name: 'portrait',
    naturalWidth: 1200,
    naturalHeight: 1800,
    canvasWidth: 1440,
    canvasHeight: 960,
    zIndex: 1,
  });

  assert.equal(portrait.width, 213);
  assert.equal(portrait.height, 320);
  assert.equal(portrait.x, 614);
  assert.equal(portrait.y, 320);
  assert.equal(portrait.edge, 'thin');
});

test('photo edge supports thin and thick frame styles', () => {
  assert.deepEqual(getPhotoEdge({ edge: 'thin' }), {
    className: 'edge-thin',
    borderWidth: 1,
    inset: 0,
  });
  assert.deepEqual(getPhotoEdge({ edge: 'thick' }), {
    className: 'edge-thick',
    borderWidth: 12,
    inset: 12,
  });
  assert.equal(getPhotoEdge({ edge: 'unknown' }).className, 'edge-thin');
});

test('layer movement supports front, back, up, and down', () => {
  const photos = ['a', 'b', 'c'].map((id, index) => ({
    id,
    src: id,
    name: id,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    zIndex: index + 1,
  }));

  assert.deepEqual(moveLayer(photos, 'a', 'front').map((photo) => photo.id), ['b', 'c', 'a']);
  assert.deepEqual(moveLayer(photos, 'c', 'back').map((photo) => photo.id), ['c', 'a', 'b']);
  assert.deepEqual(moveLayer(photos, 'a', 'up').map((photo) => photo.id), ['b', 'a', 'c']);
  assert.deepEqual(moveLayer(photos, 'c', 'down').map((photo) => photo.id), ['a', 'c', 'b']);
});

test('resizing keeps the original aspect ratio', () => {
  const photo = {
    id: 'photo',
    src: 'photo',
    name: 'photo',
    x: 0,
    y: 0,
    width: 300,
    height: 200,
    rotation: 0,
    zIndex: 1,
  };

  assert.deepEqual(updatePhotoSize(photo, 450), { width: 450, height: 300 });
});

test('photo placement uses board-relative left and top coordinates', () => {
  const placement = getPhotoPlacement({
    x: 360,
    y: 240,
    width: 288,
    height: 192,
    rotation: 3,
    zIndex: 4,
  });

  assert.deepEqual(placement, {
    left: '25%',
    top: '25%',
    width: '20%',
    height: '20%',
    rotation: '3deg',
    zIndex: '6',
  });
});
