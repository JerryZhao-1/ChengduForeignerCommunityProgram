import { createHash, randomUUID } from "node:crypto";

import tcb from "@cloudbase/node-sdk";
import {
  FILE_PATH_RULES,
  PLACE_TOP_LEVEL_CATEGORIES,
  PENDING_EVENT_COVER_BIZ_ID,
  PENDING_PLACE_GALLERY_BIZ_ID,
  EventRegistrationSchema,
  EventSchema,
  EventTicketSchema,
  EventWithRegistrationSchema,
  FileAssetSchema,
  PlaceSchema,
  PostSchema,
  PostInteractionRecordSchema,
  PostInteractionStateSchema,
  DiscoverTagSchema,
  UserFollowRecordSchema,
  CommentSchema,
  DiscoverAuditRecordSchema,
  DiscoverReportCaseSchema,
  DiscoverMeGovernanceSchema,
  DiscoverUserGovernanceDetailSchema,
  DiscoverUserGovernanceSummarySchema,
  UserEnforcementStateSchema,
  UserSchema,
  postHasVideoMedia,
  type Event,
  type EventAdminListItem,
  type DiscoverAuditRecord,
  type DiscoverMeGovernance,
  type DiscoverReportCase,
  type DiscoverUserGovernanceDetail,
  type DiscoverUserGovernanceSummary,
  type EventAdminRegistrationRow,
  type EventRegistration,
  type EventTicket,
  type FileAsset,
  type Comment,
  type PageResult,
  type Place,
  type PlaceDetail,
  type PlaceGalleryMedia,
  type PlaceListItem,
  type PlaceMapMarker,
  type Post,
  type PostInteractionRecord,
  type PostInteractionState,
  type DiscoverTag,
  type ProfileFollowListItem,
  type ProfileFollowState,
  type PublicProfile,
  type User,
  type UserFollowRecord,
  type UserEnforcementState
} from "@community-map/shared";

import { apiError } from "../../lib/errors";
import {
  assertAdminLogin,
  createAdminSession,
  getAdminUserId
} from "../../lib/admin-auth";
import { createMockProvider } from "../mock";
import type { ApiProvider, WechatMiniappIdentity } from "../types";

const DEFAULT_COMMUNITY_ID = "tongzilin";
const MAX_PLACES_FETCH = 1000;
const MAX_EVENTS_FETCH = 1000;
const MAX_DISCOVER_FETCH = 1000;
const POST_MEDIA_BIZ_TYPES = new Set([
  "post_image",
  "post_video",
  "post_media"
]);
const PLACEHOLDER_AVATAR_URL =
  "https://static.cloudbase.net/cloudbase-logo.svg";

type CloudbaseApp = ReturnType<typeof tcb.init>;
type CloudbaseDatabase = ReturnType<CloudbaseApp["database"]>;
type CloudbaseCollection = ReturnType<
  ReturnType<ReturnType<typeof tcb.init>["database"]>["collection"]
>;

interface LiveCloudbaseContext {
  app: CloudbaseApp;
  db: CloudbaseDatabase;
  users: CloudbaseCollection;
  events: CloudbaseCollection;
  eventRegistrations: CloudbaseCollection;
  eventTickets: CloudbaseCollection;
  places: CloudbaseCollection;
  posts: CloudbaseCollection;
  comments: CloudbaseCollection;
  postInteractions: CloudbaseCollection;
  userFollows: CloudbaseCollection;
  discoverTags: CloudbaseCollection;
  fileAssets: CloudbaseCollection;
  discoverReportCases: CloudbaseCollection;
  discoverAuditRecords: CloudbaseCollection;
}

const cleanUndefined = <TItem extends object>(input: Partial<TItem>) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined)
  ) as Partial<TItem>;

const toCloudbaseSetDocument = <TItem extends { _id: string }>(item: TItem) => {
  const document: Partial<TItem> = { ...item };
  delete document._id;
  return document;
};

const paginate = <TItem>(
  items: TItem[],
  params: { page?: number; pageSize?: number }
): PageResult<TItem> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length
  };
};

const keywordMatch = (value: string, keyword?: string) =>
  !keyword || value.toLowerCase().includes(keyword.toLowerCase());

const normalizeTagId = (value: string) =>
  value
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

const discoverSortValue = (
  post: Post,
  sort: "latest" | "likes" | "favorites" | "comments" = "latest"
) => {
  if (sort === "likes") {
    return post.like_count;
  }
  if (sort === "favorites") {
    return post.favorite_count;
  }
  if (sort === "comments") {
    return post.comment_count;
  }
  return Date.parse(post.created_at);
};

const sortDiscoverPosts = (
  posts: Post[],
  sort: "latest" | "likes" | "favorites" | "comments" = "latest"
) =>
  [...posts].sort((left, right) => {
    if (left.is_pinned !== right.is_pinned) {
      return left.is_pinned ? -1 : 1;
    }

    const valueDelta = discoverSortValue(right, sort) - discoverSortValue(left, sort);
    if (valueDelta !== 0) {
      return valueDelta;
    }

    return Date.parse(right.created_at) - Date.parse(left.created_at);
  });

const isAdmin = (user: { role_flags: string[] }) =>
  user.role_flags.includes("community_admin") ||
  user.role_flags.includes("system_admin");

const isLaunchVisibleEvent = (event: Event) =>
  event.review_status === "approved" && event.publish_status === "published";

const isLaunchVisiblePost = (post: Post) =>
  post.status === "visible" &&
  !["hidden", "deleted"].includes(post.review_status);

const isVisibleComment = (comment: Comment) =>
  comment.status === "visible" || comment.status === "reported";

const isActiveRegistration = (registration: EventRegistration) =>
  !["cancelled", "closed"].includes(registration.registration_status);

const storedConfirmedAttendeeCount = (raw: unknown) => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const value = (raw as { confirmed_attendee_count?: unknown })
    .confirmed_attendee_count;
  return Number.isInteger(value) && typeof value === "number" && value >= 0
    ? value
    : null;
};

const toEventAdminListItem = (
  event: Event,
  registrations: EventRegistration[]
): EventAdminListItem => {
  const activeRegistrations = registrations.filter(
    (registration) =>
      registration.event_id === event._id && isActiveRegistration(registration)
  );
  const confirmed_attendee_count = activeRegistrations.reduce(
    (sum, registration) => sum + registration.attendee_count,
    0
  );
  const remaining_capacity = Math.max(
    event.capacity - confirmed_attendee_count,
    0
  );

  return {
    ...event,
    active_registration_count: activeRegistrations.length,
    confirmed_attendee_count,
    remaining_capacity,
    is_full: remaining_capacity === 0
  };
};

const toEventAdminRegistrationRow = (
  registration: EventRegistration,
  ticket: EventTicket | undefined
): EventAdminRegistrationRow => ({
  ...registration,
  ticket_code: ticket?.ticket_code ?? null,
  ticket_status: ticket?.status ?? null,
  ticket_used_at: ticket?.used_at ?? null
});

const createEventFromInput = (
  input: Partial<Event>,
  organizerUserId: string
): Event =>
  EventSchema.parse({
    _id: `event_${randomUUID()}`,
    community_id: DEFAULT_COMMUNITY_ID,
    title_zh: input.title_zh ?? "",
    title_en: input.title_en ?? "",
    summary_zh: input.summary_zh ?? "",
    summary_en: input.summary_en ?? "",
    content_zh: input.content_zh ?? "",
    content_en: input.content_en ?? "",
    cover_file_id: input.cover_file_id ?? null,
    cover_cloud_path: input.cover_cloud_path ?? null,
    cover_url:
      input.cover_url ??
      "https://example.com/public/events/placeholder/cover.jpg",
    place_id: input.place_id,
    address_text: input.address_text ?? "",
    location: input.location ?? { latitude: 30.615, longitude: 104.062 },
    start_time: input.start_time ?? new Date().toISOString(),
    end_time: input.end_time ?? new Date().toISOString(),
    signup_deadline: input.signup_deadline ?? new Date().toISOString(),
    capacity: input.capacity ?? 30,
    organizer_user_id: organizerUserId,
    review_status: "draft",
    publish_status: "draft"
  });

const hasUsableCoordinates = (place: Place) =>
  Number.isFinite(place.location.latitude) &&
  Number.isFinite(place.location.longitude) &&
  place.location.latitude >= -90 &&
  place.location.latitude <= 90 &&
  place.location.longitude >= -180 &&
  place.location.longitude <= 180;

const sortPlaces = (
  places: Place[],
  sort: "recommended" | "name" = "recommended"
) => {
  return [...places].sort((left, right) => {
    if (sort === "name") {
      return left.name_en.localeCompare(right.name_en);
    }

    if (left.is_recommended !== right.is_recommended) {
      return left.is_recommended ? -1 : 1;
    }

    return left.recommended_rank - right.recommended_rank;
  });
};

const sortPlacesForMapMarkers = (places: Place[]) =>
  [...places].sort((left, right) => {
    if (left.is_recommended !== right.is_recommended) {
      return left.is_recommended ? -1 : 1;
    }

    if (left.recommended_rank !== right.recommended_rank) {
      return left.recommended_rank - right.recommended_rank;
    }

    const zhComparison = left.name_zh.localeCompare(right.name_zh);
    if (zhComparison !== 0) {
      return zhComparison;
    }

    const enComparison = left.name_en.localeCompare(right.name_en);
    if (enComparison !== 0) {
      return enComparison;
    }

    return left._id.localeCompare(right._id);
  });

const toPlaceListItem = (place: Place): PlaceListItem => ({
  _id: place._id,
  name_zh: place.name_zh,
  name_en: place.name_en,
  cover_url: place.cover_url,
  category_level_1: place.category_level_1,
  category_level_2: place.category_level_2,
  short_address_zh: place.address_zh,
  short_address_en: place.address_en,
  summary_zh: place.intro_zh,
  summary_en: place.intro_en,
  tag_ids: place.tag_ids,
  is_recommended: place.is_recommended,
  recommended_reason_zh: place.recommended_reason_zh,
  recommended_reason_en: place.recommended_reason_en,
  supports_navigation: place.supports_navigation
});

const toFallbackGalleryMedia = (place: Place): PlaceGalleryMedia[] =>
  place.gallery_urls.map((url, index) => {
    const parsedUrl = new URL(url);

    return {
      file_id: place.gallery_file_ids[index] ?? `legacy-url-${index + 1}`,
      cloud_path: parsedUrl.pathname.replace(/^\/+/, ""),
      url,
      alt_zh: `${place.name_zh} 图集 ${index + 1}`,
      alt_en: `${place.name_en} gallery ${index + 1}`
    };
  });

