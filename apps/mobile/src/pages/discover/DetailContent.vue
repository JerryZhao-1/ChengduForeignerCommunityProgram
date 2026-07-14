<script setup lang="ts">
import type { Post } from "@community-map/shared";
import type { DiscoverMediaItem } from "./media";

interface AssociationItem {
  title: string;
  meta: string;
  coverUrl: string;
}

interface DetailCommentItem {
  id: string;
  authorId?: string;
  authorName: string;
  avatarUrl: string;
  content: string;
  time: string;
  likeCount: number;
  liked: boolean;
}

defineProps<{
  post: Post;
  authorName: string;
  authorAvatarUrl: string;
  authorInitial: string;
  isAuthorSelf: boolean;
  isFollowing: boolean;
  isUpdatingFollow: boolean;
  media: DiscoverMediaItem[];
  mediaIndex: number;
  languageLabel: string;
  locationLabel: string;
  placeAssociation: AssociationItem | null;
  eventAssociation: AssociationItem | null;
  hasUnavailablePlace: boolean;
  hasUnavailableEvent: boolean;
  placeAssociationLabel: string;
  eventAssociationLabel: string;
  placeAssociationUnavailable: string;
  eventAssociationUnavailable: string;
  comments: DetailCommentItem[];
  commentCount: number;
  followButton: string;
  followingButton: string;
  moreActionsLabel: string;
  commentSectionTitle: string;
  commentSectionHint: string;
}>();

defineEmits<{
  (event: "openAuthor"): void;
  (event: "toggleFollow"): void;
  (event: "mediaChange", payload: { detail: { current: number } }): void;
  (event: "openActions"): void;
  (event: "openAssociatedPlace"): void;
  (event: "openAssociatedEvent"): void;
  (event: "openProfile", userId?: string): void;
  (event: "toggleCommentLike", comment: DetailCommentItem): void;
  (event: "openCommentActions", comment: DetailCommentItem): void;
}>();
</script>

