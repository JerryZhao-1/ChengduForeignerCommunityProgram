<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onShow } from "@dcloudio/uni-app";
import type { Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
import { getProfileOverride, type ProfileOverride } from "@/stores/profile-store";
import { getFirstMedia } from "@/pages/discover/media";

interface ProfileInfo {
  name: string;
  handle: string;
  avatarUrl: string;
  bioZh: string;
  bioEn: string;
  followers: number;
  following: number;
}

const userProfiles: Record<string, ProfileInfo> = {
  user_001: {
    name: "Jerry",
    handle: "jerry_",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    bioZh: "桐梓林在地生活分享 · 早晨散步与咖啡\n记录社区里的日常小事。",
    bioEn: "Tongzilin local life · morning walks & coffee\nSharing the little things around the community.",
    followers: 1280,
    following: 342
  },
  user_002: {
    name: "Emma",
    handle: "emma.cd",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    bioZh: "语言交换组织者 · 网球爱好者\n欢迎新邻居一起玩。",
    bioEn: "Language exchange host · tennis lover\nNew neighbors always welcome.",
    followers: 2460,
    following: 512
  },
  user_003: {
    name: "李雷",
    handle: "lilei",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    bioZh: "桐梓林老住户，爱运动、爱分享本地信息。",
    bioEn: "Longtime Tongzilin resident who loves sports and local tips.",
    followers: 620,
    following: 210
  },
  user_004: {
    name: "Sophie",
    handle: "sophie_h",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    bioZh: "刚搬来的新邻居，正在学中文。",
    bioEn: "New neighbor here, learning Chinese step by step.",
    followers: 138,
    following: 305
  }
};

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].profile);

const targetUserId = ref(state.userId);
const statusBarHeight = ref(0);
const posts = ref<Post[]>([]);
const isFollowing = ref(false);
const override = ref<ProfileOverride>({});

const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));

const baseProfile = computed<ProfileInfo>(
  () =>
    userProfiles[targetUserId.value] ?? {
      name: targetUserId.value,
      handle: targetUserId.value,
      avatarUrl: "",
      bioZh: "",
      bioEn: "",
      followers: 0,
      following: 0
    }
);

const profile = computed<ProfileInfo>(() => ({
  ...baseProfile.value,
  name: override.value.name || baseProfile.value.name,
  handle: override.value.handle || baseProfile.value.handle,
  avatarUrl: override.value.avatarUrl || baseProfile.value.avatarUrl
}));

const isSelf = computed(() => targetUserId.value === state.userId);
const bio = computed(() => {
  if (override.value.bio) {
    return override.value.bio;
  }
  const value =
    state.locale === "zh" ? baseProfile.value.bioZh : baseProfile.value.bioEn;
  return value || copy.value.bioFallback;
});

const refreshOverride = () => {
  override.value = getProfileOverride(targetUserId.value);
};

const userPosts = computed(() =>
  posts.value.filter((post) => post.author_user_id === targetUserId.value)
);

const leftColumn = computed(() =>
  userPosts.value.filter((_, index) => index % 2 === 0)
);
const rightColumn = computed(() =>
  userPosts.value.filter((_, index) => index % 2 === 1)
);

const isVideoPost = (post: Post) => getFirstMedia(post)?.kind === "video";

const postCount = computed(() => userPosts.value.length);

