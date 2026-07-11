<script setup lang="ts">
import { computed, ref } from "vue";

import { mobileApi } from "@/api/client";
import { mobileEnv } from "@/config/env";
import { getMobileCopy, interpolate } from "@/i18n";
import {
  buildLocalePreferenceInput,
  useAppStore
} from "@/stores/app-store";

const session = ref("");
const loading = ref(false);
const error = ref("");
const { state, setAuthenticatedUser } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).auth);

const login = async () => {
  loading.value = true;
  error.value = "";
  try {
    const preferenceInput = buildLocalePreferenceInput(
      state.locale,
      state.hasExplicitLocale
    );
    const result =
      mobileEnv.apiMode === "cloudbase-function"
        ? await mobileApi.auth.wechatMiniappSession(preferenceInput)
        : await mobileApi.auth.login(preferenceInput);
    await setAuthenticatedUser(
      result.data.user._id,
      result.data.user.preferred_language
    );
    session.value = interpolate(copy.value.signedInAs, {
      name: result.data.user.nickname
    });
    uni.showToast({ title: copy.value.success, icon: "none" });
  } catch {
    session.value = "";
    error.value = copy.value.error;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <view class="page">
    <view class="title">{{ copy.title }}</view>
    <button class="primary" :disabled="loading" @click="login">
      {{ loading ? copy.signingIn : copy.signIn }}
    </button>
    <view v-if="session" class="caption">{{ session }}</view>
    <view v-if="error" class="caption error">{{ error }}</view>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.title {
  margin-bottom: 24rpx;
  font-size: 36rpx;
  font-weight: 700;
}

.primary {
  background: #111827;
  color: white;
}

.caption {
  margin-top: 20rpx;
  color: #6b7280;
}

.caption.error {
  color: #b91c1c;
}
</style>
