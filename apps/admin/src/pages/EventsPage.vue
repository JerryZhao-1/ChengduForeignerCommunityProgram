<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  CreateEventInputSchema,
  ApiClientError,
  EVENT_PUBLISH_STATUSES,
  EVENT_REVIEW_STATUSES,
  UpdateEventInputSchema,
  validateEventPublicationReadiness,
  type Event,
  type EventAdminListItem,
  type EventAdminRegistrationRow,
  type Place,
  type PlaceDetail,
  type PlaceExternalMedia,
  type PlaceGalleryMedia,
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
  address_zh: string;
  address_en: string;
  latitude: number;
  longitude: number;
  start_time: string;
  end_time: string;
  signup_deadline: string;
  capacity: number;
  cover_file_id: string | null;
  cover_cloud_path: string | null;
  cover_url: string;
  place_id: string;
  review_status: Event["review_status"];
  publish_status: Event["publish_status"];
};

type AddressTabName = "tencent" | "place";
type EventSortField =
  | "default"
  | "name"
  | "start_time"
  | "end_time"
  | "signup_deadline"
  | "capacity"
  | "remaining_capacity";
type SortOrder = "asc" | "desc";

type PlaceCoverCandidate = {
  key: string;
  typeLabel: string;
  title: string;
  subtitle: string;
  url: string;
  cover_file_id: string | null;
  cover_cloud_path: string | null;
  selectable: boolean;
};

const DEFAULT_EVENT_ADDRESS = "成都市武侯区桐梓林国际社区";
const DEFAULT_EVENT_COVER_URL = "";

const loading = ref(false);
const loadError = ref("");
const events = ref<EventAdminListItem[]>([]);
const saving = ref(false);
const submittingError = ref("");
const dialogVisible = ref(false);
const editingEvent = ref<EventAdminListItem | null>(null);
const pendingAction = ref("");
const deletingEventId = ref("");
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
const addressTab = ref<AddressTabName>("tencent");
const placeKeyword = ref("");
const placesLoading = ref(false);
const placesError = ref("");
const adminPlaces = ref<Place[]>([]);
const selectedPlace = ref<Place | null>(null);
const selectedPlaceDetail = ref<PlaceDetail | null>(null);
const placeDetailLoading = ref(false);
const placeCoverDialogVisible = ref(false);

const dateTimeDisplayFormat = "YYYY-MM-DD HH:mm";
const dateTimeValueFormat = "YYYY-MM-DDTHH:mm:ss[+08:00]";

const filters = reactive({
  keyword: "",
  review_status: "",
  publish_status: "",
  drafts_only: false,
  published_only: false,
  sort_field: "default" as EventSortField,
  sort_order: "asc" as SortOrder
});

const createEmptyForm = (): EventFormState => ({
  title_zh: "新活动草稿",
  title_en: "New Draft Event",
  summary_zh: "待补充简介",
  summary_en: "Summary pending",
  content_zh: "待补充正文",
  content_en: "Content pending",
  address_text: DEFAULT_EVENT_ADDRESS,
  address_zh: DEFAULT_EVENT_ADDRESS,
  address_en: "Address pending",
  latitude: 30.618887,
  longitude: 104.065468,
  start_time: "2027-04-10T10:00:00+08:00",
  end_time: "2027-04-10T12:00:00+08:00",
  signup_deadline: "2027-04-09T18:00:00+08:00",
  capacity: 30,
  cover_file_id: null,
  cover_cloud_path: null,
  cover_url: DEFAULT_EVENT_COVER_URL,
  place_id: "",
  review_status: "draft",
  publish_status: "draft"
});

const form = reactive<EventFormState>(createEmptyForm());

const eventReadiness = computed(() =>
  validateEventPublicationReadiness(buildPayload())
);

const getEventReadiness = (event: EventAdminListItem) =>
  validateEventPublicationReadiness(event);

const readinessLabel = (event: EventAdminListItem) => {
  const result = getEventReadiness(event);
  return result.ready
    ? "双语就绪"
    : `待补：${result.issues.map((issue) => issue.field).join("、")}`;
};

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

