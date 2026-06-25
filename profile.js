import {
  cacheProfile,
  clearGleamCache,
  getCachedProfile,
  getCurrentUser,
  getUserProfile,
  profileInitial,
  profileName,
  signedStorageUrl,
  supabase,
} from './supabase-client.js';

const DEFAULT_SETTINGS = {
  defaultBg: 'cork',
  alignmentGrid: false,
  productUpdates: true,
  tipsInspiration: true,
};

let currentUser = null;
let currentProfile = null;
let avatarFile = null;
let lastLoadedProfile = null;

const $ = selector => document.querySelector(selector);

function showToast(id, message = 'Saved', isError = false) {
  const toast = document.getElementById(id);
  if (!toast) return;
  const text = toast.querySelector('span');
  if (text) text.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(showToast.timers?.[id]);
  showToast.timers = showToast.timers || {};
  showToast.timers[id] = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.remove('error');
  }, isError ? 4500 : 2600);
}

function setDeleteMessage(message, isError = false) {
  const el = $('#delete-message');
  el.textContent = message;
  el.style.color = isError ? '#C0624A' : '#6B6560';
}

function updateCharCount(input, countId) {
  const counter = document.getElementById(countId);
  if (!input || !counter) return;
  counter.textContent = `${input.value.length} / ${input.maxLength}`;
}

function updateAllCounts() {
  updateCharCount($('#username'), 'username-count');
  updateCharCount($('#displayname'), 'display-count');
  updateCharCount($('#bio'), 'bio-count');
}

function setAvatarPreview(url, fallbackText) {
  const display = $('#avatar-display');
  const initial = $('#avatar-initial');
  const navAvatar = $('#nav-avatar');
  display.style.backgroundImage = '';
  navAvatar.style.backgroundImage = '';
  initial.textContent = fallbackText;
  navAvatar.textContent = fallbackText;

  if (url) {
    display.style.backgroundImage = `url("${url}")`;
    navAvatar.style.backgroundImage = `url("${url}")`;
    initial.textContent = '';
    navAvatar.textContent = '';
  }
}

function updateHeaderInitial() {
  const name = $('#username').value.trim() || $('#displayname').value.trim() || 'Gleam user';
  if (!$('#avatar-display').style.backgroundImage) {
    setAvatarPreview('', name.slice(0, 1).toUpperCase() || 'G');
  }
}

function readSettingsFromStorage() {
  return {
    defaultBg: localStorage.getItem('gleam_default_bg') || DEFAULT_SETTINGS.defaultBg,
    alignmentGrid: localStorage.getItem('gleam_alignment_grid') === 'true',
    productUpdates: localStorage.getItem('gleam_product_updates') !== 'false',
    tipsInspiration: localStorage.getItem('gleam_tips_inspiration') !== 'false',
  };
}

function readSettingsFromUser(user) {
  return {
    ...DEFAULT_SETTINGS,
    ...readSettingsFromStorage(),
    ...(user?.user_metadata?.gleam_settings || {}),
  };
}

function writeSettingsToStorage(settings) {
  localStorage.setItem('gleam_default_bg', settings.defaultBg);
  localStorage.setItem('gleam_alignment_grid', String(Boolean(settings.alignmentGrid)));
  localStorage.setItem('gleam_product_updates', String(Boolean(settings.productUpdates)));
  localStorage.setItem('gleam_tips_inspiration', String(Boolean(settings.tipsInspiration)));
}

function currentSettings() {
  return {
    defaultBg: $('#default-bg').value,
    alignmentGrid: $('#grid-toggle').checked,
    productUpdates: $('#product-updates').checked,
    tipsInspiration: $('#tips-inspiration').checked,
  };
}

function applySettings(settings) {
  $('#default-bg').value = settings.defaultBg || DEFAULT_SETTINGS.defaultBg;
  $('#grid-toggle').checked = Boolean(settings.alignmentGrid);
  $('#product-updates').checked = settings.productUpdates !== false;
  $('#tips-inspiration').checked = settings.tipsInspiration !== false;
  writeSettingsToStorage(currentSettings());
}

async function persistUserMetadata(extraData = {}) {
  if (!currentUser) return;
  const data = {
    ...(currentUser.user_metadata || {}),
    ...extraData,
    gleam_settings: currentSettings(),
  };
  const { data: result, error } = await supabase.auth.updateUser({ data });
  if (error) throw error;
  currentUser = result?.user || currentUser;
}

function setButtonLoading(button, label) {
  const previous = button.textContent;
  button.disabled = true;
  button.textContent = label;
  return () => {
    button.disabled = false;
    button.textContent = previous;
  };
}

async function hydrateBoardStats() {
  if (!currentUser) return;
  const { count, error } = await supabase
    .from('boards')
    .select('id', { count: 'exact', head: true });
  if (!error && typeof count === 'number') {
    $('#boards-stat').textContent = String(count);
  }
}

