import {
  cacheProfile,
  getCachedProfile,
  getCurrentUser,
  getUserProfile,
  profileInitial,
  signedStorageUrl,
} from './supabase-client.js';

function setProfileLinks(user, profile, avatarUrl = '') {
  document.querySelectorAll('[data-profile-link]').forEach(profileLink => {
    profileLink.href = 'profile.html';
    profileLink.title = 'Profile settings';
    profileLink.textContent = profileInitial(user, profile);
    profileLink.style.backgroundImage = '';
    if (avatarUrl) {
      profileLink.textContent = '';
      profileLink.style.backgroundImage = `url("${avatarUrl}")`;
    }
  });
}

async function hydrateAuthNav() {
  document.querySelectorAll('[data-auth-link="boards"]').forEach(link => {
    link.href = 'boards.html';
  });

  const user = await getCurrentUser();
  if (!user) {
    document.documentElement.classList.remove('likely-signed-in');
    document.querySelectorAll('[data-auth="login"]').forEach(el => { el.style.display = ''; });
    document.querySelectorAll('[data-profile-link]').forEach(el => { el.style.display = 'none'; });
    return;
  }

  document.body.classList.add('signed-in');
  document.querySelectorAll('[data-auth="login"]').forEach(el => { el.style.display = 'none'; });
  document.querySelectorAll('[data-profile-link]').forEach(el => { el.style.display = 'flex'; });
  const cachedProfile = getCachedProfile();
  setProfileLinks(user, cachedProfile);
  const cachedAvatarPath = cachedProfile?.avatar_path || user.user_metadata?.avatar_path;
  signedStorageUrl('profile-avatars', cachedAvatarPath).then(cachedAvatarUrl => {
    if (cachedAvatarUrl) setProfileLinks(user, cachedProfile, cachedAvatarUrl);
  });

  const profile = await getUserProfile(user);
  if (profile) cacheProfile(profile);
  const avatarPath = profile?.avatar_path || user.user_metadata?.avatar_path;
  const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);
  setProfileLinks(user, profile, avatarUrl);
}

hydrateAuthNav();