const sortFieldOptions: Array<{ value: EventSortField; label: string }> = [
  { value: "default", label: "默认排序" },
  { value: "name", label: "按名字" },
  { value: "start_time", label: "按开始时间" },
  { value: "end_time", label: "按结束时间" },
  { value: "signup_deadline", label: "按报名截止" },
  { value: "capacity", label: "按容量" },
  { value: "remaining_capacity", label: "按剩余名额" }
];

const sortOrderOptions: Array<{ value: SortOrder; label: string }> = [
  { value: "asc", label: "升序" },
  { value: "desc", label: "降序" }
];

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

const publishedPlaces = computed(() =>
  adminPlaces.value.filter((place) => place.status === "published")
);

const filteredPublishedPlaces = computed(() => {
  const keyword = placeKeyword.value.trim().toLowerCase();

  if (!keyword) {
    return publishedPlaces.value;
  }

  return publishedPlaces.value.filter((place) =>
    [
      place.name_zh,
      place.name_en,
      place.address_zh,
      place.address_en,
      place.category_level_2
    ].some((value) => value.toLowerCase().includes(keyword))
  );
});

const hasSelectedPlace = computed(() => selectedPlace.value !== null);

const hasCustomCover = computed(
  () => Boolean(form.cover_url || form.cover_file_id)
);

const placeCoverCandidates = computed<PlaceCoverCandidate[]>(() => {
  const place = selectedPlace.value;
  const detail = selectedPlaceDetail.value;

  if (!place) {
    return [];
  }

  const candidates: PlaceCoverCandidate[] = [];

  if (place.cover_url) {
    candidates.push({
      key: `${place._id}:cover`,
      typeLabel: "地点封面",
      title: place.name_zh,
      subtitle: place.address_zh,
      url: place.cover_url,
      cover_file_id: place.cover_file_id,
      cover_cloud_path: null,
      selectable: false
    });
  }

  for (const media of detail?.gallery_media ?? []) {
    candidates.push(placeGalleryMediaToCoverCandidate(place, media));
  }

  for (const media of detail?.external_gallery_media ?? []) {
    candidates.push(placeExternalMediaToCoverCandidate(place, media));
  }

  return candidates;
});

const filteredEvents = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase();

  const filtered = events.value.filter((event) => {
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

  if (filters.sort_field === "default") {
    return filtered;
  }

  const direction = filters.sort_order === "asc" ? 1 : -1;

  return [...filtered].sort((left, right) => {
    const result = compareEvents(left, right, filters.sort_field);
    return result * direction;
  });
});

const sortedRegistrations = computed(() =>
  [...registrations.value].sort((left, right) => {
    const leftUsed = isTicketUsed(left);
    const rightUsed = isTicketUsed(right);

    if (leftUsed !== rightUsed) {
      return leftUsed ? 1 : -1;
    }

    return (
      left.contact_name.localeCompare(right.contact_name, "zh-Hans-CN") ||
      left._id.localeCompare(right._id)
    );
  })
);

const issueMessage = (issue: {
  path: Array<string | number>;
  message: string;
}) =>
  issue.path.length > 0
    ? `${issue.path.join(".")}: ${issue.message}`
    : issue.message;

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

const compareTime = (left: string, right: string) => {
  const leftTime = new Date(left).getTime();
  const rightTime = new Date(right).getTime();

  if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
    return left.localeCompare(right);
  }

  if (Number.isNaN(leftTime)) {
    return 1;
  }

  if (Number.isNaN(rightTime)) {
    return -1;
  }

  return leftTime - rightTime;
};

const compareEvents = (
  left: EventAdminListItem,
  right: EventAdminListItem,
  field: EventSortField
) => {
  if (field === "name") {
    return (
      left.title_zh.localeCompare(right.title_zh, "zh-Hans-CN") ||
      left.title_en.localeCompare(right.title_en)
    );
  }

  if (field === "start_time") {
    return compareTime(left.start_time, right.start_time);
  }

  if (field === "end_time") {
    return compareTime(left.end_time, right.end_time);
  }

  if (field === "signup_deadline") {
    return compareTime(left.signup_deadline, right.signup_deadline);
  }

  if (field === "capacity") {
    return left.capacity - right.capacity;
  }

  if (field === "remaining_capacity") {
    return left.remaining_capacity - right.remaining_capacity;
  }

  return 0;
};

