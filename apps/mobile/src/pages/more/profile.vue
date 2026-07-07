<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Post } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";
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
const activeTab = ref<"grid" | "reels">("grid");
const isFollowing = ref(false);

const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));

const profile = computed<ProfileInfo>(
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

const isSelf = computed(() => targetUserId.value === state.userId);
const bio = computed(() => {
  const value = state.locale === "zh" ? profile.value.bioZh : profile.value.bioEn;
  return value || copy.value.bioFallback;
});

const userPosts = computed(() =>
  posts.value.filter((post) => post.author_user_id === targetUserId.value)
);

const isVideoPost = (post: Post) => getFirstMedia(post)?.kind === "video";
const reelPosts = computed(() => userPosts.value.filter(isVideoPost));
const gridItems = computed(() =>
  activeTab.value === "grid" ? userPosts.value : reelPosts.value
);

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

const getThumb = (post: Post) => getFirstMedia(post)?.url ?? "";

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
  loadPosts();
});

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

const editProfile = () => {
  uni.navigateTo({ url: "/pages/more/language-settings" });
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
          <button class="action-btn ghost" @click="shareProfile">
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
      <view
        class="tab"
        :class="{ active: activeTab === 'grid' }"
        @click="activeTab = 'grid'"
      >
        {{ copy.posts }}
      </view>
      <view
        class="tab"
        :class="{ active: activeTab === 'reels' }"
        @click="activeTab = 'reels'"
      >
        {{ copy.videos }}
      </view>
    </view>

    <view v-if="gridItems.length" class="list">
      <view
        v-for="post in gridItems"
        :key="post._id"
        class="card"
        @click="openPost(post._id)"
      >
        <view class="card-media">
          <image
            v-if="getThumb(post)"
            class="card-cover"
            :src="getThumb(post)"
            mode="aspectFill"
          />
          <view v-else class="card-cover placeholder">{{ copy.textBadge }}</view>
          <view v-if="isVideoPost(post)" class="card-play">▶</view>
        </view>
        <view class="card-title">{{ post.title }}</view>
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

.list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 24rpx;
}

.card {
  overflow: hidden;
  border-radius: 20rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(15, 23, 42, 0.06);
}

.card-media {
  position: relative;
  width: 100%;
  height: 240rpx;
  background: #e2e8f0;
}

.card-cover {
  width: 100%;
  height: 100%;
}

.card-cover.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24rpx;
}

.card-play {
  position: absolute;
  top: 12rpx;
  right: 14rpx;
  color: #ffffff;
  font-size: 26rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.5);
}

.card-title {
  padding: 16rpx 18rpx 20rpx;
  color: #111827;
  font-size: 26rpx;
  line-height: 1.4;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty {
  padding: 80rpx 24rpx;
  text-align: center;
  color: #9ca3af;
  font-size: 26rpx;
}
</style>
