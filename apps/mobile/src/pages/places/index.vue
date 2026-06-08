<script setup lang="ts">
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import type { PlaceListItem } from "@community-map/shared";

import { mobileApi } from "@/api/client";
import AsyncStateCard from "@/components/AsyncStateCard.vue";
import SectionPanel from "@/components/SectionPanel.vue";
import { pickLocalized, useAppStore } from "@/stores/app-store";
import { getPlacesCopy } from "./copy";
import { PLACE_LIST_CATEGORIES } from "./list-categories";
import { placesPagePaths } from "./navigation";
import { usePlaceAsyncState } from "./usePlaceAsyncState";

const { state } = useAppStore();
const places = ref<PlaceListItem[]>([]);
const { loading, error, run } = usePlaceAsyncState();
const filters = ref({
  keyword: "",
  category: "",
  recommended: false,
  sort: "recommended" as "recommended" | "name"
});

const listCopy = computed(() => getPlacesCopy(state.locale, "list"));
const categoryOptions = computed(() => [
  {
    value: "",
    label: listCopy.value.allCategories
  },
  ...PLACE_LIST_CATEGORIES.map((option) => ({
    value: option.value,
    label: option.label[state.locale]
  }))
]);
const activeCategoryIndex = computed(() =>
  Math.max(
    0,
    categoryOptions.value.findIndex(
      (option) => option.value === filters.value.category
    )
  )
);

const load = async () => {
  const result = await run(
    async () =>
      mobileApi.places.list({
        communityId: state.communityId,
        keyword: filters.value.keyword || undefined,
        category: filters.value.category || undefined,
        recommended: filters.value.recommended || undefined,
        sort: filters.value.sort
      }),
    listCopy.value.error
  );

  if (!result) {
    places.value = [];
    return;
  }

  places.value = result.data.items;
};

const openDetail = (id: string) => {
  uni.navigateTo({
    url: placesPagePaths.detail(id)
  });
};

const openRecommended = () => {
  filters.value.recommended = true;
  filters.value.sort = "recommended";
  load();
};

const handleCategoryChange = (event: { detail: { value: number | string } }) => {
  filters.value.category =
    categoryOptions.value[Number(event.detail.value)]?.value ?? "";
  load();
};

const resetFilters = () => {
  filters.value = {
    keyword: "",
    category: "",
    recommended: false,
    sort: "recommended"
  };
  load();
};

onLoad((query) => {
  filters.value.keyword = String(query?.keyword ?? "");
  filters.value.category = String(query?.category ?? "");
  filters.value.recommended = query?.recommended === "true";
  filters.value.sort = query?.sort === "name" ? "name" : "recommended";

  load();
});
</script>

<template>
  <view class="page">
    <SectionPanel :title="listCopy.title" :subtitle="listCopy.subtitle">
      <view class="toolbar">
        <button class="secondary" @click="openRecommended">
          {{ listCopy.recommendedFilter }}
        </button>
      </view>
      <input
        v-model="filters.keyword"
        class="field"
        :placeholder="listCopy.searchPlaceholder"
        @confirm="load"
      />
      <picker
        :range="categoryOptions.map((option) => option.label)"
        :value="activeCategoryIndex"
        @change="handleCategoryChange"
      >
        <view class="picker">
          {{ listCopy.categoryLabel }}：{{ categoryOptions[activeCategoryIndex]?.label }}
        </view>
      </picker>
      <view class="sort-row">
        <button
          class="chip"
          :class="{ active: filters.sort === 'recommended' }"
          @click="filters.sort = 'recommended'; load()"
        >
          {{ listCopy.recommendedSort }}
        </button>
        <button
          class="chip"
          :class="{ active: filters.sort === 'name' }"
          @click="filters.sort = 'name'; load()"
        >
          {{ listCopy.nameSort }}
        </button>
        <button
          class="chip"
          :class="{ active: filters.recommended }"
          @click="filters.recommended = !filters.recommended; load()"
        >
          {{ listCopy.recommendedFilter }}
        </button>
        <button class="chip ghost" @click="resetFilters">{{ listCopy.clearFilters }}</button>
      </view>

      <AsyncStateCard v-if="loading" variant="loading" :text="listCopy.loading" />
      <AsyncStateCard v-else-if="error" variant="error" :text="error" />
      <AsyncStateCard
        v-else-if="places.length === 0"
        variant="empty"
        :text="listCopy.empty"
      />
      <view
        v-else
        v-for="place in places"
        :key="place._id"
        class="card"
        @click="openDetail(place._id)"
      >
        <image
          v-if="place.cover_url"
          class="card-cover"
          :src="place.cover_url"
          mode="aspectFill"
        />
        <view class="card-top">
          <view class="card-title">{{
            pickLocalized(state.locale, place.name_zh, place.name_en)
          }}</view>
          <view v-if="place.is_recommended" class="badge">
            {{ listCopy.recommendedBadge }}
          </view>
        </view>
        <view class="card-meta">
          {{ place.category_level_1 }} / {{ place.category_level_2 }}
        </view>
        <view class="card-text">{{
          pickLocalized(state.locale, place.short_address_zh, place.short_address_en)
        }}</view>
        <view class="card-text">{{
          pickLocalized(state.locale, place.summary_zh, place.summary_en)
        }}</view>
        <view v-if="place.tag_ids.length" class="tags">
          <text v-for="tag in place.tag_ids" :key="tag" class="tag">#{{ tag }}</text>
        </view>
      </view>
    </SectionPanel>
  </view>
</template>

<style scoped>
.page {
  padding: 24rpx;
  background: #f8fafc;
  min-height: 100vh;
}

.toolbar,
.sort-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 16rpx;
  flex-wrap: wrap;
}

.secondary,
.chip {
  border-radius: 8rpx;
  background: #e6f4ff;
  color: #0052d9;
  font-size: 24rpx;
}

.chip.active {
  background: #0052d9;
  color: #ffffff;
}

.chip.ghost {
  background: #f3f4f6;
  color: #374151;
}

.field,
.picker {
  margin-bottom: 16rpx;
  background: #ffffff;
  border: 1rpx solid #d1d5db;
  border-radius: 8rpx;
  padding: 20rpx 24rpx;
  font-size: 26rpx;
}

.card {
  margin-top: 16rpx;
  background: #ffffff;
  border: 1rpx solid #e5e7eb;
  border-radius: 16rpx;
  padding: 24rpx;
  overflow: hidden;
}

.card-cover {
  width: calc(100% + 48rpx);
  height: 240rpx;
  margin: -24rpx -24rpx 20rpx;
  background: #e2e8f0;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: flex-start;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
}

.card-meta,
.card-text {
  margin-top: 10rpx;
  color: #6b7280;
  line-height: 1.5;
}

.badge,
.tag {
  display: inline-flex;
  align-items: center;
  padding: 6rpx 14rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
}

.badge {
  background: #fff7e6;
  color: #ad5a00;
}

.tags {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  margin-top: 14rpx;
}

.tag {
  background: #e6f4ff;
  color: #0052d9;
}
</style>
