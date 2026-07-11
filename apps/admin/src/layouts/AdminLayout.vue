<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import { adminAuthToken } from "@/api/auth-token";

const router = useRouter();
const route = useRoute();

const menuItems = [
  { index: "/events", label: "活动管理" },
  { index: "/posts", label: "帖子治理" },
  { index: "/places", label: "地点管理" },
  { index: "/announcements", label: "公告管理" },
  { index: "/files", label: "文件回溯" },
  { index: "/logs", label: "操作日志" }
];

const activePath = computed(() => route.path);

const logout = () => {
  adminAuthToken.clear();
  router.push("/login");
};
</script>

<template>
  <el-container style="min-height: 100vh">
    <el-aside width="240px" style="background: #111827; color: white">
      <div style="padding: 24px; font-size: 18px; font-weight: 600">桐梓林轻后台</div>
      <el-menu
        :default-active="activePath"
        background-color="#111827"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
        @select="(path: string) => router.push(path)"
      >
        <el-menu-item v-for="item in menuItems" :key="item.index" :index="item.index">
          {{ item.label }}
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header
        style="background: white; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between"
      >
        <div style="font-weight: 600">{{ route.meta.title ?? "社区后台" }}</div>
        <div style="display: flex; align-items: center; gap: 12px">
          <el-button size="small" @click="logout">退出登录</el-button>
        </div>
      </el-header>
      <el-main style="padding: 24px">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