<template>
  <view>
    <view class="detail-author-action">
      <view class="detail-author-main" @click.stop="$emit('openAuthor')">
        <image
          v-if="authorAvatarUrl"
          class="detail-author-avatar"
          :src="authorAvatarUrl"
          mode="aspectFill"
        />
        <view v-else class="detail-author-avatar fallback">
          {{ authorInitial }}
        </view>
        <view class="detail-author-text">
          <view class="detail-author-name">{{ authorName }}</view>
          <view class="detail-author-id">{{ post.author_user_id }}</view>
        </view>
      </view>
      <button
        v-if="!isAuthorSelf"
        class="detail-follow"
        :class="{ following: isFollowing }"
        :disabled="isUpdatingFollow"
        @click.stop="$emit('toggleFollow')"
      >
        {{ isFollowing ? followingButton : followButton }}
      </button>
    </view>

    <view v-if="media.length" class="gallery">
      <swiper
        class="media-swiper"
        :current="mediaIndex"
        :circular="false"
        @change="$emit('mediaChange', $event)"
      >
        <swiper-item
          v-for="item in media"
          :key="item.url"
          class="media-slide"
        >
          <image
            v-if="item.kind === 'image'"
            class="slide-image"
            :src="item.url"
            mode="aspectFill"
          />
          <video
            v-else
            class="slide-video"
            :src="item.url"
            controls
            :autoplay="false"
            :show-center-play-btn="true"
            :enable-progress-gesture="true"
          />
        </swiper-item>
      </swiper>
      <view v-if="media.length > 1" class="media-dots">
        <view
          v-for="(item, idx) in media"
          :key="item.url"
          class="media-dot"
          :class="{ active: idx === mediaIndex }"
        />
      </view>
    </view>

    <view class="article-header">
      <view class="article-title-row">
        <view class="article-title">{{ post.title }}</view>
        <view
          class="more-button"
          :aria-label="moreActionsLabel"
          @click.stop="$emit('openActions')"
        >
          <text class="more-dots">⋯</text>
        </view>
      </view>
      <view class="article-meta">
        <text>{{ languageLabel }}</text>
        <text>{{ post.created_at.slice(0, 10) }}</text>
        <text>{{ locationLabel }}</text>
      </view>
    </view>

    <view class="content">{{ post.content }}</view>

    <view
      v-if="
        placeAssociation ||
        eventAssociation ||
        hasUnavailablePlace ||
        hasUnavailableEvent
      "
      class="association-list"
    >
      <view
        v-if="placeAssociation"
        class="association-card"
        @click="$emit('openAssociatedPlace')"
      >
        <image
          v-if="placeAssociation.coverUrl"
          class="association-cover"
          :src="placeAssociation.coverUrl"
          mode="aspectFill"
        />
        <view class="association-main">
          <view class="association-label">{{ placeAssociationLabel }}</view>
          <view class="association-title">{{ placeAssociation.title }}</view>
          <view class="association-meta">{{ placeAssociation.meta }}</view>
        </view>
      </view>
      <view v-else-if="hasUnavailablePlace" class="association-unavailable">
        {{ placeAssociationUnavailable }}
      </view>

      <view
        v-if="eventAssociation"
        class="association-card"
        @click="$emit('openAssociatedEvent')"
      >
        <image
          v-if="eventAssociation.coverUrl"
          class="association-cover"
          :src="eventAssociation.coverUrl"
          mode="aspectFill"
        />
        <view class="association-main">
          <view class="association-label">{{ eventAssociationLabel }}</view>
          <view class="association-title">{{ eventAssociation.title }}</view>
          <view class="association-meta">{{ eventAssociation.meta }}</view>
        </view>
      </view>
      <view v-else-if="hasUnavailableEvent" class="association-unavailable">
        {{ eventAssociationUnavailable }}
      </view>
    </view>

    <view v-if="post.tag_ids.length" class="tags">
      <text v-for="tag in post.tag_ids" :key="tag" class="tag">#{{ tag }}</text>
    </view>

    <view class="comment-box">
      <view class="comment-heading">
        <view class="comment-title">
          {{ commentSectionTitle }} {{ commentCount }}
        </view>
        <view class="comment-hint">{{ commentSectionHint }}</view>
      </view>

      <view class="comment-list">
        <view
          v-for="comment in comments"
          :key="comment.id"
          class="comment-item"
        >
          <image
            v-if="comment.avatarUrl"
            class="comment-avatar"
            :src="comment.avatarUrl"
            mode="aspectFill"
            @click.stop="$emit('openProfile', comment.authorId)"
          />
          <view
            v-else
            class="comment-avatar fallback"
            @click.stop="$emit('openProfile', comment.authorId)"
          >
            {{ comment.authorName.slice(0, 1).toUpperCase() }}
          </view>
          <view class="comment-main">
            <view
              class="comment-name"
              @click.stop="$emit('openProfile', comment.authorId)"
            >
              {{ comment.authorName }}
            </view>
            <view class="comment-text">{{ comment.content }}</view>
            <view class="comment-time">{{ comment.time }}</view>
          </view>
          <view class="comment-actions">
            <view
              class="like-button"
              :class="{ liked: comment.liked }"
              @click.stop="$emit('toggleCommentLike', comment)"
            >
              <text class="like-icon">{{ comment.liked ? "♥" : "♡" }}</text>
              <text class="like-count">{{ comment.likeCount }}</text>
            </view>
            <view
              class="comment-more"
              :aria-label="moreActionsLabel"
              @click.stop="$emit('openCommentActions', comment)"
            >
              <text class="more-dots">⋯</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped>
.detail-author-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 22rpx;
}

.detail-author-main {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 14rpx;
}

.detail-author-avatar {
  flex-shrink: 0;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #e2e8f0;
}

