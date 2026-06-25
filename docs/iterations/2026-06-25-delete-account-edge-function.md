# Delete Account Edge Function

## Goal

Move final account deletion out of the browser and into a Supabase Edge Function. The frontend can safely request deletion, but only the backend function can use the service role key needed to remove the Supabase Auth user.

## What Changed

- Added `supabase/functions/delete-account/index.ts`.
- The function verifies the current user's bearer token before deleting anything.
- The function removes the user's profile avatar files, board image files, board thumbnail files, board items, boards, profile row, and Supabase Auth user.
- Updated the Profile page danger action from "Delete data" to "Delete account".
- Updated `profile.js` to call `supabase.functions.invoke('delete-account')`.

## Deploy Notes

Deploy the function from the project root with:

```bash
supabase functions deploy delete-account
```

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` to deployed Edge Functions. Do not put the service role key in frontend code or commit it to GitHub.

## Safety Notes

- The function only accepts `POST`.
- The browser must send a valid logged-in Supabase session.
- The service role key stays inside Supabase Edge Functions.
- This action is destructive and cannot be undone.
