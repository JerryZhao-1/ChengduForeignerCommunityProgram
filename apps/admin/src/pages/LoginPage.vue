<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { ApiClientError } from "@community-map/shared";

import { adminApi } from "@/api/client";
import { adminAuthToken } from "@/api/auth-token";

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const session = ref<string>("");
const form = reactive({
  username: "",
  password: ""
});

const submit = async () => {
  loading.value = true;
  try {
    const result = await adminApi.auth.adminLogin(form);
    adminAuthToken.set(result.data.token);
    session.value = `${result.data.user.nickname} / ${result.data.user.role_flags.join(", ")}`;
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/events";
    router.push(redirect);
  } catch (error) {
    const message =
      error instanceof ApiClientError
        ? error.message
        : "登录失败，请稍后重试。";
    ElMessage.error(message);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div
    style="min-height: 100vh; display: grid; place-items: center; background: #f3f4f6"
  >
    <div class="page-card" style="width: 420px">
      <h2 style="margin-top: 0">后台登录</h2>
      <p style="color: #6b7280">使用管理员账号进入桐梓林轻后台。</p>
      <el-form label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            show-password
            @keyup.enter="submit"
          />
        </el-form-item>
      </el-form>
      <el-button type="primary" :loading="loading" @click="submit">进入后台</el-button>
      <div v-if="session" style="margin-top: 16px; color: #374151">当前会话：{{ session }}</div>
    </div>
  </div>
</template>
