// Simple client-side login for demo purposes
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  const err = document.getElementById('login-error');
  const toggle = document.getElementById('toggle-pass');
  const loginBtn = document.getElementById('btn-login');
  const remember = document.getElementById('remember-me');
  const registerForm = document.getElementById('form-register');
  const registerErr = document.getElementById('register-error');
  const registerBtn = document.getElementById('btn-register');

  // Toggle password visibility
  toggle.addEventListener('click', () => {
    const pw = document.getElementById('login-password');
    if (pw.type === 'password') { pw.type = 'text'; toggle.textContent = '🙈'; }
    else { pw.type = 'password'; toggle.textContent = '👁️'; }
  });

  function showError(msg) { err.textContent = msg; err.style.display = msg ? 'block' : 'none'; }
  function showRegisterError(msg) { registerErr.textContent = msg; registerErr.style.display = msg ? 'block' : 'none'; }

  async function doLogin(user, pwd, rememberMe) {
    // Minimal client-side validation
    if (!user) return showError('Informe o usuário');
    if (!pwd) return showError('Informe a senha');
    loginBtn.disabled = true;
    showError('');
    // Simulate auth: accept any credentials for demo, but persist based on remember
    try {
      // try backend auth
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user, password: pwd }) });
      if (res.ok) {
        const data = await res.json();
        // store token
        if (rememberMe) localStorage.setItem('token', data.token);
        else sessionStorage.setItem('token', data.token);
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('garagem_user', JSON.stringify({ user: data.user.email, name: data.user.name }));
        window.location.href = '/';
        return;
      } else {
        // fallback to demo behaviour (no backend)
        const payload = { user, loggedAt: Date.now() };
        if (rememberMe) localStorage.setItem('garagem_user', JSON.stringify(payload));
        else sessionStorage.setItem('garagem_user', JSON.stringify(payload));
        await new Promise(r => setTimeout(r, 300));
        window.location.href = '/';
        return;
      }
    } catch (e) {
      showError('Erro ao processar login');
    } finally {
      loginBtn.disabled = false;
    }
  }

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const user = document.getElementById('login-username').value.trim();
    const pwd = document.getElementById('login-password').value.trim();
    const rememberMe = remember.checked;
    doLogin(user, pwd, rememberMe);
  });

  // Register flow
  if (registerForm) {
    registerForm.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      showRegisterError('');
      const email = document.getElementById('register-email').value.trim();
      const name = document.getElementById('register-name').value.trim();
      const pwd = document.getElementById('register-password').value.trim();
      if (!email || !pwd) return showRegisterError('Email e senha são obrigatórios');
      try {
        registerBtn.disabled = true;
        const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pwd, name }) });
        const body = await res.json();
        if (res.ok) {
          // store token in session by default
          sessionStorage.setItem('token', body.token);
          sessionStorage.setItem('garagem_user', JSON.stringify({ user: body.user.email, name: body.user.name }));
          window.location.href = '/';
        } else {
          showRegisterError(body.error || 'Erro ao registrar');
        }
      } catch (e) {
        showRegisterError('Erro ao registrar');
      } finally { registerBtn.disabled = false; }
    });
  }

  // No demo button: standard login only
});
