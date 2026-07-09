<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import { getProfileOverride, setProfileOverride } from "@/stores/profile-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].profile);

const statusBarHeight = ref(0);
const name = ref("");
const handle = ref("");
const bio = ref("");
const avatarUrl = ref("");
const isSaving = ref(false);

const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));

const avatarInitial = computed(() =>
  name.value ? name.value.slice(0, 1).toUpperCase() : "U"
);

const prefill = async () => {
  const override = getProfileOverride(state.userId);
  name.value = override.name ?? "";
  handle.value = override.handle ?? "";
  bio.value = override.bio ?? "";
  avatarUrl.value = override.avatarUrl ?? "";

  try {
    const me = await mobileApi.auth.me();
    const user = me.data.user;
    if (!name.value) {
      name.value = user.nickname ?? "";
    }
    if (!avatarUrl.value) {
      avatarUrl.value = user.avatar_url ?? "";
    }
    if (!handle.value && user.nickname) {
      handle.value = user.nickname.toLowerCase().replace(/\s+/g, "_");
    }
  } catch {
    // Keep whatever is already prefilled from local overrides.
  }
};

onLoad(() => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  prefill();
});

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
    return;
  }
  uni.switchTab({ url: "/pages/home/index" });
};

const changeAvatar = async () => {
  try {
    const result = await uni.chooseImage({ count: 1, sizeType: ["compressed"] });
    const [path] = result.tempFilePaths;
    if (path) {
      avatarUrl.value = path;
    }
  } catch {
    // User cancellation does not need feedback.
  }
};

const save = () => {
  if (isSaving.value) {
    return;
  }
  isSaving.value = true;
  setProfileOverride(state.userId, {
    name: name.value.trim(),
    handle: handle.value.trim(),
    bio: bio.value.trim(),
    avatarUrl: avatarUrl.value
  });
  uni.showToast({ title: copy.value.saved, icon: "success" });
  setTimeout(() => {
    isSaving.value = false;
    goBack();
  }, 600);
};
</script>

<template>
  <view class="page">
    <view class="custom-nav" :style="customNavStyle">
      <view class="nav-content">
        <view class="nav-back" @click.stop="goBack">‹</view>
        <view class="nav-title">{{ copy.editProfile }}</view>
        <button class="nav-save" :disabled="isSaving" @click.stop="save">
          {{ copy.save }}
        </button>
        <view class="nav-spacer" />
      </view>
    </view>

    <view class="avatar-section" @click="changeAvatar">
      <image
        v-if="avatarUrl"
        class="avatar"
        :src="avatarUrl"
        mode="aspectFill"
      />
      <view v-else class="avatar fallback">{{ avatarInitial }}</view>
      <view class="avatar-hint">{{ copy.changeAvatar }}</view>
    </view>

    <view class="form">
      <view class="field">
        <view class="field-label">{{ copy.nameLabel }}</view>
        <input
          v-model="name"
          class="field-input"
          :placeholder="copy.namePlaceholder"
          maxlength="24"
        />
      </view>
      <view class="field">
        <view class="field-label">{{ copy.handleLabel }}</view>
        <input
          v-model="handle"
          class="field-input"
          :placeholder="copy.handlePlaceholder"
          maxlength="24"
        />
      </view>
      <view class="field column">
        <view class="field-label">{{ copy.bioLabel }}</view>
        <textarea
          v-model="bio"
          class="field-textarea"
          :placeholder="copy.bioPlaceholder"
          maxlength="120"
        />
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: #f5f7f6;
}

.custom-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #ffffff;
  border-bottom: 1rpx solid #eef2f7;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
  min-height: 92rpx;
  padding: 0 24rpx;
}

.nav-back {
  width: 48rpx;
  height: 72rpx;
  line-height: 66rpx;
  color: #111827;
  font-size: 58rpx;
  font-weight: 300;
}

.nav-title {
  flex-shrink: 0;
  color: #111827;
  font-size: 32rpx;
  font-weight: 700;
}

.nav-save {
  flex-shrink: 0;
  margin: 0;
  padding: 0 26rpx;
  min-height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 26rpx;
}

.nav-save[disabled] {
  opacity: 0.6;
}

.nav-spacer {
  flex: 1;
  min-width: 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14rpx;
  padding: 44rpx 0 32rpx;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #cbd5e1;
}

.avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: #0f766e;
  font-size: 60rpx;
  font-weight: 700;
}

.avatar-hint {
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 600;
}

.form {
  margin: 0 24rpx;
  border-radius: 20rpx;
  background: #ffffff;
  overflow: hidden;
}

.field {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 26rpx 28rpx;
  border-bottom: 1rpx solid #f1f1f1;
}

.field.column {
  flex-direction: column;
  align-items: stretch;
  gap: 14rpx;
}

.field:last-child {
  border-bottom: none;
}

.field-label {
  flex-shrink: 0;
  width: 120rpx;
  color: #374151;
  font-size: 28rpx;
  font-weight: 600;
}

.field-input {
  flex: 1;
  min-width: 0;
  height: 56rpx;
  color: #111827;
  font-size: 28rpx;
}

.field-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 160rpx;
  color: #111827;
  font-size: 28rpx;
  line-height: 1.6;
}
</style>