const isTicketUsed = (row: EventAdminRegistrationRow) =>
  row.ticket_status === "used";

const getRegistrationRowClass = ({
  row
}: {
  row: EventAdminRegistrationRow;
}) => (isTicketUsed(row) ? "is-checked-in-row" : "");

function placeGalleryMediaToCoverCandidate(
  place: Place,
  media: PlaceGalleryMedia
): PlaceCoverCandidate {
  return {
    key: `${place._id}:gallery:${media.file_id}`,
    typeLabel: "自有图集",
    title: media.alt_zh,
    subtitle: media.cloud_path,
    url: media.url,
    cover_file_id: media.file_id,
    cover_cloud_path: media.cloud_path,
    selectable: true
  };
}

function placeExternalMediaToCoverCandidate(
  place: Place,
  media: PlaceExternalMedia
): PlaceCoverCandidate {
  return {
    key: `${place._id}:external:${media.image_url}`,
    typeLabel: "Amap 图片",
    title: media.image_title ?? place.name_zh,
    subtitle: media.attribution.label,
    url: media.image_url,
    cover_file_id: null,
    cover_cloud_path: null,
    selectable: false
  };
}

const resetPoiState = (address = "") => {
  poiKeyword.value = address;
  poiResults.value = [];
  poiError.value = "";
};

const resetPlaceState = () => {
  addressTab.value = "tencent";
  placeKeyword.value = "";
  placesError.value = "";
  selectedPlace.value = null;
  selectedPlaceDetail.value = null;
  placeCoverDialogVisible.value = false;
};

