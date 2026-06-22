import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://xvqrjdskhlzuvbylojwe.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_XCyLzdi2tkDiyBq5MrldbA_hiuJ4wbX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session;
}

export async function getCurrentUser() {
  const session = await getCurrentSession();
  if (!session?.user) return null;
  return session.user;
}

export async function getUserProfile(user) {
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) return null;
  return data;
}

export function profileName(user, profile) {
  return profile?.username || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Gleam user';
}

export function profileInitial(user, profile) {
  return profileName(user, profile).trim().slice(0, 1).toUpperCase() || 'G';
}

export async function signedStorageUrl(bucket, path, expiresIn = 3600) {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http')) return path;
  const cacheKey = `gleam:signed-url:${bucket}:${path}`;
  const cached = readSignedUrlCache(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return '';
  const signedUrl = data?.signedUrl || '';
  writeSignedUrlCache(cacheKey, signedUrl, expiresIn);
  return signedUrl;
}

function readSignedUrlCache(cacheKey) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
    if (!cached?.url || !cached.expiresAt || cached.expiresAt <= Date.now()) {
      sessionStorage.removeItem(cacheKey);
      return '';
    }
    return cached.url;
  } catch {
    return '';
  }
}

function writeSignedUrlCache(cacheKey, url, expiresIn) {
  if (!url) return;
  try {
    const expiresAt = Date.now() + Math.max(expiresIn - 60, 60) * 1000;
    sessionStorage.setItem(cacheKey, JSON.stringify({ url, expiresAt }));
  } catch {
    // Cache is only a speed boost; the app still works without it.
  }
}

export function getBoardIdFromUrl() {
  return new URLSearchParams(window.location.search).get('board');
}

export function openWorkspaceUrl(boardId) {
  return boardId ? `workspace.html?board=${encodeURIComponent(boardId)}` : 'workspace.html';
}
