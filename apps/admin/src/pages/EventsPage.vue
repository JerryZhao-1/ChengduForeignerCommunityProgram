<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CreateEventInputSchema,
  EVENT_PUBLISH_STATUSES,
  EVENT_REVIEW_STATUSES,
  UpdateEventInputSchema,
  type Event,
  type EventAdminListItem,
  type EventAdminRegistrationRow,
  type PlacePoiSearchItem
} from "@community-map/shared";

import { adminApi } from "@/api/client";

type EventFormState = {
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  content_zh: string;
  content_en: string;
  address_text: string;
  latitude: number;
  longitude: number;
  start_time: string;
  end_time: string;
  signup_deadline: string;
  capacity: number;
  cover_file_id: string;
  cover_cloud_path: string;
  cover_url: string;
  place_id: string;
  review_status: Event["review_status"];
  publish_status: Event["publish_status"];
};

const loading = ref(false);
const loadError = ref("");
const events = ref<EventAdminListItem[]>([]);
const saving = ref(false);
const submittingError = ref("");
const dialogVisible = ref(false);
const editingEvent = ref<EventAdminListItem | null>(null);
const pendingAction = ref("");
const registrationDrawerVisible = ref(false);
const selectedEvent = ref<EventAdminListItem | null>(null);
const registrationLoading = ref(false);
const registrationError = ref("");
const registrations = ref<EventAdminRegistrationRow[]>([]);
const checkinTicketId = ref("");
const checkinLoading = ref(false);
const coverFileInput = ref<HTMLInputElement | null>(null);
const coverUploading = ref(false);
const coverUploadError = ref("");
const poiKeyword = ref("");
const poiSearching = ref(false);
const poiResults = ref<PlacePoiSearchItem[]>([]);
const poiError = ref("");

const dateTimeDisplayFormat = "YYYY-MM-DD HH:mm";
const dateTimeValueFormat = "YYYY-MM-DDTHH:mm:ss[+08:00]";

const filters = reactive({
  keyword: "",
  review_status: "",
  publish_status: "",
  drafts_only: false,
  published_only: false
});

const createEmptyForm = (): EventFormState => ({
  title_zh: "新活动草稿",
  title_en: "New Draft Event",
  summary_zh: "待补充简介",
  summary_en: "Summary pending",
  content_zh: "待补充正文",
  content_en: "Content pending",
  address_text: "桐梓林社区中心",
  latitude: 30.615,
  longitude: 104.062,
  start_time: "2027-04-10T10:00:00+08:00",
  end_time: "2027-04-10T12:00:00+08:00",
  signup_deadline: "2027-04-09T18:00:00+08:00",
  capacity: 30,
  cover_file_id: "",
  cover_cloud_path: "",
  cover_url: "https://example.com/public/events/placeholder/cover.jpg",
  place_id: "",
  review_status: "draft",
  publish_status: "draft"
});

const form = reactive<EventFormState>(createEmptyForm());

const reviewStatusLabels: Record<Event["review_status"], string> = {
  draft: "草稿",
  pending_review: "待审核",
  approved: "已通过",
  rejected: "已拒绝"
};

const publishStatusLabels: Record<Event["publish_status"], string> = {
  draft: "草稿",
  published: "已发布",
  offline: "已下线",
  ended: "已结束"
};

const reviewTagType: Record<
  Event["review_status"],
  "info" | "warning" | "success" | "danger"
> = {
  draft: "info",
  pending_review: "warning",
  approved: "success",
  rejected: "danger"
};

const publishTagType: Record<
  Event["publish_status"],
  "info" | "warning" | "success" | "danger"
> = {
  draft: "info",
  published: "success",
  offline: "warning",
  ended: "info"
};

const reviewOptions = EVENT_REVIEW_STATUSES.map((value) => ({
  value,
  label: reviewStatusLabels[value]
}));

const publishOptions = EVENT_PUBLISH_STATUSES.map((value) => ({
  value,
  label: publishStatusLabels[value]
}));

const getReviewStatusLabel = (status: Event["review_status"]) =>
  reviewStatusLabels[status];

