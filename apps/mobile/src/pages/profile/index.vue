<script setup lang="ts">
import type { Comment, Event, PlaceListItem, Post, User } from "@community-map/shared";
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { pickLocalized, useAppStore } from "@/stores/app-store";

type ProfileTab = "favorites" | "reviews";

interface ProfileSummary {
  user: User;
  is_self: boolean;
  is_following: boolean;
  follower_count: number;
  following_count: number;
}

const { state } = useAppStore();
const users = ref<User[]>([]);
const currentUser = ref<User | null>(null);
const selectedUserId = ref("");
const summary = ref<ProfileSummary | null>(null);
const favoriteEvents = ref<Event[]>([]);
const favoritePosts = ref<Post[]>([]);
const favoritePlaces = ref<PlaceListItem[]>([]);
const comments = ref<Array<{ comment: Comment; post: Post | null }>>([]);
const activeTab = ref<ProfileTab>("favorites");
const slideClass = ref("slide-from-left");
const loading = ref(false);

const selectedUser = computed(
  () => users.value.find((user) => user._id === selectedUserId.value) ?? null
);

const avatarInitial = computed(
  () => (selectedUser.value?.nickname ?? "U").trim().slice(0, 1).toUpperCase() || "U"
);

const loadProfile = async (targetUserId = selectedUserId.value) => {
  if (!targetUserId) {
    return;
  }

  loading.value = true;

  try {
    const [summaryResult, favoritesResult, commentsResult] = await Promise.all([
      mobileApi.profile.summary(targetUserId),
      mobileApi.profile.favorites(targetUserId),
      mobileApi.profile.comments(targetUserId)
    ]);

    summary.value = summaryResult.data;
    favoriteEvents.value = favoritesResult.data.events;
    favoritePosts.value = favoritesResult.data.posts;
    favoritePlaces.value = favoritesResult.data.places;
    comments.value = commentsResult.data;
  } finally {
    loading.value = false;
  }
};

const load = async () => {
  const [meResult, usersResult] = await Promise.all([
    mobileApi.auth.me(),
    mobileApi.profile.users()
  ]);

  currentUser.value = meResult.data.user;
  users.value = usersResult.data;

  if (!selectedUserId.value) {
    selectedUserId.value = meResult.data.user._id;
  }

  await loadProfile(selectedUserId.value);
};

const selectUser = (userId: string) => {
  selectedUserId.value = userId;
  void loadProfile(userId);
};

const toggleFollow = async () => {
  if (!summary.value || summary.value.is_self) {
    uni.showToast({ title: "不能关注自己", icon: "none" });
    return;
  }

  const result = await mobileApi.profile.toggleFollow(summary.value.user._id);
  summary.value = result.data;
};

const switchTab = (tab: ProfileTab) => {
  if (activeTab.value === tab) {
    return;
  }

  slideClass.value = tab === "favorites" ? "slide-from-left" : "slide-from-right";
  activeTab.value = tab;
};

const openEvent = (id: string) => {
  uni.navigateTo({ url: `/pages/events/detail?id=${id}` });
};

const openPost = (id: string) => {
  uni.navigateTo({ url: `/pages/discover/detail?id=${id}` });
};