.detail-author-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 24rpx;
  font-weight: 700;
}

.detail-author-text {
  min-width: 0;
}

.detail-author-name {
  overflow: hidden;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-author-id {
  overflow: hidden;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-follow {
  flex-shrink: 0;
  margin: 0;
  padding: 0 26rpx;
  min-height: 56rpx;
  line-height: 56rpx;
  border-radius: 999rpx;
  background: #ff2442;
  color: #ffffff;
  font-size: 26rpx;
}

.detail-follow.following {
  background: #f3f4f6;
  color: #6b7280;
}

.gallery {
  position: relative;
  margin-bottom: 22rpx;
}

.media-swiper {
  width: 100%;
  height: 600rpx;
  overflow: hidden;
  border-radius: 18rpx;
  background: #111827;
}

.media-slide,
.slide-image,
.slide-video {
  width: 100%;
  height: 100%;
}

.media-dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 18rpx;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 10rpx;
}

.media-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
}

.media-dot.active {
  background: rgba(255, 255, 255, 0.9);
}

.article-header {
  padding-bottom: 22rpx;
  border-bottom: 1rpx solid #e5e7eb;
}

.article-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.article-title {
  flex: 1;
  min-width: 0;
  color: #111827;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
}

.more-button {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #f3f4f6;
  color: #374151;
}

.more-dots {
  font-size: 40rpx;
  line-height: 1;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 14rpx;
  margin-top: 14rpx;
  color: #64748b;
  font-size: 24rpx;
}

.content {
  margin-top: 24rpx;
  line-height: 1.7;
  color: #111827;
  font-size: 30rpx;
  white-space: pre-wrap;
}

.association-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 22rpx;
}

.association-card {
  display: flex;
  gap: 16rpx;
  align-items: center;
  min-height: 128rpx;
  padding: 14rpx;
  border: 1rpx solid #e5e7eb;
  border-radius: 12rpx;
  background: #f9fafb;
}

.association-cover {
  flex-shrink: 0;
  width: 112rpx;
  height: 96rpx;
  border-radius: 8rpx;
  background: #e2e8f0;
}

.association-main {
  flex: 1;
  min-width: 0;
}

.association-label {
  color: #64748b;
  font-size: 22rpx;
  font-weight: 600;
}

.association-title {
  overflow: hidden;
  margin-top: 4rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.association-meta {
  overflow: hidden;
  margin-top: 4rpx;
  color: #64748b;
  font-size: 23rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.association-unavailable {
  padding: 18rpx;
  border-radius: 10rpx;
  background: #f3f4f6;
  color: #64748b;
  font-size: 24rpx;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 20rpx;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  background: #e6f4ff;
  color: #0052d9;
  font-size: 22rpx;
}

.comment-box {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #e5e7eb;
}

.comment-heading {
  margin-bottom: 14rpx;
}

.comment-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 600;
}

.comment-hint {
  margin-top: 6rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.5;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  margin-top: 24rpx;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 18rpx;
}

.comment-avatar {
  flex-shrink: 0;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #e2e8f0;
}

.comment-avatar.fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 26rpx;
  font-weight: 700;
}

.comment-main {
  flex: 1;
  min-width: 0;
}

.comment-name {
  color: #64748b;
  font-size: 24rpx;
  font-weight: 600;
}

.comment-text {
  margin-top: 8rpx;
  color: #111827;
  font-size: 28rpx;
  line-height: 1.55;
  word-break: break-word;
}

.comment-time {
  margin-top: 8rpx;
  color: #9ca3af;
  font-size: 22rpx;
}

.comment-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 18rpx;
  padding-top: 4rpx;
}

.like-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rpx;
  color: #9ca3af;
}

.like-button.liked {
  color: #ff2442;
}

.like-icon {
  font-size: 34rpx;
  line-height: 1;
}

.like-count {
  font-size: 20rpx;
  line-height: 1;
}

.comment-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}
</style>
