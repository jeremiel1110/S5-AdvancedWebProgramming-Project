import { createRouter, createWebHistory } from 'vue-router'

import LoginView from "../views/LoginView.vue"
import MainView from "../views/MainView.vue"
import ProfileView from '../views/ProfileView.vue'
import PresetsView from '../views/PresetsView.vue'
import InformationView from '../views/InformationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginView },
    { path: '/main', component: MainView },
    { path: '/profile', component: ProfileView },
    { path: '/presets', component: PresetsView },
    { path: '/information', component: InformationView }
  ],
})

export default router
