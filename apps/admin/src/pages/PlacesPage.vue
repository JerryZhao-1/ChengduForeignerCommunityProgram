<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CreatePlaceInputSchema,
  ApiClientError,
  PLACE_SECONDARY_CATEGORY_OPTIONS,
  PLACE_STATUSES,
  PLACE_TOP_LEVEL_CATEGORIES,
  UpdatePlaceInputSchema,
  validatePlacePublicationReadiness,
  type ApiFailureResult,
  type Place,
  type PlaceAmapMediaSearchItem,
  type PlaceExternalMedia,
  type PlacePoiSearchItem,
  type PlaceTopLevelCategory
} from "@community-map/shared";

import { adminApi } from "@/api/client";

const loading = ref(false);
const places = ref<Place[]>([]);
const saving = ref(false);
const uploadingGallery = ref(false);
const editingId = ref<string | null>(null);
const deletingId = ref<string | null>(null);
const publishingId = ref<string | null>(null);
const submittingError = ref("");
const poiKeyword = ref("");
const poiSearching = ref(false);
const poiResults = ref<PlacePoiSearchItem[]>([]);
const poiError = ref("");
const amapKeyword = ref("");
const amapSearching = ref(false);
const amapResults = ref<PlaceAmapMediaSearchItem[]>([]);
const amapError = ref("");
const galleryFileInput = ref<HTMLInputElement | null>(null);
const isAssigningForm = ref(false);

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

const isPendingEnglishName = (name: string) =>
  name.trim().toLowerCase() === "pending english name";

const hiddenImportReviewBlockers = new Set([
  "needs_coordinate_review",
  "missing_position_evidence",
  "missing_media",
  "needs_tag_review",
  "needs_english_name_review",
  "unsupported_category:missing",
  "unsupported_category:pet space"
]);

const getReviewIndicators = (place: Place) => {
  const indicators: Array<{
    type: "danger" | "warning" | "info" | "success";
    label: string;
  }> = [];

  if (place.import_review) {
    indicators.push({ type: "info", label: "志愿者导入" });
  }
  if (place.status === "draft") {
    indicators.push({ type: "warning", label: "草稿" });
  }
  const canAppearOnMap =
    place.status === "published" && hasUsableCoordinates(place);

  if (!hasUsableCoordinates(place)) {
    indicators.push({ type: "danger", label: "缺坐标/不可出地图点" });
  }
  if (!canAppearOnMap && place.status !== "published") {
    indicators.push({ type: "warning", label: "未发布不上地图" });
  }
  if (canAppearOnMap) {
    indicators.push({ type: "success", label: "可出地图" });
  }
  if (!place.address_zh.trim() || !place.address_en.trim()) {
    indicators.push({ type: "warning", label: "地址待补齐" });
  }
  if (
    !place.name_en.trim() ||
    isPendingEnglishName(place.name_en) ||
    !place.intro_en.trim() ||
    !place.business_hours_en.trim()
  ) {
    indicators.push({ type: "warning", label: "英文待补齐" });
  }
  if (place.tag_ids.length === 0) {
    indicators.push({ type: "warning", label: "缺标签" });
  }
  if (
    place.gallery_file_ids.length === 0 &&
    place.external_gallery_media.length === 0 &&
    place.gallery_urls.length === 0
  ) {
    indicators.push({ type: "info", label: "缺图集" });
  }
  if (place.is_recommended) {
    indicators.push({ type: "success", label: "推荐" });
  }

  const readiness = validatePlacePublicationReadiness(place);
  if (readiness.ready) {
    indicators.push({ type: "success", label: "双语发布就绪" });
  } else {
    indicators.push({
      type: "danger",
      label: `发布待补：${readiness.issues
        .map((issue) => issue.field)
        .join("、")}`
    });
  }

  for (const blocker of place.import_review?.review_blockers ?? []) {
    if (hiddenImportReviewBlockers.has(blocker)) {
      continue;
    }

    indicators.push({ type: "danger", label: blocker });
  }

  return indicators;
};

const createEmptyForm = () => ({
  name_zh: "新增地点草稿",
  name_en: "New Draft Place",
  cover_file_id: null as string | null,
  cover_url: "",
  cover_source: null as Place["cover_source"],
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
  external_gallery_media: [] as PlaceExternalMedia[],
  gallery_urls: [] as string[],
  status: "draft" as Place["status"],
  supports_navigation: true,
  supports_favorite: true,
  supports_share: true
});

