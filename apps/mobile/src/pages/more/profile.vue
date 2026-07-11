<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { Post, PublicProfile } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import { getMobileCopy, resolveLocalized } from "@/i18n";
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

const { state } = useAppStore();
const copy = computed(() => getMobileCopy(state.locale).profile);

const targetUserId = ref(state.userId);
const statusBarHeight = ref(0);
const profileData = ref<PublicProfile | null>(null);
const activeTab = ref<"grid" | "reels">("grid");
const isFollowing = ref(false);
const isLoading = ref(true);
const errorMessage = ref("");
const isUpdatingFollow = ref(false);

const customNavStyle = computed(() => ({
  paddingTop: `${statusBarHeight.value}px`
}));

const isSelf = computed(() => targetUserId.value === state.userId);
const profile = computed<ProfileInfo>(() => {
  const user = profileData.value?.user;
  const stats = profileData.value?.stats;
  return {
    name: user?.nickname || targetUserId.value,
    handle: targetUserId.value,
    avatarUrl: user?.avatar_url ?? "",
    bioZh: "",
    bioEn: "",
    followers: stats?.follower_count ?? 0,
    following: stats?.following_count ?? 0
  };
});

const bio = computed(() => {
  const localized = resolveLocalized(
    state.locale,
    { zh: profile.value.bioZh, en: profile.value.bioEn },
    { optional: true }
  );
  return localized.value || copy.value.bioFallback;
});

const userPosts = computed(() => profileData.value?.posts ?? []);

const isVideoPost = (post: Post) => getFirstMedia(post)?.kind === "video";
const reelPosts = computed(() => profileData.value?.video_posts ?? []);
const gridItems = computed(() =>
  activeTab.value === "grid" ? userPosts.value : reelPosts.value
);

const postCount = computed(() => profileData.value?.stats.post_count ?? 0);

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

const loadProfile = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const result = await mobileApi.discover.profile(targetUserId.value);
    profileData.value = result.data;
    isFollowing.value = result.data.followed_by_actor;
  } catch {
    profileData.value = null;
    errorMessage.value = copy.value.unavailable;
  } finally {
    isLoading.value = false;
  }
};

onLoad((query) => {
  statusBarHeight.value = uni.getSystemInfoSync().statusBarHeight ?? 0;
  const id = String(query?.id ?? "").trim();
  if (id) {
    targetUserId.value = id;
  }
  loadProfile();
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

const openFollowList = (type: "followers" | "following") => {
  uni.navigateTo({
    url: `/pages/more/follows?id=${targetUserId.value}&type=${type}`
  });
};

const toggleFollow = async () => {
  if (isSelf.value || isUpdatingFollow.value) {
    return;
  }

  isUpdatingFollow.value = true;
  try {
    const result = await mobileApi.discover.setProfileFollow(
      targetUserId.value,
      {
        following: !isFollowing.value
      }
    );
    isFollowing.value = result.data.following;
    if (profileData.value) {
      profileData.value = {
        ...profileData.value,
        followed_by_actor: result.data.following,
        stats: {
          ...profileData.value.stats,
          follower_count: result.data.follower_count,
          following_count: result.data.following_count
        }
      };
    }
    uni.showToast({
      title: isFollowing.value ? copy.value.followDone : copy.value.unfollowDone,
      icon: "none"
    });
  } catch {
    uni.showToast({ title: copy.value.followError, icon: "none" });
  } finally {
    isUpdatingFollow.value = false;
  }
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

    <view v-if="isLoading" class="state-message">{{ copy.loading }}</view>
    <view v-else-if="errorMessage" class="state-message error">
      {{ errorMessage }}
    </view>

    <view v-else class="cover">
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
            :disabled="isUpdatingFollow"
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

    <view v-if="!isLoading && !errorMessage" class="stats-card">
      <view class="stat">
        <view class="stat-value">{{ formatCount(postCount) }}</view>
        <view class="stat-label">{{ copy.posts }}</view>
      </view>
      <view class="stat-divider" />
      <view class="stat" @click="openFollowList('followers')">
        <view class="stat-value">{{ formatCount(profile.followers) }}</view>
        <view class="stat-label">{{ copy.followers }}</view>
      </view>
      <view class="stat-divider" />
      <view class="stat" @click="openFollowList('following')">
        <view class="stat-value">{{ formatCount(profile.following) }}</view>
        <view class="stat-label">{{ copy.following }}</view>
      </view>
    </view>

    <view v-if="!isLoading && !errorMessage" class="tabs">
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

    <view v-if="!isLoading && !errorMessage && gridItems.length" class="list">
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
    <view v-else-if="!isLoading && !errorMessage" class="empty">
      {{ copy.emptyPosts }}
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 40rpx;
  background: #f5f7f6;
}

.state-message {
  padding: 80rpx 32rpx;
  color: #6b7280;
  font-size: 28rpx;
  text-align: center;
}

.state-message.error {
  color: #b45309;
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
