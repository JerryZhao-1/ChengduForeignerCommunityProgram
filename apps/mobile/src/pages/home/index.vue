<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { mobileApi } from "@/api/client";
import SectionPanel from "@/components/SectionPanel.vue";
import { appCopy } from "@/i18n/copy";
import { placesPagePaths } from "@/pages/places/navigation";
import { pickLocalized, useAppStore } from "@/stores/app-store";

const { state } = useAppStore();
const copy = computed(() => appCopy[state.locale]);
const events = ref<Array<any>>([]);
const announcements = ref<Array<any>>([]);
const places = ref<Array<any>>([]);
const quickSidebarOpen = ref(false);
const quickSidebarTop = ref(90);
const quickDragStartY = ref(0);
const quickDragStartTop = ref(0);
const quickDragMoved = ref(false);
const quickActions = [
  { label: "登录", icon: "login", url: "/pages/more/login" },
  { label: "通知", icon: "notice", url: "/pages/more/notifications" },
  { label: "报名", icon: "ticket", url: "/pages/more/my-registrations" },
  { label: "语言", icon: "language", url: "/pages/more/language-settings" }
];

const load = async () => {
  const [eventsResult, announcementsResult, placesResult] = await Promise.all([
    mobileApi.events.list(),
    mobileApi.announcements.list(),
    mobileApi.places.list()
  ]);

  events.value = eventsResult.data.items.slice(0, 2);
  announcements.value = announcementsResult.data.items.slice(0, 2);
  places.value = placesResult.data.items.slice(0, 2);
};

const open = (url: string) => {
  quickSidebarOpen.value = false;
  uni.navigateTo({ url });
};

const quickSidebarStyle = computed(() => ({
  top: `${quickSidebarTop.value}px`
}));

const getWindowHeight = () => {
  try {
    return uni.getSystemInfoSync().windowHeight;
  } catch {
    return 667;
  }
};

const clampSidebarTop = (top: number, estimatedHeight = quickSidebarOpen.value ? 260 : 72) => {
  const minTop = 24;
  const maxTop = Math.max(minTop, getWindowHeight() - estimatedHeight - 24);

  return Math.min(Math.max(top, minTop), maxTop);
};

const getTouchY = (event: TouchEvent) => {
  const touch = event.touches[0] ?? event.changedTouches[0];

  return touch?.clientY ?? quickSidebarTop.value;
};

const startQuickDrag = (event: TouchEvent) => {
  quickDragStartY.value = getTouchY(event);
  quickDragStartTop.value = quickSidebarTop.value;
  quickDragMoved.value = false;
};

const moveQuickDrag = (event: TouchEvent) => {
  const deltaY = getTouchY(event) - quickDragStartY.value;

  if (Math.abs(deltaY) > 4) {
    quickDragMoved.value = true;
  }

  quickSidebarTop.value = clampSidebarTop(quickDragStartTop.value + deltaY);
};

const endQuickDrag = () => {
  if (!quickDragMoved.value) {
    quickSidebarOpen.value = !quickSidebarOpen.value;
    quickSidebarTop.value = clampSidebarTop(
      quickSidebarTop.value,
      quickSidebarOpen.value ? 260 : 72
    );
  }

  quickDragMoved.value = false;
};

onMounted(() => {
  quickSidebarTop.value = clampSidebarTop(quickSidebarTop.value, 72);
  void load();
});
</script>

<template>
  <scroll-view scroll-y enable-flex class="page-scroll">
    <view class="shell">
      <view
        class="quick-sidebar"
        :class="{ expanded: quickSidebarOpen }"
        :style="quickSidebarStyle"
        aria-label="常用入口"
      >
        <view
          class="quick-toggle"
          @touchstart.stop="startQuickDrag"
          @touchmove.stop.prevent="moveQuickDrag"
          @touchend.stop="endQuickDrag"
          @touchcancel.stop="endQuickDrag"
        >
          <view class="quick-toggle-triangle" />
        </view>

        <template v-if="quickSidebarOpen">
          <view
            v-for="action in quickActions"
            :key="action.url"
            class="quick-side-item"
            @click.stop="open(action.url)"
          >
            <view class="quick-icon" :class="`quick-icon-${action.icon}`" />
            <view class="quick-label">{{ action.label }}</view>
          </view>
        </template>
      </view>

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
      </view>
    </view>
  </scroll-view>