const cloudPathFromFileId = (fileId: string) => {
  const withoutScheme = fileId.replace(/^cloud:\/\//, "");
  const pathStart = withoutScheme.indexOf("/");

  return pathStart >= 0 ? withoutScheme.slice(pathStart + 1) : withoutScheme;
};

const getCloudbaseTempFileUrls = async (
  context: LiveCloudbaseContext,
  fileList: string[]
) => {
  if (fileList.length === 0) {
    return new Map<string, string>();
  }

  const result = await (
    context.app as unknown as {
      getTempFileURL(input: { fileList: string[] }): Promise<{
        fileList: Array<{ fileID: string; tempFileURL?: string }>;
      }>;
    }
  ).getTempFileURL({
    fileList
  });

  return new Map(
    result.fileList
      .filter((item) => item.tempFileURL)
      .map((item) => [item.fileID, item.tempFileURL as string])
  );
};

const isManagedEventCoverFileId = (fileId: string | null) => {
  if (!fileId) {
    return false;
  }

  const cloudPath = cloudPathFromFileId(fileId);
  return (
    cloudPath.startsWith(FILE_PATH_RULES.eventCovers) ||
    cloudPath.startsWith(FILE_PATH_RULES.placeGallery)
  );
};

const resolveEventCoverUrls = async (
  context: LiveCloudbaseContext,
  events: Event[]
): Promise<Event[]> => {
  const coverFileIds = [
    ...new Set(
      events
        .map((event) => event.cover_file_id)
        .filter((fileId): fileId is string => isManagedEventCoverFileId(fileId))
    )
  ];
  const urlsByFileId = await getCloudbaseTempFileUrls(context, coverFileIds);

  return events.map((event) => {
    const coverUrl = event.cover_file_id
      ? urlsByFileId.get(event.cover_file_id)
      : undefined;
    return coverUrl ? { ...event, cover_url: coverUrl } : event;
  });
};

const toCloudbaseGalleryMedia = async (
  context: LiveCloudbaseContext,
  place: Place
): Promise<PlaceGalleryMedia[]> => {
  if (place.gallery_file_ids.length === 0) {
    return [];
  }

  const urlsByFileId = await getCloudbaseTempFileUrls(
    context,
    place.gallery_file_ids
  );

  return place.gallery_file_ids
    .map((fileId, index) => {
      const url = urlsByFileId.get(fileId);
      if (!url) {
        return null;
      }

      return {
        file_id: fileId,
        cloud_path: cloudPathFromFileId(fileId),
        url,
        alt_zh: `${place.name_zh} 图集 ${index + 1}`,
        alt_en: `${place.name_en} gallery ${index + 1}`
      };
    })
    .filter((item): item is PlaceGalleryMedia => item !== null);
};

const toPlaceDetail = async (
  context: LiveCloudbaseContext,
  place: Place
): Promise<PlaceDetail> => {
  const cloudbaseGalleryMedia = await toCloudbaseGalleryMedia(context, place);
  const gallery_media =
    cloudbaseGalleryMedia.length > 0
      ? cloudbaseGalleryMedia
      : toFallbackGalleryMedia(place);

  return {
    _id: place._id,
    community_id: place.community_id,
    name_zh: place.name_zh,
    name_en: place.name_en,
    cover_url: place.cover_url,
    cover_source: place.cover_source,
    category_level_1: place.category_level_1,
    category_level_2: place.category_level_2,
    tag_ids: place.tag_ids,
    address_zh: place.address_zh,
    address_en: place.address_en,
    location: place.location,
    business_hours_zh: place.business_hours_zh,
    business_hours_en: place.business_hours_en,
    intro_zh: place.intro_zh,
    intro_en: place.intro_en,
    gallery_media,
    external_gallery_media: place.external_gallery_media,
    gallery_urls: gallery_media.map((media) => media.url),
    is_recommended: place.is_recommended,
    recommended_reason_zh: place.recommended_reason_zh,
    recommended_reason_en: place.recommended_reason_en,
    supports_navigation: place.supports_navigation,
    supports_favorite: place.supports_favorite,
    supports_share: place.supports_share,
    navigation: {
      latitude: place.location.latitude,
      longitude: place.location.longitude,
      name_zh: place.name_zh,
      name_en: place.name_en,
      address_zh: place.address_zh,
      address_en: place.address_en
    },
    share: {
      title_zh: place.name_zh,
      title_en: place.name_en,
      summary_zh: place.intro_zh,
      summary_en: place.intro_en
    }
  };
};

const getCloudbaseEnvId = () =>
  process.env.CLOUDBASE_ENV_ID ?? process.env.TCB_ENV;

const createLiveContext = (): LiveCloudbaseContext | null => {
  const env = getCloudbaseEnvId();

  if (process.env.CLOUDBASE_PROVIDER_MODE !== "live" || !env) {
    return null;
  }

  const app = tcb.init({ env });
  const db = app.database();

  return {
    app,
    db,
    users: db.collection("users"),
    events: db.collection("events"),
    eventRegistrations: db.collection("event_registrations"),
    eventTickets: db.collection("event_tickets"),
    places: db.collection("places"),
    posts: db.collection("posts"),
    comments: db.collection("comments"),
    postInteractions: db.collection("discover_post_interactions"),
    userFollows: db.collection("discover_user_follows"),
    discoverTags: db.collection("discover_tags"),
    fileAssets: db.collection("file_assets"),
    discoverReportCases: db.collection("discover_report_cases"),
    discoverAuditRecords: db.collection("discover_audit_records")
  };
};

const normalizeEvent = (raw: unknown): Event | null => {
  const parsed = EventSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeEventRegistration = (raw: unknown): EventRegistration | null => {
  const parsed = EventRegistrationSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeEventTicket = (raw: unknown): EventTicket | null => {
  const parsed = EventTicketSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeUser = (raw: unknown): User | null => {
  const parsed = UserSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizePlace = (raw: unknown): Place | null => {
  const parsed = PlaceSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizePost = (raw: unknown): Post | null => {
  const item = raw as Partial<Post> | null;
  if (!item || typeof item !== "object") {
    return null;
  }

  const parsed = PostSchema.safeParse({
    ...item,
    author_display: item.author_display ?? {
      nickname: item.author_user_id ?? "Unknown",
      avatar_url: null
    },
    place_id: item.place_id ?? null,
    event_id: item.event_id ?? null,
    comment_count: item.comment_count ?? 0,
    like_count: item.like_count ?? 0,
    favorite_count: item.favorite_count ?? 0,
    share_count: item.share_count ?? 0,
    is_pinned: item.is_pinned ?? false,
    is_featured: item.is_featured ?? false,
    is_recommended: item.is_recommended ?? false,
    is_official: item.is_official ?? false,
    ops_rank: item.ops_rank ?? 0,
    created_at: item.created_at ?? new Date(0).toISOString(),
    updated_at: item.updated_at ?? item.created_at ?? new Date(0).toISOString()
  });
  return parsed.success ? parsed.data : null;
};

const normalizeComment = (raw: unknown): Comment | null => {
  const item = raw as Partial<Comment> | null;
  if (!item || typeof item !== "object") {
    return null;
  }

  const parsed = CommentSchema.safeParse({
    ...item,
    status: item.status ?? "visible"
  });
  return parsed.success ? parsed.data : null;
};

const normalizePostInteractionRecord = (
  raw: unknown
): PostInteractionRecord | null => {
  const parsed = PostInteractionRecordSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeUserFollowRecord = (raw: unknown): UserFollowRecord | null => {
  const parsed = UserFollowRecordSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeDiscoverTag = (raw: unknown): DiscoverTag | null => {
  const parsed = DiscoverTagSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeFileAsset = (raw: unknown): FileAsset | null => {
  const parsed = FileAssetSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeDiscoverReportCase = (
  raw: unknown
): DiscoverReportCase | null => {
  const parsed = DiscoverReportCaseSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const normalizeDiscoverAuditRecord = (
  raw: unknown
): DiscoverAuditRecord | null => {
  const parsed = DiscoverAuditRecordSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
};

const readEvents = async (context: LiveCloudbaseContext) => {
  const result = await context.events.limit(MAX_EVENTS_FETCH).get();
  const events = result.data
    .map(normalizeEvent)
    .filter((event): event is Event => !!event);

  return resolveEventCoverUrls(context, events);
};

const readEventRegistrations = async (context: LiveCloudbaseContext) => {
  const result = await context.eventRegistrations.limit(MAX_EVENTS_FETCH).get();
  return result.data
    .map(normalizeEventRegistration)
    .filter(
      (registration): registration is EventRegistration => !!registration
    );
};

const readEventTickets = async (context: LiveCloudbaseContext) => {
  const result = await context.eventTickets.limit(MAX_EVENTS_FETCH).get();
  return result.data
    .map(normalizeEventTicket)
    .filter((ticket): ticket is EventTicket => !!ticket);
};

const readUsers = async (context: LiveCloudbaseContext) => {
  const result = await context.users.limit(MAX_DISCOVER_FETCH).get();
  return result.data.map(normalizeUser).filter((user): user is User => !!user);
};

const isLiveMockActorFallbackAllowed = () =>
  process.env.API_ALLOW_MOCK_ACTOR_HEADER === "true";

const buildWechatUserId = (appid: string, openid: string) => {
  const digest = createHash("sha256")
    .update(`${appid}:${openid}`)
    .digest("hex")
    .slice(0, 24);
  return `wx_${digest}`;
};

const createLiveAuthSession = (user: User) => ({
  user,
  token: `cloudbase-miniapp-${user._id}`
});

const resolveLiveAdminUser = async (context: LiveCloudbaseContext) => {
  const users = await readUsers(context);
  const existing = users.find((user) => user._id === getAdminUserId());
  if (!existing || existing.status !== "active") {
    throw apiError(
      "FORBIDDEN",
      "Configured Admin user is missing or inactive.",
      403
    );
  }

  if (
    !existing.role_flags.includes("community_admin") &&
    !existing.role_flags.includes("system_admin")
  ) {
    throw apiError(
      "FORBIDDEN",
      "Configured Admin user does not have an Admin role.",
      403
    );
  }

  return existing;
};

const resolveLiveWechatUser = async (
  context: LiveCloudbaseContext,
  identity: WechatMiniappIdentity,
  preferredLanguage?: "zh" | "en"
) => {
  const users = await readUsers(context);
  const existing =
    users.find((user) => user.openid === identity.openid) ??
    users.find((user) => user._id === buildWechatUserId(identity.appid, identity.openid));
  const nowPreferredLanguage =
    preferredLanguage ?? existing?.preferred_language ?? "zh";
  const user = UserSchema.parse({
    _id: existing?._id ?? buildWechatUserId(identity.appid, identity.openid),
    openid: identity.openid,
    unionid: identity.unionid ?? existing?.unionid,
    nickname: existing?.nickname ?? "微信用户",
    avatar_url: existing?.avatar_url ?? PLACEHOLDER_AVATAR_URL,
    phone: existing?.phone,
    preferred_language: nowPreferredLanguage,
    role_flags: existing?.role_flags ?? ["user"],
    status: existing?.status ?? "active"
  });

  await context.users.doc(user._id).set(toCloudbaseSetDocument(user));
  return user;
};

const createLiveAuthProvider = (
  context: LiveCloudbaseContext,
  fallbackAuth: ApiProvider["auth"]
): ApiProvider["auth"] => ({
  async resolveActor(userId, identity) {
    if (identity) {
      return resolveLiveWechatUser(context, identity, identity.preferredLanguage);
    }

    if (!userId) {
      throw apiError("UNAUTHORIZED", "Authentication is required.", 401);
    }

    const users = await readUsers(context);
    const user = users.find((item) => item._id === userId);
    if (user?.status === "active") {
      return user;
    }

    if (isLiveMockActorFallbackAllowed()) {
      return fallbackAuth.resolveActor(userId);
    }

    throw apiError("UNAUTHORIZED", "Invalid actor.", 401);
  },
  async login(input) {
    if (isLiveMockActorFallbackAllowed()) {
      return fallbackAuth.login(input);
    }

    throw apiError(
      "UNAUTHORIZED",
      "Mock login is disabled for CloudBase live mode.",
      401
    );
  },
  async adminLogin(input) {
    await assertAdminLogin(input);
    const user = await resolveLiveAdminUser(context);
    return createAdminSession(user);
  },
  async me(userId) {
    const users = await readUsers(context);
    const user = users.find((item) => item._id === userId);
    if (user?.status === "active") {
      return createLiveAuthSession(user);
    }
    if (isLiveMockActorFallbackAllowed()) {
      return fallbackAuth.me(userId);
    }
    throw apiError("UNAUTHORIZED", "Invalid actor.", 401);
  },
  async wechatMiniappSession(input) {
    if (!input.identity) {
      if (isLiveMockActorFallbackAllowed()) {
        return fallbackAuth.login({
          mock_user_id: "user_001",
          preferred_language: input.preferred_language
        });
      }

      throw apiError("UNAUTHORIZED", "WeChat Mini Program identity is required.", 401);
    }

    const user = await resolveLiveWechatUser(
      context,
      {
        ...input.identity,
        preferredLanguage: input.preferred_language
      },
      input.preferred_language
    );
    return createLiveAuthSession(user);
  }
});

const readPlaces = async (context: LiveCloudbaseContext) => {
  const result = await context.places.limit(MAX_PLACES_FETCH).get();
  return result.data
    .map(normalizePlace)
    .filter((place): place is Place => !!place);
};

const readPosts = async (context: LiveCloudbaseContext) => {
  const result = await context.posts.limit(MAX_DISCOVER_FETCH).get();
  return result.data.map(normalizePost).filter((post): post is Post => !!post);
};

const readComments = async (context: LiveCloudbaseContext) => {
  const result = await context.comments.limit(MAX_DISCOVER_FETCH).get();
  return result.data
    .map(normalizeComment)
    .filter((comment): comment is Comment => !!comment);
};

const readPostInteractions = async (context: LiveCloudbaseContext) => {
  const result = await context.postInteractions.limit(MAX_DISCOVER_FETCH).get();
  return result.data
    .map(normalizePostInteractionRecord)
    .filter(
      (record): record is PostInteractionRecord => record !== null
    );
};

const readUserFollows = async (context: LiveCloudbaseContext) => {
  const result = await context.userFollows.limit(MAX_DISCOVER_FETCH).get();
  return result.data
    .map(normalizeUserFollowRecord)
    .filter((record): record is UserFollowRecord => record !== null);
};

const readDiscoverTags = async (context: LiveCloudbaseContext) => {
  const result = await context.discoverTags.limit(MAX_DISCOVER_FETCH).get();
  return result.data
    .map(normalizeDiscoverTag)
    .filter((tag): tag is DiscoverTag => tag !== null);
};

const readFileAssets = async (context: LiveCloudbaseContext) => {
  const result = await context.fileAssets.limit(MAX_DISCOVER_FETCH).get();
  return result.data
    .map(normalizeFileAsset)
    .filter((asset): asset is FileAsset => !!asset);
};

const readDiscoverReportCases = async (context: LiveCloudbaseContext) => {
  const result = await context.discoverReportCases
    .limit(MAX_DISCOVER_FETCH)
    .get();
  return result.data
    .map(normalizeDiscoverReportCase)
    .filter((report): report is DiscoverReportCase => !!report);
};

const readDiscoverAuditRecords = async (context: LiveCloudbaseContext) => {
  const result = await context.discoverAuditRecords
    .limit(MAX_DISCOVER_FETCH)
    .get();
  return result.data
    .map(normalizeDiscoverAuditRecord)
    .filter((record): record is DiscoverAuditRecord => !!record);
};

const createLiveEventsProvider = (
  context: LiveCloudbaseContext,
  fallbackAuth: ApiProvider["auth"]
): ApiProvider["events"] => ({
  async list(input) {
    const events = (await readEvents(context)).filter(
      (event) =>
        isLaunchVisibleEvent(event) &&
        (!input.communityId || event.community_id === input.communityId) &&
        (keywordMatch(event.title_zh, input.keyword) ||
          keywordMatch(event.title_en, input.keyword) ||
          keywordMatch(event.summary_zh, input.keyword) ||
          keywordMatch(event.summary_en, input.keyword))
    );

    return paginate(events, input);
  },
  async listAdmin() {
    const [events, registrations] = await Promise.all([
      readEvents(context),
      readEventRegistrations(context)
    ]);

    return paginate(
      events.map((event) => toEventAdminListItem(event, registrations)),
      { pageSize: events.length || 20 }
    );
  },
  async detail(id) {
    const event = (await readEvents(context)).find((item) => item._id === id);
    return event && isLaunchVisibleEvent(event) ? event : null;
  },
  async listRegistrationsForAdmin(eventId) {
    const [events, registrations, tickets] = await Promise.all([
      readEvents(context),
      readEventRegistrations(context),
      readEventTickets(context)
    ]);
    const event = events.find((item) => item._id === eventId);

    if (!event) {
      return null;
    }

    return registrations
      .filter((registration) => registration.event_id === eventId)
      .map((registration) =>
        toEventAdminRegistrationRow(
          registration,
          tickets.find((ticket) => ticket._id === registration.ticket_id)
        )
      );
  },
  async createRegistration(eventId, input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    const [events, registrationResult] = await Promise.all([
      readEvents(context),
      context.eventRegistrations
        .where({ event_id: eventId })
        .limit(MAX_EVENTS_FETCH)
        .get()
    ]);
    const event = events.find((item) => item._id === eventId) ?? null;
    const registrations = registrationResult.data
      .map(normalizeEventRegistration)
      .filter(
        (registration): registration is EventRegistration => !!registration
      );

    if (!event || !isLaunchVisibleEvent(event)) {
      throw apiError("NOT_FOUND", "Event not found.", 404);
    }

    const now = Date.now();

    if (new Date(event.end_time).getTime() <= now) {
      throw apiError("CONFLICT", "Event has ended.", 409, {
        reason: "event_ended"
      });
    }

    if (new Date(event.signup_deadline).getTime() <= now) {
      throw apiError("CONFLICT", "Event signup is closed.", 409, {
        reason: "signup_deadline_passed"
      });
    }

    const hasActiveRegistration = registrations.some(
      (registration) =>
        registration.user_id === actor._id && isActiveRegistration(registration)
    );

    if (hasActiveRegistration) {
      throw apiError("CONFLICT", "Registration already exists.", 409, {
        reason: "already_registered"
      });
    }

    const confirmedAttendees = registrations
      .filter(isActiveRegistration)
      .reduce((sum, registration) => sum + registration.attendee_count, 0);
    const currentConfirmedAttendees = Math.max(
      storedConfirmedAttendeeCount(event) ?? 0,
      confirmedAttendees
    );

    if (currentConfirmedAttendees + input.attendee_count > event.capacity) {
      throw apiError("CONFLICT", "Event capacity is full.", 409, {
        reason: "capacity_exceeded",
        remaining: Math.max(event.capacity - currentConfirmedAttendees, 0)
      });
    }

    const nextConfirmedAttendees =
      currentConfirmedAttendees + input.attendee_count;
    const ticketId = `ticket_${randomUUID()}`;
    const registration: EventRegistration = {
      _id: `reg_${randomUUID()}`,
      event_id: eventId,
      user_id: actor._id,
      contact_name: input.contact_name,
      contact_phone: input.contact_phone,
      attendee_count: input.attendee_count,
      registration_status: "confirmed",
      ticket_id: ticketId,
      source_channel: input.source_channel
    };
    const ticket: EventTicket = {
      _id: ticketId,
      registration_id: registration._id,
      ticket_code: `TZL-${Date.now()}`,
      qr_file_id: `cloud://${registration.ticket_id}`,
      qr_cloud_path: `${FILE_PATH_RULES.tickets}${registration.ticket_id}.png`,
      visibility: "private",
      status: "valid",
      issued_at: new Date().toISOString(),
      used_at: null
    };

    await Promise.all([
      context.events.doc(eventId).update({
        confirmed_attendee_count: nextConfirmedAttendees
      }),
      context.eventRegistrations
        .doc(registration._id)
        .set(toCloudbaseSetDocument(registration)),
      context.eventTickets.doc(ticket._id).set(toCloudbaseSetDocument(ticket))
    ]);

    const result: unknown = { registration, ticket };

    return EventWithRegistrationSchema.parse(result);
  },
  async listMyRegistrations(actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    return (await readEventRegistrations(context)).filter(
      (registration) => registration.user_id === actor._id
    );
  },
  async getTicketByRegistration(registrationId, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    const registrations = await readEventRegistrations(context);
    const registration = registrations.find(
      (item) => item._id === registrationId
    );

    if (!registration) {
      return null;
    }

    if (registration.user_id !== actor._id && !isAdmin(actor)) {
      throw apiError("FORBIDDEN", "Ticket access denied.", 403);
    }

    return (
      (await readEventTickets(context)).find(
        (ticket) => ticket._id === registration.ticket_id
      ) ?? null
    );
  },
  async create(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    const event = createEventFromInput(input, actor._id);
    await context.events.doc(event._id).set(toCloudbaseSetDocument(event));
    await rebindPendingEventCoverAsset(context, event._id, event.cover_file_id);
    return event;
  },
  async update(id, input) {
    const events = await readEvents(context);
    const existing = events.find((event) => event._id === id);

    if (!existing) {
      return null;
    }

    const update = cleanUndefined<Event>(input);
    const nextEvent = EventSchema.parse({
      ...existing,
      ...update
    });

    if (Object.keys(update).length > 0) {
      await context.events.doc(id).update(update);
    }

    return nextEvent;
  },
  async delete(id) {
    const events = await readEvents(context);
    const existing = events.find((event) => event._id === id);

    if (!existing) {
      return null;
    }

    await context.events.doc(id).remove();
    return { deleted_id: id };
  },
  async uploadCoverFile(id, input, actorId = "user_001") {
    const events = id ? await readEvents(context) : [];
    const existing = id ? events.find((event) => event._id === id) : null;

    if (id && !existing) {
      return null;
    }

    const targetPath = id ?? `_pending/${randomUUID()}`;
    const cloudPath = `${FILE_PATH_RULES.eventCovers}${targetPath}/${randomUUID()}-${sanitizeFileName(input.file_name, "event-cover")}`;
    const uploadResult = await (
      context.app as unknown as {
        uploadFile(input: {
          cloudPath: string;
          fileContent: Buffer;
        }): Promise<{ fileID?: string; fileId?: string }>;
      }
    ).uploadFile({
      cloudPath,
      fileContent: input.buffer
    });
    const fileId =
      uploadResult.fileID ??
      uploadResult.fileId ??
      `cloud://${getCloudbaseEnvId()}/${cloudPath}`;
    const urlsByFileId = await getCloudbaseTempFileUrls(context, [fileId]);
    const coverUrl =
      urlsByFileId.get(fileId) ??
      `https://example.com/${cloudPath.replace(/^\/+/, "")}`;
    const asset = FileAssetSchema.parse({
      _id: `file_${randomUUID()}`,
      file_id: fileId,
      cloud_path: cloudPath,
      visibility: "public",
      biz_type: "event_cover",
      biz_id: id ?? PENDING_EVENT_COVER_BIZ_ID,
      uploaded_by: actorId,
      status: "active"
    } satisfies FileAsset);

    await context.fileAssets.doc(asset._id).set({
      file_id: asset.file_id,
      cloud_path: asset.cloud_path,
      visibility: asset.visibility,
      biz_type: asset.biz_type,
      biz_id: asset.biz_id,
      uploaded_by: asset.uploaded_by,
      status: asset.status
    });

    return {
      file_asset: asset,
      cover_file_id: asset.file_id,
      cover_cloud_path: asset.cloud_path,
      cover_url: coverUrl
    };
  },
  async review(id, input) {
    const events = await readEvents(context);
    const existing = events.find((event) => event._id === id);

    if (!existing) {
      return null;
    }

    const update = cleanUndefined<Event>({
      review_status: input.review_status,
      publish_status: input.publish_status
    });
    const nextEvent = EventSchema.parse({
      ...existing,
      ...update
    });

    await context.events.doc(id).update(update);
    return nextEvent;
  },
  async checkin(id, ticketId) {
    const [events, registrations, tickets] = await Promise.all([
      readEvents(context),
      readEventRegistrations(context),
      readEventTickets(context)
    ]);
    const event = events.find((item) => item._id === id);
    const ticket = tickets.find((item) => item._id === ticketId);

    if (!event || !ticket) {
      return null;
    }

    const registration = registrations.find(
      (item) => item._id === ticket.registration_id
    );

    if (!registration || registration.event_id !== event._id) {
      throw apiError("CONFLICT", "Ticket does not belong to event.", 409, {
        reason: "ticket_event_mismatch"
      });
    }

    if (ticket.status !== "valid") {
      throw apiError("CONFLICT", "Ticket is not valid for check-in.", 409, {
        reason: "ticket_not_valid",
        ticket_status: ticket.status
      });
    }

    const usedTicket = EventTicketSchema.parse({
      ...ticket,
      status: "used",
      used_at: new Date().toISOString()
    });

    const updateResult = await context.eventTickets
      .where({ _id: ticket._id, status: "valid" })
      .options({ multiple: false })
      .update({
        status: usedTicket.status,
        used_at: usedTicket.used_at
      });

    if (updateResult.updated !== 1) {
      throw apiError("CONFLICT", "Ticket is not valid for check-in.", 409, {
        reason: "ticket_not_valid",
        ticket_status: ticket.status
      });
    }

    return usedTicket;
  }
});

const createPlaceFromInput = (input: Partial<Place>): Place =>
  PlaceSchema.parse({
    _id: `place_${randomUUID()}`,
    community_id: DEFAULT_COMMUNITY_ID,
    name_zh: input.name_zh ?? "",
    name_en: input.name_en ?? "",
    cover_file_id: input.cover_file_id ?? null,
    cover_url: input.cover_url ?? null,
    cover_source: input.cover_source ?? null,
    category_level_1: input.category_level_1 ?? PLACE_TOP_LEVEL_CATEGORIES[0],
    category_level_2: input.category_level_2 ?? "",
    tag_ids: input.tag_ids ?? [],
    address_zh: input.address_zh ?? "",
    address_en: input.address_en ?? "",
    location: input.location ?? { latitude: 30.615, longitude: 104.062 },
    tencent_map_poi_id: input.tencent_map_poi_id ?? null,
    business_hours_zh: input.business_hours_zh ?? "",
    business_hours_en: input.business_hours_en ?? "",
    intro_zh: input.intro_zh ?? "",
    intro_en: input.intro_en ?? "",
    recommended_reason_zh: input.recommended_reason_zh ?? null,
    recommended_reason_en: input.recommended_reason_en ?? null,
    is_recommended: input.is_recommended ?? false,
    recommended_rank: input.recommended_rank ?? 0,
    gallery_file_ids: input.gallery_file_ids ?? [],
    external_gallery_media: input.external_gallery_media ?? [],
    gallery_urls: input.gallery_urls ?? [],
    supports_navigation: input.supports_navigation ?? true,
    supports_favorite: input.supports_favorite ?? true,
    supports_share: input.supports_share ?? true,
    status: input.status ?? "draft",
    import_review: input.import_review ?? null
  });

const sanitizeFileName = (fileName: string, fallback = "gallery-upload") =>
  fileName.replace(/[^\w.-]+/g, "-").replace(/^-+/, "") || fallback;

const rebindPendingGalleryAssets = async (
  context: LiveCloudbaseContext,
  placeId: string,
  galleryFileIds: string[]
) => {
  if (galleryFileIds.length === 0) {
    return;
  }

  const result = await (
    context.fileAssets as unknown as {
      where(query: Record<string, unknown>): {
        limit(count: number): {
          get(): Promise<{ data: Array<FileAsset & { _id: string }> }>;
        };
      };
    }
  )
    .where({
      biz_type: "place_gallery",
      biz_id: PENDING_PLACE_GALLERY_BIZ_ID
    })
    .limit(1000)
    .get();

  const galleryFileIdSet = new Set(galleryFileIds);
  await Promise.all(
    result.data
      .filter((asset) => galleryFileIdSet.has(asset.file_id))
      .map((asset) =>
        context.fileAssets.doc(asset._id).update({
          biz_id: placeId
        })
      )
  );
};

const rebindPendingEventCoverAsset = async (
  context: LiveCloudbaseContext,
  eventId: string,
  coverFileId: string | null
) => {
  if (!coverFileId) {
    return;
  }

  const result = await (
    context.fileAssets as unknown as {
      where(query: Record<string, unknown>): {
        limit(count: number): {
          get(): Promise<{ data: Array<FileAsset & { _id: string }> }>;
        };
      };
    }
  )
    .where({
      file_id: coverFileId,
      biz_type: "event_cover",
      biz_id: PENDING_EVENT_COVER_BIZ_ID
    })
    .limit(1)
    .get();
  const [asset] = result.data;

  if (!asset) {
    return;
  }

  await context.fileAssets.doc(asset._id).update({
    biz_id: eventId
  });
};

const createLivePlacesProvider = (
  context: LiveCloudbaseContext
): ApiProvider["places"] => ({
  async list(input) {
    const places = sortPlaces(
      (await readPlaces(context)).filter((place) => {
        if (place.status !== "published") {
          return false;
        }

        if (input.communityId && place.community_id !== input.communityId) {
          return false;
        }

        if (
          input.category &&
          place.category_level_1 !== input.category &&
          place.category_level_2 !== input.category
        ) {
          return false;
        }

        if (input.tag && !place.tag_ids.includes(input.tag)) {
          return false;
        }

        if (input.recommended && !place.is_recommended) {
          return false;
        }

        return (
          keywordMatch(place.name_zh, input.keyword) ||
          keywordMatch(place.name_en, input.keyword) ||
          keywordMatch(place.intro_zh, input.keyword) ||
          keywordMatch(place.intro_en, input.keyword)
        );
      }),
      input.sort
    );

    return paginate(places.map(toPlaceListItem), input);
  },
  async listAdmin() {
    const places = await readPlaces(context);
    return paginate(places, { pageSize: places.length || 20 });
  },
  async detail(id) {
    const place = (await readPlaces(context)).find((item) => item._id === id);

    if (!place || place.status !== "published") {
      return null;
    }

    return toPlaceDetail(context, place);
  },
  async mapMarkers() {
    return sortPlacesForMapMarkers(
      (await readPlaces(context)).filter(
        (place) =>
          place.community_id === DEFAULT_COMMUNITY_ID &&
          place.status === "published" &&
          hasUsableCoordinates(place)
      )
    ).map(
      (place): PlaceMapMarker => ({
        _id: place._id,
        name_zh: place.name_zh,
        name_en: place.name_en,
        cover_url: place.cover_url,
        category_level_1: place.category_level_1,
        is_recommended: place.is_recommended,
        location: place.location
      })
    );
  },
  async create(input) {
    const place = createPlaceFromInput(input);
    await context.places.doc(place._id).set(toCloudbaseSetDocument(place));
    await rebindPendingGalleryAssets(
      context,
      place._id,
      place.gallery_file_ids
    );
    return place;
  },
  async update(id, input) {
    const places = await readPlaces(context);
    const existing = places.find((place) => place._id === id);

    if (!existing) {
      return null;
    }

    const nextPlace = PlaceSchema.parse({
      ...existing,
      ...cleanUndefined<Place>(input)
    });
    const update = cleanUndefined<Place>(input);

    if (Object.keys(update).length > 0) {
      await context.places.doc(id).update(update);
    }
    return nextPlace;
  },
  async delete(id) {
    const places = await readPlaces(context);
    const existing = places.find((place) => place._id === id);

    if (!existing) {
      return null;
    }

    await context.places.doc(id).remove();
    return { deleted_id: id };
  },
  async uploadGalleryFile(id, input, actorId = "user_001") {
    const places = id ? await readPlaces(context) : [];
    const existing = id ? places.find((place) => place._id === id) : null;

    if (id && !existing) {
      return null;
    }

    const targetPath = id ?? `_pending/${randomUUID()}`;
    const cloudPath = `${FILE_PATH_RULES.placeGallery}${targetPath}/${randomUUID()}-${sanitizeFileName(input.file_name)}`;
    const uploadResult = await (
      context.app as unknown as {
        uploadFile(input: {
          cloudPath: string;
          fileContent: Buffer;
        }): Promise<{ fileID?: string; fileId?: string }>;
      }
    ).uploadFile({
      cloudPath,
      fileContent: input.buffer
    });
    const fileId =
      uploadResult.fileID ??
      uploadResult.fileId ??
      `cloud://${getCloudbaseEnvId()}/${cloudPath}`;
    const asset = FileAssetSchema.parse({
      _id: `file_${randomUUID()}`,
      file_id: fileId,
      cloud_path: cloudPath,
      visibility: "public",
      biz_type: "place_gallery",
      biz_id: id ?? PENDING_PLACE_GALLERY_BIZ_ID,
      uploaded_by: actorId,
      status: "active"
    } satisfies FileAsset);
    const gallery_file_ids = existing
      ? [...existing.gallery_file_ids, asset.file_id]
      : [asset.file_id];

    await context.fileAssets.doc(asset._id).set({
      file_id: asset.file_id,
      cloud_path: asset.cloud_path,
      visibility: asset.visibility,
      biz_type: asset.biz_type,
      biz_id: asset.biz_id,
      uploaded_by: asset.uploaded_by,
      status: asset.status
    });
    if (id) {
      await context.places.doc(id).update({
        gallery_file_ids
      });
    }

    return {
      file_asset: asset,
      gallery_file_ids
    };
  }
});

const resolvePostMediaUrls = async (
  context: LiveCloudbaseContext,
  post: Post
) => {
  const fileIds = post.image_file_ids.filter((fileId) =>
    cloudPathFromFileId(fileId).startsWith(FILE_PATH_RULES.postImages)
  );
  const urlsByFileId = await getCloudbaseTempFileUrls(context, fileIds);
  return [
    ...fileIds.map((fileId) => urlsByFileId.get(fileId)).filter(Boolean),
    ...post.image_urls
  ] as string[];
};

const normalizePostForRead = async (
  context: LiveCloudbaseContext,
  post: Post,
  comments: Comment[]
): Promise<Post> => {
  const visibleComments = comments.filter(
    (comment) => comment.post_id === post._id && isVisibleComment(comment)
  );

  return PostSchema.parse({
    ...post,
    comment_count: visibleComments.length,
    image_urls: await resolvePostMediaUrls(context, post)
  });
};

const requireLiveAdminActor = async (
  fallbackAuth: ApiProvider["auth"],
  actorId?: string
) => {
  const actor = await fallbackAuth.resolveActor(actorId);
  if (!isAdmin(actor)) {
    throw apiError("FORBIDDEN", "Insufficient permission.", 403);
  }
  return actor;
};

const LIVE_ENFORCEMENT_STATUSES = [
  "active",
  "warned",
  "muted",
  "banned"
] as const;
const LIVE_CONTENT_STATUSES = [
  "visible",
  "reported",
  "hidden",
  "deleted"
] as const;

const isLiveEnforcementStatus = (
  value: unknown
): value is UserEnforcementState["status"] =>
  typeof value === "string" &&
  LIVE_ENFORCEMENT_STATUSES.some((status) => status === value);

const isLiveEnforcementContentStatus = (
  value: unknown
): value is Post["status"] =>
  typeof value === "string" &&
  LIVE_CONTENT_STATUSES.some((status) => status === value);

const toPlaceholderUser = (userId: string): User =>
  UserSchema.parse({
    _id: userId,
    nickname: userId,
    avatar_url: "https://example.com/avatar-placeholder.png",
    preferred_language: "zh",
    role_flags: [],
    status: "active"
  });

const resolveLiveGovernanceUser = async (
  fallbackAuth: ApiProvider["auth"],
  userId: string
): Promise<User> => {
  try {
    return await fallbackAuth.resolveActor(userId);
  } catch {
    return toPlaceholderUser(userId);
  }
};

const latestLiveUserEnforcement = (
  auditRecords: DiscoverAuditRecord[],
  userId: string
): UserEnforcementState => {
  const record = auditRecords
    .filter(
      (item) =>
        item.action === "enforce_user" &&
        item.target_type === "user" &&
        item.target_id === userId
    )
    .sort(
      (left, right) =>
        Date.parse(right.created_at) - Date.parse(left.created_at)
    )[0];
  const nextState = record?.next_state;
  const status = isLiveEnforcementStatus(nextState?.status)
    ? nextState.status
    : "active";
  const expiresAt =
    typeof nextState?.expires_at === "string" ? nextState.expires_at : null;

  if (status !== "active" && expiresAt && Date.parse(expiresAt) <= Date.now()) {
    return UserEnforcementStateSchema.parse({
      status: "active",
      reason: null,
      notes: typeof nextState?.notes === "string" ? nextState.notes : null,
      expires_at: null,
      updated_at: new Date().toISOString(),
      updated_by:
        typeof nextState?.updated_by === "string" ? nextState.updated_by : null
    });
  }

  return UserEnforcementStateSchema.parse({
    status,
    reason: typeof nextState?.reason === "string" ? nextState.reason : null,
    notes: typeof nextState?.notes === "string" ? nextState.notes : null,
    expires_at: expiresAt,
    updated_at:
      typeof nextState?.updated_at === "string" ? nextState.updated_at : null,
    updated_by:
      typeof nextState?.updated_by === "string" ? nextState.updated_by : null
  });
};

const collectLiveGovernanceUserIds = (
  posts: Post[],
  comments: Comment[],
  reports: DiscoverReportCase[],
  auditRecords: DiscoverAuditRecord[]
) => {
  const ids = new Set<string>();

  posts.forEach((post) => ids.add(post.author_user_id));
  comments.forEach((comment) => ids.add(comment.author_user_id));
  reports.forEach((report) => {
    ids.add(report.reporter_user_id);
    if (report.handler_user_id) {
      ids.add(report.handler_user_id);
    }
  });
  auditRecords.forEach((record) => {
    ids.add(record.actor_user_id);
    if (record.target_type === "user") {
      ids.add(record.target_id);
    }
  });

  return [...ids];
};

const buildLiveUserGovernanceSummary = (
  user: User,
  posts: Post[],
  comments: Comment[],
  reports: DiscoverReportCase[],
  auditRecords: DiscoverAuditRecord[]
): DiscoverUserGovernanceSummary =>
  DiscoverUserGovernanceSummarySchema.parse({
    user,
    enforcement: latestLiveUserEnforcement(auditRecords, user._id),
    post_count: posts.filter((post) => post.author_user_id === user._id).length,
    comment_count: comments.filter(
      (comment) => comment.author_user_id === user._id
    ).length,
    report_count: reports.filter(
      (report) => report.reporter_user_id === user._id
    ).length,
    violation_count: auditRecords.filter(
      (record) => record.target_type === "user" && record.target_id === user._id
    ).length
  });

const buildLiveUserGovernanceDetail = async (
  context: LiveCloudbaseContext,
  user: User,
  posts: Post[],
  comments: Comment[],
  reports: DiscoverReportCase[],
  auditRecords: DiscoverAuditRecord[]
): Promise<DiscoverUserGovernanceDetail> => {
  const ownedPostIds = new Set(
    posts
      .filter((post) => post.author_user_id === user._id)
      .map((post) => post._id)
  );
  const visibleReports = await Promise.all(
    reports
      .filter(
        (report) =>
          report.reporter_user_id === user._id ||
          ownedPostIds.has(report.post_id)
      )
      .map((report) => normalizeLiveReportCase(context, report, true))
  );

  return DiscoverUserGovernanceDetailSchema.parse({
    ...buildLiveUserGovernanceSummary(
      user,
      posts,
      comments,
      reports,
      auditRecords
    ),
    posts: posts.filter((post) => post.author_user_id === user._id),
    comments: comments.filter((comment) => comment.author_user_id === user._id),
    reports: visibleReports,
    audit_records: auditRecords.filter(
      (record) =>
        record.target_id === user._id || record.actor_user_id === user._id
    )
  });
};

const hideLiveBannedUserPosts = async (
  context: LiveCloudbaseContext,
  posts: Post[],
  userId: string
) => {
  const hiddenPosts = posts
    .filter(
      (post) =>
        post.author_user_id === userId &&
        post.status === "visible" &&
        !["hidden", "deleted"].includes(post.review_status)
    )
    .map((post) => ({
      _id: post._id,
      status: post.status,
      review_status: post.review_status
    }));
  const now = new Date().toISOString();

  await Promise.all(
    hiddenPosts.map((post) =>
      context.posts.doc(post._id).update({
        status: "hidden",
        review_status: "hidden",
        updated_at: now
      })
    )
  );

  return hiddenPosts;
};

const restoreLiveBannedUserPosts = async (
  context: LiveCloudbaseContext,
  posts: Post[],
  auditRecords: DiscoverAuditRecord[],
  userId: string
) => {
  const latestBan = auditRecords
    .filter(
      (record) =>
        record.action === "enforce_user" &&
        record.target_type === "user" &&
        record.target_id === userId &&
        record.next_state?.status === "banned"
    )
    .sort(
      (left, right) =>
        Date.parse(right.created_at) - Date.parse(left.created_at)
    )[0];
  const hiddenPosts = Array.isArray(latestBan?.next_state?.banned_hidden_posts)
    ? latestBan.next_state.banned_hidden_posts
    : [];
  const restoredPostIds: string[] = [];
  const now = new Date().toISOString();

  for (const hiddenPost of hiddenPosts) {
    if (!hiddenPost || typeof hiddenPost !== "object") {
      continue;
    }

    const candidate = hiddenPost as {
      _id?: unknown;
      status?: unknown;
      review_status?: unknown;
    };

    if (
      typeof candidate._id !== "string" ||
      !isLiveEnforcementContentStatus(candidate.status) ||
      !isLiveEnforcementContentStatus(candidate.review_status)
    ) {
      continue;
    }

    const post = posts.find((item) => item._id === candidate._id);
    if (
      post &&
      post.author_user_id === userId &&
      post.status === "hidden" &&
      post.review_status === "hidden"
    ) {
      await context.posts.doc(post._id).update({
        status: candidate.status,
        review_status: candidate.review_status,
        updated_at: now
      });
      restoredPostIds.push(post._id);
    }
  }

  return restoredPostIds;
};

const assertLiveReportEvidenceAccess = (
  evidenceFileIds: string[],
  fileAssets: FileAsset[],
  actor: { _id: string; role_flags: string[] }
) => {
  for (const fileId of evidenceFileIds) {
    const asset = fileAssets.find(
      (item) => item.file_id === fileId && item.status === "active"
    );

    if (
      !asset ||
      asset.visibility !== "private" ||
      asset.biz_type !== "report_evidence" ||
      !asset.cloud_path.startsWith(FILE_PATH_RULES.reports) ||
      (asset.uploaded_by !== actor._id && !isAdmin(actor))
    ) {
      throw apiError("FORBIDDEN", "Report evidence access denied.", 403);
    }
  }
};

const normalizeLiveReportCase = async (
  context: LiveCloudbaseContext,
  report: DiscoverReportCase,
  includeEvidenceUrls = false
): Promise<DiscoverReportCase> => {
  const fileAssets = await readFileAssets(context);
  const evidenceAssets = report.evidence_file_ids
    .map((fileId) =>
      fileAssets.find(
        (asset) => asset.file_id === fileId && asset.status === "active"
      )
    )
    .filter((asset): asset is FileAsset => !!asset);
  const urlsByFileId = includeEvidenceUrls
    ? await getCloudbaseTempFileUrls(
        context,
        evidenceAssets.map((asset) => asset.file_id)
      )
    : new Map<string, string>();

  return {
    ...report,
    evidence: evidenceAssets.map((asset) => ({
      file_id: asset.file_id,
      cloud_path: asset.cloud_path,
      visibility: asset.visibility,
      ...(includeEvidenceUrls
        ? { temp_url: urlsByFileId.get(asset.file_id) }
        : {})
    }))
  };
};

const createLiveReportCase = async (
  context: LiveCloudbaseContext,
  input: {
    target_type: "post" | "comment";
    post: Post;
    comment?: Comment;
    reason: string;
    description?: string;
    evidence_file_ids?: string[];
    actor: { _id: string; role_flags: string[] };
  }
) => {
  const evidenceFileIds = input.evidence_file_ids ?? [];
  const fileAssets = await readFileAssets(context);
  assertLiveReportEvidenceAccess(evidenceFileIds, fileAssets, input.actor);

  const now = new Date().toISOString();
  const report = DiscoverReportCaseSchema.parse({
    _id: `report_${randomUUID()}`,
    community_id: input.post.community_id,
    target_type: input.target_type,
    target_id: input.comment?._id ?? input.post._id,
    post_id: input.post._id,
    comment_id: input.comment?._id ?? null,
    reporter_user_id: input.actor._id,
    reason: input.reason,
    description: input.description ?? null,
    evidence_file_ids: evidenceFileIds,
    evidence: [],
    status: "open",
    handler_user_id: null,
    resolution_note: null,
    created_at: now,
    updated_at: now,
    resolved_at: null
  });

  await context.discoverReportCases
    .doc(report._id)
    .set(toCloudbaseSetDocument(report));
  await Promise.all(
    evidenceFileIds.map(async (fileId) => {
      const asset = fileAssets.find((item) => item.file_id === fileId);
      if (asset) {
        await context.fileAssets.doc(asset._id).update({ biz_id: report._id });
      }
    })
  );

  return normalizeLiveReportCase(context, report);
};

const assertLiveActorAllowed = async (
  context: LiveCloudbaseContext,
  actorId: string,
  action: "create_post" | "create_comment" | "report" | "read_mine"
) => {
  const enforcement = latestLiveUserEnforcement(
    await readDiscoverAuditRecords(context),
    actorId
  );
  const blockedByMuted =
    enforcement.status === "muted" &&
    (action === "create_post" || action === "create_comment");
  const blockedByBanned =
    enforcement.status === "banned" &&
    ["create_post", "create_comment", "report", "read_mine"].includes(action);

  if (!blockedByMuted && !blockedByBanned) {
    return;
  }

  throw apiError("FORBIDDEN", "User enforcement blocks this action.", 403, {
    enforcement_status: enforcement.status,
    action
  });
};

const addLiveAuditRecord = async (
  context: LiveCloudbaseContext,
  input: {
    actor_user_id: string;
    action: string;
    target_type: DiscoverAuditRecord["target_type"];
    target_id: string;
    reason?: string | null;
    previous_state?: Record<string, unknown> | null;
    next_state?: Record<string, unknown> | null;
  }
) => {
  const record = DiscoverAuditRecordSchema.parse({
    _id: `audit_${randomUUID()}`,
    community_id: DEFAULT_COMMUNITY_ID,
    actor_user_id: input.actor_user_id,
    action: input.action,
    target_type: input.target_type,
    target_id: input.target_id,
    reason: input.reason ?? null,
    previous_state: input.previous_state ?? null,
    next_state: input.next_state ?? null,
    created_at: new Date().toISOString()
  });

  await context.discoverAuditRecords
    .doc(record._id)
    .set(toCloudbaseSetDocument(record));
  return record;
};

const buildLiveInteractionState = (
  post: Post,
  actor: User,
  record?: PostInteractionRecord
): PostInteractionState =>
  PostInteractionStateSchema.parse({
    post_id: post._id,
    actor_user_id: actor._id,
    liked: record?.liked ?? false,
    favorited: record?.favorited ?? false,
    like_count: Math.max(0, post.like_count),
    favorite_count: Math.max(0, post.favorite_count),
    share_count: Math.max(0, post.share_count)
  });

const findLiveInteractionRecord = (
  records: PostInteractionRecord[],
  postId: string,
  actorId: string
) =>
  records.find(
    (record) => record.post_id === postId && record.actor_user_id === actorId
  );

type LiveInteractionMutation =
  | { kind: "like"; liked: boolean }
  | { kind: "favorite"; favorited: boolean }
  | { kind: "share" };

const liveInteractionLocks = new Map<string, Promise<void>>();

const withLiveInteractionLock = async <TResult>(
  key: string,
  task: () => Promise<TResult>
) => {
  const previous = liveInteractionLocks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  const next = previous.catch(() => undefined).then(() => current);
  liveInteractionLocks.set(key, next);

  await previous.catch(() => undefined);

  try {
    return await task();
  } finally {
    release();
    if (liveInteractionLocks.get(key) === next) {
      liveInteractionLocks.delete(key);
    }
  }
};

const mutateLivePostInteraction = async (
  context: LiveCloudbaseContext,
  postId: string,
  actor: User,
  mutation: LiveInteractionMutation
) =>
  withLiveInteractionLock(`${postId}:${actor._id}`, async () => {
  const [posts, recordResult] = await Promise.all([
    readPosts(context),
    context.postInteractions
      .where({
        post_id: postId,
        actor_user_id: actor._id
      })
      .limit(1)
      .get()
  ]);
  const post = posts.find((item) => item._id === postId) ?? null;
  if (!post || !isLaunchVisiblePost(post)) {
    throw apiError("NOT_FOUND", "Post not found.", 404);
  }

  const existingRecord =
    recordResult.data
      .map(normalizePostInteractionRecord)
      .find((record): record is PostInteractionRecord => record !== null) ??
    null;
  const now = new Date().toISOString();
  const shouldTrackActorState = mutation.kind !== "share";
  let nextRecord = existingRecord;
  let shouldWriteRecord = false;
  let likeDelta = 0;
  let favoriteDelta = 0;
  let shareDelta = 0;

  if (shouldTrackActorState && !nextRecord) {
    nextRecord = PostInteractionRecordSchema.parse({
      _id: `post_interaction_${post._id}_${actor._id}`,
      post_id: post._id,
      actor_user_id: actor._id,
      liked: false,
      favorited: false,
      created_at: now,
      updated_at: now
    });
    shouldWriteRecord = true;
  }

  if (mutation.kind === "like" && nextRecord) {
    if (nextRecord.liked !== mutation.liked) {
      likeDelta = mutation.liked ? 1 : -1;
      nextRecord = {
        ...nextRecord,
        liked: mutation.liked,
        updated_at: now
      };
      shouldWriteRecord = true;
    }
  } else if (mutation.kind === "favorite" && nextRecord) {
    if (nextRecord.favorited !== mutation.favorited) {
      favoriteDelta = mutation.favorited ? 1 : -1;
      nextRecord = {
        ...nextRecord,
        favorited: mutation.favorited,
        updated_at: now
      };
      shouldWriteRecord = true;
    }
  } else if (mutation.kind === "share") {
    shareDelta = 1;
  }

  const postChanged =
    likeDelta !== 0 || favoriteDelta !== 0 || shareDelta !== 0;
  const nextPost = PostSchema.parse({
    ...post,
    like_count: Math.max(0, post.like_count + likeDelta),
    favorite_count: Math.max(0, post.favorite_count + favoriteDelta),
    share_count: Math.max(0, post.share_count + shareDelta),
    updated_at: postChanged ? now : post.updated_at
  });
  const postUpdate: Partial<Post> = {
    updated_at: nextPost.updated_at
  };

  if (likeDelta !== 0) {
    postUpdate.like_count = nextPost.like_count;
  }

  if (favoriteDelta !== 0) {
    postUpdate.favorite_count = nextPost.favorite_count;
  }

  if (shareDelta !== 0) {
    postUpdate.share_count = nextPost.share_count;
  }

  await Promise.all([
    postChanged
      ? context.posts.doc(post._id).update(postUpdate)
      : Promise.resolve(),
    shouldWriteRecord && nextRecord
      ? existingRecord
        ? context.postInteractions.doc(nextRecord._id).update({
            liked: nextRecord.liked,
            favorited: nextRecord.favorited,
            updated_at: nextRecord.updated_at
          })
        : context.postInteractions
            .doc(nextRecord._id)
            .set(toCloudbaseSetDocument(nextRecord))
      : Promise.resolve()
  ]);

  const result: unknown = buildLiveInteractionState(
    nextPost,
    actor,
    nextRecord ?? undefined
  );

  return PostInteractionStateSchema.parse(result);
  });

const buildLiveFollowState = (
  follows: UserFollowRecord[],
  followerId: string,
  followedId: string
): ProfileFollowState => ({
  follower_user_id: followerId,
  followed_user_id: followedId,
  following: follows.some(
    (record) =>
      record.follower_user_id === followerId &&
      record.followed_user_id === followedId
  ),
  follower_count: follows.filter(
    (record) => record.followed_user_id === followedId
  ).length,
  following_count: follows.filter(
    (record) => record.follower_user_id === followedId
  ).length
});

const readLiveProfileUsers = async (context: LiveCloudbaseContext) => {
  try {
    return await readUsers(context);
  } catch {
    return [];
  }
};

const userFromVisibleAuthorPost = (
  userId: string,
  posts: Post[]
): User | null => {
  const post = posts.find(
    (item) => item.author_user_id === userId && isLaunchVisiblePost(item)
  );
  if (!post) {
    return null;
  }

  const parsed = UserSchema.safeParse({
    _id: userId,
    nickname: post.author_display.nickname || userId,
    avatar_url: post.author_display.avatar_url ?? PLACEHOLDER_AVATAR_URL,
    preferred_language: post.language,
    role_flags: [],
    status: "active"
  });

  return parsed.success ? parsed.data : null;
};

const resolveLiveProfileUser = (
  userId: string,
  users: User[],
  posts: Post[]
) => {
  const liveUser = users.find((item) => item._id === userId);
  const user = liveUser ?? userFromVisibleAuthorPost(userId, posts);

  return user?.status === "active" ? user : null;
};

const buildLivePublicProfile = async (
  context: LiveCloudbaseContext,
  user: User,
  actor: User,
  posts: Post[],
  comments: Comment[],
  follows: UserFollowRecord[]
): Promise<PublicProfile> => {
  const visibleRawPosts = posts.filter(
    (post) => post.author_user_id === user._id && isLaunchVisiblePost(post)
  );
  const visiblePosts = await Promise.all(
    visibleRawPosts.map((post) => normalizePostForRead(context, post, comments))
  );
  const videoPosts = visiblePosts.filter(postHasVideoMedia);
  const followState = buildLiveFollowState(follows, actor._id, user._id);

  return {
    user: {
      _id: user._id,
      nickname: user.nickname,
      avatar_url: user.avatar_url,
      preferred_language: user.preferred_language,
      status: user.status
    },
    stats: {
      post_count: visiblePosts.length,
      video_post_count: videoPosts.length,
      follower_count: followState.follower_count,
      following_count: followState.following_count
    },
    followed_by_actor: followState.following,
    is_self: actor._id === user._id,
    posts: visiblePosts,
    video_posts: videoPosts
  };
};

const createLivePostsProvider = (
  context: LiveCloudbaseContext,
  fallbackAuth: ApiProvider["auth"],
  fallbackPosts: ApiProvider["posts"]
): ApiProvider["posts"] => ({
  ...fallbackPosts,
  async meGovernance(actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    const [posts, comments, reports, auditRecords, interactions] = await Promise.all([
      readPosts(context),
      readComments(context),
      readDiscoverReportCases(context),
      readDiscoverAuditRecords(context),
      readPostInteractions(context)
    ]);

    return DiscoverMeGovernanceSchema.parse({
      ...buildLiveUserGovernanceSummary(
        actor,
        posts,
        comments,
        reports,
        auditRecords
      ),
      liked_post_count: interactions.filter(
        (interaction) =>
          interaction.actor_user_id === actor._id && interaction.liked
      ).length,
      favorited_post_count: interactions.filter(
        (interaction) =>
          interaction.actor_user_id === actor._id && interaction.favorited
      ).length,
      unread_notification_count: 0
    } satisfies DiscoverMeGovernance);
  },
  async listAdmin(input, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const [posts, comments] = await Promise.all([
      readPosts(context),
      readComments(context)
    ]);
    const filteredPosts = posts.filter((post) => {
      const status = input.status ?? "all";
      return (
        (!input.communityId || post.community_id === input.communityId) &&
        (status === "all" ||
          post.status === status ||
          post.review_status === status) &&
        (!input.authorUserId || post.author_user_id === input.authorUserId) &&
        (!input.language || post.language === input.language) &&
        (!input.tag || post.tag_ids.includes(input.tag)) &&
        (keywordMatch(post.title, input.keyword) ||
          keywordMatch(post.content, input.keyword))
      );
    });
    const normalized = await Promise.all(
      filteredPosts.map((post) => normalizePostForRead(context, post, comments))
    );

    return paginate(normalized, input);
  },
  async updateOps(id, input, actorId) {
    const actor = await requireLiveAdminActor(fallbackAuth, actorId);
    const posts = await readPosts(context);
    const post = posts.find((item) => item._id === id);
    if (!post) {
      return null;
    }
    const previous = {
      is_pinned: post.is_pinned,
      is_featured: post.is_featured,
      is_recommended: post.is_recommended,
      is_official: post.is_official,
      ops_rank: post.ops_rank
    };
    const nextPost = PostSchema.parse({
      ...post,
      ...input,
      updated_at: new Date().toISOString()
    });
    await context.posts.doc(id).update({
      is_pinned: nextPost.is_pinned,
      is_featured: nextPost.is_featured,
      is_recommended: nextPost.is_recommended,
      is_official: nextPost.is_official,
      ops_rank: nextPost.ops_rank,
      updated_at: nextPost.updated_at
    });
    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "update_post_ops",
      target_type: "post",
      target_id: id,
      reason: input.reason ?? "Update discover post ops metadata",
      previous_state: previous,
      next_state: {
        is_pinned: nextPost.is_pinned,
        is_featured: nextPost.is_featured,
        is_recommended: nextPost.is_recommended,
        is_official: nextPost.is_official,
        ops_rank: nextPost.ops_rank
      }
    });

    return nextPost;
  },
  async listTags(actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const [tags, posts] = await Promise.all([
      readDiscoverTags(context),
      readPosts(context)
    ]);
    return paginate(
      tags.map((tag) => ({
        ...tag,
        post_count: posts.filter((post) => post.tag_ids.includes(tag._id))
          .length
      })),
      { page: 1, pageSize: tags.length || 20 }
    );
  },
  async upsertTag(id, input, actorId) {
    const actor = await requireLiveAdminActor(fallbackAuth, actorId);
    const [tags, posts] = await Promise.all([
      readDiscoverTags(context),
      readPosts(context)
    ]);
    const existing = tags.find((tag) => tag._id === id);
    const now = new Date().toISOString();
    const tag = DiscoverTagSchema.parse({
      _id: id,
      label_zh: input.label_zh,
      label_en: input.label_en,
      status: input.status ?? "active",
      post_count: posts.filter((post) => post.tag_ids.includes(id)).length,
      created_at: existing?.created_at ?? now,
      updated_at: now
    });
    await context.discoverTags.doc(id).set(toCloudbaseSetDocument(tag));
    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "upsert_tag",
      target_type: "tag",
      target_id: id,
      reason: "Maintain discover tag taxonomy",
      previous_state: existing ?? null,
      next_state: tag
    });
    return tag;
  },
  async listPublicTags(input) {
    const [tags, posts] = await Promise.all([
      readDiscoverTags(context),
      readPosts(context)
    ]);
    const filteredTags = tags
      .filter(
        (tag) =>
          tag.status === "active" &&
          (keywordMatch(tag._id, input.keyword) ||
            keywordMatch(tag.label_zh, input.keyword) ||
            keywordMatch(tag.label_en, input.keyword))
      )
      .map((tag) => ({
        ...tag,
        post_count: posts.filter((post) => post.tag_ids.includes(tag._id))
          .length
      }));

    return paginate(filteredTags, input);
  },
  async createTag(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    const id = normalizeTagId(input.label);
    if (!id) {
      throw apiError("VALIDATION_ERROR", "Tag label is required.", 400);
    }

    const [tags, posts] = await Promise.all([
      readDiscoverTags(context),
      readPosts(context)
    ]);
    const existing = tags.find((tag) => tag._id === id);
    if (existing?.status === "hidden") {
      throw apiError("CONFLICT", "Tag is hidden by moderation.", 409, {
        reason: "hidden_tag"
      });
    }
    if (existing) {
      return DiscoverTagSchema.parse({
        ...existing,
        post_count: posts.filter((post) => post.tag_ids.includes(id)).length
      });
    }

    const now = new Date().toISOString();
    const tag = DiscoverTagSchema.parse({
      _id: id,
      label_zh: input.label.trim().replace(/^#+/, ""),
      label_en: input.label.trim().replace(/^#+/, ""),
      status: "active",
      post_count: 0,
      created_at: now,
      updated_at: now
    });
    await context.discoverTags.doc(tag._id).set(toCloudbaseSetDocument(tag));
    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "create_public_tag",
      target_type: "tag",
      target_id: tag._id,
      reason: "User created discover tag",
      previous_state: null,
      next_state: tag
    });
    return tag;
  },
  async list(input) {
    const [posts, comments] = await Promise.all([
      readPosts(context),
      readComments(context)
    ]);
    const visiblePosts = sortDiscoverPosts(posts.filter(
      (post) =>
        isLaunchVisiblePost(post) &&
        (!input.communityId || post.community_id === input.communityId) &&
        (!input.tag || post.tag_ids.includes(normalizeTagId(input.tag))) &&
        (keywordMatch(post.title, input.keyword) ||
          keywordMatch(post.content, input.keyword) ||
          post.tag_ids.some((tag) => keywordMatch(tag, input.keyword)))
    ), input.sort);
    const normalized = await Promise.all(
      visiblePosts.map((post) => normalizePostForRead(context, post, comments))
    );

    return paginate(normalized, input);
  },
  async listMine(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const [posts, comments] = await Promise.all([
      readPosts(context),
      readComments(context)
    ]);
    const ownedPosts = posts.filter(
      (post) =>
        post.author_user_id === actor._id &&
        (!input.communityId || post.community_id === input.communityId)
    );
    const normalized = await Promise.all(
      ownedPosts.map((post) => normalizePostForRead(context, post, comments))
    );

    return paginate(normalized, input);
  },
  async listLiked(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const [posts, comments, interactions] = await Promise.all([
      readPosts(context),
      readComments(context),
      readPostInteractions(context)
    ]);
    const likedPostIds = new Set(
      interactions
        .filter(
          (interaction) =>
            interaction.actor_user_id === actor._id && interaction.liked
        )
        .map((interaction) => interaction.post_id)
    );
    const likedPosts = posts.filter(
      (post) =>
        likedPostIds.has(post._id) &&
        isLaunchVisiblePost(post) &&
        (!input.communityId || post.community_id === input.communityId)
    );
    const normalized = await Promise.all(
      likedPosts.map((post) => normalizePostForRead(context, post, comments))
    );

    return paginate(normalized, input);
  },
  async listFavorited(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const [posts, comments, interactions] = await Promise.all([
      readPosts(context),
      readComments(context),
      readPostInteractions(context)
    ]);
    const favoritedPostIds = new Set(
      interactions
        .filter(
          (interaction) =>
            interaction.actor_user_id === actor._id && interaction.favorited
        )
        .map((interaction) => interaction.post_id)
    );
    const favoritedPosts = posts.filter(
      (post) =>
        favoritedPostIds.has(post._id) &&
        isLaunchVisiblePost(post) &&
        (!input.communityId || post.community_id === input.communityId)
    );
    const normalized = await Promise.all(
      favoritedPosts.map((post) =>
        normalizePostForRead(context, post, comments)
      )
    );

    return paginate(normalized, input);
  },
  async listRelatedByPlace(input) {
    const [places, posts, comments] = await Promise.all([
      readPlaces(context),
      readPosts(context),
      readComments(context)
    ]);
    const place = places.find((item) => item._id === input.placeId);
    if (
      !place ||
      place.status !== "published" ||
      (input.communityId && place.community_id !== input.communityId)
    ) {
      return null;
    }

    const relatedPosts = posts.filter(
      (post) =>
        post.place_id === input.placeId &&
        post.community_id === place.community_id &&
        isLaunchVisiblePost(post)
    );
    const normalized = await Promise.all(
      relatedPosts.map((post) => normalizePostForRead(context, post, comments))
    );

    return paginate(normalized, input);
  },
  async listRelatedByEvent(input) {
    const [events, posts, comments] = await Promise.all([
      readEvents(context),
      readPosts(context),
      readComments(context)
    ]);
    const event = events.find((item) => item._id === input.eventId);
    if (
      !event ||
      !isLaunchVisibleEvent(event) ||
      (input.communityId && event.community_id !== input.communityId)
    ) {
      return null;
    }

    const relatedPosts = posts.filter(
      (post) =>
        post.event_id === input.eventId &&
        post.community_id === event.community_id &&
        isLaunchVisiblePost(post)
    );
    const normalized = await Promise.all(
      relatedPosts.map((post) => normalizePostForRead(context, post, comments))
    );

    return paginate(normalized, input);
  },
  async detail(id) {
    const [posts, comments] = await Promise.all([
      readPosts(context),
      readComments(context)
    ]);
    const post = posts.find((item) => item._id === id);

    return post && isLaunchVisiblePost(post)
      ? normalizePostForRead(context, post, comments)
      : null;
  },
  async interaction(id, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    const [posts, records] = await Promise.all([
      readPosts(context),
      readPostInteractions(context)
    ]);
    const post = posts.find((item) => item._id === id);

    if (!post || !isLaunchVisiblePost(post)) {
      throw apiError("NOT_FOUND", "Post not found.", 404);
    }

    return buildLiveInteractionState(
      post,
      actor,
      findLiveInteractionRecord(records, post._id, actor._id)
    );
  },
  async setLike(id, input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    return mutateLivePostInteraction(context, id, actor, {
      kind: "like",
      liked: input.liked
    });
  },
  async setFavorite(id, input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    return mutateLivePostInteraction(context, id, actor, {
      kind: "favorite",
      favorited: input.favorited
    });
  },
  async recordShare(id, _input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    return mutateLivePostInteraction(context, id, actor, { kind: "share" });
  },
  async profile(userId, actorId) {
    const [actor, users, posts, comments, follows, auditRecords] =
      await Promise.all([
        fallbackAuth.resolveActor(actorId),
        readLiveProfileUsers(context),
        readPosts(context),
        readComments(context),
        readUserFollows(context),
        readDiscoverAuditRecords(context)
      ]);
    const user = resolveLiveProfileUser(userId, users, posts);
    if (!user || user.status !== "active") {
      return null;
    }
    const enforcement = latestLiveUserEnforcement(auditRecords, user._id);
    if (enforcement.status === "banned") {
      return null;
    }

    return buildLivePublicProfile(
      context,
      user,
      actor,
      posts,
      comments,
      follows
    );
  },
  async setProfileFollow(userId, input, actorId) {
    const [actor, users, posts, follows, auditRecords] = await Promise.all([
      fallbackAuth.resolveActor(actorId),
      readLiveProfileUsers(context),
      readPosts(context),
      readUserFollows(context),
      readDiscoverAuditRecords(context)
    ]);
    const user = resolveLiveProfileUser(userId, users, posts);
    if (!user || user.status !== "active") {
      throw apiError("NOT_FOUND", "Profile not found.", 404);
    }
    const enforcement = latestLiveUserEnforcement(auditRecords, user._id);
    if (enforcement.status === "banned") {
      throw apiError("NOT_FOUND", "Profile not found.", 404);
    }
    if (actor._id === user._id) {
      throw apiError("CONFLICT", "Users cannot follow themselves.", 409, {
        reason: "self_follow"
      });
    }

    const existing = follows.find(
      (record) =>
        record.follower_user_id === actor._id &&
        record.followed_user_id === user._id
    );
    if (input.following && !existing) {
      const now = new Date().toISOString();
      const record = UserFollowRecordSchema.parse({
        _id: `user_follow_${actor._id}_${user._id}`,
        follower_user_id: actor._id,
        followed_user_id: user._id,
        created_at: now,
        updated_at: now
      });
      await context.userFollows
        .doc(record._id)
        .set(toCloudbaseSetDocument(record));
      follows.unshift(record);
    }
    if (!input.following && existing) {
      await context.userFollows.doc(existing._id).update({
        follower_user_id: "__deleted__",
        followed_user_id: "__deleted__",
        updated_at: new Date().toISOString()
      });
      const index = follows.findIndex((record) => record._id === existing._id);
      if (index >= 0) {
        follows.splice(index, 1);
      }
    }

    return buildLiveFollowState(follows, actor._id, user._id);
  },
  async listProfileFollowers(userId, input, actorId) {
    const [actor, users, posts, follows, auditRecords] = await Promise.all([
      fallbackAuth.resolveActor(actorId),
      readLiveProfileUsers(context),
      readPosts(context),
      readUserFollows(context),
      readDiscoverAuditRecords(context)
    ]);
    const user = resolveLiveProfileUser(userId, users, posts);
    if (!user || user.status !== "active") {
      return null;
    }
    const enforcement = latestLiveUserEnforcement(auditRecords, user._id);
    if (enforcement.status === "banned") {
      return null;
    }

    const followerUsers = follows
      .filter((record) => record.followed_user_id === userId)
      .map((record) =>
        resolveLiveProfileUser(record.follower_user_id, users, posts)
      );
    const items = followerUsers
      .filter((item): item is User => !!item && item.status === "active")
      .map((item): ProfileFollowListItem => {
        const followedByActor = follows.some(
          (record) =>
            record.follower_user_id === actor._id &&
            record.followed_user_id === item._id
        );
        const followsActor = follows.some(
          (record) =>
            record.follower_user_id === item._id &&
            record.followed_user_id === actor._id
        );

        return {
          user: {
            _id: item._id,
            nickname: item.nickname,
            avatar_url: item.avatar_url,
            preferred_language: item.preferred_language,
            status: item.status
          },
          following: followedByActor,
          followed_by_actor: followedByActor,
          follows_actor: followsActor,
          mutual: followedByActor && followsActor
        };
      });

    return paginate(items, input);
  },
  async listProfileFollowing(userId, input, actorId) {
    const [actor, users, posts, follows, auditRecords] = await Promise.all([
      fallbackAuth.resolveActor(actorId),
      readLiveProfileUsers(context),
      readPosts(context),
      readUserFollows(context),
      readDiscoverAuditRecords(context)
    ]);
    const user = resolveLiveProfileUser(userId, users, posts);
    if (!user || user.status !== "active") {
      return null;
    }
    const enforcement = latestLiveUserEnforcement(auditRecords, user._id);
    if (enforcement.status === "banned") {
      return null;
    }

    const followingUsers = follows
      .filter((record) => record.follower_user_id === userId)
      .map((record) =>
        resolveLiveProfileUser(record.followed_user_id, users, posts)
      );
    const items = followingUsers
      .filter((item): item is User => !!item && item.status === "active")
      .map((item): ProfileFollowListItem => {
        const followedByActor = follows.some(
          (record) =>
            record.follower_user_id === actor._id &&
            record.followed_user_id === item._id
        );
        const followsActor = follows.some(
          (record) =>
            record.follower_user_id === item._id &&
            record.followed_user_id === actor._id
        );

        return {
          user: {
            _id: item._id,
            nickname: item.nickname,
            avatar_url: item.avatar_url,
            preferred_language: item.preferred_language,
            status: item.status
          },
          following: followedByActor,
          followed_by_actor: followedByActor,
          follows_actor: followsActor,
          mutual: followedByActor && followsActor
        };
      });

    return paginate(items, input);
  },
  async listComments(postId, input) {
    const [posts, comments] = await Promise.all([
      readPosts(context),
      readComments(context)
    ]);
    const post = posts.find((item) => item._id === postId);

    if (!post || !isLaunchVisiblePost(post)) {
      throw apiError("NOT_FOUND", "Post not found.", 404);
    }

    return paginate(
      comments.filter(
        (comment) => comment.post_id === postId && isVisibleComment(comment)
      ),
      input
    );
  },
  async listAdminComments(input, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const comments = (await readComments(context)).filter((comment) => {
      const status = input.status ?? "all";
      return (
        (!input.postId || comment.post_id === input.postId) &&
        (status === "all" || comment.status === status) &&
        (!input.authorUserId ||
          comment.author_user_id === input.authorUserId) &&
        keywordMatch(comment.content, input.keyword)
      );
    });

    return paginate(comments, input);
  },
  async listMyComments(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const comments = (await readComments(context)).filter(
      (comment) => comment.author_user_id === actor._id
    );

    return paginate(comments, input);
  },
  async detailMyComment(id, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const comment = (await readComments(context)).find(
      (item) => item._id === id && item.author_user_id === actor._id
    );

    return comment ?? null;
  },
  async create(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "create_post");
    const now = new Date().toISOString();
    const postId = `post_${randomUUID()}`;
    const imageFileIds = input.image_file_ids ?? [];
    const fileAssets = await readFileAssets(context);
    const assets = imageFileIds.map((fileId) =>
      fileAssets.find((asset) => asset.file_id === fileId)
    );
    const hasInvalidAsset = assets.some(
      (asset) =>
        !asset ||
        asset.status !== "active" ||
        asset.visibility !== "public" ||
        asset.uploaded_by !== actor._id ||
        !asset.cloud_path.startsWith(FILE_PATH_RULES.postImages) ||
        !POST_MEDIA_BIZ_TYPES.has(asset.biz_type)
    );

    if (hasInvalidAsset) {
      throw apiError("FORBIDDEN", "Post media file access denied.", 403);
    }

    if (input.place_id) {
      const place = (await readPlaces(context)).find(
        (item) => item._id === input.place_id
      );
      if (
        !place ||
        place.status !== "published" ||
        place.community_id !== DEFAULT_COMMUNITY_ID
      ) {
        throw apiError("NOT_FOUND", "Place association not found.", 404);
      }
    }

    if (input.event_id) {
      const event = (await readEvents(context)).find(
        (item) => item._id === input.event_id
      );
      if (
        !event ||
        !isLaunchVisibleEvent(event) ||
        event.community_id !== DEFAULT_COMMUNITY_ID
      ) {
        throw apiError("NOT_FOUND", "Event association not found.", 404);
      }
    }

    const post = PostSchema.parse({
      _id: postId,
      author_user_id: actor._id,
      author_display: {
        nickname: actor.nickname,
        avatar_url: actor.avatar_url
      },
      community_id: DEFAULT_COMMUNITY_ID,
      title: input.title ?? "",
      content: input.content ?? "",
      language: input.language ?? "zh",
      tag_ids: input.tag_ids ?? [],
      location_text: input.location_text ?? null,
      image_file_ids: imageFileIds,
      image_urls: input.image_urls ?? [],
      place_id: input.place_id ?? null,
      event_id: input.event_id ?? null,
      comment_count: 0,
      like_count: 0,
      favorite_count: 0,
      share_count: 0,
      is_pinned: false,
      is_featured: false,
      is_recommended: false,
      is_official: false,
      ops_rank: 0,
      created_at: now,
      updated_at: now,
      status: "visible",
      review_status: "visible"
    });

    await context.posts.doc(post._id).set(toCloudbaseSetDocument(post));
    await Promise.all(
      assets
        .filter((asset): asset is FileAsset => !!asset)
        .map((asset) =>
          context.fileAssets.doc(asset._id).update({
            biz_id: post._id
          })
        )
    );

    return normalizePostForRead(context, post, []);
  },
  async createComment(postId, input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "create_comment");
    const posts = await readPosts(context);
    const post = posts.find((item) => item._id === postId);

    if (!post || !isLaunchVisiblePost(post)) {
      throw apiError("NOT_FOUND", "Post not found.", 404);
    }

    const comment = CommentSchema.parse({
      _id: `comment_${randomUUID()}`,
      post_id: postId,
      author_user_id: actor._id,
      author_display: {
        nickname: actor.nickname,
        avatar_url: actor.avatar_url
      },
      content: input.content,
      language: input.language,
      status: "visible",
      created_at: new Date().toISOString()
    });

    await context.comments
      .doc(comment._id)
      .set(toCloudbaseSetDocument(comment));
    await context.posts.doc(post._id).update({
      comment_count: post.comment_count + 1,
      updated_at: new Date().toISOString()
    });

    return comment;
  },
  async report(id, input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "report");
    const posts = await readPosts(context);
    const post = posts.find((item) => item._id === id);

    if (!post || !isLaunchVisiblePost(post)) {
      return null;
    }

    const nextPost = PostSchema.parse({
      ...post,
      review_status: "reported",
      updated_at: new Date().toISOString()
    });
    await context.posts.doc(id).update({
      review_status: nextPost.review_status,
      updated_at: nextPost.updated_at
    });
    await createLiveReportCase(context, {
      target_type: "post",
      post: nextPost,
      reason: input.reason,
      description: input.description,
      evidence_file_ids: input.evidence_file_ids,
      actor
    });
    return nextPost;
  },
  async reportComment(postId, commentId, input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "report");
    const [posts, comments] = await Promise.all([
      readPosts(context),
      readComments(context)
    ]);
    const post = posts.find((item) => item._id === postId);
    const comment = comments.find(
      (item) => item._id === commentId && item.post_id === postId
    );

    if (
      !post ||
      !comment ||
      !isLaunchVisiblePost(post) ||
      !isVisibleComment(comment)
    ) {
      return null;
    }

    const nextComment = CommentSchema.parse({
      ...comment,
      status: "reported"
    });
    await context.comments.doc(commentId).update({
      status: nextComment.status
    });

    return createLiveReportCase(context, {
      target_type: "comment",
      post,
      comment: nextComment,
      reason: input.reason,
      description: input.description,
      evidence_file_ids: input.evidence_file_ids,
      actor
    });
  },
  async listReportCases(input, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const reports = (await readDiscoverReportCases(context)).filter(
      (report) => {
        const status = input.status ?? "all";
        return (
          (status === "all" || report.status === status) &&
          (!input.targetType || report.target_type === input.targetType) &&
          (!input.reason || report.reason === input.reason)
        );
      }
    );
    const normalized = await Promise.all(
      reports.map((report) => normalizeLiveReportCase(context, report, true))
    );

    return paginate(normalized, input);
  },
  async listMyReportCases(input, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const reports = (await readDiscoverReportCases(context)).filter(
      (report) => report.reporter_user_id === actor._id
    );
    const normalized = await Promise.all(
      reports.map((report) => normalizeLiveReportCase(context, report, true))
    );

    return paginate(normalized, input);
  },
  async detailMyReportCase(id, actorId) {
    const actor = await fallbackAuth.resolveActor(actorId);
    await assertLiveActorAllowed(context, actor._id, "read_mine");
    const report = (await readDiscoverReportCases(context)).find(
      (item) => item._id === id && item.reporter_user_id === actor._id
    );

    return report ? normalizeLiveReportCase(context, report, true) : null;
  },
  async detailReportCase(id, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const report = (await readDiscoverReportCases(context)).find(
      (item) => item._id === id
    );

    return report ? normalizeLiveReportCase(context, report, true) : null;
  },
  async resolveReportCase(id, input, actorId) {
    const actor = await requireLiveAdminActor(fallbackAuth, actorId);
    const report = (await readDiscoverReportCases(context)).find(
      (item) => item._id === id
    );
    if (!report) {
      return null;
    }

    const now = new Date().toISOString();
    const previous = {
      status: report.status,
      handler_user_id: report.handler_user_id,
      resolution_note: report.resolution_note
    };
    const nextReport = DiscoverReportCaseSchema.parse({
      ...report,
      status: input.status,
      handler_user_id: actor._id,
      resolution_note: input.reason,
      updated_at: now,
      resolved_at: now
    });
    await context.discoverReportCases.doc(id).update({
      status: nextReport.status,
      handler_user_id: nextReport.handler_user_id,
      resolution_note: nextReport.resolution_note,
      updated_at: nextReport.updated_at,
      resolved_at: nextReport.resolved_at
    });

    const action = input.moderation_action ?? "none";
    const hasOtherOpenReport = (await readDiscoverReportCases(context)).some(
      (item) =>
        item._id !== report._id &&
        item.status === "open" &&
        item.target_type === report.target_type &&
        item.target_id === report.target_id
    );

    if (action !== "none" && report.target_type === "post") {
      const nextStatus =
        action === "restore"
          ? "visible"
          : action === "delete"
            ? "deleted"
            : "hidden";
      await context.posts.doc(report.post_id).update({
        status: nextStatus,
        review_status: nextStatus,
        updated_at: now
      });
    }

    if (
      action === "none" &&
      input.status === "rejected" &&
      report.target_type === "post" &&
      !hasOtherOpenReport
    ) {
      const targetPost = (await readPosts(context)).find(
        (post) => post._id === report.post_id
      );
      if (
        targetPost &&
        targetPost.status === "visible" &&
        targetPost.review_status === "reported"
      ) {
        await context.posts.doc(report.post_id).update({
          review_status: "visible",
          updated_at: now
        });
      }
    }

    if (
      action !== "none" &&
      report.target_type === "comment" &&
      report.comment_id
    ) {
      const nextStatus =
        action === "restore"
          ? "visible"
          : action === "delete"
            ? "deleted"
            : "hidden";
      await context.comments.doc(report.comment_id).update({
        status: nextStatus
      });
    }

    if (
      action === "none" &&
      input.status === "rejected" &&
      report.target_type === "comment" &&
      report.comment_id &&
      !hasOtherOpenReport
    ) {
      const targetComment = (await readComments(context)).find(
        (comment) => comment._id === report.comment_id
      );
      if (targetComment?.status === "reported") {
        await context.comments.doc(report.comment_id).update({
          status: "visible"
        });
      }
    }

    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "resolve_report",
      target_type: "report",
      target_id: report._id,
      reason: input.reason,
      previous_state: previous,
      next_state: {
        status: nextReport.status,
        handler_user_id: nextReport.handler_user_id,
        resolution_note: nextReport.resolution_note,
        moderation_action: action
      }
    });

    return normalizeLiveReportCase(context, nextReport, true);
  },
  async listAuditRecords(input, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const records = (await readDiscoverAuditRecords(context)).filter(
      (record) =>
        (!input.targetType || record.target_type === input.targetType) &&
        (!input.targetId || record.target_id === input.targetId) &&
        (!input.actorUserId || record.actor_user_id === input.actorUserId)
    );

    return paginate(records, input);
  },
  async analytics(input, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const windowDays = input.windowDays ?? 30;
    const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
    const inWindow = (value: string) => Date.parse(value) >= cutoff;
    const [posts, comments, reports] = await Promise.all([
      readPosts(context),
      readComments(context),
      readDiscoverReportCases(context)
    ]);
    const windowPosts = posts.filter((post) => inWindow(post.created_at));
    const windowComments = comments.filter((comment) =>
      inWindow(comment.created_at)
    );
    const windowReports = reports.filter((report) =>
      inWindow(report.created_at)
    );
    const authorIds = new Set([
      ...windowPosts.map((post) => post.author_user_id),
      ...windowComments.map((comment) => comment.author_user_id)
    ]);
    const resolvedDurations = windowReports
      .filter((report) => report.resolved_at)
      .map(
        (report) =>
          (Date.parse(report.resolved_at as string) -
            Date.parse(report.created_at)) /
          (60 * 60 * 1000)
      )
      .filter((hours) => Number.isFinite(hours) && hours >= 0);
    const countBy = <TItem>(
      items: TItem[],
      getKey: (item: TItem) => string | null
    ) =>
      [...items.reduce((map, item) => {
        const key = getKey(item);
        if (key) {
          map.set(key, (map.get(key) ?? 0) + 1);
        }
        return map;
      }, new Map<string, number>())]
        .sort((left, right) => right[1] - left[1])
        .slice(0, 5);

    return {
      window_days: windowDays,
      post_count: windowPosts.length,
      comment_count: windowComments.length,
      report_count: windowReports.length,
      open_report_count: windowReports.filter(
        (report) => report.status === "open"
      ).length,
      pending_workload_count:
        reports.filter((report) => report.status === "open").length +
        comments.filter((comment) => comment.status === "reported").length +
        posts.filter((post) => post.review_status === "reported").length,
      average_moderation_hours: resolvedDurations.length
        ? resolvedDurations.reduce((sum, value) => sum + value, 0) /
          resolvedDurations.length
        : null,
      engagement: {
        like_count: windowPosts.reduce((sum, post) => sum + post.like_count, 0),
        favorite_count: windowPosts.reduce(
          (sum, post) => sum + post.favorite_count,
          0
        ),
        share_count: windowPosts.reduce(
          (sum, post) => sum + post.share_count,
          0
        )
      },
      active_authors: [...authorIds]
        .map((userId) => ({
          user_id: userId,
          post_count: windowPosts.filter(
            (post) => post.author_user_id === userId
          ).length,
          comment_count: windowComments.filter(
            (comment) => comment.author_user_id === userId
          ).length
        }))
        .sort(
          (left, right) =>
            right.post_count +
            right.comment_count -
            (left.post_count + left.comment_count)
        )
        .slice(0, 5),
      popular_places: countBy(windowPosts, (post) => post.place_id).map(
        ([place_id, post_count]) => ({ place_id, post_count })
      ),
      popular_events: countBy(windowPosts, (post) => post.event_id).map(
        ([event_id, post_count]) => ({ event_id, post_count })
      )
    };
  },
  async moderateComment(id, input, actorId) {
    const actor = await requireLiveAdminActor(fallbackAuth, actorId);
    const comment = (await readComments(context)).find(
      (item) => item._id === id
    );
    if (!comment) {
      return null;
    }
    const previous = { status: comment.status };
    const nextComment = CommentSchema.parse({
      ...comment,
      status: input.status
    });

    await context.comments.doc(id).update({
      status: nextComment.status
    });
    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "moderate_comment",
      target_type: "comment",
      target_id: id,
      reason: input.reason ?? null,
      previous_state: previous,
      next_state: { status: nextComment.status }
    });

    return nextComment;
  },
  async listGovernanceUsers(input, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const [posts, comments, reports, auditRecords] = await Promise.all([
      readPosts(context),
      readComments(context),
      readDiscoverReportCases(context),
      readDiscoverAuditRecords(context)
    ]);
    const users = await Promise.all(
      collectLiveGovernanceUserIds(posts, comments, reports, auditRecords).map(
        (id) => resolveLiveGovernanceUser(fallbackAuth, id)
      )
    );
    const summaries = users
      .map((user) =>
        buildLiveUserGovernanceSummary(
          user,
          posts,
          comments,
          reports,
          auditRecords
        )
      )
      .filter((summary) => {
        const status = input.status ?? "all";
        return (
          (status === "all" ||
            summary.enforcement.status === status ||
            summary.user.status === status) &&
          (keywordMatch(summary.user.nickname, input.keyword) ||
            keywordMatch(summary.user.phone ?? "", input.keyword) ||
            keywordMatch(summary.user._id, input.keyword))
        );
      });

    return paginate(summaries, input);
  },
  async detailGovernanceUser(id, actorId) {
    await requireLiveAdminActor(fallbackAuth, actorId);
    const [posts, comments, reports, auditRecords] = await Promise.all([
      readPosts(context),
      readComments(context),
      readDiscoverReportCases(context),
      readDiscoverAuditRecords(context)
    ]);
    const knownUserIds = collectLiveGovernanceUserIds(
      posts,
      comments,
      reports,
      auditRecords
    );

    if (!knownUserIds.includes(id)) {
      return null;
    }

    const user = await resolveLiveGovernanceUser(fallbackAuth, id);
    return buildLiveUserGovernanceDetail(
      context,
      user,
      posts,
      comments,
      reports,
      auditRecords
    );
  },
  async enforceUser(id, input, actorId) {
    const actor = await requireLiveAdminActor(fallbackAuth, actorId);
    const [posts, comments, reports, auditRecords] = await Promise.all([
      readPosts(context),
      readComments(context),
      readDiscoverReportCases(context),
      readDiscoverAuditRecords(context)
    ]);
    const knownUserIds = collectLiveGovernanceUserIds(
      posts,
      comments,
      reports,
      auditRecords
    );

    if (!knownUserIds.includes(id)) {
      return null;
    }

    const user = await resolveLiveGovernanceUser(fallbackAuth, id);
    if (user.role_flags.includes("system_admin") && actor._id !== user._id) {
      throw apiError("FORBIDDEN", "System admin enforcement denied.", 403);
    }

    const previous = latestLiveUserEnforcement(auditRecords, id);
    const bannedHiddenPosts =
      input.status === "banned"
        ? await hideLiveBannedUserPosts(context, posts, id)
        : [];
    const restoredPostIds =
      input.status === "active" && previous.status === "banned"
        ? await restoreLiveBannedUserPosts(context, posts, auditRecords, id)
        : [];
    const now = new Date().toISOString();
    const nextState = UserEnforcementStateSchema.parse({
      status: input.status,
      reason: input.reason,
      notes: input.notes ?? null,
      expires_at: input.expires_at ?? null,
      updated_at: now,
      updated_by: actor._id
    });

    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "enforce_user",
      target_type: "user",
      target_id: id,
      reason: input.reason,
      previous_state: previous,
      next_state: {
        ...nextState,
        ...(bannedHiddenPosts.length
          ? { banned_hidden_posts: bannedHiddenPosts }
          : {}),
        ...(restoredPostIds.length
          ? { restored_post_ids: restoredPostIds }
          : {})
      }
    });

    const updatedPosts =
      bannedHiddenPosts.length || restoredPostIds.length
        ? await readPosts(context)
        : posts;

    return buildLiveUserGovernanceDetail(
      context,
      user,
      updatedPosts,
      comments,
      reports,
      await readDiscoverAuditRecords(context)
    );
  },
  async moderate(id, input, actorId) {
    const actor = await requireLiveAdminActor(fallbackAuth, actorId);
    const posts = await readPosts(context);
    const post = posts.find((item) => item._id === id);

    if (!post) {
      return null;
    }

    const nextPost = PostSchema.parse({
      ...post,
      review_status: input.review_status,
      status: input.review_status,
      updated_at: new Date().toISOString()
    });
    await context.posts.doc(id).update({
      review_status: nextPost.review_status,
      status: nextPost.status,
      updated_at: nextPost.updated_at
    });
    await addLiveAuditRecord(context, {
      actor_user_id: actor._id,
      action: "moderate_post",
      target_type: "post",
      target_id: id,
      reason: input.reason ?? null,
      previous_state: {
        status: post.status,
        review_status: post.review_status
      },
      next_state: {
        status: nextPost.status,
        review_status: nextPost.review_status
      }
    });
    return nextPost;
  }
});