const getPublishStatusLabel = (status: Event["publish_status"]) =>
  publishStatusLabels[status];

const getReviewTagType = (status: Event["review_status"]) =>
  reviewTagType[status];

const getPublishTagType = (status: Event["publish_status"]) =>
  publishTagType[status];

const dialogTitle = computed(() =>
  editingEvent.value ? "编辑活动" : "新建活动"
);

const filteredEvents = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();

  return events.value.filter((event) => {
    if (
      filters.review_status &&
      event.review_status !== filters.review_status
    ) {
      return false;
    }

    if (
      filters.publish_status &&
      event.publish_status !== filters.publish_status
    ) {
      return false;
    }

    if (filters.drafts_only && event.publish_status !== "draft") {
      return false;
    }

    if (filters.published_only && event.publish_status !== "published") {
      return false;
    }

    if (!keyword) {
      return true;
    }

    return [
      event.title_zh,
      event.title_en,
      event.summary_zh,
      event.summary_en,
      event.address_text
    ].some((value) => value.toLowerCase().includes(keyword));
  });
});

const issueMessage = (issue: {
  path: Array<string | number>;
  message: string;
}) =>
  issue.path.length > 0
    ? `${issue.path.join(".")}: ${issue.message}`
    : issue.message;

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

const showOperationError = (error: unknown, fallback: string) => {
  const message = toErrorMessage(error, fallback);
  ElMessage.error(message);
  return message;
};

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const resetPoiState = (address = "") => {
  poiKeyword.value = address;
  poiResults.value = [];
  poiError.value = "";
};

const assignForm = (event?: EventAdminListItem) => {
  Object.assign(form, createEmptyForm());
  submittingError.value = "";
  coverUploadError.value = "";
  resetPoiState(form.address_text);

  if (!event) {
    editingEvent.value = null;
    return;
  }

  editingEvent.value = event;
  Object.assign(form, {
    title_zh: event.title_zh,
    title_en: event.title_en,
    summary_zh: event.summary_zh,
    summary_en: event.summary_en,
    content_zh: event.content_zh,
    content_en: event.content_en,
    address_text: event.address_text,
    latitude: event.location.latitude,
    longitude: event.location.longitude,
    start_time: event.start_time,
    end_time: event.end_time,
    signup_deadline: event.signup_deadline,
    capacity: event.capacity,
    cover_file_id: event.cover_file_id,
    cover_cloud_path: event.cover_cloud_path,
    cover_url: event.cover_url,
    place_id: event.place_id ?? "",
    review_status: event.review_status,
    publish_status: event.publish_status
  });
  resetPoiState(event.address_text);
};

const buildPayload = () => ({
  title_zh: form.title_zh,
  title_en: form.title_en,
  summary_zh: form.summary_zh,
  summary_en: form.summary_en,
  content_zh: form.content_zh,
  content_en: form.content_en,
  address_text: form.address_text,
  location: {
    latitude: Number(form.latitude),
    longitude: Number(form.longitude)
  },
  start_time: form.start_time,
  end_time: form.end_time,
  signup_deadline: form.signup_deadline,
  capacity: Number(form.capacity),
  ...(form.cover_file_id ? { cover_file_id: form.cover_file_id } : {}),
  ...(form.cover_cloud_path ? { cover_cloud_path: form.cover_cloud_path } : {}),
  ...(form.cover_url ? { cover_url: form.cover_url } : {}),
  ...(form.place_id ? { place_id: form.place_id } : {})
});

const validateStatusCombination = () => {
  if (form.publish_status !== "published" || form.review_status === "approved") {
    return true;
  }

  const message = "活动发布前必须先通过审核。";
  submittingError.value = message;
  ElMessage.error(message);
  return false;
};

const buildValidatedPayload = () => {
  if (!validateStatusCombination()) {
    return null;
  }

  const payload = buildPayload();
  const result = editingEvent.value
    ? UpdateEventInputSchema.safeParse(payload)
    : CreateEventInputSchema.safeParse(payload);

  if (result.success) {
    return result.data;
  }

  const message = issueMessage(result.error.issues[0]);
  submittingError.value = message;
  ElMessage.error(message);
  return null;
};

