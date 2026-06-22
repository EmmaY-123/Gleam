import {
  getCurrentUser,
  getUserProfile,
  openWorkspaceUrl,
  profileInitial,
  signedStorageUrl,
  supabase,
} from './supabase-client.js';

let boards = [];
let pendingDeleteId = null;
let activeSort = 'recent';
let searchTerm = '';
const BOARD_WIDTH = 960;
const BOARD_HEIGHT = 540;
const sortLabels = {
  recent: 'Most recent',
  oldest: 'Oldest',
  edited: 'Recently edited',
};

function setStatus(message) {
  document.getElementById('board-count').textContent = message;
}

function boardCard(board) {
  const updated = new Date(board.updated_at || board.created_at);
  const label = Number.isNaN(updated.getTime()) ? 'Saved' : `Edited ${updated.toLocaleDateString()}`;
  const thumbnail = board.thumbnailSrc
    ? `<img class="board-thumbnail" src="${escapeAttr(board.thumbnailSrc)}" alt="">`
    : previewItems(board);
  return `
    <div class="board-card" data-id="${board.id}" data-name="${escapeHtml(board.title)}" data-type="saved" data-date="${board.updated_at || board.created_at}">
      <div class="board-preview ${previewClass(board.background)}">
        ${thumbnail}
        <div class="board-overlay">
          <a href="${openWorkspaceUrl(board.id)}" class="overlay-btn">Open</a>
          <button class="overlay-btn danger" onclick="confirmDelete(event, '${board.id}')">Delete</button>
        </div>
      </div>
      <div class="board-meta">
        <div class="board-name-row">
          <input class="board-name" value="${escapeHtml(board.title)}" onblur="renameBoard('${board.id}', this.value)" onclick="this.select()">
          <span class="board-badge badge-saved">Saved</span>
        </div>
        <p class="board-date">${label}</p>
      </div>
    </div>
  `;
}

function previewClass(background) {
  const allowed = new Set(['bg-cork', 'bg-linen', 'bg-dark', 'bg-white', 'bg-blush']);
  const clean = allowed.has(background) ? background : 'bg-cork';
  return clean.replace('bg-', 'bp-');
}

function previewItems(board) {
  const items = [...(board.items || [])].sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
  if (!items.length) return '<div class="bp-empty">Blank board</div>';

  return items.map(item => {
    const left = (Number(item.x || 0) / BOARD_WIDTH) * 100;
    const top = (Number(item.y || 0) / BOARD_HEIGHT) * 100;
    const width = (Number(item.width || 200) / BOARD_WIDTH) * 100;
    const height = (Number(item.height || 160) / BOARD_HEIGHT) * 100;
    const rotation = Number(item.rotation || 0);
    const opacity = Number(item.opacity ?? 1);
    const zIndex = Math.min(Number(item.z_index || 1), 100);
    const src = item.previewSrc || item.image_path || '';
    const fallback = colorForPath(src);
    const image = src ? `<img src="${escapeAttr(src)}" alt="">` : '';

    return `
      <div class="bp-img" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%;opacity:${opacity};z-index:${zIndex};background:${fallback};transform:rotate(${rotation}deg)">
        ${image}
      </div>
    `;
  }).join('');
}

function colorForPath(value) {
  const colors = ['#C9A99A', '#D4B8A8', '#E8DDD4', '#B8C4BB', '#D4C5B5'];
  const index = String(value || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

async function loadBoards() {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = 'login.html?from=boards';
    return;
  }

  const avatar = document.querySelector('.avatar');
  avatar.textContent = profileInitial(user, null);
  setStatus('Loading...');

  hydrateAvatar(user);

  const { data, error } = await loadBoardRows();

  if (error) {
    setStatus('Could not load boards');
    console.error(error);
    return;
  }

  boards = data || [];
  await attachThumbnails();
  await attachBoardItemsForMissingThumbnails();
  renderBoards();
}

async function hydrateAvatar(user) {
  const profile = await getUserProfile(user);
  const avatarPath = profile?.avatar_path || user.user_metadata?.avatar_path;
  const avatar = document.querySelector('.avatar');
  avatar.textContent = profileInitial(user, profile);
  const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);
  if (avatarUrl) {
    avatar.textContent = '';
    avatar.style.backgroundImage = `url("${avatarUrl}")`;
  }
}

async function loadBoardRows() {
  return supabase
    .from('boards')
    .select('*')
    .order('updated_at', { ascending: false });
}

async function attachThumbnails() {
  const paths = [...new Set(boards.map(board => board.thumbnail_path).filter(Boolean))];
  if (!paths.length) return;

  const signedUrlByPath = new Map();
  await Promise.all(paths.map(async path => {
    const signedUrl = await signedStorageUrl('board-thumbnails', path);
    if (signedUrl) signedUrlByPath.set(path, signedUrl);
  }));

  boards = boards.map(board => ({
    ...board,
    thumbnailSrc: signedUrlByPath.get(board.thumbnail_path) || '',
  }));
}

