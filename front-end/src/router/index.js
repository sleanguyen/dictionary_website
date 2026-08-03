import { createRouter, createWebHistory } from 'vue-router';
import Dictionary from '../views/Dictionary.vue';
import AddWord from '../views/AddWord.vue';
import Edit from '../views/Edit.vue';
import About from '../views/About.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Account from '../views/Account.vue';
import { isAdmin, isLoggedIn } from '../utils/auth';

const routes = [
  { path: '/', redirect: '/words' },
  { path: '/words', name: 'Dictionary', component: Dictionary },
  {
    path: '/words/new',
    name: 'WordCreate',
    component: AddWord,
    meta: { requiresAdmin: true }
  },
  {
    path: '/words/:id/edit',
    name: 'WordEdit',
    component: Edit,
    props: true,
    meta: { requiresAdmin: true }
  },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: { requiresAuth: true }
  },
  { path: '/about', name: 'About', component: About }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAdmin && !isAdmin()) {
    next('/words');
  } else if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});

export default router;