<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad, onPullDownRefresh } from "@dcloudio/uni-app";
import type { ProfileFollowListItem } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import { appCopy } from "@/i18n/copy";
import { useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale].profile);
const targetUserId = ref(state.userId);
const listType = ref<"followers" | "following">("followers");
const items = ref<ProfileFollowListItem[]>([]);
const isLoading = ref(true);
const errorMessage = ref("");
const updatingUserId = ref("");

const title = computed(() =>
  listType.value === "followers" ? copy.value.followers : copy.value.following
);

const loadList = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    const result =
      listType.value === "followers"
        ? await mobileApi.discover.listProfileFollowers(targetUserId.value, {
            pageSize: 50
          })
        : await mobileApi.discover.listProfileFollowing(targetUserId.value, {
            pageSize: 50
          });
    items.value = result.data.items;
  } catch {
    items.value = [];
    errorMessage.value = copy.value.followListError;
  } finally {
    isLoading.value = false;
    uni.stopPullDownRefresh();
  }
};

const openProfile = (userId: string) => {
  uni.navigateTo({ url: `/pages/more/profile?id=${userId}` });
};

const toggleFollow = async (item: ProfileFollowListItem) => {
  if (item.user._id === state.userId || updatingUserId.value) {
    return;
  }

  updatingUserId.value = item.user._id;
  try {
    const result = await mobileApi.discover.setProfileFollow(item.user._id, {
      following: !item.followed_by_actor
    });
    const followedByActor = result.data.following;
    items.value = items.value.map((row) =>
      row.user._id === item.user._id
        ? {
            ...row,
            following: followedByActor,
            followed_by_actor: followedByActor,
            mutual: followedByActor && row.follows_actor
          }
        : row
    );
  } catch {
    uni.showToast({ title: copy.value.followError, icon: "none" });
  } finally {
    updatingUserId.value = "";
  }
};

const getActionLabel = (item: ProfileFollowListItem) => {
  if (item.user._id === state.userId) {
    return copy.value.self;
  }
  if (item.mutual) {
    return copy.value.mutual;
  }
  return item.followed_by_actor ? copy.value.followed : copy.value.follow;
};

onLoad((query) => {
  const id = String(query?.id ?? "").trim();
  const type = String(query?.type ?? "").trim();
  targetUserId.value = id || state.userId;
  listType.value = type === "following" ? "following" : "followers";
  void loadList();
});

onPullDownRefresh(loadList);
</script>

<template>
  <view class="page">
    <view class="title">{{ title }}</view>

    <AsyncStateCard v-if="isLoading" variant="loading" :text="copy.loading" />
    <view v-else-if="errorMessage" class="status-block">
      <AsyncStateCard variant="error" :text="errorMessage" />
      <button class="retry" @click="loadList">{{ copy.retry }}</button>
    </view>
    <AsyncStateCard
      v-else-if="items.length === 0"
      variant="empty"
      :text="copy.followListEmpty"
    />

    <view v-else class="list">
      <view v-for="item in items" :key="item.user._id" class="row">
        <view class="identity" @click="openProfile(item.user._id)">
          <image
            v-if="item.user.avatar_url"
            class="avatar"
            :src="item.user.avatar_url"
            mode="aspectFill"
          />
          <view v-else class="avatar fallback">
            {{ item.user.nickname.slice(0, 1).toUpperCase() }}
          </view>
          <view class="user-text">
            <view class="name">{{ item.user.nickname }}</view>
            <view v-if="item.follows_actor" class="sub">{{ copy.followsYou }}</view>
          </view>
        </view>
        <button
          class="follow-btn"
          :class="{ active: item.followed_by_actor }"
          :disabled="item.user._id === state.userId || updatingUserId === item.user._id"
          @click="toggleFollow(item)"
        >
          {{ getActionLabel(item) }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24rpx;
  background: #f8fafc;
}

.title {
  margin-bottom: 22rpx;
  color: #111827;
  font-size: 36rpx;
  font-weight: 700;
}

.status-block,
.list {
  display: grid;
  gap: 14rpx;
}

.retry {
  border-radius: 10rpx;
  background: #fff1f0;
  color: #c41d7f;
  font-size: 26rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 18rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 14rpx;
  background: #ffffff;
}

.identity {
  display: flex;
  align-items: center;
  min-width: 0;
  flex: 1;
  gap: 16rpx;
}

.avatar {
  flex-shrink: 0;
  width: 84rpx;
  height: 84rpx;
  border-radius: 50%;
  background: #dbeafe;
}

.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1d4ed8;
  font-weight: 800;
}

.user-text {
  min-width: 0;
}

.name {
  overflow: hidden;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sub {
  margin-top: 6rpx;
  color: #0f766e;
  font-size: 22rpx;
}

.follow-btn {
  flex-shrink: 0;
  margin: 0;
  min-width: 132rpx;
  height: 58rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 24rpx;
  line-height: 58rpx;
}

.follow-btn.active {
  background: #e6f4ff;
  color: #0052d9;
}

.follow-btn::after {
  border: 0;
}
</style>