const formatCount = (value: number) => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)}w`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return `${value}`;
};

const getCoverImage = (post: Post) => {
  const first = getFirstMedia(post);
  return first?.kind === "image" ? first.url : "";
};

const getVideoUrl = (post: Post) => {
  const first = getFirstMedia(post);
  return first?.kind === "video" ? first.url : "";
};

const getExcerpt = (post: Post) => {
  const text = (post.content ?? post.title ?? "").trim();
  return text.length > 100 ? `${text.slice(0, 100)}...` : text;
};

const loadPosts = async () => {
  try {
    const result = await mobileApi.discover.listPosts({
      communityId: state.communityId,
      page: 1,
      pageSize: 50
    });
    posts.value = result.data.items;
  } catch {
    posts.value = [];
  }
};

onLoad((query) => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  const id = String(query?.id ?? "").trim();
  if (id) {
    targetUserId.value = id;
  }
  refreshOverride();
  loadPosts();
});

onShow(refreshOverride);

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 });
    return;
  }
  uni.switchTab({ url: "/pages/home/index" });
};

const openPost = (id: string) => {
  uni.navigateTo({ url: `/pages/discover/detail?id=${id}` });
};

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value;
  uni.showToast({
    title: isFollowing.value ? copy.value.followDone : copy.value.unfollowDone,
    icon: "none"
  });
};

const shareProfile = () => {
  uni.setClipboardData({
    data: `/pages/more/profile?id=${targetUserId.value}`,
    success: () => {
      uni.showToast({ title: copy.value.shareLinkCopied, icon: "none" });
    }
  });
};

const sendMessage = () => {
  uni.showToast({ title: copy.value.messageComingSoon, icon: "none" });
};

const editProfile = () => {
  uni.navigateTo({ url: "/pages/more/profile-edit" });
};
</script>

<template>
  <view class="page">
    <view class="custom-nav" :style="customNavStyle">
      <view class="nav-content">
        <view class="nav-back" @click.stop="goBack">‹</view>
        <view class="nav-handle">{{ profile.name }}</view>
        <view class="nav-spacer" />
      </view>
    </view>

    <view class="cover">
      <view class="cover-top">
        <image
          v-if="profile.avatarUrl"
          class="avatar"
          :src="profile.avatarUrl"
          mode="aspectFill"
        />
        <view v-else class="avatar fallback">
          {{ profile.name.slice(0, 1).toUpperCase() }}
        </view>
        <view class="cover-info">
          <view class="display-name">{{ profile.name }}</view>
          <view class="handle">@{{ profile.handle }}</view>
        </view>
      </view>
      <view class="community-tag">
        <text class="pin">◎</text>{{ copy.communityLabel }}
      </view>
      <view class="bio">{{ bio }}</view>

      <view class="actions">
        <template v-if="isSelf">
          <button class="action-btn primary" @click="editProfile">
            {{ copy.editProfile }}
          </button>
          <button class="action-btn ghost" @click="shareProfile">
            {{ copy.shareProfile }}
          </button>
        </template>
        <template v-else>
          <button
            class="action-btn primary"
            :class="{ followed: isFollowing }"
            @click="toggleFollow"
          >
            {{ isFollowing ? copy.followed : copy.follow }}
          </button>
          <button class="action-btn ghost" @click="sendMessage">
            {{ copy.message }}
          </button>
        </template>
      </view>
    </view>

    <view class="stats-card">
      <view class="stat">
        <view class="stat-value">{{ formatCount(postCount) }}</view>
        <view class="stat-label">{{ copy.posts }}</view>
      </view>
      <view class="stat-divider" />
      <view class="stat">
        <view class="stat-value">{{ formatCount(profile.followers) }}</view>
        <view class="stat-label">{{ copy.followers }}</view>
      </view>
      <view class="stat-divider" />
      <view class="stat">
        <view class="stat-value">{{ formatCount(profile.following) }}</view>
        <view class="stat-label">{{ copy.following }}</view>
      </view>
    </view>

    <view class="tabs">
      <view class="tab active">{{ copy.posts }}</view>
    </view>

    <view v-if="userPosts.length" class="waterfall">
      <view
        v-for="(column, colIndex) in [leftColumn, rightColumn]"
        :key="colIndex"
        class="wf-col"
      >
        <view
          v-for="post in column"
          :key="post._id"
          class="wf-card"
          @click="openPost(post._id)"
        >
          <image
            v-if="getCoverImage(post)"
            class="wf-image"
            :src="getCoverImage(post)"
            mode="widthFix"
          />
          <view v-else-if="isVideoPost(post)" class="wf-video-wrap">
            <video
              class="wf-video"
              :src="getVideoUrl(post)"
              :controls="false"
              :show-center-play-btn="false"
              :enable-progress-gesture="false"
              :show-fullscreen-btn="false"
              object-fit="cover"
            />
            <view class="card-play">▶</view>
          </view>
          <view v-else class="wf-text">
            <text class="text-cover-quote">“</text>
            <text class="wf-text-body">{{ getExcerpt(post) }}</text>
          </view>
          <view class="wf-title">{{ post.title }}</view>
        </view>
      </view>
    </view>
    <view v-else class="empty">{{ copy.emptyPosts }}</view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #f5f7f6;
}

.custom-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #0f766e;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-height: 92rpx;
  padding: 0 24rpx;
}

.nav-back {
  width: 48rpx;
  height: 72rpx;
  line-height: 66rpx;
  color: #ffffff;
  font-size: 58rpx;
  font-weight: 300;
}

.nav-handle {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
}

.nav-spacer {
  flex: 1;
  min-width: 0;
}

.cover {
  padding: 28rpx 32rpx 36rpx;
  background: linear-gradient(135deg, #0f766e, #155e75);
  border-radius: 0 0 32rpx 32rpx;
  color: #ffffff;
}

.cover-top {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.avatar {
  flex-shrink: 0;
  width: 132rpx;
  height: 132rpx;
  border-radius: 32rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  background: #cbd5e1;
}

.avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f766e;
  background: #ffffff;
  font-size: 52rpx;
  font-weight: 700;
}

.cover-info {
  flex: 1;
  min-width: 0;
}

.display-name {
  font-size: 40rpx;
  font-weight: 700;
}

.handle {
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.8);
  font-size: 26rpx;
}

.community-tag {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 20rpx;
  padding: 6rpx 18rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.18);
  font-size: 24rpx;
}

.pin {
  font-size: 24rpx;
}

.bio {
  margin-top: 18rpx;
  color: rgba(255, 255, 255, 0.92);
  font-size: 26rpx;
  line-height: 1.55;
  white-space: pre-wrap;
}

.actions {
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}

.action-btn {
  flex: 1;
  margin: 0;
  min-height: 64rpx;
  line-height: 64rpx;
  border-radius: 14rpx;
  font-size: 26rpx;
  font-weight: 600;
}

.action-btn.primary {
  background: #ffffff;
  color: #0f766e;
}

.action-btn.primary.followed {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.action-btn.ghost {
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.stats-card {
  display: flex;
  align-items: center;
  margin: -20rpx 24rpx 0;
  padding: 26rpx 0;
  border-radius: 24rpx;
  background: #ffffff;
  box-shadow: 0 10rpx 30rpx rgba(15, 118, 110, 0.1);
}

.stat {
  flex: 1;
  text-align: center;
}

.stat-value {
  color: #0f766e;
  font-size: 36rpx;
  font-weight: 700;
}

.stat-label {
  margin-top: 6rpx;
  color: #6b7280;
  font-size: 24rpx;
}

.stat-divider {
  width: 1rpx;
  height: 48rpx;
  background: #e5e7eb;
}

.tabs {
  display: flex;
  gap: 40rpx;
  margin: 28rpx 32rpx 0;
}

.tab {
  padding-bottom: 12rpx;
  color: #9ca3af;
  font-size: 28rpx;
  font-weight: 600;
  border-bottom: 4rpx solid transparent;
}

.tab.active {
  color: #0f766e;
  border-bottom-color: #0f766e;
}

.waterfall {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  padding: 24rpx;
}

.wf-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.wf-card {
  overflow: hidden;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.06);
}

.wf-image {
  width: 100%;
  display: block;
  background: #e2e8f0;
}

.wf-video-wrap {
  position: relative;
  width: 100%;
  height: 320rpx;
  background: #000000;
}

.wf-video {
  width: 100%;
  height: 100%;
}

.wf-text {
  position: relative;
  padding: 30rpx 22rpx 10rpx;
  background: linear-gradient(135deg, #ecfdf5, #f0fdfa);
}

.text-cover-quote {
  position: absolute;
  top: 6rpx;
  left: 14rpx;
  color: rgba(15, 118, 110, 0.25);
  font-size: 72rpx;
  font-weight: 700;
  line-height: 1;
}

.wf-text-body {
  position: relative;
  z-index: 1;
  color: #334155;
  font-size: 27rpx;
  line-height: 1.55;
}

.card-play {
  position: absolute;
  top: 12rpx;
  right: 14rpx;
  color: #ffffff;
  font-size: 26rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
}

.wf-title {
  padding: 16rpx 18rpx 22rpx;
  color: #111827;
  font-size: 27rpx;
  line-height: 1.45;
  font-weight: 600;
}

.empty {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 26rpx;
}
</style>
