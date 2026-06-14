<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  CreatePlaceInputSchema,
  PLACE_STATUSES,
  PLACE_TOP_LEVEL_CATEGORIES,
  UpdatePlaceInputSchema,
  type Place
} from "@community-map/shared";

import { FILE_PATH_RULES, adminApi } from "@/api/client";

const loading = ref(false);
const places = ref<Place[]>([]);
const saving = ref(false);
const registeringGallery = ref(false);
const editingId = ref<string | null>(null);
const submittingError = ref("");

const categoryOptions = PLACE_TOP_LEVEL_CATEGORIES.map((value) => ({
  value,
  label: value
}));

const statusOptions = PLACE_STATUSES.map((value) => ({
  value,
  label: value
}));

const hasUsableCoordinates = (place: Place) =>
  Number.isFinite(place.location.latitude) &&
  Number.isFinite(place.location.longitude) &&
  place.location.latitude >= -90 &&
  place.location.latitude <= 90 &&
  place.location.longitude >= -180 &&
  place.location.longitude <= 180;

const getReviewIndicators = (place: Place) => {
  const indicators: Array<{ type: "danger" | "warning" | "info"; label: string }> = [];

  if (place.import_review) {
    indicators.push({ type: "info", label: "志愿者导入" });
  }
  if (place.status === "draft") {
    indicators.push({ type: "warning", label: "草稿" });
  }
  if (!hasUsableCoordinates(place)) {
    indicators.push({ type: "danger", label: "缺坐标/不可出地图点" });
  }
  if (!place.address_zh || !place.address_en) {
    indicators.push({ type: "warning", label: "地址待补齐" });
  }
  if (!place.name_en || !place.intro_en || !place.business_hours_en) {
    indicators.push({ type: "warning", label: "英文待补齐" });
  }
  if (place.tag_ids.length === 0) {
    indicators.push({ type: "warning", label: "缺标签" });
  }
  if (place.gallery_file_ids.length === 0 && place.gallery_urls.length === 0) {
    indicators.push({ type: "info", label: "缺图集" });
  }
  if (!place.is_recommended) {
    indicators.push({ type: "info", label: "非推荐" });
  }

  for (const blocker of place.import_review?.review_blockers ?? []) {
    indicators.push({ type: "danger", label: blocker });
  }

  return indicators;
};

const createEmptyForm = () => ({
  name_zh: "新增地点草稿",
  name_en: "New Draft Place",
  cover_file_id: null as string | null,
  cover_url: "",
  category_level_1: "public-service",
  category_level_2: "community-center",
  tag_ids_text: "service,community",
  address_zh: "桐梓林待补充地址",
  address_en: "Address pending",
  latitude: 30.615,
  longitude: 104.062,
  tencent_map_poi_id: "",
  business_hours_zh: "待补充",
  business_hours_en: "Pending",
  intro_zh: "待补充简介",
  intro_en: "Introduction pending",
  recommended_reason_zh: "",
  recommended_reason_en: "",
  is_recommended: false,
  recommended_rank: 0,
  gallery_file_ids: [] as string[],
  gallery_file_name: "",
  status: "draft" as Place["status"],
  supports_navigation: true,
  supports_favorite: true,
  supports_share: true
});

const form = reactive(createEmptyForm());

const issueMessage = (issue: { path: Array<string | number>; message: string }) =>
  issue.path.length > 0
    ? `${issue.path.join(".")}: ${issue.message}`
    : issue.message;

const fillForm = (place?: Place) => {
  Object.assign(form, createEmptyForm());
  submittingError.value = "";

  if (!place) {
    editingId.value = null;
    return;
  }

  editingId.value = place._id;
  Object.assign(form, {
    name_zh: place.name_zh,
    name_en: place.name_en,
    cover_file_id: place.cover_file_id,
    cover_url: place.cover_url ?? "",
    category_level_1: place.category_level_1,
    category_level_2: place.category_level_2,
    tag_ids_text: place.tag_ids.join(","),
    address_zh: place.address_zh,
    address_en: place.address_en,
    latitude: place.location.latitude,
    longitude: place.location.longitude,
    tencent_map_poi_id: place.tencent_map_poi_id ?? "",
    business_hours_zh: place.business_hours_zh,
    business_hours_en: place.business_hours_en,
    intro_zh: place.intro_zh,
    intro_en: place.intro_en,
    recommended_reason_zh: place.recommended_reason_zh ?? "",
    recommended_reason_en: place.recommended_reason_en ?? "",
    is_recommended: place.is_recommended,
    recommended_rank: place.recommended_rank,
    gallery_file_ids: [...place.gallery_file_ids],
    gallery_file_name: "",
    status: place.status,
    supports_navigation: place.supports_navigation,
    supports_favorite: place.supports_favorite,
    supports_share: place.supports_share
  });
};

