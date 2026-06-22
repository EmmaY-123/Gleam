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

let currentUser = null;
let currentProfile = null;
let avatarFile = null;

function setMessage(message, isError = false) {
  const el = document.getElementById('profile-message');
  el.textContent = message;
  el.style.color = isError ? '#A07868' : '#6B6560';
}

function setAvatarPreview(url, fallbackText) {
  const preview = document.getElementById('avatar-preview');
  preview.textContent = fallbackText;
  preview.style.backgroundImage = '';
  if (url) {
    preview.textContent = '';
    preview.style.backgroundImage = `url("${url}")`;
  }
}

async function loadProfile() {
  const cachedProfile = getCachedProfile();
  if (cachedProfile) {
    document.getElementById('username').value = profileName(null, cachedProfile);
    setAvatarPreview('', profileInitial(null, cachedProfile));
  }

  currentUser = await getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html?from=profile';
    return;
  }

  currentProfile = await getUserProfile(currentUser);
  if (currentProfile) cacheProfile(currentProfile);
  document.getElementById('email').value = currentUser.email || '';
  document.getElementById('username').value = profileName(currentUser, currentProfile);

  const avatarPath = currentProfile?.avatar_path || currentUser.user_metadata?.avatar_path;
  const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);
  setAvatarPreview(avatarUrl, profileInitial(currentUser, currentProfile));

  if (!currentProfile) {
    setMessage('Profile storage is ready after you run the profile setup SQL.');
  }
}

async function uploadAvatar() {
  if (!avatarFile || !currentUser) return currentProfile?.avatar_path || currentUser.user_metadata?.avatar_path || '';

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

  const button = document.getElementById('save-profile');
  const username = document.getElementById('username').value.trim() || 'Gleam user';
  button.disabled = true;
  button.textContent = 'Saving...';

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

    await supabase.auth.updateUser({ data: { name: username, avatar_path: avatarPath || null } });
    currentProfile = { user_id: currentUser.id, username, avatar_path: avatarPath };
    cacheProfile(currentProfile);
    const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);
    setAvatarPreview(avatarUrl, profileInitial(currentUser, currentProfile));
    setMessage('Profile saved.');
  } catch (error) {
    console.error(error);
    setMessage('Could not save yet. Make sure the profiles table and avatar bucket are set up in Supabase.', true);
  } finally {
    button.disabled = false;
    button.textContent = 'Save profile';
  }
}

document.getElementById('avatar-input').addEventListener('change', event => {
  avatarFile = event.target.files?.[0] || null;
  if (!avatarFile) return;
  setAvatarPreview(URL.createObjectURL(avatarFile), '');
});

document.getElementById('profile-form').addEventListener('submit', saveProfile);
document.getElementById('sign-out').addEventListener('click', async () => {
  await supabase.auth.signOut();
  clearGleamCache();
  window.location.href = 'index.html';
});

loadProfile();
