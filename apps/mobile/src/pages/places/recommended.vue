<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";

import { placesPagePaths } from "./navigation";

onLoad(() => {
  uni.redirectTo({
    url: placesPagePaths.recommended()
  });
});
</script>

<template>
  <view class="page" />
</template>

<style scoped>
.page {
  padding: 24rpx;
  background: #f8fafc;
  min-height: 100vh;
}
</style>
