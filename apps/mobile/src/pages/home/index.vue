<script setup lang="ts">
import type { Event } from "@community-map/shared";
import { computed, onMounted, ref } from "vue";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import { appCopy } from "@/i18n/copy";
import { isPublicEvent } from "@/pages/events/event-signup-state";
import { placesPagePaths } from "@/pages/places/navigation";
import { pickLocalized, useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale]);
const events = ref<Array<any>>([]);
const announcements = ref<Array<any>>([]);
const places = ref<Array<any>>([]);

const load = async () => {
  const [eventsResult, announcementsResult, placesResult] = await Promise.all([
    mobileApi.events.list(),
    mobileApi.announcements.list(),
    mobileApi.places.list()
  ]);

  events.value = (eventsResult.data.items as Event[])
    .filter(isPublicEvent)
    .slice(0, 2);
  announcements.value = announcementsResult.data.items.slice(0, 2);
  places.value = placesResult.data.items.slice(0, 2);
};

const open = (url: string) => {
  uni.navigateTo({ url });
};

onMounted(load);
</script>

<template>
  <scroll-view scroll-y enable-flex class="page-scroll">
    <view class="page">
      <view class="hero">
        <view class="eyebrow">Tongzilin</view>
        <view class="title">{{ copy.homeTitle }}</view>
        <view class="subtitle">{{ copy.homeSubtitle }}</view>
      </view>

      <SectionPanel title="Events" subtitle="活动骨架已接入统一 DTO">
        <view v-for="event in events" :key="event._id" class="list-item" @click="open(`/pages/events/detail?id=${event._id}`)">
          <view>{{ pickLocalized(state.locale, event.title_zh, event.title_en) }}</view>
          <view class="caption">{{ event.start_time }}</view>
        </view>
      </SectionPanel>

      <SectionPanel title="Announcements" subtitle="公告列表已连通">
        <view v-for="item in announcements" :key="item._id" class="list-item">
          <view>{{ pickLocalized(state.locale, item.title_zh, item.title_en) }}</view>
        </view>
      </SectionPanel>

      <SectionPanel title="Places" subtitle="从首页直接进入完整地点列表或推荐地点。">
        <view class="places-actions">
          <button class="action-button" @click="open(placesPagePaths.list())">
            查看地点列表
          </button>
          <button
            class="action-button ghost"
            @click="open(placesPagePaths.recommended())"
          >
            查看推荐地点
          </button>
        </view>
        <view
          v-for="place in places"
          :key="place._id"
          class="list-item"
          @click="open(`/pages/places/detail?id=${place._id}`)"
        >
          <view>{{ pickLocalized(state.locale, place.name_zh, place.name_en) }}</view>
          <view class="caption">
            {{ pickLocalized(state.locale, place.short_address_zh, place.short_address_en) }}
          </view>
        </view>
      </SectionPanel>

      <SectionPanel :title="copy.moreActions">
        <view class="quick-grid">
          <view class="quick-item" @click="open('/pages/more/login')">登录</view>
          <view class="quick-item" @click="open('/pages/more/notifications')">通知中心</view>
          <view class="quick-item" @click="open('/pages/more/my-registrations')">我的报名</view>
          <view class="quick-item" @click="open('/pages/more/language-settings')">语言设置</view>
        </view>
      </SectionPanel>
    </view>
  </scroll-view>
</template>

<style scoped>
.page-scroll {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  padding: 24rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.hero {
  background: linear-gradient(135deg, #0f766e, #155e75);
  border-radius: 32rpx;
  padding: 36rpx 28rpx;
  color: #ffffff;
}

.eyebrow {
  opacity: 0.8;
  font-size: 22rpx;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.title {
  font-size: 48rpx;
  font-weight: 700;
  margin-top: 12rpx;
}

.subtitle {
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 1.5;
}

.list-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
}

.caption {
  color: #6b7280;
  margin-top: 8rpx;
  font-size: 24rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.quick-item {
  padding: 24rpx;
  border-radius: 20rpx;
  background: #ecfeff;
  text-align: center;
  font-weight: 600;
}

.places-actions {
  display: flex;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.action-button {
  flex: 1;
  background: #0f766e;
  color: #ffffff;
  font-size: 26rpx;
}

.action-button.ghost {
  background: #ccfbf1;
  color: #115e59;
}
</style>
