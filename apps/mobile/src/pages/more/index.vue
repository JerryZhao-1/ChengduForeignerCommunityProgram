<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh, onShow } from "@dcloudio/uni-app";
import type {
  DiscoverMeGovernance,
  PublicProfile,
  UserEnforcementState
} from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].me);
const governance = ref<DiscoverMeGovernance | null>(null);
const profile = ref<PublicProfile | null>(null);
const isLoading = ref(true);
const errorMessage = ref("");

const statusCopy = computed<Record<UserEnforcementState["status"], string>>(
  () => ({
    active: copy.value.statusActive,
    warned: copy.value.statusWarned,
    muted: copy.value.statusMuted,
    banned: copy.value.statusBanned
  })
);

const isWarned = computed(
  () => governance.value?.enforcement.status !== "active"
);

const warningBody = computed(
  () => governance.value?.enforcement.reason || copy.value.warningBody
);

const unreadCount = computed(
  () => governance.value?.unread_notification_count ?? 0
);

const followerCount = computed(() => profile.value?.stats.follower_count ?? 0);
const followingCount = computed(() => profile.value?.stats.following_count ?? 0);

const quickLinks = computed(() => [
  {
    label: copy.value.profile,
    url: `/pages/more/profile?id=${state.userId}`,
    icon: "/static/icons/profile.svg"
  },
  {
    label: copy.value.notifications,
    url: "/pages/more/notifications",
    icon: "/static/icons/notifications.svg"
  },
  {
    label: copy.value.registrations,
    url: "/pages/more/my-registrations",
    icon: "/static/icons/registrations.svg"
  },
  {
    label: copy.value.comments,
    url: "/pages/more/my-comments",
    icon: "/static/icons/posts.svg"
  },
  {
    label: copy.value.reports,
    url: "/pages/more/my-reports",
    icon: "/static/icons/posts.svg"
  },
  {
    label: copy.value.language,
    url: "/pages/more/language-settings",
    icon: "/static/icons/language.svg"
  }
]);

const loadGovernance = async () => {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const [governanceResult, profileResult] = await Promise.all([
      mobileApi.discover.meGovernance(),
      mobileApi.discover.profile(state.userId)
    ]);
    governance.value = governanceResult.data;
    profile.value = profileResult.data;
  } catch {
    governance.value = null;
    errorMessage.value = copy.value.error;
  } finally {
    isLoading.value = false;
    uni.stopPullDownRefresh();
  }
};

const navigateTo = (url: string) => {
  uni.navigateTo({ url });
};

const navigateToFollowList = (type: "followers" | "following") => {
  uni.navigateTo({
    url: `/pages/more/follows?id=${state.userId}&type=${type}`
  });
};

onLoad(loadGovernance);
onShow(loadGovernance);
onPullDownRefresh(loadGovernance);
</script>

<template>
  <view class="page">
    <view class="topbar">
      <view class="page-title">{{ copy.title }}</view>
      <button
        class="bell"
        :aria-label="copy.notificationLabel"
        @click="navigateTo('/pages/more/notifications')"
      >
        <image class="bell-icon" src="/static/icons/notifications.svg" mode="aspectFit" />
        <text v-if="unreadCount > 0" class="badge">{{ unreadCount }}</text>
      </button>
    </view>

    <AsyncStateCard v-if="isLoading" variant="loading" :text="copy.loading" />
    <view v-else-if="errorMessage" class="status-block">
      <AsyncStateCard variant="error" :text="errorMessage" />
      <button class="retry" @click="loadGovernance">{{ copy.retry }}</button>
    </view>

    <view v-else-if="governance" class="content">
      <view v-if="isWarned" class="warning">
        <view class="warning-title">{{ copy.warningTitle }}</view>
        <view class="warning-body">{{ warningBody }}</view>
      </view>

      <view class="profile">
        <view class="profile-main">
          <image
            v-if="governance.user.avatar_url"
            class="avatar"
            :src="governance.user.avatar_url"
            mode="aspectFill"
          />
          <view v-else class="avatar fallback">
            {{ governance.user.nickname.slice(0, 1).toUpperCase() }}
          </view>
          <view class="identity">
            <view class="name">{{ governance.user.nickname }}</view>
            <view class="status">
              {{ statusCopy[governance.enforcement.status] }}
            </view>
          </view>
        </view>
        <view class="follow-stats">
          <view class="follow-stat" @click="navigateToFollowList('followers')">
            <view class="follow-value">{{ followerCount }}</view>
            <view class="follow-label">{{ copy.followers }}</view>
          </view>
          <view class="follow-stat" @click="navigateToFollowList('following')">
            <view class="follow-value">{{ followingCount }}</view>
            <view class="follow-label">{{ copy.following }}</view>
          </view>
        </view>
      </view>

      <view class="stats">
        <view class="stat" @click="navigateTo('/pages/more/my-posts')">
          <view class="stat-value">{{ governance.post_count }}</view>
          <view class="stat-label">{{ copy.posts }}</view>
        </view>
        <view class="stat" @click="navigateTo('/pages/more/my-likes')">
          <view class="stat-value">{{ governance.liked_post_count }}</view>
          <view class="stat-label">{{ copy.likes }}</view>
        </view>
        <view class="stat" @click="navigateTo('/pages/more/my-favorites')">
          <view class="stat-value">{{ governance.favorited_post_count }}</view>
          <view class="stat-label">{{ copy.favoritePosts }}</view>
        </view>
      </view>

      <view class="links">
        <button
          v-for="link in quickLinks"
          :key="link.url"
          class="link"
          @click="navigateTo(link.url)"
        >
          <image class="link-icon" :src="link.icon" mode="aspectFit" />
          <text class="link-label">{{ link.label }}</text>
          <text class="link-arrow">&gt;</text>
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  position: relative;
  min-height: 100vh;
  padding: 24rpx;
  background: #f8fafc;
}

