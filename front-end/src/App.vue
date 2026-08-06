<template>
  <div id="app-shell">
    <nav class="navbar">
      <div class="navbar-left">
        <span class="brand-logo">Polyglot</span>
        <span class="brand-tag">ACADEMIC EDITION</span>
      </div>

      <div class="navbar-center">
        <router-link to="/words" class="nav-link">Dictionary</router-link>
        <router-link v-if="userIsLoggedIn" to="/favourites" class="nav-link">Favourites</router-link>
        <router-link v-if="userIsAdmin" to="/words/new" class="nav-link">Add Word</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
      </div>

<div class="navbar-right">
  <template v-if="userIsLoggedIn">
    <div class="user-menu" @click="menuOpen = !menuOpen" v-click-outside="closeMenu">
      <span class="username-label">{{ currentUsername }}</span>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>

      <div v-if="menuOpen" class="dropdown">
        <router-link to="/account" class="dropdown-item" @click="menuOpen = false">
          Account Settings
        </router-link>
        <button class="dropdown-item dropdown-logout" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>
  </template>
  <template v-else>
    <router-link to="/login" class="nav-link login-link">Login</router-link>
    <router-link to="/register" class="register-btn">Register</router-link>
  </template>
</div>
    </nav>

    <main class="app-content">
      <router-view />
    </main>

    <RandomWordModal />
  </div>
</template>

<script>
import { isAdmin, isLoggedIn, getUsername, clearSession } from './utils/auth';
import RandomWordModal from './views/RandomWordModal.vue';

export default {
  name: 'App',
  components: { RandomWordModal },
  data() {
    return {
      menuOpen: false
    };
  },
  computed: {
    userIsAdmin() {
      return isAdmin();
    },
    userIsLoggedIn() {
      return isLoggedIn();
    },
    currentUsername() {
      return getUsername();
    }
  },
  methods: {
    closeMenu() {
      this.menuOpen = false;
    },
    handleLogout() {
      this.menuOpen = false;
      clearSession();
      this.$router.push('/login');
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,500;1,600&family=Inter:wght@400;500;600;700&display=swap');

:root {
  --bg-espresso: #1B1614;
  --bg-mocha: #29211C;
  --text-taupe: #D6CFC9;
  --text-muted: #8A7C72;
  --accent-gold: #CFA76E;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  background-color: var(--bg-espresso);
  color: var(--text-taupe);
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

#app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  width: 100%;
}

/* Navbar */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.navbar-left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.brand-logo {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 1.4rem;
  color: var(--accent-gold);
}

.brand-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--text-muted);
  font-weight: 600;
}

.navbar-center {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  padding-bottom: 6px;
  position: relative;
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--text-taupe);
}

.nav-link.router-link-exact-active {
  color: var(--text-taupe);
}

.nav-link.router-link-exact-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background-color: var(--accent-gold);
  border-radius: 2px;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.icon-btn:hover {
  color: var(--accent-gold);
}


@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    gap: 16px;
    padding: 16px 20px;
  }

  .navbar-center {
    order: 3;
    width: 100%;
    justify-content: center;
    gap: 20px;
  }
}

.register-btn {
  background-color: var(--accent-gold);
  color: var(--bg-espresso);
  text-decoration: none;
  font-size: 0.82rem;
  font-weight: 700;
  padding: 8px 18px;
  border-radius: 999px;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.register-btn:hover {
  background-color: #ddbb85;
}

.register-btn:active {
  transform: scale(0.97);
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-taupe);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-menu:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.username-label {
  text-transform: capitalize;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: var(--bg-mocha);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  min-width: 170px;
  overflow: hidden;
  z-index: 20;
}

.dropdown-item {
  display: block;
  width: 100%;
  text-align: left;
  padding: 12px 16px;
  color: var(--text-taupe);
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(207, 167, 110, 0.1);
  color: var(--accent-gold);
}

.dropdown-logout {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  color: #c96a5a;
}

.dropdown-logout:hover {
  background-color: rgba(201, 106, 90, 0.08);
  color: #c96a5a;
}

</style>