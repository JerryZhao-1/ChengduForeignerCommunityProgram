<script setup lang="ts">
import type {
  Comment,
  Event,
  PlaceListItem,
  PointLedgerEntry,
  Post,
  User,
  UserPrivacySettings
} from "@community-map/shared";
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import { pickLocalized, useAppStore } from "@/stores/app-store";

type ProfileTab = "favorites" | "reviews" | "milestones";

interface ProfileSummary {
  user: User;
  is_self: boolean;
  is_following: boolean;
  follower_count: number;
  following_count: number;
}

interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  unlocked: boolean;
}

const tabOrder: ProfileTab[] = ["favorites", "reviews", "milestones"];

const { state } = useAppStore();
const users = ref<User[]>([]);
const currentUser = ref<User | null>(null);
const selectedUserId = ref("");
const summary = ref<ProfileSummary | null>(null);
const selectedPrivacy = ref<UserPrivacySettings | null>(null);
const blockedUserIds = ref<string[]>([]);
const pointsBalance = ref(0);
const pointEntries = ref<PointLedgerEntry[]>([]);
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

const isSelectedBlocked = computed(() =>
  selectedUserId.value ? blockedUserIds.value.includes(selectedUserId.value) : false
);

const canViewFavorites = computed(
  () => !isSelectedBlocked.value && (summary.value?.is_self || selectedPrivacy.value?.show_favorites !== false)
);

const canViewComments = computed(
  () => !isSelectedBlocked.value && (summary.value?.is_self || selectedPrivacy.value?.show_comments !== false)
);

const totalFavorites = computed(
  () => favoriteEvents.value.length + favoritePosts.value.length + favoritePlaces.value.length
);

const hasEventParticipation = computed(() =>
  pointEntries.value.some(
    (entry) => entry.source_type === "event_registration" || entry.reason.includes("参加活动")
  )
);

const milestones = computed<MilestoneItem[]>(() => [
  {
    id: "first-step",
    title: "社区初体验",
    description: "获得任意积分，代表你已经开始参与社区互动。",
    icon: "NEW",
    current: Math.min(pointsBalance.value, 1),
    target: 1,
    unlocked: pointsBalance.value > 0
  },
  {
    id: "event-joiner",
    title: "活动参与者",
    description: "完成一次活动报名后解锁。",
    icon: "EVT",
    current: hasEventParticipation.value ? 1 : 0,
    target: 1,
    unlocked: hasEventParticipation.value
  },
  {
    id: "collector",
    title: "收藏达人",
    description: "收藏 3 个活动、帖子或地点，建立自己的社区清单。",
    icon: "FAV",
    current: Math.min(totalFavorites.value, 3),
    target: 3,
    unlocked: totalFavorites.value >= 3
  },
  {
    id: "reviewer",
    title: "邻里评论家",
    description: "留下 3 条评价或评论，帮助邻里发现有用信息。",
    icon: "REV",
    current: Math.min(comments.value.length, 3),
    target: 3,
    unlocked: comments.value.length >= 3
  },
  {
    id: "contributor",
    title: "社区贡献者",
    description: "累计达到 50 积分，说明你已经持续参与社区建设。",
    icon: "PTS",
    current: Math.min(pointsBalance.value, 50),
    target: 50,
    unlocked: pointsBalance.value >= 50
  },
  {
    id: "place-explorer",
    title: "探索新手",
    description: "收藏 1 个地点后解锁，适合刚开始探索桐梓林的用户。",
    icon: "MAP",
    current: Math.min(favoritePlaces.value.length, 1),
    target: 1,
    unlocked: favoritePlaces.value.length >= 1
  }
]);

const unlockedMilestoneCount = computed(
  () => milestones.value.filter((milestone) => milestone.unlocked).length
);

const loadProfile = async (targetUserId = selectedUserId.value) => {
  if (!targetUserId) {
    return;
  }

  loading.value = true;

  try {
    const [summaryResult, favoritesResult, commentsResult, privacyResult] = await Promise.all([
      mobileApi.profile.summary(targetUserId),
      mobileApi.profile.favorites(targetUserId),
      mobileApi.profile.comments(targetUserId),
      mobileApi.profile.privacy(targetUserId)
    ]);

    summary.value = summaryResult.data;
    selectedPrivacy.value = privacyResult.data;
    favoriteEvents.value = favoritesResult.data.events;
    favoritePosts.value = favoritesResult.data.posts;
    favoritePlaces.value = favoritesResult.data.places;
    comments.value = commentsResult.data;
  } finally {
    loading.value = false;
  }
};