const openPlace = (id: string) => {
  uni.navigateTo({ url: `/pages/places/detail?id=${id}` });
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="profile-hero">
        <view class="cover" />
        <view class="identity-row">
          <view class="avatar">{{ avatarInitial }}</view>
          <view class="identity-main">
            <view class="nickname">{{ selectedUser?.nickname ?? "Profile" }}</view>
            <view class="meta">ID {{ selectedUser?._id ?? "-" }}</view>
          </view>
          <button
            class="follow-button"
            :class="{ following: summary?.is_following, self: summary?.is_self }"
            @click="toggleFollow"
          >
            {{ summary?.is_self ? "本人" : summary?.is_following ? "已关注" : "+ 关注" }}
          </button>
        </view>

        <view class="bio">社区居民 · 分享活动、地点和邻里经验</view>

        <view class="stats">
          <view class="stat-item">
            <text class="stat-number">{{ summary?.following_count ?? 0 }}</text>
            <text class="stat-label">关注</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ summary?.follower_count ?? 0 }}</text>
            <text class="stat-label">粉丝</text>
          </view>
        </view>
      </view>

      <view class="user-switcher">
        <text
          v-for="user in users"
          :key="user._id"
          class="user-chip"
          :class="{ active: user._id === selectedUserId }"
          @click="selectUser(user._id)"
        >
          {{ user.nickname }}{{ user._id === currentUser?._id ? "（我）" : "" }}
        </text>
      </view>

      <view class="tabs">
        <view
          class="tab-item"
          :class="{ active: activeTab === 'favorites' }"
          @click="switchTab('favorites')"
        >
          收藏
        </view>
        <view
          class="tab-item"
          :class="{ active: activeTab === 'reviews' }"
          @click="switchTab('reviews')"
        >
          评价
        </view>
      </view>

      <view v-if="loading" class="state-text">加载中...</view>

      <view v-else class="content-panel" :class="slideClass">
        <template v-if="activeTab === 'favorites'">
          <view v-if="!favoriteEvents.length && !favoritePosts.length && !favoritePlaces.length" class="state-text">
            暂无收藏
          </view>

          <view v-for="event in favoriteEvents" :key="event._id" class="content-card" @click="openEvent(event._id)">
            <text class="content-type">Event</text>
            <text class="content-title">{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</text>
            <text class="content-desc">{{ pickLocalized(state.locale, event.summary_zh, event.summary_en) }}</text>
          </view>

          <view v-for="post in favoritePosts" :key="post._id" class="content-card" @click="openPost(post._id)">
            <text class="content-type">Post</text>
            <text class="content-title">{{ post.title }}</text>
            <text class="content-desc">{{ post.content }}</text>
          </view>

          <view v-for="place in favoritePlaces" :key="place._id" class="content-card" @click="openPlace(place._id)">
            <text class="content-type">Place</text>
            <text class="content-title">{{ pickLocalized(state.locale, place.name_zh, place.name_en) }}</text>
            <text class="content-desc">
              {{ pickLocalized(state.locale, place.short_address_zh, place.short_address_en) }}
            </text>
          </view>
        </template>

        <template v-else>
          <view v-if="!comments.length" class="state-text">暂无评价</view>
          <view v-for="item in comments" :key="item.comment._id" class="content-card" @click="item.post && openPost(item.post._id)">
            <text class="content-type">评论于 {{ item.post?.title ?? "帖子" }}</text>
            <text class="content-title">{{ item.comment.content }}</text>
            <text class="content-desc">{{ item.comment.created_at }}</text>
          </view>
        </template>
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.page-scroll {
  min-height: 100vh;
  background: #f3f4f6;
}

.page {
  padding: 24rpx;
}

.profile-hero {
  overflow: hidden;
  border-radius: 28rpx;
  background: #111827;
  color: #ffffff;
}

.cover {
  height: 260rpx;
  background: linear-gradient(135deg, #0f766e, #34d399);
}

.identity-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 0 24rpx;
  margin-top: -48rpx;
}

.avatar {
  width: 104rpx;
  height: 104rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 999rpx;
  background: #0f766e;
  text-align: center;
  line-height: 104rpx;
  font-size: 42rpx;
  font-weight: 700;
}

.identity-main {
  flex: 1;
  min-width: 0;
  padding-top: 46rpx;
}

.nickname {
  font-size: 34rpx;
  font-weight: 700;
}

.meta {
  margin-top: 6rpx;
  color: #d1d5db;
  font-size: 22rpx;
}

.follow-button {
  margin: 46rpx 0 0;
  padding: 0 20rpx;
  height: 54rpx;
  border-radius: 999rpx;
  background: #ecfdf5;
  color: #047857;
  font-size: 24rpx;
  line-height: 54rpx;
}

.follow-button.following,
.follow-button.self {
  background: #374151;
  color: #e5e7eb;
}

.bio {
  padding: 18rpx 24rpx 0;
  color: #d1d5db;
  font-size: 24rpx;
}

.stats {
  display: flex;
  gap: 48rpx;
  padding: 24rpx;
}

.stat-number,
.stat-label {
  display: block;
}

.stat-number {
  font-size: 30rpx;
  font-weight: 700;
}

.stat-label {
  margin-top: 4rpx;
  color: #d1d5db;
  font-size: 22rpx;
}

.user-switcher {
  display: flex;
  gap: 12rpx;
  margin: 20rpx 0;
  overflow-x: auto;
  white-space: nowrap;
}

.user-chip {
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #e5e7eb;
  color: #374151;
  font-size: 24rpx;
}

.user-chip.active {
  background: #ccfbf1;
  color: #0f766e;
  font-weight: 700;
}

.tabs {
  display: flex;
  height: 72rpx;
  border-radius: 24rpx 24rpx 0 0;
  background: #ffffff;
}

.tab-item {
  flex: 1;
  position: relative;
  text-align: center;
  line-height: 72rpx;
  color: #6b7280;
  font-weight: 600;
}

.tab-item.active {
  color: #0f766e;
}

.tab-item.active::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 56rpx;
  height: 6rpx;
  border-radius: 999rpx;
  background: #0f766e;
  transform: translateX(-50%);
}

.content-panel {
  min-height: 320rpx;
  padding: 20rpx;
  border-radius: 0 0 24rpx 24rpx;
  background: #ffffff;
}

.slide-from-left {
  animation: slideFromLeft 180ms ease-out;
}

.slide-from-right {
  animation: slideFromRight 180ms ease-out;
}

.content-card {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
}

.content-type,
.content-title,
.content-desc {
  display: block;
}

.content-type {
  color: #0f766e;
  font-size: 22rpx;
  font-weight: 700;
}

.content-title {
  margin-top: 8rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.content-desc {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.5;
}

.state-text {
  padding: 80rpx 0;
  text-align: center;
  color: #6b7280;
}

@keyframes slideFromLeft {
  from {
    opacity: 0;
    transform: translateX(-36rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideFromRight {
  from {
    opacity: 0;
    transform: translateX(36rpx);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
