import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../stores/auth.js";
import AppLayout from "../layouts/AppLayout.vue";
import LoginView from "../views/LoginView.vue";
import TasksView from "../views/TasksView.vue";
import ProfileView from "../views/ProfileView.vue";
import NewToDoListView from "../views/NewToDoListView.vue";
import PresetsView from "../views/PresetsView.vue";
import InformationView from "../views/InformationView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", redirect: "/login" },
    { path: "/login", component: LoginView },
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "tasks", component: TasksView },
        { path: "profile", component: ProfileView },
        { path: "newtodolist", component: NewToDoListView },
        { path: "presets", component: PresetsView },
        { path: "information", component: InformationView },
      ],
    },
  ],
});
router.beforeEach((to) => {
  if (to.path !== "/login" && !auth.user) {
    return "/login";
  }
  if (to.path === "/login" && auth.user) {
    return "/tasks";
  }
});
export default router;
