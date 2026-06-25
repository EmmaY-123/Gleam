import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.108.2';

const ALLOWED_ORIGINS = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://www.gleamup.asia',
  'https://gleamup.asia',
  'https://gleam-beta.vercel.app',
]);

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') || '';
  const isAllowedPreview = /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin);
  const allowedOrigin = ALLOWED_ORIGINS.has(origin) || isAllowedPreview ? origin : 'https://www.gleamup.asia';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function jsonResponse(request: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      'Content-Type': 'application/json',
    },
  });
}

function bearerToken(request: Request) {
  const header = request.headers.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  return scheme?.toLowerCase() === 'bearer' ? token : '';
}

async function removeStorageFolder(admin: ReturnType<typeof createClient>, bucket: string, userId: string) {
  const { data, error } = await admin.storage.from(bucket).list(userId, { limit: 1000 });
  if (error || !data?.length) return;

  const paths = data
    .filter(file => file.name)
    .map(file => `${userId}/${file.name}`);

  if (paths.length) {
    await admin.storage.from(bucket).remove(paths);
  }
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Method not allowed' }, 405);
  }

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY) {
    return jsonResponse(request, { error: 'Delete account function is missing Supabase environment variables.' }, 500);
  }

  const token = bearerToken(request);
  if (!token) {
    return jsonResponse(request, { error: 'Missing authorization token.' }, 401);
  }

  const authClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: userData, error: userError } = await authClient.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return jsonResponse(request, { error: 'Could not verify the current user.' }, 401);
  }

  const userId = user.id;

  try {
    await Promise.all([
      removeStorageFolder(admin, 'profile-avatars', userId),
      removeStorageFolder(admin, 'board-images', userId),
      removeStorageFolder(admin, 'board-thumbnails', userId),
    ]);

    const itemDelete = await admin.from('board_items').delete().eq('user_id', userId);
    if (itemDelete.error) throw itemDelete.error;

    const boardDelete = await admin.from('boards').delete().eq('user_id', userId);
    if (boardDelete.error) throw boardDelete.error;

    const profileDelete = await admin.from('profiles').delete().eq('user_id', userId);
    if (profileDelete.error) throw profileDelete.error;

    const { error: deleteUserError } = await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) throw deleteUserError;

    return jsonResponse(request, { ok: true });
  } catch (error) {
    console.error('Delete account failed', error);
    return jsonResponse(request, { error: 'Could not delete the account.' }, 500);
  }
});