const createLiveFilesProvider = (
  context: LiveCloudbaseContext
): ApiProvider["files"] => ({
  async createUploadRequest(input) {
    const cloud_path = `${input.target_prefix}${input.biz_id}/${randomUUID()}-${sanitizeFileName(input.file_name, "upload")}`;
    return {
      cloud_path,
      upload_url: `https://example.com/upload/${encodeURIComponent(cloud_path)}`,
      expires_in: 900
    };
  },
  async complete(input, actorId = "user_001") {
    const asset = FileAssetSchema.parse({
      _id: `file_${randomUUID()}`,
      file_id: input.file_id,
      cloud_path: input.cloud_path,
      visibility: input.visibility,
      biz_type: input.biz_type,
      biz_id: input.biz_id,
      uploaded_by: actorId,
      status: "active"
    } satisfies FileAsset);

    const urlsByFileId = await getCloudbaseTempFileUrls(context, [
      asset.file_id
    ]);
    if (!urlsByFileId.has(asset.file_id)) {
      throw apiError(
        "VALIDATION_ERROR",
        "Uploaded file does not exist in CloudBase storage.",
        400,
        {
          file_id: asset.file_id
        }
      );
    }

    await context.fileAssets.doc(asset._id).set(toCloudbaseSetDocument(asset));
    return asset;
  },
  async privateUrl(input, actorId) {
    const actor = await createMockProvider().auth.resolveActor(actorId);
    const asset = (await readFileAssets(context)).find(
      (item) => item.file_id === input.file_id && item.status === "active"
    );

    if (!asset) {
      throw apiError("NOT_FOUND", "File not found.", 404);
    }

    if (
      asset.visibility === "private" &&
      asset.uploaded_by !== actor._id &&
      !isAdmin(actor)
    ) {
      throw apiError("FORBIDDEN", "File access denied.", 403);
    }

    const urlsByFileId = await getCloudbaseTempFileUrls(context, [
      asset.file_id
    ]);
    return {
      temp_url:
        urlsByFileId.get(asset.file_id) ??
        `https://example.com/temp/${encodeURIComponent(asset.file_id)}`,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
  },
  async uploadPostMedia(input, actorId = "user_001") {
    const cloudPath = `${FILE_PATH_RULES.postImages}_pending/${actorId}/${randomUUID()}-${sanitizeFileName(input.file_name, "post-media")}`;
    const uploadResult = await (
      context.app as unknown as {
        uploadFile(input: {
          cloudPath: string;
          fileContent: Buffer;
        }): Promise<{ fileID?: string; fileId?: string }>;
      }
    ).uploadFile({
      cloudPath,
      fileContent: input.buffer
    });
    const fileId =
      uploadResult.fileID ??
      uploadResult.fileId ??
      `cloud://${getCloudbaseEnvId()}/${cloudPath}`;
    const asset = FileAssetSchema.parse({
      _id: `file_${randomUUID()}`,
      file_id: fileId,
      cloud_path: cloudPath,
      visibility: "public",
      biz_type: input.kind === "video" ? "post_video" : "post_image",
      biz_id: "__pending_post_media__",
      uploaded_by: actorId,
      status: "active"
    } satisfies FileAsset);

    await context.fileAssets.doc(asset._id).set(toCloudbaseSetDocument(asset));
    return asset;
  },
  async uploadReportEvidence(input, actorId = "user_001") {
    const bizId = input.biz_id ?? `pending_report_${randomUUID()}`;
    const cloudPath = `${FILE_PATH_RULES.reports}${bizId}/${randomUUID()}-${sanitizeFileName(input.file_name, "report-evidence")}`;
    const uploadResult = await (
      context.app as unknown as {
        uploadFile(input: {
          cloudPath: string;
          fileContent: Buffer;
        }): Promise<{ fileID?: string; fileId?: string }>;
      }
    ).uploadFile({
      cloudPath,
      fileContent: input.buffer
    });
    const fileId =
      uploadResult.fileID ??
      uploadResult.fileId ??
      `cloud://${getCloudbaseEnvId()}/${cloudPath}`;
    const asset = FileAssetSchema.parse({
      _id: `file_${randomUUID()}`,
      file_id: fileId,
      cloud_path: cloudPath,
      visibility: "private",
      biz_type: "report_evidence",
      biz_id: bizId,
      uploaded_by: actorId,
      status: "active"
    } satisfies FileAsset);

    await context.fileAssets.doc(asset._id).set(toCloudbaseSetDocument(asset));
    return asset;
  }
});

export const createCloudbaseProvider = (): ApiProvider => {
  const fallback = createMockProvider();
  const liveContext = createLiveContext();

  if (!liveContext) {
    return fallback;
  }

  const auth = createLiveAuthProvider(liveContext, fallback.auth);

  return {
    ...fallback,
    auth,
    events: createLiveEventsProvider(liveContext, auth),
    places: createLivePlacesProvider(liveContext),
    posts: createLivePostsProvider(liveContext, auth, fallback.posts),
    files: createLiveFilesProvider(liveContext)
  };
};
