import { reactive } from 'vue';

// Reactive session state, shared across every component that imports this file.
// Initialized once from localStorage on app load.
export const authState = reactive({
  token: localStorage.getItem('token') || null,
  role: localStorage.getItem('role') || null,
  username: localStorage.getItem('username') || null
});

export function isLoggedIn() {
  return !!authState.token;
}

export function isAdmin() {
  return authState.role === 'admin';
}

export function getUsername() {
  return authState.username;
}

export function setSession({ token, role, username }) {
  localStorage.setItem('token', token);
  localStorage.setItem('role', role);
  localStorage.setItem('username', username);

  // Update reactive state too — this is what makes the navbar update instantly.
  authState.token = token;
  authState.role = role;
  authState.username = username;
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');

  authState.token = null;
  authState.role = null;
  authState.username = null;
}

export function getToken() {
  return authState.token;
}

export function updateStoredUsername(newUsername) {
  localStorage.setItem('username', newUsername);
  authState.username = newUsername;
}