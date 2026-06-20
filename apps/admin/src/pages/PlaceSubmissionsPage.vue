<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";
import type { PlaceSubmission, User } from "@community-map/shared";

import { adminApi } from "@/api/client";

const loading = ref(false);
const reviewingId = ref<string | null>(null);
const submissions = ref<PlaceSubmission[]>([]);
const users = ref<User[]>([]);

const userNameMap = computed(() =>
  new Map(users.value.map((user) => [user._id, user.nickname]))
);

const statusLabel: Record<PlaceSubmission["status"], string> = {
  pending_review: "待审核",
  approved: "已通过",
  rejected: "已驳回"
};

const statusTagType: Record<PlaceSubmission["status"], "success" | "info" | "warning"> = {
  pending_review: "warning",
  approved: "success",
  rejected: "info"
};

const submitterName = (userId: string) => userNameMap.value.get(userId) ?? userId;
const getStatusLabel = (status: PlaceSubmission["status"]) => statusLabel[status];
const getStatusTagType = (status: PlaceSubmission["status"]) => statusTagType[status];

const load = async () => {
  loading.value = true;
  try {
    const [submissionResult, userResult] = await Promise.all([
      adminApi.admin.listPlaceSubmissions(),
      adminApi.profile.users()
    ]);
    submissions.value = submissionResult.data;
    users.value = userResult.data;
  } finally {
    loading.value = false;
  }
};

const approve = async (id: string) => {
  reviewingId.value = id;
  try {
    await adminApi.admin.approvePlaceSubmission(id);
    ElMessage.success("已通过地点提交。");
    await load();
  } finally {
    reviewingId.value = null;
  }
};

const reject = async (id: string) => {
  reviewingId.value = id;
  try {
    await adminApi.admin.rejectPlaceSubmission(id);
    ElMessage.success("已驳回地点提交。");
    await load();
  } finally {
    reviewingId.value = null;
  }
};

onMounted(load);
</script>

<template>
  <div class="page-card">
    <div class="page-header">
      <h2>用户提交审核</h2>
      <el-tag type="warning">Mock places 审核队列</el-tag>
    </div>

    <el-table :data="submissions" v-loading="loading" row-key="_id">
      <el-table-column label="提交人" width="140">
        <template #default="{ row }">
          <div>{{ submitterName(row.user_id) }}</div>
          <small class="muted">{{ row.user_id }}</small>
        </template>
      </el-table-column>

      <el-table-column label="地点信息" min-width="260">
        <template #default="{ row }">
          <div class="place-name">{{ row.name }}</div>
          <div class="muted">{{ row.address }}</div>
          <div v-if="row.note" class="note">{{ row.note }}</div>
        </template>
      </el-table-column>

      <el-table-column label="照片" min-width="260">
        <template #default="{ row }">
          <div v-if="row.photo_urls.length > 0" class="photo-list">
            <div v-for="url in row.photo_urls" :key="url" class="photo-item">
              <el-image
                class="photo-preview"
                :src="url"
                :preview-src-list="row.photo_urls"
                fit="cover"
              />
              <el-link :href="url" target="_blank" type="primary" :underline="false">
                查看原图
              </el-link>
            </div>
          </div>
          <span v-else class="muted">无照片</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="时间" width="220">
        <template #default="{ row }">
          <div>提交：{{ row.submitted_at }}</div>
          <div class="muted">审核：{{ row.reviewed_at ?? "未审核" }}</div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button
            size="small"
            type="primary"
            :loading="reviewingId === row._id"
            :disabled="row.status === 'approved'"
            @click="approve(row._id)"
          >
            通过
          </el-button>
          <el-button
            size="small"
            :loading="reviewingId === row._id"
            :disabled="row.status === 'rejected'"
            @click="reject(row._id)"
          >
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.place-name {
  font-weight: 600;
}

.muted {
  color: #64748b;
}

.note {
  margin-top: 8px;
  color: #334155;
}

.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 88px;
}

.photo-preview {
  width: 88px;
  height: 64px;
  border-radius: 8px;
}
</style>
