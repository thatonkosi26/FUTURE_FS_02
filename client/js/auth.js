/* ==========================================
   auth.js — JWT Authentication Module
   ========================================== */
const Auth = (() => {
  const KEY = 'ciq_token';
  const USER_KEY = 'ciq_user';

  function getToken() {
    return localStorage.getItem(KEY);
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY));
    } catch { return null; }
  }

  function setSession(token, user) {
    localStorage.setItem(KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(USER_KEY);
  }

  async function login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Login failed');
    setSession(data.token, data.user);
    return data;
  }

  function logout() {
    clearSession();
    window.location.href = 'login.html';
  }

  function requireAuth() {
    if (!getToken()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  return { getToken, getUser, login, logout, requireAuth, setSession, clearSession };
})();