const buildPayload = () => ({
  name_zh: form.name_zh,
  name_en: form.name_en,
  cover_file_id: form.cover_file_id,
  cover_url: form.cover_url || null,
  category_level_1: form.category_level_1,
  category_level_2: form.category_level_2,
  tag_ids: form.tag_ids_text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  address_zh: form.address_zh,
  address_en: form.address_en,
  location: {
    latitude: Number(form.latitude),
    longitude: Number(form.longitude)
  },
  tencent_map_poi_id: form.tencent_map_poi_id || null,
  business_hours_zh: form.business_hours_zh,
  business_hours_en: form.business_hours_en,
  intro_zh: form.intro_zh,
  intro_en: form.intro_en,
  recommended_reason_zh: form.recommended_reason_zh || null,
  recommended_reason_en: form.recommended_reason_en || null,
  is_recommended: form.is_recommended,
  recommended_rank: Number(form.recommended_rank),
  gallery_file_ids: form.gallery_file_ids,
  gallery_urls: [],
  supports_navigation: form.supports_navigation,
  supports_favorite: form.supports_favorite,
  supports_share: form.supports_share,
  status: form.status
});

const buildValidatedPayload = () => {
  const payload = buildPayload();
  const result = editingId.value
    ? UpdatePlaceInputSchema.safeParse(payload)
    : CreatePlaceInputSchema.safeParse(payload);

  if (result.success) {
    return result.data;
  }

  const message = issueMessage(result.error.issues[0]);
  submittingError.value = message;
  ElMessage.error(message);
  return null;
};

