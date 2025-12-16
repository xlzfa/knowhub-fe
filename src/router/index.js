import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../views/HomePage.vue";
import LoginPage from "../views/LoginPage.vue";
import RegisterPage from "../views/RegisterPage.vue";
import PostDetailPage from "../views/PostDetailPage.vue";
import CreatePostPage from "../views/CreatePostPage.vue";
import ProfilePage from "../views/ProfilePage.vue";
import EditProfilePage from "../views/EditProfilePage.vue";
import SearchPage from "../views/SearchPage.vue";
import HotPage from "../views/HotPage.vue";
import { useUserStore } from "../stores/user";

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: "/", name: "home", component: HomePage },
    { path: "/login", name: "login", component: LoginPage },
    { path: "/register", name: "register", component: RegisterPage },
    { path: "/post/:id", name: "post-detail", component: PostDetailPage, props: true },
    {
      path: "/create",
      name: "create-post",
      component: CreatePostPage,
      meta: { requiresAuth: true }
    },
    {
      path: "/profile",
      name: "profile",
      component: ProfilePage,
      meta: { requiresAuth: true }
    },
    {
      path: "/profile/edit",
      name: "profile-edit",
      component: EditProfilePage,
      meta: { requiresAuth: true }
    },
    { path: "/search", name: "search", component: SearchPage },
    { path: "/hot", name: "hot", component: HotPage }
  ]
});

function authGuard(to, _from, next) {
  const userStore = useUserStore();
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else {
    next();
  }
}

router.beforeEach(authGuard);

export default router;

