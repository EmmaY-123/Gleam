import { getCurrentUser, supabase } from './supabase-client.js';

let mode = 'signin';

function setMode(nextMode) {
  mode = nextMode;
  const signingUp = mode === 'signup';
  document.getElementById('tab-signin').classList.toggle('active', !signingUp);
  document.getElementById('tab-signup').classList.toggle('active', signingUp);
  document.getElementById('form-title').textContent = signingUp ? 'Create your account.' : 'Welcome back.';
  document.getElementById('form-sub').textContent = signingUp
    ? 'Set up takes 30 seconds.'
    : "Sign in to your boards - they've been waiting.";
  document.querySelectorAll('.signup-only').forEach(el => { el.style.display = signingUp ? 'block' : 'none'; });
  document.querySelectorAll('.signin-only').forEach(el => { el.style.display = signingUp ? 'none' : 'block'; });
  document.getElementById('submit-btn').textContent = signingUp ? 'Create account' : 'Sign in';
  document.querySelectorAll('.field').forEach(field => field.classList.remove('has-error'));
}

function setMessage(message, isError = false) {
  let messageEl = document.getElementById('auth-message');
  if (!messageEl) {
    messageEl = document.createElement('p');
    messageEl.id = 'auth-message';
    messageEl.style.cssText = 'margin-top:12px;font-size:13px;line-height:1.5;';
    document.getElementById('auth-form').appendChild(messageEl);
  }
  messageEl.textContent = message;
  messageEl.style.color = isError ? '#A07868' : '#6B6560';
}

async function handleSubmit(event) {
  event.preventDefault();
  let ok = true;
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailField = document.getElementById('field-email');
  const passwordField = document.getElementById('field-password');

  emailField.classList.remove('has-error');
  passwordField.classList.remove('has-error');

  if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
    emailField.classList.add('has-error');
    ok = false;
  }
  if (!password.value || password.value.length < 8) {
    passwordField.classList.add('has-error');
    ok = false;
  }
  if (mode === 'signup') {
    const confirm = document.getElementById('confirm');
    const confirmField = document.getElementById('field-confirm');
    confirmField.classList.remove('has-error');
    if (confirm.value !== password.value) {
      confirmField.classList.add('has-error');
      ok = false;
    }
  }
  if (!ok) return;

  const button = document.getElementById('submit-btn');
  button.disabled = true;
  button.textContent = mode === 'signup' ? 'Creating...' : 'Signing in...';

  const authCall = mode === 'signup'
    ? supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: { data: { name: document.getElementById('name')?.value || '' } },
      })
    : supabase.auth.signInWithPassword({ email: email.value, password: password.value });

  const { error } = await authCall;
  if (error) {
    setMessage(error.message, true);
    button.disabled = false;
    button.textContent = mode === 'signup' ? 'Create account' : 'Sign in';
    return;
  }

  setMessage('Success. Opening your boards...');
  window.location.href = 'boards.html';
}

document.querySelectorAll('.signup-only').forEach(el => { el.style.display = 'none'; });
document.getElementById('auth-form').addEventListener('submit', handleSubmit);
document.querySelector('.btn-social')?.addEventListener('click', () => {
  setMessage('Google sign-in is not connected yet. Use email for now.', true);
});

const params = new URLSearchParams(window.location.search);
if (params.get('from') === 'boards') {
  document.getElementById('form-title').textContent = 'Your boards are waiting.';
  document.getElementById('form-sub').textContent = 'Sign in to see your saved boards and pick up where you left off.';
}

window.setMode = setMode;

getCurrentUser().then(user => {
  if (!user) return;
  const from = params.get('from');
  window.location.href = from === 'profile' ? 'profile.html' : 'boards.html';
});