</template>

<style scoped>
.page-scroll {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

.shell {
  min-height: 100vh;
  position: relative;
  padding: 24rpx;
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.quick-sidebar {
  position: fixed;
  left: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  align-items: center;
}

.quick-sidebar.expanded {
  padding: 18rpx 12rpx 16rpx 10rpx;
  border: 1rpx solid #d1fae5;
  border-left: 0;
  border-radius: 0 28rpx 28rpx 0;
  background: rgba(240, 253, 250, 0.96);
  box-shadow: 0 10rpx 28rpx rgba(15, 118, 110, 0.16);
}

.quick-toggle {
  width: 38rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 18rpx 18rpx 0;
  background: #0f766e;
  box-shadow: 0 8rpx 20rpx rgba(15, 118, 110, 0.18);
}

.quick-sidebar.expanded .quick-toggle {
  align-self: flex-end;
  width: 32rpx;
  height: 48rpx;
  margin-right: -28rpx;
  border-radius: 999rpx;
}

.quick-toggle-triangle {
  width: 0;
  height: 0;
  border-top: 12rpx solid transparent;
  border-bottom: 12rpx solid transparent;
  border-left: 16rpx solid #ffffff;
}

.quick-sidebar.expanded .quick-toggle-triangle {
  border-left: 0;
  border-right: 14rpx solid #ffffff;
}

.quick-side-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;
  padding: 12rpx 4rpx;
  border-radius: 20rpx;
  color: #115e59;
}

.quick-side-item:active {
  background: #ccfbf1;
}

.quick-icon {
  position: relative;
  width: 48rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: #0f766e;
}

.quick-icon-login::before {
  content: "";
  position: absolute;
  left: 17rpx;
  top: 10rpx;
  width: 14rpx;
  height: 14rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.quick-icon-login::after {
  content: "";
  position: absolute;
  left: 12rpx;
  bottom: 9rpx;
  width: 24rpx;
  height: 14rpx;
  border-radius: 14rpx 14rpx 6rpx 6rpx;
  background: #ffffff;
}

.quick-icon-notice::before {
  content: "";
  position: absolute;
  left: 13rpx;
  top: 10rpx;
  width: 22rpx;
  height: 24rpx;
  border: 4rpx solid #ffffff;
  border-bottom-width: 6rpx;
  border-radius: 18rpx 18rpx 8rpx 8rpx;
  box-sizing: border-box;
}

.quick-icon-notice::after {
  content: "";
  position: absolute;
  left: 20rpx;
  bottom: 8rpx;
  width: 8rpx;
  height: 5rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.quick-icon-ticket::before {
  content: "";
  position: absolute;
  left: 10rpx;
  top: 14rpx;
  width: 28rpx;
  height: 20rpx;
  border-radius: 6rpx;
  background: #ffffff;
}

.quick-icon-ticket::after {
  content: "";
  position: absolute;
  left: 22rpx;
  top: 17rpx;
  width: 0;
  height: 14rpx;
  border-left: 3rpx dashed #0f766e;
}

.quick-icon-language::before {
  content: "";
  position: absolute;
  left: 11rpx;
  top: 11rpx;
  width: 26rpx;
  height: 26rpx;
  border: 4rpx solid #ffffff;
  border-radius: 999rpx;
  box-sizing: border-box;
}

.quick-icon-language::after {
  content: "";
  position: absolute;
  left: 16rpx;
  top: 22rpx;
  width: 16rpx;
  height: 4rpx;
  border-radius: 999rpx;
  background: #ffffff;
}

.quick-label {
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1.2;
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