const isStatusChanged = (event?: EventAdminListItem | null) => {
  if (!event) {
    return form.review_status !== "draft" || form.publish_status !== "draft";
  }

  return (
    event.review_status !== form.review_status ||
    event.publish_status !== form.publish_status
  );
};

const load = async () => {
  loading.value = true;
  loadError.value = "";

  try {
    const result = await adminApi.admin.listEvents();
    events.value = result.data.items;
  } catch (error) {
    loadError.value = showOperationError(error, "活动列表加载失败。");
  } finally {
    loading.value = false;
  }
};

const startCreate = () => {
  assignForm();
  dialogVisible.value = true;
};

const startEdit = (event: EventAdminListItem) => {
  assignForm(event);
  dialogVisible.value = true;
};

const chooseCoverFile = () => {
  coverFileInput.value?.click();
};

const uploadCoverFile = async (domEvent: globalThis.Event) => {
  const target = domEvent.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) {
    return;
  }

  coverUploading.value = true;
  coverUploadError.value = "";

  try {
    const uploadInput = {
      file,
      file_name: file.name,
      content_type: file.type
    };
    const result = editingEvent.value
      ? await adminApi.admin.uploadEventCoverFile(
          editingEvent.value._id,
          uploadInput
        )
      : await adminApi.admin.uploadPendingEventCoverFile(uploadInput);

    form.cover_file_id = result.data.cover_file_id;
    form.cover_cloud_path = result.data.cover_cloud_path;
    form.cover_url = result.data.cover_url;
    ElMessage.success("封面已上传，保存活动后生效。");
  } catch (error) {
    coverUploadError.value = showOperationError(error, "上传封面失败。");
  } finally {
    coverUploading.value = false;
    target.value = "";
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
    const result = await adminApi.admin.searchPlacePoi({ keyword });
    poiResults.value = result.data;

    if (result.data.length === 0) {
      poiError.value = "未找到匹配地标。";
    }
  } catch (error) {
    const message = toErrorMessage(error, "地标搜索失败。");
    poiResults.value = [];
    poiError.value = message;
    ElMessage.error(message);
  } finally {
    poiSearching.value = false;
  }
};

const hasManualEventLookupFields = () => {
  const emptyForm = createEmptyForm();

  return (
    editingEvent.value !== null ||
    form.address_text !== emptyForm.address_text ||
    Number(form.latitude) !== emptyForm.latitude ||
    Number(form.longitude) !== emptyForm.longitude
  );
};