async function loadProfile() {
  const cachedProfile = getCachedProfile();
  if (cachedProfile) {
    $('#username').value = profileName(null, cachedProfile);
    setAvatarPreview('', profileInitial(null, cachedProfile));
    updateAllCounts();
  }

  currentUser = await getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html?from=profile';
    return;
  }

  currentProfile = await getUserProfile(currentUser);
  if (currentProfile) cacheProfile(currentProfile);
  lastLoadedProfile = {
    username: profileName(currentUser, currentProfile),
    displayName: currentUser.user_metadata?.display_name || '',
    bio: currentUser.user_metadata?.bio || '',
  };

  $('#email-display-val').textContent = currentUser.email || '';
  $('#username').value = lastLoadedProfile.username;
  $('#displayname').value = lastLoadedProfile.displayName;
  $('#bio').value = lastLoadedProfile.bio;
  updateAllCounts();

  const avatarPath = currentProfile?.avatar_path || currentUser.user_metadata?.avatar_path;
  const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);
  setAvatarPreview(avatarUrl, profileInitial(currentUser, currentProfile));
  applySettings(readSettingsFromUser(currentUser));
  await hydrateBoardStats();
}

async function uploadAvatar() {
  if (!avatarFile || !currentUser) {
    return currentProfile?.avatar_path || currentUser?.user_metadata?.avatar_path || '';
  }

  const extension = avatarFile.name.split('.').pop()?.toLowerCase() || 'png';
  const cleanExtension = extension.replace(/[^a-z0-9]/g, '') || 'png';
  const path = `${currentUser.id}/avatar-${Date.now()}.${cleanExtension}`;
  const { error } = await supabase.storage
    .from('profile-avatars')
    .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
  if (error) throw error;
  return path;
}

async function saveProfile(event) {
  event.preventDefault();
  if (!currentUser) return;

  const button = $('#save-profile');
  const restore = setButtonLoading(button, 'Saving...');
  const username = $('#username').value.trim() || 'Gleam user';
  const displayName = $('#displayname').value.trim();
  const bio = $('#bio').value.trim();

  try {
    const avatarPath = await uploadAvatar();
    const { error } = await supabase
      .from('profiles')
      .upsert({
        user_id: currentUser.id,
        username,
        avatar_path: avatarPath || null,
        updated_at: new Date().toISOString(),
      });
    if (error) throw error;

    await persistUserMetadata({
      name: username,
      display_name: displayName,
      bio,
      avatar_path: avatarPath || null,
    });

    currentProfile = { user_id: currentUser.id, username, avatar_path: avatarPath };
    lastLoadedProfile = { username, displayName, bio };
    cacheProfile(currentProfile);
    const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);
    setAvatarPreview(avatarUrl, profileInitial(currentUser, currentProfile));
    avatarFile = null;
    showToast('profile-toast', 'Profile saved');
  } catch (error) {
    console.error(error);
    showToast('profile-toast', 'Could not save profile', true);
  } finally {
    restore();
  }
}

function resetProfileForm() {
  if (!lastLoadedProfile) return;
  $('#username').value = lastLoadedProfile.username;
  $('#displayname').value = lastLoadedProfile.displayName;
  $('#bio').value = lastLoadedProfile.bio;
  updateAllCounts();
  updateHeaderInitial();
}

function toggleSection(sectionId, rowId) {
  const section = document.getElementById(sectionId);
  const row = document.getElementById(rowId);
  const isOpen = section.classList.contains('open');
  document.querySelectorAll('.inline-section').forEach(item => item.classList.remove('open'));
  document.querySelectorAll('.account-row').forEach(item => item.style.display = 'flex');
  if (!isOpen) {
    section.classList.add('open');
    row.style.display = 'none';
  }
}

function closeSection(sectionId, rowId) {
  document.getElementById(sectionId).classList.remove('open');
  document.getElementById(rowId).style.display = 'flex';
}

async function saveEmail() {
  const button = $('#save-email');
  const restore = setButtonLoading(button, 'Saving...');
  const email = $('#email-new').value.trim();
  try {
    if (!email) throw new Error('Enter a new email address.');
    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;
    $('#email-new').value = '';
    showToast('email-toast', 'Check your inbox to confirm');
    setTimeout(() => closeSection('email-edit', 'email-row-display'), 1400);
  } catch (error) {
    console.error(error);
    showToast('email-toast', error.message || 'Could not update email', true);
  } finally {
    restore();
  }
}

function checkStrength(value) {
  const segments = [$('#seg1'), $('#seg2'), $('#seg3'), $('#seg4')];
  const label = $('#strength-label');
  segments.forEach(segment => segment.className = 'strength-seg');
  if (!value) {
    label.textContent = '';
    return 0;
  }
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[0-9]/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  const className = score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong';
  const labels = { weak: 'Weak', medium: 'Fair', strong: 'Strong' };
  for (let index = 0; index < score; index += 1) segments[index].classList.add(className);
  label.textContent = labels[className];
  label.style.color = className === 'strong' ? '#3B6B3A' : className === 'medium' ? '#A07868' : '#C0624A';
  return score;
}