async function attachBoardItemsForMissingThumbnails() {
  if (!boards.length) return;
  const boardIds = boards.filter(board => !board.thumbnailSrc).map(board => board.id);
  if (!boardIds.length) return;

  const { data, error } = await supabase
    .from('board_items')
    .select('*')
    .in('board_id', boardIds)
    .order('z_index', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const paths = [...new Set((data || [])
    .map(item => item.image_path)
    .filter(path => path && !path.startsWith('data:') && !path.startsWith('http')))];

  const signedUrlByPath = new Map();
  await Promise.all(paths.map(async path => {
    const signedUrl = await signedStorageUrl('board-images', path);
    if (signedUrl) signedUrlByPath.set(path, signedUrl);
  }));

  const itemsByBoard = new Map();
  for (const item of data || []) {
    const previewSrc = item.image_path?.startsWith('data:') || item.image_path?.startsWith('http')
      ? item.image_path
      : signedUrlByPath.get(item.image_path);
    const enrichedItem = { ...item, previewSrc };
    const list = itemsByBoard.get(item.board_id) || [];
    list.push(enrichedItem);
    itemsByBoard.set(item.board_id, list);
  }

  boards = boards.map(board => ({ ...board, items: itemsByBoard.get(board.id) || [] }));
}

function renderBoards() {
  const grid = document.getElementById('boards-grid');
  const filtered = boards
    .filter(board => !searchTerm || board.title.toLowerCase().includes(searchTerm))
    .sort((a, b) => {
      const createdA = dateValue(a.created_at || a.updated_at);
      const createdB = dateValue(b.created_at || b.updated_at);
      const editedA = dateValue(a.updated_at || a.created_at);
      const editedB = dateValue(b.updated_at || b.created_at);
      if (activeSort === 'oldest') return createdA - createdB;
      if (activeSort === 'edited') return editedB - editedA;
      return createdB - createdA;
    });

  grid.innerHTML = filtered.map(boardCard).join('');

  document.getElementById('board-count').textContent = `${filtered.length} board${filtered.length === 1 ? '' : 's'}`;
  document.getElementById('empty-state').style.display = filtered.length === 0 ? 'flex' : 'none';
}

function dateValue(value) {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function toggleSortMenu() {
  const wrap = document.getElementById('sort-wrap');
  const button = document.getElementById('sort-button');
  const isOpen = wrap.classList.toggle('open');
  button.setAttribute('aria-expanded', String(isOpen));
}

function closeSortMenu() {
  document.getElementById('sort-wrap')?.classList.remove('open');
  document.getElementById('sort-button')?.setAttribute('aria-expanded', 'false');
}

function setSort(value) {
  activeSort = value;
  document.getElementById('sort-label').textContent = sortLabels[value] || sortLabels.recent;
  document.querySelectorAll('.sort-option').forEach(option => {
    const isActive = option.dataset.sort === value;
    option.classList.toggle('active', isActive);
    option.setAttribute('aria-selected', String(isActive));
  });
  closeSortMenu();
  renderBoards();
}

function filterSearch(value) {
  searchTerm = value.toLowerCase();
  renderBoards();
}

async function renameBoard(id, title) {
  const cleanTitle = title.trim() || 'Untitled board';
  const { error } = await supabase
    .from('boards')
    .update({ title: cleanTitle, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    console.error(error);
    return;
  }
  const board = boards.find(item => item.id === id);
  if (board) board.title = cleanTitle;
  renderBoards();
}

function confirmDelete(event, id) {
  event.preventDefault();
  event.stopPropagation();
  pendingDeleteId = id;
  document.getElementById('modal-overlay').classList.add('show');
}

function closeModal() {
  pendingDeleteId = null;
  document.getElementById('modal-overlay').classList.remove('show');
}

async function deletePendingBoard() {
  if (!pendingDeleteId) return;
  const { error } = await supabase.from('boards').delete().eq('id', pendingDeleteId);
  if (error) {
    console.error(error);
    return;
  }
  boards = boards.filter(board => board.id !== pendingDeleteId);
  closeModal();
  renderBoards();
}

document.getElementById('confirm-delete-btn').addEventListener('click', deletePendingBoard);
document.getElementById('modal-overlay').addEventListener('click', event => {
  if (event.target === document.getElementById('modal-overlay')) closeModal();
});
document.addEventListener('click', event => {
  if (!event.target.closest('#sort-wrap')) closeSortMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeSortMenu();
});

window.setSort = setSort;
window.toggleSortMenu = toggleSortMenu;
window.filterSearch = filterSearch;
window.renameBoard = renameBoard;
window.confirmDelete = confirmDelete;
window.closeModal = closeModal;

loadBoards();
