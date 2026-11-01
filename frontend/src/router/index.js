import { createRouter, createWebHistory } from "vue-router";
import { watch } from "vue";
import { auth, restoreSession } from "../stores/auth.js";
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
router.beforeEach(async (to) => {
  if (!auth.loaded) {
    try {
      await restoreSession();
    } catch (err) {
      auth.user = null;
      auth.loaded = true;
    }
  }
  if (to.path !== "/login" && !auth.user) {
    return "/login";
  }
  if (to.path === "/login" && auth.user) {
    return "/tasks";
  }
});

watch(() => auth.user, (user) => {
  if (!user && router.currentRoute.value.path !== "/login") {
    router.replace("/login");
  }
});
export default router;
