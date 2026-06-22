import { getBoardIdFromUrl, getCurrentUser, signedStorageUrl, supabase } from './supabase-client.js';

const workspace = window.gleamWorkspace;
let user = null;
let boardId = getBoardIdFromUrl();
let saveTimer = null;
let isLoading = false;

async function initWorkspaceSync() {
  if (!workspace) return;

  user = await getCurrentUser();
  if (!user) {
    workspace.setSaveText('Saved locally');
    return;
  }

  window.gleamUploadFiles = uploadFiles;
  workspace.setSaveText('Connected');

  if (boardId) {
    await loadBoard(boardId);
  } else {
    workspace.clearBoard();
    await saveBoard();
  }

  const boardName = document.getElementById('board-name');
  boardName.addEventListener('input', scheduleSave);
  workspace.onChange(scheduleSave);
}

async function uploadFiles(files, addImageToTray) {
  if (!user) return;
  const validFiles = files.filter(file => file.type.match(/image\/(jpeg|png|webp)/));

  for (const file of validFiles) {
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
    const path = `${user.id}/${Date.now()}-${safeName}`;
    workspace.setSaveText('Uploading...');

    const { error } = await supabase.storage
      .from('board-images')
      .upload(path, file, { upsert: false, contentType: file.type });

    if (error) {
      console.error(error);
      workspace.showToast('Upload failed');
      workspace.setSaveText('Upload failed');
      continue;
    }

    const src = await resolveImageSource(path);
    addImageToTray(src, file.name, path);
    workspace.setSaveText('Uploaded');
  }
}

async function loadBoard(id) {
  isLoading = true;
  const { data: board, error: boardError } = await supabase
    .from('boards')
    .select('*')
    .eq('id', id)
    .single();

  if (boardError) {
    console.error(boardError);
    workspace.showToast('Could not load board');
    isLoading = false;
    return;
  }

  const { data: items, error: itemsError } = await supabase
    .from('board_items')
    .select('*')
    .eq('board_id', id)
    .order('z_index', { ascending: true });

  if (itemsError) {
    console.error(itemsError);
    workspace.showToast('Could not load board items');
    isLoading = false;
    return;
  }

  workspace.clearBoard();
  document.getElementById('board-name').value = board.title || 'Untitled board';
  workspace.setBackground(board.background || 'bg-cork');

  for (const item of items || []) {
    const src = await resolveImageSource(item.image_path);
    const localId = `db_${item.id}`;
    workspace.addImageToTray(src, item.image_path?.split('/').pop() || 'image', item.image_path, localId);
    workspace.createBoardImg(
      localId,
      src,
      Number(item.x),
      Number(item.y),
      Number(item.width),
      Number(item.height),
      Number(item.rotation),
      Number(item.scale_x),
      Number(item.z_index),
    );
    const imgData = workspace.state.images.find(image => image.id === localId);
    if (imgData) {
      imgData.onBoard = true;
      imgData.dbId = item.id;
      imgData.imagePath = item.image_path;
      if (imgData.el) imgData.el.style.opacity = item.opacity ?? 1;
    }
  }

  workspace.updateImgCount();
  isLoading = false;
  workspace.setSaveText('Saved to account');
}

async function resolveImageSource(path) {
  if (!path) return '';
  return signedStorageUrl('board-images', path);
}

function scheduleSave() {
  if (isLoading || !user) return;
  workspace.setSaveText('Saving...');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveBoard, 900);
}

async function saveBoard() {
  if (!user || isLoading) return;

  const title = document.getElementById('board-name').value.trim() || 'Untitled board';
  const background = workspace.getBackgroundClass();
  const now = new Date().toISOString();

  if (!boardId) {
    const { data, error } = await supabase
      .from('boards')
      .insert({ user_id: user.id, title, background, updated_at: now })
      .select('id')
      .single();
    if (error) {
      console.error(error);
      workspace.setSaveText('Save failed');
      return;
    }
    boardId = data.id;
    window.history.replaceState({}, '', `workspace.html?board=${boardId}`);
  } else {
  }

  const items = workspace.state.images
    .filter(item => item.el && item.onBoard !== false)
    .map(item => ({
      board_id: boardId,
      user_id: user.id,
      image_path: item.imagePath || item.src || '',
      item_type: 'image',
      x: item.x || 0,
      y: item.y || 0,
      width: item.w || 200,
      height: item.h || 160,
      rotation: item.rot || 0,
      scale_x: item.scaleX || 1,
      z_index: item.z || 1,
      opacity: parseFloat(item.el?.style?.opacity || '1'),
    }));

  const deleteResult = await supabase.from('board_items').delete().eq('board_id', boardId);
  if (deleteResult.error) {
    console.error(deleteResult.error);
    workspace.setSaveText('Save failed');
    return;
  }

  if (items.length) {
    const { error } = await supabase.from('board_items').insert(items);
    if (error) {
      console.error(error);
      workspace.setSaveText('Save failed');
      return;
    }
  }

  const thumbnailPath = await saveThumbnail();
  const boardUpdate = { title, background, updated_at: now };
  if (thumbnailPath) boardUpdate.thumbnail_path = thumbnailPath;

  const { error: boardUpdateError } = await supabase
    .from('boards')
    .update(boardUpdate)
    .eq('id', boardId);
  if (boardUpdateError) {
    console.error(boardUpdateError);
    workspace.setSaveText('Save failed');
    return;
  }

  workspace.setSaveText('Saved to account');
}

async function saveThumbnail() {
  if (!workspace.renderBoardCanvas || !boardId) return '';
  try {
    const canvas = workspace.renderBoardCanvas(0.5);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.82));
    if (!blob) return '';

    const path = `${user.id}/${boardId}.jpg`;
    const { error } = await supabase.storage
      .from('board-thumbnails')
      .upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
    if (error) throw error;
    return path;
  } catch (error) {
    console.error(error);
    return '';
  }
}

initWorkspaceSync();
