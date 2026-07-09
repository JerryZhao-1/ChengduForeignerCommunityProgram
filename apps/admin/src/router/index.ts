import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import { adminApi } from "@/api/client";
import { adminAuthToken } from "@/api/auth-token";
import AnnouncementsPage from "@/pages/AnnouncementsPage.vue";
import EventsPage from "@/pages/EventsPage.vue";
import FilesPage from "@/pages/FilesPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import LogsPage from "@/pages/LogsPage.vue";
import PlacesPage from "@/pages/PlacesPage.vue";
import PostsPage from "@/pages/PostsPage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginPage
    },
    {
      path: "/",
      component: AdminLayout,
      redirect: "/events",
      children: [
        {
          path: "events",
          name: "events",
          component: EventsPage,
          meta: { title: "活动管理" }
        },
        {
          path: "posts",
          name: "posts",
          component: PostsPage,
          meta: { title: "帖子治理" }
        },
        {
          path: "places",
          name: "places",
          component: PlacesPage,
          meta: { title: "地点管理" }
        },
        {
          path: "announcements",
          name: "announcements",
          component: AnnouncementsPage,
          meta: { title: "公告管理" }
        },
        {
          path: "files",
          name: "files",
          component: FilesPage,
          meta: { title: "文件回溯" }
        },
        {
          path: "logs",
          name: "logs",
          component: LogsPage,
          meta: { title: "操作日志" }
        }
      ]
    }
  ]
});

let validatedToken: string | undefined;
let validationPromise: Promise<boolean> | null = null;

const validateAdminToken = async () => {
  const token = adminAuthToken.get();

  if (!token) {
    validatedToken = undefined;
    return false;
  }

  if (token === validatedToken) {
    return true;
  }

  if (!validationPromise) {
    validationPromise = adminApi.auth
      .me()
      .then(() => {
        validatedToken = token;
        return true;
      })
      .catch(() => {
        adminAuthToken.clear();
        validatedToken = undefined;
        return false;
      })
      .finally(() => {
        validationPromise = null;
      });
  }

  return validationPromise;
};

router.beforeEach(async (to) => {
  const isLogin = to.name === "login";
  const isAuthenticated = await validateAdminToken();

  if (!isLogin && !isAuthenticated) {
    return {
      name: "login",
      query: { redirect: to.fullPath }
    };
  }

  if (isLogin && isAuthenticated) {
    return "/events";
  }

  return true;
});

export default router;