const form = reactive(createEmptyForm());

const secondaryCategoryOptions = computed(() => {
  const topLevel = form.category_level_1 as PlaceTopLevelCategory;
  const fixedOptions = [...PLACE_SECONDARY_CATEGORY_OPTIONS[topLevel]];

  if (
    form.category_level_2 &&
    !fixedOptions.includes(form.category_level_2)
  ) {
    return [
      {
        value: form.category_level_2,
        label: `${form.category_level_2}（当前值）`
      },
      ...fixedOptions.map((value) => ({ value, label: value }))
    ];
  }

  return fixedOptions.map((value) => ({ value, label: value }));
});

watch(
  () => form.category_level_1,
  (category) => {
    if (isAssigningForm.value) {
      return;
    }

    const options = PLACE_SECONDARY_CATEGORY_OPTIONS[
      category as PlaceTopLevelCategory
    ];
    form.category_level_2 = options[0] ?? "";
  },
  { flush: "sync" }
);

const issueMessage = (issue: {
  path: Array<string | number>;
  message: string;
}) =>
  issue.path.length > 0
    ? `${issue.path.join(".")}: ${issue.message}`
    : issue.message;

const isApiFailureResult = (value: unknown): value is ApiFailureResult => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return record.success === false && typeof record.error === "object";
};

const toErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    const fields = (error.details as {
      fields?: Array<{ field?: string; message?: string }>;
    } | undefined)?.fields;
    if (fields?.length) {
      return `${error.message} ${fields
        .map((item) => item.field || item.message)
        .filter(Boolean)
        .join("、")}`;
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
};

const showOperationError = (error: unknown, fallback: string) => {
  const message = toErrorMessage(error, fallback);
  ElMessage.error(message);
  return message;
};

const fillForm = (place?: Place) => {
  isAssigningForm.value = true;
  Object.assign(form, createEmptyForm());
  submittingError.value = "";

  if (!place) {
    editingId.value = null;
    isAssigningForm.value = false;
    return;
  }

  editingId.value = place._id;
  Object.assign(form, {
    name_zh: place.name_zh,
    name_en: place.name_en,
    cover_file_id: place.cover_file_id,
    cover_url: place.cover_url ?? "",
    cover_source: place.cover_source,
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
    external_gallery_media: [...place.external_gallery_media],
    gallery_urls: [...place.gallery_urls],
    status: place.status,
    supports_navigation: place.supports_navigation,
    supports_favorite: place.supports_favorite,
    supports_share: place.supports_share
  });
  isAssigningForm.value = false;
};

const buildPayload = () => ({
  name_zh: form.name_zh,
  name_en: form.name_en,
  cover_file_id: form.cover_file_id,
  cover_url: form.cover_url || null,
  cover_source: form.cover_source,
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
  external_gallery_media: form.external_gallery_media,
  gallery_urls: form.gallery_urls,
  supports_navigation: form.supports_navigation,
  supports_favorite: form.supports_favorite,
  supports_share: form.supports_share,
  status: form.status
});

const formReadiness = computed(() =>
  validatePlacePublicationReadiness(buildPayload() as Partial<Place>)
);

const buildValidatedPayload = () => {
  const payload = buildPayload();
  const readiness = validatePlacePublicationReadiness(
    payload as Partial<Place>
  );
  if (payload.status === "published" && !readiness.ready) {
    const message = `发布前请补齐：${readiness.issues
      .map((issue) => issue.field)
      .join("、")}`;
    submittingError.value = message;
    ElMessage.error(message);
    return null;
  }
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
  } catch (error) {
    showOperationError(error, "地点列表加载失败。");
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

    const wasEditing = editingId.value !== null;

    if (editingId.value) {
      await adminApi.admin.updatePlace(editingId.value, payload);
    } else {
      await adminApi.admin.createPlace(payload);
    }

    fillForm();
    await load();
    ElMessage.success(wasEditing ? "地点已保存。" : "地点已创建。");
  } catch (error) {
    submittingError.value = showOperationError(
      error,
      editingId.value ? "保存地点失败。" : "创建地点失败。"
    );
  } finally {
    saving.value = false;
  }
};