const selectPoi = async (item: PlacePoiSearchItem) => {
  if (hasManualEventLookupFields()) {
    try {
      await ElMessageBox.confirm(
        "选中地标会覆盖当前地址、纬度和经度。",
        "填充活动地址",
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

  form.address_text = item.address || item.title;
  form.latitude = item.location.latitude;
  form.longitude = item.location.longitude;
  poiKeyword.value = item.title;
  poiResults.value = [];
  poiError.value = "";
  ElMessage.success("已填充腾讯地图地址和经纬度。");
};

const submit = async () => {
  saving.value = true;
  submittingError.value = "";

  try {
    const payload = buildValidatedPayload();
    if (!payload) {
      return;
    }

    const originalEvent = editingEvent.value;
    const wasEditing = originalEvent !== null;
    const saved = originalEvent
      ? await adminApi.admin.updateEvent(originalEvent._id, payload)
      : await adminApi.admin.createEvent(payload);

    if (isStatusChanged(originalEvent)) {
      await adminApi.admin.reviewEvent(saved.data._id, {
        review_status: form.review_status,
        publish_status: form.publish_status
      });
    }

    dialogVisible.value = false;
    await load();
    ElMessage.success(wasEditing ? "活动已保存。" : "活动已创建。");
  } catch (error) {
    submittingError.value = showOperationError(
      error,
      editingEvent.value ? "保存活动失败。" : "创建活动失败。"
    );
  } finally {
    saving.value = false;
  }
};

const actionKey = (event: EventAdminListItem, action: string) =>
  `${event._id}:${action}`;

const isActionPending = (event: EventAdminListItem, action: string) =>
  pendingAction.value === actionKey(event, action);

const updateStatus = async (
  event: EventAdminListItem,
  action: string,
  input: {
    review_status: Event["review_status"];
    publish_status?: Event["publish_status"];
  },
  successMessage: string
) => {
  pendingAction.value = actionKey(event, action);

  try {
    await adminApi.admin.reviewEvent(event._id, input);
    await load();
    ElMessage.success(successMessage);
  } catch (error) {
    showOperationError(error, "更新活动状态失败。");
  } finally {
    pendingAction.value = "";
  }
};

const submitForReview = (event: EventAdminListItem) =>
  updateStatus(
    event,
    "submit",
    { review_status: "pending_review", publish_status: "draft" },
    "活动已提交审核。"
  );

const publishEvent = (event: EventAdminListItem) =>
  updateStatus(
    event,
    "publish",
    { review_status: "approved", publish_status: "published" },
    "活动已通过并发布。"
  );

const takeOffline = (event: EventAdminListItem) =>
  updateStatus(
    event,
    "offline",
    { review_status: "approved", publish_status: "offline" },
    "活动已下线。"
  );

const endEvent = (event: EventAdminListItem) =>
  updateStatus(
    event,
    "end",
    { review_status: "approved", publish_status: "ended" },
    "活动已标记结束。"
  );

const canSubmitForReview = (event: EventAdminListItem) =>
  event.review_status === "draft" || event.review_status === "rejected";

const canPublish = (event: EventAdminListItem) =>
  event.publish_status !== "published" || event.review_status !== "approved";

const canTakeOffline = (event: EventAdminListItem) =>
  event.publish_status === "published";

const canEnd = (event: EventAdminListItem) =>
  event.publish_status === "published" || event.publish_status === "offline";

const loadRegistrations = async (event: EventAdminListItem) => {
  registrationLoading.value = true;
  registrationError.value = "";

  try {
    const result = await adminApi.admin.listEventRegistrations(event._id);
    registrations.value = result.data;
  } catch (error) {
    registrationError.value = showOperationError(error, "报名列表加载失败。");
    registrations.value = [];
  } finally {
    registrationLoading.value = false;
  }
};

const openRegistrations = async (event: EventAdminListItem) => {
  selectedEvent.value = event;
  checkinTicketId.value = "";
  registrations.value = [];
  registrationDrawerVisible.value = true;
  await loadRegistrations(event);
};

const fillCheckinTicket = (row: EventAdminRegistrationRow) => {
  checkinTicketId.value = row.ticket_id;
};

const checkinTicket = async () => {
  const event = selectedEvent.value;
  const ticketId = checkinTicketId.value.trim();

  if (!event || !ticketId) {
    ElMessage.warning("请输入 ticket id。");
    return;
  }

  checkinLoading.value = true;

  try {
    await adminApi.admin.checkinEvent(event._id, { ticket_id: ticketId });
    ElMessage.success("票据已核销。");
    checkinTicketId.value = "";
    await loadRegistrations(event);
    await load();
  } catch (error) {
    showOperationError(error, "核销失败。");
  } finally {
    checkinLoading.value = false;
  }
};

const resetFilters = () => {
  filters.keyword = "";
  filters.review_status = "";
  filters.publish_status = "";
  filters.drafts_only = false;
  filters.published_only = false;
};

onMounted(load);
</script>

<template>
  <div class="page-card">
    <div class="page-header">
      <h2>活动管理</h2>
      <div class="header-actions">
        <el-button :loading="loading" @click="load">刷新</el-button>
        <el-button type="primary" @click="startCreate">新建活动</el-button>
      </div>
    </div>

    <div class="filter-panel">
      <el-input
        v-model="filters.keyword"
        placeholder="搜索标题、简介或地址"
        clearable
      />
      <el-select
        v-model="filters.review_status"
        placeholder="审核状态"
        clearable
      >
        <el-option
          v-for="option in reviewOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-select
        v-model="filters.publish_status"
        placeholder="发布状态"
        clearable
      >
        <el-option
          v-for="option in publishOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-switch v-model="filters.drafts_only" active-text="只看草稿" />
      <el-switch v-model="filters.published_only" active-text="只看已发布" />
      <el-button @click="resetFilters">重置筛选</el-button>
    </div>

    <el-alert
      v-if="loadError"
      :title="loadError"
      type="error"
      show-icon
      class="mb-16"
    />

    <el-table
      :data="filteredEvents"
      v-loading="loading"
      empty-text="暂无匹配活动"
      class="events-table"
    >
      <el-table-column label="活动" min-width="260">
        <template #default="{ row }">
          <div class="event-title-cell">
            <strong>{{ row.title_zh }}</strong>
            <span>{{ row.title_en }}</span>
            <small>{{ row.address_text }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="190">
        <template #default="{ row }">
          <div class="status-stack">
            <el-tag :type="getReviewTagType(row.review_status)" size="small">
              {{ getReviewStatusLabel(row.review_status) }}
            </el-tag>
            <el-tag :type="getPublishTagType(row.publish_status)" size="small">
              {{ getPublishStatusLabel(row.publish_status) }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="活动时间" width="180">
        <template #default="{ row }">
          <div class="date-stack">
            <span>{{ formatDate(row.start_time) }}</span>
            <small>{{ formatDate(row.end_time) }}</small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="报名截止" width="150">
        <template #default="{ row }">
          {{ formatDate(row.signup_deadline) }}
        </template>
      </el-table-column>
      <el-table-column label="容量" width="170">
        <template #default="{ row }">
          <div class="capacity-stack">
            <span>
              {{ row.confirmed_attendee_count }} / {{ row.capacity }}
            </span>
            <small>
              {{ row.active_registration_count }} 笔报名 · 余
              {{ row.remaining_capacity }}
            </small>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="满员" width="90">
        <template #default="{ row }">
          <el-tag :type="row.is_full ? 'danger' : 'success'" size="small">
            {{ row.is_full ? "是" : "否" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="330" fixed="right">
        <template #default="{ row }">
          <div class="row-actions">
            <el-button link size="small" type="primary" @click="startEdit(row)">
              编辑
            </el-button>
            <el-button link size="small" @click="openRegistrations(row)">
              报名
            </el-button>
            <el-button
              v-if="canSubmitForReview(row)"
              link
              size="small"
              :loading="isActionPending(row, 'submit')"
              @click="submitForReview(row)"
            >
              提交审核
            </el-button>
            <el-button
              v-if="canPublish(row)"
              link
              size="small"
              type="success"
              :loading="isActionPending(row, 'publish')"
              @click="publishEvent(row)"
            >
              通过并发布
            </el-button>
            <el-button
              v-if="canTakeOffline(row)"
              link
              size="small"
              type="warning"
              :loading="isActionPending(row, 'offline')"
              @click="takeOffline(row)"
            >
              下线
            </el-button>
            <el-button
              v-if="canEnd(row)"
              link
              size="small"
              type="info"
              :loading="isActionPending(row, 'end')"
              @click="endEvent(row)"
            >
              结束
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="960px"
      destroy-on-close
    >
      <el-form :model="form" label-position="top" class="event-form">
        <section class="form-section">
          <div class="section-title">基础信息</div>
          <div class="form-grid">
            <el-form-item label="中文标题">
              <el-input v-model="form.title_zh" placeholder="中文标题" />
            </el-form-item>
            <el-form-item label="英文标题">
              <el-input v-model="form.title_en" placeholder="英文标题" />
            </el-form-item>
            <el-form-item label="中文简介">
              <el-input v-model="form.summary_zh" placeholder="中文简介" />
            </el-form-item>
            <el-form-item label="英文简介">
              <el-input v-model="form.summary_en" placeholder="英文简介" />
            </el-form-item>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title">活动封面</div>
          <div class="cover-uploader">
            <div class="cover-preview">
              <img :src="form.cover_url" alt="活动封面预览" />
            </div>
            <div class="cover-controls">
              <input
                ref="coverFileInput"
                class="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="uploadCoverFile"
              />
              <el-button
                type="primary"
                :loading="coverUploading"
                @click="chooseCoverFile"
              >
                {{ form.cover_file_id ? "更换封面" : "选择并上传封面" }}
              </el-button>
              <span class="hint-text">
                支持 JPG、PNG、WebP、GIF，单张不超过 5 MB。
              </span>
              <span v-if="form.cover_file_id" class="hint-text">
                当前封面将在保存活动后生效。
              </span>
            </div>
          </div>
          <el-alert
            v-if="coverUploadError"
            :title="coverUploadError"
            type="error"
            show-icon
            class="mt-12"
          />
        </section>

        <section class="form-section">
          <div class="section-title">地址与定位</div>
          <div class="poi-search-panel">
            <div class="poi-search-row">
              <el-input
                v-model="poiKeyword"
                placeholder="搜索地标或地址，例如 桐梓林社区中心"
                clearable
                @keyup.enter="searchPoi"
              />
              <el-button
                type="primary"
                :loading="poiSearching"
                @click="searchPoi"
              >
                搜索地址
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
          <div class="form-grid">
            <el-form-item label="活动地址">
              <el-input v-model="form.address_text" placeholder="活动地址" />
            </el-form-item>
            <el-form-item label="关联地点 ID（可选）">
              <el-input
                v-model="form.place_id"
                placeholder="已有地点 ID，可留空"
              />
            </el-form-item>
            <el-form-item label="纬度（搜索后自动填充，可微调）">
              <el-input-number
                v-model="form.latitude"
                :step="0.0001"
                class="full-width"
              />
            </el-form-item>
            <el-form-item label="经度（搜索后自动填充，可微调）">
              <el-input-number
                v-model="form.longitude"
                :step="0.0001"
                class="full-width"
              />
            </el-form-item>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title">时间与容量</div>
          <div class="time-grid">
            <el-form-item label="开始时间（成都时间 UTC+8）">
              <el-date-picker
                v-model="form.start_time"
                type="datetime"
                :format="dateTimeDisplayFormat"
                :value-format="dateTimeValueFormat"
                placeholder="选择开始时间"
                class="full-width"
              />
            </el-form-item>
            <el-form-item label="结束时间（成都时间 UTC+8）">
              <el-date-picker
                v-model="form.end_time"
                type="datetime"
                :format="dateTimeDisplayFormat"
                :value-format="dateTimeValueFormat"
                placeholder="选择结束时间"
                class="full-width"
              />
            </el-form-item>
            <el-form-item label="报名截止时间（成都时间 UTC+8）">
              <el-date-picker
                v-model="form.signup_deadline"
                type="datetime"
                :format="dateTimeDisplayFormat"
                :value-format="dateTimeValueFormat"
                placeholder="选择报名截止时间"
                class="full-width"
              />
            </el-form-item>
          </div>
          <div class="form-grid capacity-grid">
            <el-form-item label="参加人数上限">
              <el-input-number
                v-model="form.capacity"
                :min="1"
                class="full-width"
              />
            </el-form-item>
            <div class="capacity-help">
              报名人数达到此数后停止报名。
            </div>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title">状态</div>
          <div class="form-grid">
            <el-form-item label="审核状态">
              <el-select v-model="form.review_status" class="full-width">
                <el-option
                  v-for="option in reviewOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="发布状态">
              <el-select v-model="form.publish_status" class="full-width">
                <el-option
                  v-for="option in publishOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </section>

        <section class="form-section">
          <div class="section-title">正文内容</div>
          <el-form-item label="中文正文">
            <el-input
              v-model="form.content_zh"
              type="textarea"
              :rows="4"
              placeholder="中文正文"
            />
          </el-form-item>
          <el-form-item label="英文正文">
            <el-input
              v-model="form.content_en"
              type="textarea"
              :rows="4"
              placeholder="英文正文"
            />
          </el-form-item>
        </section>
      </el-form>
      <el-alert
        v-if="submittingError"
        :title="submittingError"
        type="error"
        show-icon
        class="mt-12"
      />
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">
          {{ editingEvent ? "保存修改" : "创建活动" }}
        </el-button>
      </template>
    </el-dialog>

    <el-drawer
      v-model="registrationDrawerVisible"
      :title="selectedEvent ? `${selectedEvent.title_zh} · 报名` : '报名'"
      size="680px"
    >
      <div class="checkin-panel">
        <el-input
          v-model="checkinTicketId"
          placeholder="输入 ticket id"
          clearable
          @keyup.enter="checkinTicket"
        />
        <el-button
          type="primary"
          :loading="checkinLoading"
          @click="checkinTicket"
        >
          核销
        </el-button>
      </div>

      <el-alert
        v-if="registrationError"
        :title="registrationError"
        type="error"
        show-icon
        class="mb-16"
      />

      <el-table
        :data="registrations"
        v-loading="registrationLoading"
        empty-text="暂无报名"
      >
        <el-table-column label="联系人" min-width="150">
          <template #default="{ row }">
            <div class="event-title-cell">
              <strong>{{ row.contact_name }}</strong>
              <span>{{ row.contact_phone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="attendee_count" label="人数" width="70" />
        <el-table-column
          prop="registration_status"
          label="报名状态"
          width="110"
        />
        <el-table-column prop="source_channel" label="来源" width="90" />
        <el-table-column label="票据" min-width="190">
          <template #default="{ row }">
            <div class="ticket-cell">
              <strong>{{ row.ticket_id }}</strong>
              <span>{{ row.ticket_code || "无票码" }}</span>
              <small>
                {{ row.ticket_status || "无状态" }}
                <template v-if="row.ticket_used_at">
                  · {{ formatDate(row.ticket_used_at) }}
                </template>
              </small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90">
          <template #default="{ row }">
            <el-button link size="small" @click="fillCheckinTicket(row)">
              填入
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<style scoped>
.header-actions,
.row-actions,
.checkin-panel {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.filter-panel {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 150px 150px auto auto auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.events-table {
  width: 100%;
}

.event-title-cell,
.date-stack,
.capacity-stack,
.ticket-cell {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.event-title-cell strong,
.ticket-cell strong {
  overflow-wrap: anywhere;
  color: #1f2937;
}

.event-title-cell span,
.date-stack small,
.capacity-stack small,
.ticket-cell span,
.ticket-cell small {
  overflow-wrap: anywhere;
  color: #6b7280;
  font-size: 12px;
}

.event-title-cell small {
  overflow-wrap: anywhere;
  color: #9ca3af;
  font-size: 12px;
}

.status-stack {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.event-form {
  display: grid;
  gap: 18px;
}

.form-section {
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.form-section:first-child {
  padding-top: 0;
  border-top: 0;
}

.section-title {
  margin-bottom: 12px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 700;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.form-grid :deep(.el-form-item) {
  margin-bottom: 0;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.time-grid :deep(.el-form-item) {
  margin-bottom: 0;
}

.capacity-grid {
  grid-template-columns: minmax(180px, 240px) minmax(260px, 1fr);
  align-items: end;
  margin-top: 12px;
}

.capacity-help,
.hint-text {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.6;
}

.full-width {
  width: 100%;
}

.cover-uploader {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.cover-preview {
  overflow: hidden;
  width: 220px;
  aspect-ratio: 16 / 9;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f8fafc;
}

.cover-preview img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-controls {
  display: grid;
  gap: 8px;
  justify-items: start;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.poi-search-panel {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.poi-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.poi-result-list {
  display: grid;
  gap: 8px;
}

.poi-result-item {
  display: grid;
  gap: 3px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.poi-result-item:hover {
  border-color: #409eff;
  background: #f8fafc;
}

.poi-result-title {
  color: #1f2937;
  font-weight: 700;
}

.poi-result-address,
.poi-result-meta {
  color: #6b7280;
  font-size: 12px;
}

.checkin-panel {
  margin-bottom: 16px;
}

.checkin-panel .el-input {
  flex: 1;
  min-width: 260px;
}

.mb-16 {
  margin-bottom: 16px;
}

.mt-12 {
  margin-top: 12px;
}
</style>
