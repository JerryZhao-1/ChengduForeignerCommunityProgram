import { createRouter, createWebHistory } from "vue-router";

import AdminLayout from "@/layouts/AdminLayout.vue";
import AnnouncementsPage from "@/pages/AnnouncementsPage.vue";
import EventsPage from "@/pages/EventsPage.vue";
import FilesPage from "@/pages/FilesPage.vue";
import LoginPage from "@/pages/LoginPage.vue";
import LogsPage from "@/pages/LogsPage.vue";
import PlaceSubmissionsPage from "@/pages/PlaceSubmissionsPage.vue";
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
          path: "place-submissions",
          name: "place-submissions",
          component: PlaceSubmissionsPage,
          meta: { title: "用户提交审核" }
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

export default router;
