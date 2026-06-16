<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";

const posts = ref<Array<any>>([]);
const favoritePostIds = ref<string[]>([]);

const load = async () => {
  const [postResult, favoriteResult] = await Promise.all([
    mobileApi.discover.listPosts(),
    mobileApi.profile.favoriteIds()
  ]);
  posts.value = postResult.data.items;
  favoritePostIds.value = favoriteResult.data.post;
};

const openDetail = (id: string) => {
  uni.navigateTo({
    url: `/pages/discover/detail?id=${id}`
  });
};

const openCreate = () => {
  uni.navigateTo({
    url: "/pages/discover/create"
  });
};

const isFavoritePost = (postId: string) => favoritePostIds.value.includes(postId);

const toggleFavoritePost = async (postId: string) => {
  const result = await mobileApi.profile.toggleFavorite({
    item_type: "post",
    item_id: postId
  });

  favoritePostIds.value = result.data.is_favorited
    ? [...favoritePostIds.value, postId]
    : favoritePostIds.value.filter((id) => id !== postId);
};

onShow(load);
</script>

<template>
  <view class="page">
    <SectionPanel title="Discover" subtitle="内容流、发帖和详情壳已就位">
      <button class="primary" @click="openCreate">发布帖子</button>
      <view v-for="post in posts" :key="post._id" class="card" @click="openDetail(post._id)">
        <view class="title-row">
          <view class="card-title">{{ post.title }}</view>
          <text
            class="favorite-star"
            :class="{ active: isFavoritePost(post._id) }"
            @click.stop="toggleFavoritePost(post._id)"
          >
            {{ isFavoritePost(post._id) ? "★" : "☆" }}
          </text>
        </view>
        <view class="card-text">{{ post.content }}</view>
      </view>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
}

.primary {
  margin-bottom: 20rpx;
  background: #1d4ed8;
  color: white;
}

.card {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.card-title {
  flex: 1;
  font-size: 32rpx;
  font-weight: 600;
}

.favorite-star {
  color: #9ca3af;
  font-size: 38rpx;
  line-height: 1;
}

.favorite-star.active {
  color: #f59e0b;
}

.card-text {
  margin-top: 10rpx;
  color: #6b7280;
}
</style>
