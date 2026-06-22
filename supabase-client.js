import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const SUPABASE_URL = 'https://xvqrjdskhlzuvbylojwe.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_XCyLzdi2tkDiyBq5MrldbA_hiuJ4wbX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}

export function getBoardIdFromUrl() {
  return new URLSearchParams(window.location.search).get('board');
}

export function openWorkspaceUrl(boardId) {
  return boardId ? `workspace.html?board=${encodeURIComponent(boardId)}` : 'workspace.html';
}