.topbar {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72rpx;
  margin-bottom: 22rpx;
  padding-right: 92rpx;
}

.page-title {
  color: #111827;
  font-size: 38rpx;
  font-weight: 700;
}

.bell {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  width: 72rpx;
  height: 72rpx;
  padding: 0;
  border: 1rpx solid #d1d5db;
  border-radius: 50%;
  background: #ffffff;
  line-height: 1;
}

.bell::after {
  border: 0;
}

.bell-icon {
  width: 34rpx;
  height: 34rpx;
}

.badge {
  position: absolute;
  top: -4rpx;
  right: -4rpx;
  min-width: 30rpx;
  height: 30rpx;
  padding: 0 8rpx;
  border: 2rpx solid #ffffff;
  border-radius: 999rpx;
  background: #dc2626;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 700;
  line-height: 30rpx;
  text-align: center;
}

.status-block,
.content {
  display: grid;
  gap: 18rpx;
}

.retry {
  border-radius: 10rpx;
  background: #fff1f0;
  color: #c41d7f;
  font-size: 26rpx;
}

.warning,
.profile,
.stats,
.links {
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.warning {
  padding: 20rpx;
  border-color: #fed7aa;
  background: #fff7ed;
}

.warning-title {
  color: #9a3412;
  font-size: 28rpx;
  font-weight: 700;
}

.warning-body {
  margin-top: 8rpx;
  color: #7c2d12;
  font-size: 24rpx;
  line-height: 1.5;
}

.profile {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 24rpx;
}

.profile-main {
  display: flex;
  flex: 1;
  align-items: center;
  min-width: 0;
  gap: 20rpx;
}

.avatar {
  flex-shrink: 0;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: #dbeafe;
}

.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-size: 42rpx;
  font-weight: 800;
}

.identity {
  flex: 1;
  min-width: 0;
}

.name {
  overflow: hidden;
  color: #111827;
  font-size: 34rpx;
  font-weight: 700;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status {
  display: inline-flex;
  margin-top: 10rpx;
  padding: 6rpx 12rpx;
  border-radius: 8rpx;
  background: #eef2ff;
  color: #3730a3;
  font-size: 22rpx;
}

.follow-stats {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 22rpx;
  padding-left: 12rpx;
}

.follow-stat {
  min-width: 74rpx;
  text-align: center;
}

.follow-value {
  color: #111827;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
}

.follow-label {
  margin-top: 4rpx;
  color: #6b7280;
  font-size: 22rpx;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  overflow: hidden;
}

.stat {
  padding: 22rpx 10rpx;
  text-align: center;
}

.stat:not(:first-child) {
  border-left: 1rpx solid #e5e7eb;
}

.stat-value {
  color: #111827;
  font-size: 34rpx;
  font-weight: 800;
}

.stat-label {
  margin-top: 4rpx;
  color: #6b7280;
  font-size: 22rpx;
}

.links {
  overflow: hidden;
}

.link {
  display: grid;
  grid-template-columns: 48rpx minmax(0, 1fr) 28rpx;
  align-items: center;
  width: 100%;
  height: 92rpx;
  padding: 0 22rpx;
  border-radius: 0;
  background: #ffffff;
  color: #111827;
  font-size: 28rpx;
  text-align: left;
}

.link::after {
  border: 0;
}

.link + .link {
  border-top: 1rpx solid #e5e7eb;
}

.link-icon {
  width: 34rpx;
  height: 34rpx;
}

.link-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-arrow {
  color: #9ca3af;
  font-size: 36rpx;
  text-align: right;
}
</style>