const load = async () => {
  loading.value = true;
  try {
    const result = await adminApi.admin.listPlaces();
    places.value = result.data.items;
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  saving.value = true;
  submittingError.value = "";

  try {
    const payload = buildValidatedPayload();
    if (!payload) {
      return;
    }

    if (editingId.value) {
      await adminApi.admin.updatePlace(editingId.value, payload);
    } else {
      await adminApi.admin.createPlace(payload);
    }

    fillForm();
    await load();
  } finally {
    saving.value = false;
  }
};

const startCreate = () => fillForm();
const startEdit = (place: Place) => fillForm(place);
const quickPublish = async (place: Place, status: Place["status"]) => {
  await adminApi.admin.updatePlace(place._id, { status });
  await load();
};

const removeGalleryFile = (fileId: string) => {
  form.gallery_file_ids = form.gallery_file_ids.filter((item) => item !== fileId);
};

const registerGalleryFile = async () => {
  if (!editingId.value) {
    ElMessage.warning("请先创建并保存地点，再登记图集文件。");
    return;
  }

  const fileName = form.gallery_file_name.trim();
  if (!fileName) {
    ElMessage.warning("请输入图集文件名。");
    return;
  }

  registeringGallery.value = true;
  try {
    const uploadRequest = await adminApi.files.createUploadRequest({
      biz_type: "place_gallery",
      biz_id: editingId.value,
      file_name: fileName,
      visibility: "public",
      target_prefix: FILE_PATH_RULES.placeGallery
    });
    const fileId = `cloud://${uploadRequest.data.cloud_path}`;
    const completion = await adminApi.files.complete({
      biz_type: "place_gallery",
      biz_id: editingId.value,
      file_id: fileId,
      cloud_path: uploadRequest.data.cloud_path,
      visibility: "public"
    });
    const galleryFileIds = [
      ...new Set([...form.gallery_file_ids, completion.data.file_id])
    ];

    await adminApi.admin.updatePlace(editingId.value, {
      gallery_file_ids: galleryFileIds,
      gallery_urls: []
    });

    form.gallery_file_ids = galleryFileIds;
    form.gallery_file_name = "";
    ElMessage.success("图集文件已登记并挂接。");
    await load();
  } finally {
    registeringGallery.value = false;
  }
};

onMounted(async () => {
  fillForm();
  await load();
});
</script>

<template>
  <div class="page-card">
    <div class="page-header">
      <h2>地点管理</h2>
      <el-button type="primary" @click="startCreate">新增地点</el-button>
    </div>
    <div class="editor-grid">
      <div class="editor-card">
        <h3>{{ editingId ? "编辑地点" : "新建地点" }}</h3>
        <div class="form-grid">
          <el-input v-model="form.name_zh" placeholder="中文名" />
          <el-input v-model="form.name_en" placeholder="英文名" />
          <el-select v-model="form.category_level_1" placeholder="一级分类">
            <el-option
              v-for="option in categoryOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input v-model="form.category_level_2" placeholder="二级分类" />
          <el-input v-model="form.tag_ids_text" placeholder="标签，逗号分隔" />
          <el-select v-model="form.status" placeholder="状态">
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
          <el-input v-model="form.address_zh" placeholder="中文地址" />
          <el-input v-model="form.address_en" placeholder="英文地址" />
          <el-input v-model="form.cover_url" placeholder="封面 URL" />
          <el-input v-model="form.tencent_map_poi_id" placeholder="腾讯 POI ID" />
          <el-input-number v-model="form.latitude" :step="0.0001" placeholder="纬度" />
          <el-input-number
            v-model="form.longitude"
            :step="0.0001"
            placeholder="经度"
          />
          <el-input v-model="form.business_hours_zh" placeholder="中文营业时间" />
          <el-input v-model="form.business_hours_en" placeholder="英文营业时间" />
          <el-input
            v-model="form.recommended_reason_zh"
            placeholder="中文推荐理由"
          />
          <el-input
            v-model="form.recommended_reason_en"
            placeholder="英文推荐理由"
          />
          <el-input-number
            v-model="form.recommended_rank"
            :min="0"
            placeholder="推荐排序"
          />
        </div>
        <div v-if="submittingError" class="error-text">{{ submittingError }}</div>
        <el-input
          v-model="form.intro_zh"
          type="textarea"
          :rows="3"
          placeholder="中文简介"
        />
        <el-input
          v-model="form.intro_en"
          type="textarea"
          :rows="3"
          placeholder="英文简介"
          class="mt-12"
        />
        <div class="switch-row">
          <el-switch v-model="form.is_recommended" active-text="推荐位" />
          <el-switch v-model="form.supports_navigation" active-text="支持导航" />
          <el-switch v-model="form.supports_favorite" active-text="收藏入口" />
          <el-switch v-model="form.supports_share" active-text="分享入口" />
        </div>
        <div class="gallery-manager">
          <div class="gallery-header">
            <h4>地点图集</h4>
            <span>通过 files flow 登记并挂接，移动端详情页按文件资产解析图片。</span>
          </div>
          <div class="gallery-register-row">
            <el-input
              v-model="form.gallery_file_name"
              placeholder="图集文件名，例如 entrance.jpg"
            />
            <el-button
              type="primary"
              :loading="registeringGallery"
              :disabled="!editingId"
              @click="registerGalleryFile"
            >
              登记图集文件
            </el-button>
          </div>
          <div v-if="!editingId" class="hint-text">
            新建地点需先保存草稿，获得地点 ID 后再登记图集文件。
          </div>
          <div v-if="form.gallery_file_ids.length" class="gallery-file-list">
            <el-tag
              v-for="fileId in form.gallery_file_ids"
              :key="fileId"
              closable
              @close="removeGalleryFile(fileId)"
            >
              {{ fileId }}
            </el-tag>
          </div>
          <div v-else class="hint-text">暂无已挂接图集文件。</div>
        </div>
        <div class="editor-actions">
          <el-button @click="startCreate">重置</el-button>
          <el-button type="primary" :loading="saving" @click="submit">
            {{ editingId ? "保存修改" : "创建地点" }}
          </el-button>
        </div>
      </div>
    </div>
    <el-table :data="places" v-loading="loading">
      <el-table-column prop="name_zh" label="中文名" min-width="180" />
      <el-table-column prop="name_en" label="英文名" min-width="180" />
      <el-table-column prop="category_level_1" label="一级分类" width="140" />
      <el-table-column label="审核提示" min-width="280">
        <template #default="{ row }">
          <div class="review-indicators">
            <el-tag
              v-for="indicator in getReviewIndicators(row)"
              :key="indicator.label"
              :type="indicator.type"
              size="small"
            >
              {{ indicator.label }}
            </el-tag>
          </div>
          <div v-if="row.import_review" class="review-source">
            {{ row.import_review.source_column }} ·
            {{ row.import_review.volunteer_category_raw || "未填类型" }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="is_recommended" label="推荐" width="90">
        <template #default="{ row }">
          {{ row.is_recommended ? "是" : "否" }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column label="操作" width="280">
        <template #default="{ row }">
          <el-button link type="primary" @click="startEdit(row)">编辑</el-button>
          <el-button
            link
            type="success"
            @click="quickPublish(row, 'published')"
          >
            发布
          </el-button>
          <el-button link @click="quickPublish(row, 'draft')">转草稿</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style scoped>
.editor-grid {
  margin-bottom: 20px;
}

.editor-card {
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #f8fafc;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.switch-row,
.editor-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.error-text {
  margin-bottom: 12px;
  color: #b91c1c;
}

.gallery-manager {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.gallery-header {
  margin-bottom: 12px;
}

.gallery-header h4 {
  margin: 0 0 4px;
}

.gallery-header span,
.hint-text {
  color: #6b7280;
  font-size: 13px;
}

.gallery-register-row,
.gallery-file-list,
.review-indicators {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.gallery-file-list {
  margin-top: 12px;
}

.mt-12 {
  margin-top: 12px;
}

.review-source {
  margin-top: 6px;
  color: #6b7280;
  font-size: 12px;
}
</style>