const load = async () => {
  const [meResult, usersResult, blockedResult, pointsResult] = await Promise.all([
    mobileApi.auth.me(),
    mobileApi.profile.users(),
    mobileApi.profile.blockedUserIds(),
    mobileApi.points.summary()
  ]);

  currentUser.value = meResult.data.user;
  users.value = usersResult.data;
  blockedUserIds.value = blockedResult.data;
  pointsBalance.value = pointsResult.data.balance;
  pointEntries.value = pointsResult.data.entries.slice(0, 3);

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

const toggleBlock = async (user: User) => {
  if (user._id === currentUser.value?._id) {
    uni.showToast({ title: "不能屏蔽自己", icon: "none" });
    return;
  }

  const result = await mobileApi.profile.toggleBlock(user._id);

  if (result.data.is_blocked) {
    blockedUserIds.value = [...new Set([...blockedUserIds.value, user._id])];
    uni.showToast({ title: `已屏蔽 ${user.nickname}`, icon: "none" });
  } else {
    blockedUserIds.value = blockedUserIds.value.filter((id) => id !== user._id);
    uni.showToast({ title: `已解除屏蔽 ${user.nickname}`, icon: "none" });
  }
};

const switchTab = (tab: ProfileTab) => {
  if (activeTab.value === tab) {
    return;
  }

  const previousIndex = tabOrder.indexOf(activeTab.value);
  const nextIndex = tabOrder.indexOf(tab);
  slideClass.value = nextIndex < previousIndex ? "slide-from-left" : "slide-from-right";
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

const openTickets = () => {
  uni.navigateTo({ url: "/pages/more/my-registrations" });
};

const openSettings = () => {
  uni.navigateTo({ url: "/pages/more/settings" });
};

const formatPointTime = (input: string) => {
  const date = new Date(input);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");

  return `${mm}-${dd} ${hh}:${min}`;
};

const milestoneProgress = (milestone: MilestoneItem) => {
  if (milestone.target <= 0) {
    return "0%";
  }

  return `${Math.min(100, Math.round((milestone.current / milestone.target) * 100))}%`;
};

onShow(load);
</script>

<template>
  <scroll-view scroll-y class="page-scroll">
    <view class="page">
      <view class="profile-hero">
        <view class="cover" />
        <view class="settings-button" @click.stop="openSettings">
          <view class="settings-dot" />
          <view class="settings-dot" />
          <view class="settings-dot" />
        </view>
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
        <view class="user-chip-row">
          <view
            v-for="user in users"
            :key="user._id"
            class="user-chip"
            :class="{
              active: user._id === selectedUserId,
              blocked: blockedUserIds.includes(user._id)
            }"
            @click="selectUser(user._id)"
          >
            <text>{{ user.nickname }}{{ user._id === currentUser?._id ? "（我）" : "" }}</text>
            <text
              v-if="user._id !== currentUser?._id"
              class="block-toggle"
              @click.stop="toggleBlock(user)"
            >
              🚫
            </text>
          </view>
        </view>
        <button class="ticket-button" @click="openTickets">入场券</button>
      </view>

      <view class="points-card">
        <view>
          <text class="points-label">我的积分</text>
          <text class="points-value">{{ pointsBalance }}</text>
        </view>
        <view class="points-list">
          <text v-if="!pointEntries.length" class="point-empty">暂无积分记录</text>
          <text v-for="entry in pointEntries" :key="entry._id" class="point-entry">
            +{{ entry.points }} {{ entry.reason }} · {{ formatPointTime(entry.created_at) }}
          </text>
        </view>
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
        <view
          class="tab-item"
          :class="{ active: activeTab === 'milestones' }"
          @click="switchTab('milestones')"
        >
          里程碑
        </view>
      </view>

      <view v-if="loading" class="state-text">加载中...</view>

      <view v-else class="content-panel" :class="slideClass">
        <template v-if="activeTab === 'favorites'">
          <view v-if="isSelectedBlocked" class="state-text">
            你已屏蔽此用户，无法查看他的动态
          </view>
          <view v-else-if="!canViewFavorites" class="state-text">
            该用户已关闭公开展示收藏列表
          </view>

          <template v-if="canViewFavorites">
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
        </template>

        <template v-else-if="activeTab === 'reviews'">
          <view v-if="isSelectedBlocked" class="state-text">
            你已屏蔽此用户，无法查看他的动态
          </view>
          <view v-else-if="!canViewComments" class="state-text">
            该用户已关闭公开展示评论列表
          </view>
          <template v-if="canViewComments">
            <view v-if="!comments.length" class="state-text">暂无评价</view>
            <view v-for="item in comments" :key="item.comment._id" class="content-card" @click="item.post && openPost(item.post._id)">
              <text class="content-type">评论于 {{ item.post?.title ?? "帖子" }}</text>
              <text class="content-title">{{ item.comment.content }}</text>
              <text class="content-desc">{{ item.comment.created_at }}</text>
            </view>
          </template>
        </template>

        <template v-else>
          <view v-if="isSelectedBlocked" class="state-text">
            你已屏蔽此用户，无法查看他的里程碑
          </view>
          <template v-else>
            <view class="milestone-summary">
              <text class="milestone-summary-title">已解锁 {{ unlockedMilestoneCount }}/{{ milestones.length }}</text>
              <text class="milestone-summary-desc">里程碑会根据积分、收藏、评价和活动参与自动点亮。</text>
            </view>

            <view
              v-for="milestone in milestones"
              :key="milestone.id"
              class="milestone-card"
              :class="{ unlocked: milestone.unlocked }"
            >
              <view class="milestone-badge">{{ milestone.icon }}</view>
              <view class="milestone-main">
                <view class="milestone-title-row">
                  <text class="milestone-title">{{ milestone.title }}</text>
                  <text class="milestone-status">
                    {{ milestone.unlocked ? "已达成" : "进行中" }}
                  </text>
                </view>
                <text class="milestone-desc">{{ milestone.description }}</text>
                <view class="milestone-progress">
                  <view class="milestone-progress-bar" :style="{ width: milestoneProgress(milestone) }" />
                </view>
                <text class="milestone-progress-text">
                  进度 {{ milestone.current }}/{{ milestone.target }}
                </text>
              </view>
            </view>
          </template>
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
  position: relative;
  overflow: hidden;
  border-radius: 28rpx;
  background: #111827;
  color: #ffffff;
}