const assignForm = (event?: EventAdminListItem) => {
  Object.assign(form, createEmptyForm());
  submittingError.value = "";
  coverUploadError.value = "";
  resetPoiState(form.address_text);
  resetPlaceState();

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
    address_zh: event.address_zh || event.address_text,
    address_en: event.address_en || "",
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
  address_text: form.address_zh,
  address_zh: form.address_zh,
  address_en: form.address_en,
  location: {
    latitude: Number(form.latitude),
    longitude: Number(form.longitude)
  },
  start_time: form.start_time,
  end_time: form.end_time,
  signup_deadline: form.signup_deadline,
  capacity: Number(form.capacity),
  cover_file_id: form.cover_file_id,
  cover_cloud_path: form.cover_cloud_path,
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

const validateCover = () => {
  if (
    form.cover_file_id &&
    ["public/events/", "public/places/"].some((prefix) =>
      form.cover_cloud_path?.startsWith(prefix)
    )
  ) {
    return true;
  }

  const message = "发布活动前请上传 CloudBase 托管封面。第三方地点图片仅供预览。";
  submittingError.value = message;
  ElMessage.error(message);
  return false;
};

const buildValidatedPayload = () => {
  if (!validateStatusCombination()) {
    return null;
  }

  const payload = buildPayload();
  const willBePublic =
    form.review_status === "approved" && form.publish_status === "published";
  if (willBePublic && !validateCover()) {
    return null;
  }
  const readiness = validateEventPublicationReadiness(payload);
  if (willBePublic && !readiness.ready) {
    const message = `发布前请补齐：${readiness.issues
      .map((issue) => issue.field)
      .join("、")}`;
    submittingError.value = message;
    ElMessage.error(message);
    return null;
  }
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

const loadPublishedPlaces = async (force = false) => {
  if ((!force && adminPlaces.value.length > 0) || placesLoading.value) {
    return;
  }

  placesLoading.value = true;
  placesError.value = "";

  try {
    const result = await adminApi.admin.listPlaces();
    adminPlaces.value = result.data.items;
  } catch (error) {
    placesError.value = toErrorMessage(error, "已有地点加载失败。");
  } finally {
    placesLoading.value = false;
  }
};

const clearSelectedPlace = () => {
  selectedPlace.value = null;
  selectedPlaceDetail.value = null;
  form.place_id = "";
};

const loadPlaceDetail = async (place: Place) => {
  selectedPlace.value = place;
  selectedPlaceDetail.value = null;
  placeDetailLoading.value = true;

  try {
    const result = await adminApi.places.detail(place._id);
    selectedPlaceDetail.value = result.data;
  } catch (error) {
    ElMessage.warning(
      toErrorMessage(error, "地点详情加载失败，暂只能使用地点封面。")
    );
  } finally {
    placeDetailLoading.value = false;
  }
};

const applyPoiToForm = (item: PlacePoiSearchItem) => {
  form.address_text = item.address || item.title;
  form.address_zh = form.address_text;
  form.latitude = item.location.latitude;
  form.longitude = item.location.longitude;
  poiKeyword.value = item.title;
  poiResults.value = [];
  poiError.value = "";
};

const applyDefaultAddressFromTencentMap = async () => {
  poiKeyword.value = DEFAULT_EVENT_ADDRESS;
  poiSearching.value = true;
  poiError.value = "";

  try {
    const result = await adminApi.admin.searchPlacePoi({
      keyword: DEFAULT_EVENT_ADDRESS
    });
    const [firstCandidate] = result.data;

    if (firstCandidate) {
      applyPoiToForm(firstCandidate);
      return;
    }

    poiError.value = "未找到默认地址匹配结果，可手动搜索。";
  } catch (error) {
    poiError.value = toErrorMessage(error, "默认地址识别失败，可手动搜索。");
  } finally {
    poiSearching.value = false;
  }
};

const restoreSelectedPlaceFromEvent = async () => {
  if (!form.place_id) {
    return;
  }

  await loadPublishedPlaces();
  const place = publishedPlaces.value.find((item) => item._id === form.place_id);

  if (place) {
    selectedPlace.value = place;
    placeKeyword.value = place.name_zh;
    await loadPlaceDetail(place);
  }
};

const startCreate = async () => {
  assignForm();
  dialogVisible.value = true;
  await Promise.all([loadPublishedPlaces(), applyDefaultAddressFromTencentMap()]);
};

const startEdit = async (event: EventAdminListItem) => {
  assignForm(event);
  dialogVisible.value = true;
  await restoreSelectedPlaceFromEvent();
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
    form.address_zh !== emptyForm.address_zh ||
    form.address_en !== emptyForm.address_en ||
    Number(form.latitude) !== emptyForm.latitude ||
    Number(form.longitude) !== emptyForm.longitude ||
    Boolean(form.place_id)
  );
};

const shouldConfirmPlaceSelection = () =>
  editingEvent.value !== null || Boolean(form.place_id);

const selectPoi = async (item: PlacePoiSearchItem) => {
  if (hasManualEventLookupFields()) {
    try {
      await ElMessageBox.confirm(
        "选中腾讯地图结果会覆盖当前地址、纬度和经度，并清除已关联地点。",
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

  clearSelectedPlace();
  applyPoiToForm(item);
  ElMessage.success("已填充腾讯地图地址和经纬度。");
};

const selectExistingPlace = async (place: Place) => {
  if (shouldConfirmPlaceSelection()) {
    try {
      await ElMessageBox.confirm(
        "选择已有地点会覆盖当前活动地址、纬度、经度和关联地点 ID。",
        "关联已有地点",
        {
          confirmButtonText: "关联",
          cancelButtonText: "取消",
          type: "warning"
        }
      );
    } catch {
      return;
    }
  }

  form.place_id = place._id;
  form.address_text = place.address_zh || place.name_zh;
  form.address_zh = place.address_zh || place.name_zh;
  form.address_en = place.address_en || place.name_en;
  form.latitude = place.location.latitude;
  form.longitude = place.location.longitude;
  placeKeyword.value = place.name_zh;
  addressTab.value = "place";
  await loadPlaceDetail(place);
  ElMessage.success("已关联已有地点并填充地址。");
};

const clearPlaceAssociation = () => {
  clearSelectedPlace();
  placeKeyword.value = "";
  ElMessage.success("已清除关联地点。");
};

const openPlaceCoverDialog = async () => {
  const place = selectedPlace.value;

  if (!place) {
    return;
  }

  if (!selectedPlaceDetail.value) {
    await loadPlaceDetail(place);
  }

  placeCoverDialogVisible.value = true;
};

const applyPlaceCoverCandidate = (candidate: PlaceCoverCandidate) => {
  if (!candidate.selectable) {
    ElMessage.warning("第三方或非托管地点图片仅供预览，请先下载后上传为活动封面。");
    return;
  }
  form.cover_file_id = candidate.cover_file_id;
  form.cover_cloud_path = candidate.cover_cloud_path;
  form.cover_url = candidate.url;
  placeCoverDialogVisible.value = false;
  ElMessage.success("已设置地点图片为活动封面，保存活动后生效。");
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
  if (
    input.review_status === "approved" &&
    input.publish_status === "published"
  ) {
    const readiness = getEventReadiness(event);
    if (!readiness.ready) {
      ElMessage.error(
        `发布前请补齐：${readiness.issues
          .map((issue) => issue.field)
          .join("、")}`
      );
      return;
    }
  }
  pendingAction.value = actionKey(event, action);
  await nextTick();

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

const canPublishBilingual = (event: EventAdminListItem) =>
  getEventReadiness(event).ready;

const canTakeOffline = (event: EventAdminListItem) =>
  event.publish_status === "published";

const canEnd = (event: EventAdminListItem) =>
  event.publish_status === "published" || event.publish_status === "offline";

const deleteEvent = async (event: EventAdminListItem) => {
  try {
    await ElMessageBox.confirm(
      `删除活动「${event.title_zh}」后，活动列表和公开活动页将不再显示该活动。已有报名和票据记录不会在本次操作中级联删除。`,
      "删除活动",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
  } catch {
    return;
  }

  deletingEventId.value = event._id;

  try {
    await adminApi.admin.deleteEvent(event._id);
    if (selectedEvent.value?._id === event._id) {
      registrationDrawerVisible.value = false;
      selectedEvent.value = null;
      registrations.value = [];
    }
    await load();
    ElMessage.success("活动已删除。");
  } catch (error) {
    showOperationError(error, "删除活动失败。");
  } finally {
    deletingEventId.value = "";
  }
};

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
  filters.sort_field = "default";
  filters.sort_order = "asc";
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
      <el-select v-model="filters.sort_field" placeholder="排序字段">
        <el-option
          v-for="option in sortFieldOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
      <el-select
        v-model="filters.sort_order"
        placeholder="排序方向"
        :disabled="filters.sort_field === 'default'"
      >
        <el-option
          v-for="option in sortOrderOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </el-select>
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
            <small>中文地址：{{ row.address_zh || row.address_text }}</small>
            <small>English address: {{ row.address_en || "待补" }}</small>
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
      <el-table-column label="双语发布就绪" min-width="260">
        <template #default="{ row }">
          <el-tag
            :type="getEventReadiness(row).ready ? 'success' : 'danger'"
            size="small"
          >
            {{ readinessLabel(row) }}
          </el-tag>
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
      <el-table-column label="操作" width="380" fixed="right">
        <template #default="{ row }">
          <div class="row-actions">
            <el-button link size="small" type="primary" @click="startEdit(row)">
              编辑
            </el-button>
            <el-button link size="small" @click="openRegistrations(row)">
              核销
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
              :disabled="!canPublishBilingual(row)"
              :loading="isActionPending(row, 'publish')"
              :title="readinessLabel(row)"
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
            <el-button
              link
              size="small"
              type="danger"
              :loading="deletingEventId === row._id"
              @click="deleteEvent(row)"
            >
              删除
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
              <img
                v-if="form.cover_url"
                :src="form.cover_url"
                alt="活动封面预览"
              />
              <span v-else class="cover-placeholder">尚未选择活动封面</span>
            </div>
            <div class="cover-controls">
              <input
                ref="coverFileInput"
                class="visually-hidden"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                @change="uploadCoverFile"
              />
              <div class="cover-actions">
                <el-button
                  type="primary"
                  :loading="coverUploading"
                  @click="chooseCoverFile"
                >
                  {{ hasCustomCover ? "更换封面" : "选择并上传封面" }}
                </el-button>
                <el-tooltip
                  :disabled="hasSelectedPlace"
                  content="请先在地址与定位中选择已有地标"
                  placement="top"
                >
                  <span>
                    <el-button
                      :disabled="!hasSelectedPlace"
                      :loading="placeDetailLoading"
                      @click="openPlaceCoverDialog"
                    >
                      使用地点图片
                    </el-button>
                  </span>
                </el-tooltip>
              </div>
              <span class="hint-text">
                支持 JPG、PNG、WebP、GIF，单张不超过 5 MB。
              </span>
              <span v-if="hasCustomCover" class="hint-text">
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
          <el-tabs
            v-model="addressTab"
            class="address-tabs"
            @tab-change="() => loadPublishedPlaces()"
          >
            <el-tab-pane label="腾讯地图搜索" name="tencent">
              <div class="poi-search-panel">
                <div class="poi-search-row">
                  <el-input
                    v-model="poiKeyword"
                    placeholder="搜索地标或地址，例如 桐梓林国际社区"
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
            </el-tab-pane>
            <el-tab-pane label="选择已有地点" name="place">
              <div class="place-picker-panel">
                <div class="place-search-row">
                  <el-input
                    v-model="placeKeyword"
                    placeholder="按地点名称、地址或分类搜索已发布地点"
                    clearable
                    @focus="() => loadPublishedPlaces()"
                  />
                  <el-button
                    :loading="placesLoading"
                    @click="() => loadPublishedPlaces(true)"
                  >
                    刷新地点
                  </el-button>
                </div>
                <el-alert
                  v-if="placesError"
                  :title="placesError"
                  type="error"
                  show-icon
                  class="mt-12"
                />
                <div
                  v-loading="placesLoading"
                  class="place-result-list"
                  :class="{ 'is-empty': filteredPublishedPlaces.length === 0 }"
                >
                  <el-empty
                    v-if="!placesLoading && filteredPublishedPlaces.length === 0"
                    description="暂无可选已发布地点"
                  />
                  <button
                    v-for="place in filteredPublishedPlaces"
                    :key="place._id"
                    type="button"
                    class="place-result-item"
                    :class="{ 'is-selected': form.place_id === place._id }"
                    @click="selectExistingPlace(place)"
                  >
                    <span class="place-result-thumb">
                      <img
                        v-if="place.cover_url"
                        :src="place.cover_url"
                        :alt="place.name_zh"
                      />
                    </span>
                    <span class="place-result-body">
                      <strong>{{ place.name_zh }}</strong>
                      <span>{{ place.address_zh }}</span>
                      <small>
                        {{ place.category_level_2 }} ·
                        {{ place.location.latitude.toFixed(6) }},
                        {{ place.location.longitude.toFixed(6) }}
                      </small>
                    </span>
                  </button>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

          <div v-if="selectedPlace" class="selected-place-summary">
            <div>
              <strong>已关联地点：{{ selectedPlace.name_zh }}</strong>
              <span>{{ selectedPlace._id }}</span>
            </div>
            <el-button link type="danger" @click="clearPlaceAssociation">
              清除关联
            </el-button>
          </div>

          <div class="form-grid">
            <el-form-item label="中文活动地址（发布必填）">
              <el-input v-model="form.address_zh" placeholder="中文活动地址" />
            </el-form-item>
            <el-form-item label="英文活动地址（发布必填）">
              <el-input v-model="form.address_en" placeholder="English event address" />
            </el-form-item>
            <el-form-item label="关联地点 ID（由已有地点自动填充，可留空）">
              <el-input
                :model-value="form.place_id || '未关联已有地点'"
                readonly
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
          <el-alert
            :title="
              eventReadiness.ready
                ? '双语正式内容已满足发布要求。'
                : `仍不可发布：${eventReadiness.issues
                    .map((issue) => issue.field)
                    .join('、')}`
            "
            :type="eventReadiness.ready ? 'success' : 'warning'"
            :closable="false"
            show-icon
            class="mb-16"
          />
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

    <el-dialog
      v-model="placeCoverDialogVisible"
      title="选择地点图片"
      width="780px"
      append-to-body
    >
      <el-alert
        v-if="!selectedPlace"
        title="请先选择已有地标。"
        type="warning"
        show-icon
      />
      <template v-else>
        <div class="place-cover-heading">
          <strong>{{ selectedPlace.name_zh }}</strong>
          <span>{{ selectedPlace.address_zh }}</span>
        </div>
        <div
          v-loading="placeDetailLoading"
          class="place-cover-grid"
          :class="{ 'is-empty': placeCoverCandidates.length === 0 }"
        >
          <el-empty
            v-if="!placeDetailLoading && placeCoverCandidates.length === 0"
            description="该地点暂无可复用图片"
          />
          <button
            v-for="candidate in placeCoverCandidates"
            :key="candidate.key"
            type="button"
            class="place-cover-card"
            :disabled="!candidate.selectable"
            @click="applyPlaceCoverCandidate(candidate)"
          >
            <span class="place-cover-thumb">
              <img :src="candidate.url" :alt="candidate.title" />
            </span>
            <span class="place-cover-meta">
              <el-tag size="small">{{ candidate.typeLabel }}</el-tag>
              <strong>{{ candidate.title }}</strong>
              <small>{{ candidate.subtitle }}</small>
              <small v-if="!candidate.selectable">仅供预览，请下载后上传</small>
            </span>
          </button>
        </div>
      </template>
    </el-dialog>

    <el-drawer
      v-model="registrationDrawerVisible"
      :title="selectedEvent ? `${selectedEvent.title_zh} · 核销` : '核销'"
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
        :data="sortedRegistrations"
        v-loading="registrationLoading"
        empty-text="暂无报名"
        row-key="_id"
        :row-class-name="getRegistrationRowClass"
      >
        <el-table-column label="联系人" min-width="150">
          <template #default="{ row }">
            <div class="event-title-cell">
              <strong>{{ row.contact_name }}</strong>
              <span>{{ row.contact_phone }}</span>
              <el-tag v-if="isTicketUsed(row)" type="success" size="small">
                已核销
              </el-tag>
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
            <el-button
              link
              size="small"
              :disabled="isTicketUsed(row)"
              @click="fillCheckinTicket(row)"
            >
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

.events-table :deep(.is-checked-in-row) {
  background: #f0fdf4;
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
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 220px;
  aspect-ratio: 16 / 9;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f8fafc;
}

.cover-placeholder {
  padding: 12px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
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

.cover-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.address-tabs {
  margin-bottom: 12px;
}

.poi-search-panel {
  display: grid;
  gap: 10px;
}

.poi-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.poi-result-list,
.place-result-list {
  display: grid;
  gap: 8px;
}

.place-picker-panel {
  display: grid;
  gap: 10px;
}

.place-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
}

.place-result-list {
  min-height: 76px;
}

.place-result-list.is-empty,
.place-cover-grid.is-empty {
  place-items: center;
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

.poi-result-item:hover,
.place-result-item:hover,
.place-result-item.is-selected {
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

.place-result-item {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.place-result-thumb {
  overflow: hidden;
  width: 72px;
  aspect-ratio: 4 / 3;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f3f4f6;
}

.place-result-thumb img,
.place-cover-thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-result-body,
.selected-place-summary div,
.place-cover-heading,
.place-cover-meta {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.place-result-body strong,
.selected-place-summary strong,
.place-cover-heading strong,
.place-cover-meta strong {
  overflow-wrap: anywhere;
  color: #1f2937;
}

.place-result-body span,
.place-result-body small,
.selected-place-summary span,
.place-cover-heading span,
.place-cover-meta small {
  overflow-wrap: anywhere;
  color: #6b7280;
  font-size: 12px;
}

.selected-place-summary {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 12px;
  padding: 10px 12px;
  border: 1px solid #dbeafe;
  border-radius: 6px;
  background: #eff6ff;
}

.place-cover-heading {
  margin-bottom: 12px;
}

.place-cover-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  min-height: 160px;
}

.place-cover-card {
  display: grid;
  gap: 8px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.place-cover-card:hover {
  border-color: #409eff;
  background: #f8fafc;
}

.place-cover-thumb {
  overflow: hidden;
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 5px;
  background: #f3f4f6;
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
