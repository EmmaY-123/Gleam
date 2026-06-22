import { getCurrentUser, getUserProfile, profileInitial, signedStorageUrl } from './supabase-client.js';

async function hydrateAuthNav() {
  document.querySelectorAll('[data-auth-link="boards"]').forEach(link => {
    link.href = 'boards.html';
  });

  const user = await getCurrentUser();
  if (!user) return;

  const profile = await getUserProfile(user);
  const avatarPath = profile?.avatar_path || user.user_metadata?.avatar_path;
  const avatarUrl = await signedStorageUrl('profile-avatars', avatarPath);

  document.body.classList.add('signed-in');
  document.querySelectorAll('[data-auth="login"]').forEach(el => { el.style.display = 'none'; });

  document.querySelectorAll('[data-auth-actions]').forEach(actions => {
    if (actions.querySelector('[data-profile-link]')) return;
    const profileLink = document.createElement('a');
    profileLink.href = 'profile.html';
    profileLink.className = 'nav-avatar';
    profileLink.dataset.profileLink = 'true';
    profileLink.title = 'Profile settings';
    profileLink.textContent = profileInitial(user, profile);
    if (avatarUrl) {
      profileLink.textContent = '';
      profileLink.style.backgroundImage = `url("${avatarUrl}")`;
    }
    actions.appendChild(profileLink);
  });
}

hydrateAuthNav();