const startCreate = () => fillForm();
const startEdit = (place: Place) => fillForm(place);
const quickPublish = async (place: Place, status: Place["status"]) => {
  if (publishingId.value) {
    return;
  }
  if (status === "published") {
    const readiness = validatePlacePublicationReadiness(place);
    if (!readiness.ready) {
      ElMessage.error(
        `发布前请补齐：${readiness.issues
          .map((issue) => issue.field)
          .join("、")}`
      );
      return;
    }
  }
  publishingId.value = place._id;
  await nextTick();
  try {
    await adminApi.admin.updatePlace(place._id, { status });
    await load();
    ElMessage.success(status === "published" ? "地点已发布。" : "地点已转为草稿。");
  } catch (error) {
    showOperationError(error, "更新地点状态失败。");
  } finally {
    publishingId.value = null;
  }
};

const searchPoi = async () => {
  const keyword = poiKeyword.value.trim();

  if (!keyword) {
    ElMessage.warning("请输入地标或地址关键词。");
    return;
  }

  poiSearching.value = true;
  poiError.value = "";

  try {
    const result = (await adminApi.admin.searchPlacePoi({
      keyword
    })) as unknown;

    if (isApiFailureResult(result)) {
      poiResults.value = [];
      poiError.value = result.error.message;
      ElMessage.error(result.error.message);
      return;
    }

    const successResult = result as { data: PlacePoiSearchItem[] };
    poiResults.value = successResult.data;

    if (successResult.data.length === 0) {
      poiError.value = "未找到匹配地标。";
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "地标搜索失败。";
    poiResults.value = [];
    poiError.value = message;
    ElMessage.error(message);
  } finally {
    poiSearching.value = false;
  }
};

const searchAmapMedia = async () => {
  const keyword = amapKeyword.value.trim();

  if (!keyword) {
    ElMessage.warning("请输入可搜索图片的地点关键词。");
    return;
  }

  amapSearching.value = true;
  amapError.value = "";

  try {
    const result = (await adminApi.admin.searchPlaceAmapMedia({
      keyword
    })) as unknown;

    if (isApiFailureResult(result)) {
      amapResults.value = [];
      amapError.value = result.error.message;
      ElMessage.error(result.error.message);
      return;
    }

    const successResult = result as { data: PlaceAmapMediaSearchItem[] };
    amapResults.value = successResult.data;

    if (
      successResult.data.every((item) => item.image_candidates.length === 0)
    ) {
      amapError.value = "未找到带图片的 Amap 候选。";
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Amap 图片搜索失败。";
    amapResults.value = [];
    amapError.value = message;
    ElMessage.error(message);
  } finally {
    amapSearching.value = false;
  }
};

const hasManualPlaceLookupFields = () => {
  const emptyForm = createEmptyForm();

  return (
    editingId.value !== null ||
    form.name_zh !== emptyForm.name_zh ||
    form.address_zh !== emptyForm.address_zh ||
    form.tencent_map_poi_id !== emptyForm.tencent_map_poi_id ||
    Number(form.latitude) !== emptyForm.latitude ||
    Number(form.longitude) !== emptyForm.longitude
  );
};

const selectPoi = async (item: PlacePoiSearchItem) => {
  if (hasManualPlaceLookupFields()) {
    try {
      await ElMessageBox.confirm(
        "选中地标会覆盖中文名、中文地址、经纬度和腾讯 POI ID。",
        "填充地标信息",
        {
          confirmButtonText: "填充",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
    } catch {
      return;
    }
  }

  form.name_zh = item.title;
  form.address_zh = item.address;
  form.latitude = item.location.latitude;
  form.longitude = item.location.longitude;
  form.tencent_map_poi_id = item.id;
  poiKeyword.value = item.title;
  poiResults.value = [];
  poiError.value = "";
  ElMessage.success("已填充腾讯地图地标信息。");
};

const deletePlace = async (place: Place) => {
  try {
    await ElMessageBox.confirm(
      `删除后「${place.name_zh}」会从后台列表和前台地点中移除，且不能在当前后台撤销。`,
      "删除地点",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
        confirmButtonClass: "el-button--danger"
      }
    );
  } catch {
    return;
  }

  deletingId.value = place._id;
  try {
    await adminApi.admin.deletePlace(place._id);
    if (editingId.value === place._id) {
      fillForm();
    }
    ElMessage.success("地点已删除。");
    await load();
  } catch (error) {
    showOperationError(error, "删除地点失败。");
  } finally {
    deletingId.value = null;
  }
};

const removeGalleryFile = (fileId: string) => {
  form.gallery_file_ids = form.gallery_file_ids.filter(
    (item) => item !== fileId
  );
};

const addExternalGalleryMedia = (media: PlaceExternalMedia) => {
  const exists = form.external_gallery_media.some(
    (item) =>
      item.source === media.source &&
      item.source_place_id === media.source_place_id &&
      item.image_url === media.image_url
  );

  if (!exists) {
    form.external_gallery_media = [...form.external_gallery_media, media];
  }

  ElMessage.success("已添加外部图集图片。");
};

const useExternalCover = (media: PlaceExternalMedia) => {
  form.cover_url = media.image_url;
  form.cover_source = {
    source: media.source,
    source_place_id: media.source_place_id,
    image_url: media.image_url,
    image_title: media.image_title,
    attribution: media.attribution
  };
  ElMessage.success("已设置外部封面来源。");
};

const removeExternalGalleryMedia = (index: number) => {
  form.external_gallery_media = form.external_gallery_media.filter(
    (_, itemIndex) => itemIndex !== index
  );
};

const clearCoverSource = () => {
  form.cover_source = null;
};

const chooseGalleryUpload = () => {
  galleryFileInput.value?.click();
};

const uploadGalleryFile = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  uploadingGallery.value = true;
  try {
    const uploadInput = {
      file,
      file_name: file.name,
      content_type: file.type
    };
    const result = (await (editingId.value
      ? adminApi.admin.uploadPlaceGalleryFile(editingId.value, uploadInput)
      : adminApi.admin.uploadPendingPlaceGalleryFile(uploadInput))) as unknown;

    if (isApiFailureResult(result)) {
      ElMessage.error(result.error.message);
      return;
    }

    const successResult = result as {
      data: { file_asset: { file_id: string }; gallery_file_ids: string[] };
    };

    form.gallery_file_ids = editingId.value
      ? successResult.data.gallery_file_ids
      : [
          ...new Set([
            ...form.gallery_file_ids,
            successResult.data.file_asset.file_id
          ])
        ];

    ElMessage.success(
      editingId.value
        ? "图集图片已上传。"
        : "图集图片已上传，创建地点时会自动绑定。"
    );
    await load();
  } catch (error) {
    showOperationError(error, "上传图集图片失败。");
  } finally {
    uploadingGallery.value = false;
    target.value = "";
  }
};

const saveMediaOnly = async () => {
  if (!editingId.value) {
    ElMessage.warning("请先创建并保存地点。");
    return;
  }

  saving.value = true;
  try {
    await adminApi.admin.updatePlace(editingId.value, {
      cover_url: form.cover_url || null,
      cover_source: form.cover_source,
      gallery_file_ids: form.gallery_file_ids,
      external_gallery_media: form.external_gallery_media,
      gallery_urls: []
    });
    ElMessage.success("媒体设置已保存。");
    await load();
  } catch (error) {
    showOperationError(error, "保存媒体设置失败。");
  } finally {
    saving.value = false;
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
        <div class="poi-search-panel">
          <div class="search-section-title">腾讯地图地标</div>
          <div class="poi-search-row">
            <el-input
              v-model="poiKeyword"
              placeholder="搜索地标/地址，例如 桐梓林地铁站"
              clearable
              @keyup.enter="searchPoi"
            />
            <el-button
              type="primary"
              :loading="poiSearching"
              @click="searchPoi"
            >
              搜索地标
            </el-button>
          </div>
          <div v-if="poiError" class="hint-text">{{ poiError }}</div>
          <div v-if="poiResults.length" class="poi-result-list">
            <button
              v-for="item in poiResults"
              :key="item.id"
              type="button"
              class="poi-result-item"
              @click="selectPoi(item)"
            >
              <span class="poi-result-title">{{ item.title }}</span>
              <span class="poi-result-address">
                {{ item.address || "暂无地址" }}
              </span>
              <span class="poi-result-meta">
                {{ item.district || item.city || "成都" }} ·
                {{ item.location.latitude.toFixed(6) }},
                {{ item.location.longitude.toFixed(6) }}
              </span>
            </button>
          </div>
        </div>
        <div class="poi-search-panel">
          <div class="search-section-title">Amap 图片候选</div>
          <div class="poi-search-row">
            <el-input
              v-model="amapKeyword"
              placeholder="搜索带图片的地点，例如 Global Corner Cafe"
              clearable
              @keyup.enter="searchAmapMedia"
            />
            <el-button
              type="primary"
              :loading="amapSearching"
              @click="searchAmapMedia"
            >
              搜索图片
            </el-button>
          </div>
          <div v-if="amapError" class="hint-text">{{ amapError }}</div>
          <div v-if="amapResults.length" class="amap-result-list">
            <div
              v-for="candidate in amapResults"
              :key="candidate.id"
              class="amap-result-item"
            >
              <div class="amap-place-meta">
                <strong>{{ candidate.title }}</strong>
                <span>{{ candidate.address || "暂无地址" }}</span>
              </div>
              <div v-if="candidate.image_candidates.length" class="amap-images">
                <div
                  v-for="media in candidate.image_candidates"
                  :key="media.image_url"
                  class="amap-image-card"
                >
                  <img
                    :src="media.image_url"
                    :alt="media.image_title || candidate.title"
                  />
                  <div class="source-label">{{ media.attribution.label }}</div>
                  <div class="image-actions">
                    <el-button size="small" @click="useExternalCover(media)">
                      设为封面
                    </el-button>
                    <el-button
                      size="small"
                      type="primary"
                      @click="addExternalGalleryMedia(media)"
                    >
                      加入外部图集
                    </el-button>
                  </div>
                </div>
              </div>
              <div v-else class="hint-text">该候选暂无图片。</div>
            </div>
          </div>
        </div>
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
          <div class="secondary-category-tabs">
            <el-segmented
              v-model="form.category_level_2"
              :options="secondaryCategoryOptions"
              block
            />
          </div>
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
          <el-input
            v-model="form.tencent_map_poi_id"
            placeholder="腾讯 POI ID"
          />
          <el-input-number
            v-model="form.latitude"
            :step="0.0001"
            placeholder="纬度"
          />
          <el-input-number
            v-model="form.longitude"
            :step="0.0001"
            placeholder="经度"
          />
          <el-input
            v-model="form.business_hours_zh"
            placeholder="中文营业时间"
          />
          <el-input
            v-model="form.business_hours_en"
            placeholder="英文营业时间"
          />
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
        <div v-if="submittingError" class="error-text">
          {{ submittingError }}
        </div>
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
          <el-switch
            v-model="form.supports_navigation"
            active-text="支持导航"
          />
          <el-switch v-model="form.supports_favorite" active-text="收藏入口" />
          <el-switch v-model="form.supports_share" active-text="分享入口" />
        </div>
        <div class="gallery-manager">
          <div class="gallery-header">
            <h4>地点图集</h4>
            <span
              >上传图片作为社区自有图集；Amap 图片作为外部来源单独保存。</span
            >
          </div>
          <div class="gallery-upload-row">
            <input
              ref="galleryFileInput"
              class="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              @change="uploadGalleryFile"
            />
            <el-button
              type="primary"
              :loading="uploadingGallery"
              @click="chooseGalleryUpload"
            >
              选择并上传图片
            </el-button>
            <el-button :disabled="!editingId" @click="saveMediaOnly">
              保存媒体设置
            </el-button>
          </div>
          <div v-if="!editingId" class="hint-text">
            新建地点可先上传图集图片；点击创建地点后会自动绑定到新地点。
          </div>
          <div v-if="form.cover_source" class="cover-source-box">
            <span>封面来源：{{ form.cover_source.attribution.label }}</span>
            <el-button link type="danger" @click="clearCoverSource">
              清除来源
            </el-button>
          </div>
          <div v-if="form.gallery_file_ids.length" class="gallery-file-list">
            <span class="media-group-label">已上传文件</span>
            <el-tag
              v-for="fileId in form.gallery_file_ids"
              :key="fileId"
              closable
              @close="removeGalleryFile(fileId)"
            >
              {{ fileId }}
            </el-tag>
          </div>
          <div v-else class="hint-text">暂无已上传图集文件。</div>
          <div
            v-if="form.external_gallery_media.length"
            class="external-media-list"
          >
            <span class="media-group-label">外部来源图片</span>
            <div
              v-for="(media, index) in form.external_gallery_media"
              :key="media.image_url"
              class="external-media-card"
            >
              <img
                :src="media.image_url"
                :alt="media.image_title || 'external image'"
              />
              <div>
                <div class="source-label">{{ media.attribution.label }}</div>
                <div class="hint-text">
                  {{ media.image_title || media.source_place_id }}
                </div>
              </div>
              <el-button
                link
                type="danger"
                @click="removeExternalGalleryMedia(index)"
              >
                移除
              </el-button>
            </div>
          </div>
        </div>
        <el-alert
          :title="
            formReadiness.ready
              ? '双语正式内容已满足发布要求。'
              : `仍不可发布：${formReadiness.issues
                  .map((issue) => issue.field)
                  .join('、')}`
          "
          :type="formReadiness.ready ? 'success' : 'warning'"
          :closable="false"
          show-icon
          class="mb-16"
        />
        <div class="editor-actions">
          <el-button @click="startCreate">重置</el-button>
          <el-button type="primary" :loading="saving" @click="submit">
            {{ editingId ? "保存修改" : "创建地点" }}
          </el-button>
        </div>
      </div>
    </div>
    <el-table :data="places" v-loading="loading" class="places-table">
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
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <div class="place-row-actions">
            <el-button link size="small" type="primary" @click="startEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              size="small"
              type="success"
              :disabled="
                publishingId !== null ||
                !validatePlacePublicationReadiness(row).ready
              "
              :loading="publishingId === row._id"
              :title="
                validatePlacePublicationReadiness(row).ready
                  ? '双语发布就绪'
                  : `待补：${validatePlacePublicationReadiness(row).issues
                      .map((issue) => issue.field)
                      .join('、')}`
              "
              @click="quickPublish(row, 'published')"
            >
              发布
            </el-button>
            <el-button
              link
              size="small"
              :loading="publishingId === row._id"
              @click="quickPublish(row, 'draft')"
            >
              转草稿
            </el-button>
            <el-button
              link
              size="small"
              type="danger"
              :loading="deletingId === row._id"
              @click="deletePlace(row)"
            >
              删除
            </el-button>
          </div>
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

.poi-search-panel {
  margin-bottom: 16px;
}

.search-section-title,
.media-group-label {
  margin-bottom: 8px;
  color: #374151;
  font-size: 13px;
  font-weight: 700;
}

.poi-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.poi-result-list {
  display: grid;
  gap: 8px;
  margin-top: 10px;
}

.amap-result-list {
  display: grid;
  gap: 12px;
  margin-top: 10px;
}

.amap-result-item {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
}

.amap-place-meta {
  display: grid;
  gap: 2px;
  margin-bottom: 10px;
  color: #374151;
  font-size: 13px;
}

.amap-place-meta span {
  color: #6b7280;
}

.amap-images,
.external-media-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.amap-image-card,
.external-media-card {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.amap-image-card img,
.external-media-card img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  background: #e5e7eb;
}

.image-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.source-label {
  color: #4b5563;
  font-size: 12px;
  font-weight: 600;
}

.poi-result-item {
  display: grid;
  grid-template-columns: minmax(120px, 0.8fr) minmax(180px, 1.3fr) minmax(
      140px,
      0.8fr
    );
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  color: #1f2937;
  text-align: left;
  cursor: pointer;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.poi-result-item:hover {
  border-color: #409eff;
}

.poi-result-title {
  font-weight: 600;
}

.poi-result-address,
.poi-result-meta {
  overflow-wrap: anywhere;
  color: #6b7280;
  font-size: 13px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.secondary-category-tabs {
  min-width: 0;
}

.secondary-category-tabs :deep(.el-segmented) {
  width: 100%;
}

.secondary-category-tabs :deep(.el-segmented__item-label) {
  overflow-wrap: anywhere;
  white-space: normal;
  line-height: 1.25;
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

.gallery-upload-row,
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

.external-media-list,
.cover-source-box {
  margin-top: 12px;
}

.cover-source-box {
  display: flex;
  gap: 12px;
  align-items: center;
  color: #4b5563;
  font-size: 13px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.mt-12 {
  margin-top: 12px;
}

.review-source {
  margin-top: 6px;
  color: #6b7280;
  font-size: 12px;
}

.places-table {
  width: 100%;
}

.place-row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  align-items: center;
}
</style>