async function savePassword() {
  const button = $('#save-password');
  const restore = setButtonLoading(button, 'Saving...');
  const password = $('#new-password').value;
  const confirm = $('#confirm-password').value;
  try {
    if (password.length < 8) throw new Error('Password needs at least 8 characters.');
    if (password !== confirm) throw new Error('Passwords do not match.');
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    $('#new-password').value = '';
    $('#confirm-password').value = '';
    checkStrength('');
    showToast('pw-toast', 'Password updated');
    setTimeout(() => closeSection('pw-edit', 'pw-row-display'), 1200);
  } catch (error) {
    console.error(error);
    showToast('pw-toast', error.message || 'Could not update password', true);
  } finally {
    restore();
  }
}

async function saveSettings(kind) {
  const settings = currentSettings();
  writeSettingsToStorage(settings);
  try {
    await persistUserMetadata({ gleam_settings: settings });
    showToast(kind === 'notifications' ? 'notif-toast' : 'appearance-toast', 'Preference saved');
  } catch (error) {
    console.error(error);
    showToast(kind === 'notifications' ? 'notif-toast' : 'appearance-toast', 'Saved locally for now', true);
  }
}

async function removeStorageFolder(bucket, folder) {
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 1000 });
  if (error || !data?.length) return;
  const paths = data.map(file => `${folder}/${file.name}`);
  await supabase.storage.from(bucket).remove(paths);
}

async function deleteGleamData() {
  if (!currentUser) return;
  const confirmed = window.confirm('Delete your saved Gleam boards, uploads, thumbnails, and profile data? This cannot be undone.');
  if (!confirmed) return;

  const button = $('#delete-account');
  const restore = setButtonLoading(button, 'Deleting...');
  setDeleteMessage('Deleting your Gleam data...');

  try {
    await Promise.all([
      removeStorageFolder('profile-avatars', currentUser.id),
      removeStorageFolder('board-images', currentUser.id),
      removeStorageFolder('board-thumbnails', currentUser.id),
    ]);

    const itemDelete = await supabase.from('board_items').delete().eq('user_id', currentUser.id);
    if (itemDelete.error) throw itemDelete.error;
    const boardDelete = await supabase.from('boards').delete().eq('user_id', currentUser.id);
    if (boardDelete.error) throw boardDelete.error;
    const profileDelete = await supabase.from('profiles').delete().eq('user_id', currentUser.id);
    if (profileDelete.error) throw profileDelete.error;

    await supabase.auth.signOut();
    clearGleamCache();
    window.location.href = 'index.html';
  } catch (error) {
    console.error(error);
    setDeleteMessage('Could not delete all data yet. Check that the profile delete policy has been added in Supabase.', true);
  } finally {
    restore();
  }
}

document.querySelectorAll('.side-nav-item a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    document.querySelectorAll('.side-nav-item a').forEach(item => item.classList.remove('active'));
    link.classList.add('active');
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

$('#avatar-display').addEventListener('click', () => $('#avatar-input').click());
$('#avatar-input').addEventListener('change', event => {
  avatarFile = event.target.files?.[0] || null;
  if (!avatarFile) return;
  setAvatarPreview(URL.createObjectURL(avatarFile), '');
});
$('#username').addEventListener('input', event => {
  updateCharCount(event.target, 'username-count');
  updateHeaderInitial();
});
$('#displayname').addEventListener('input', event => updateCharCount(event.target, 'display-count'));
$('#bio').addEventListener('input', event => updateCharCount(event.target, 'bio-count'));
$('#profile').addEventListener('submit', saveProfile);
$('#cancel-profile').addEventListener('click', resetProfileForm);
$('#change-email').addEventListener('click', () => toggleSection('email-edit', 'email-row-display'));
$('#cancel-email').addEventListener('click', () => closeSection('email-edit', 'email-row-display'));
$('#save-email').addEventListener('click', saveEmail);
$('#change-password').addEventListener('click', () => toggleSection('pw-edit', 'pw-row-display'));
$('#cancel-password').addEventListener('click', () => closeSection('pw-edit', 'pw-row-display'));
$('#new-password').addEventListener('input', event => checkStrength(event.target.value));
$('#save-password').addEventListener('click', savePassword);
$('#save-notifications').addEventListener('click', () => saveSettings('notifications'));
$('#default-bg').addEventListener('change', () => saveSettings('appearance'));
$('#grid-toggle').addEventListener('change', () => saveSettings('appearance'));
$('#sign-out').addEventListener('click', async () => {
  await supabase.auth.signOut();
  clearGleamCache();
  window.location.href = 'index.html';
});
$('#delete-account').addEventListener('click', deleteGleamData);

updateAllCounts();
applySettings(readSettingsFromStorage());
loadProfile();