.settings-button {
  position: absolute;
  top: 22rpx;
  right: 22rpx;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  width: 76rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  color: #0f766e;
  line-height: 56rpx;
  box-shadow: 0 10rpx 26rpx rgba(15, 118, 110, 0.18);
}

.settings-button:active {
  background: rgba(236, 253, 245, 0.96);
}

.settings-dot {
  width: 9rpx;
  height: 9rpx;
  border-radius: 999rpx;
  background: #0f766e;
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
  align-items: center;
  gap: 12rpx;
  margin: 20rpx 0;
}

.user-chip-row {
  flex: 1;
  display: flex;
  gap: 12rpx;
  overflow-x: auto;
  white-space: nowrap;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
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

.user-chip.blocked {
  background: #fee2e2;
  color: #991b1b;
}

.block-toggle {
  font-size: 24rpx;
  line-height: 1;
}

.ticket-button {
  flex-shrink: 0;
  margin: 0;
  padding: 0 20rpx;
  height: 56rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 56rpx;
}

.points-card {
  display: flex;
  gap: 24rpx;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 22rpx 24rpx;
  border-radius: 24rpx;
  background: #ffffff;
}

.points-label,
.points-value,
.point-empty,
.point-entry {
  display: block;
}

.points-label {
  color: #6b7280;
  font-size: 22rpx;
}

.points-value {
  margin-top: 4rpx;
  color: #0f766e;
  font-size: 42rpx;
  font-weight: 800;
}

.points-list {
  flex: 1;
  min-width: 0;
}

.point-empty,
.point-entry {
  color: #6b7280;
  font-size: 22rpx;
  line-height: 1.6;
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

.milestone-summary {
  margin-bottom: 16rpx;
  padding: 20rpx;
  border-radius: 20rpx;
  background: #ecfdf5;
}

.milestone-summary-title,
.milestone-summary-desc,
.milestone-title,
.milestone-desc,
.milestone-status,
.milestone-progress-text {
  display: block;
}

.milestone-summary-title {
  color: #047857;
  font-size: 30rpx;
  font-weight: 800;
}

.milestone-summary-desc {
  margin-top: 8rpx;
  color: #047857;
  font-size: 24rpx;
  line-height: 1.5;
}

.milestone-card {
  display: flex;
  gap: 18rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
  opacity: 0.72;
}

.milestone-card.unlocked {
  opacity: 1;
}

.milestone-badge {
  flex-shrink: 0;
  width: 86rpx;
  height: 86rpx;
  border-radius: 24rpx;
  background: #e5e7eb;
  color: #6b7280;
  text-align: center;
  line-height: 86rpx;
  font-size: 22rpx;
  font-weight: 800;
}

.milestone-card.unlocked .milestone-badge {
  background: #0f766e;
  color: #ffffff;
}

.milestone-main {
  flex: 1;
  min-width: 0;
}

.milestone-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.milestone-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 700;
}

.milestone-status {
  flex-shrink: 0;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 20rpx;
}

.milestone-card.unlocked .milestone-status {
  background: #dcfce7;
  color: #166534;
}

.milestone-desc {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 24rpx;
  line-height: 1.5;
}

.milestone-progress {
  height: 10rpx;
  margin-top: 16rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e5e7eb;
}

.milestone-progress-bar {
  height: 100%;
  border-radius: 999rpx;
  background: #0f766e;
}

.milestone-progress-text {
  margin-top: 8rpx;
  color: #6b7280;
  font-size: 22rpx;
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
