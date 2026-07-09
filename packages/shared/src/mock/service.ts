import type {
  AuthSession,
  Comment,
  DiscoverAuditRecord,
  DiscoverTag,
  DiscoverMeGovernance,
  DiscoverReportCase,
  DiscoverUserGovernanceDetail,
  DiscoverUserGovernanceSummary,
  Event,
  EventAdminListItem,
  EventAdminRegistrationRow,
  EventRegistration,
  EventTicket,
  FileAsset,
  Notification,
  Place,
  PlaceDetail,
  PlaceGalleryMedia,
  PlaceListItem,
  Post,
  PostInteractionRecord,
  PostInteractionState,
  ProfileFollowListItem,
  ProfileFollowState,
  PublicProfile,
  UserFollowRecord,
  UserEnforcementState,
  User
} from "../types/entities";
import { POST_CONTENT_STATUSES, type ApiErrorCode } from "../enums";
import { postHasVideoMedia } from "../media";
import type { MockDataset } from "./data";
import { FILE_PATH_RULES } from "../schemas/files";
import { PLACE_TOP_LEVEL_CATEGORIES } from "../schemas/place-categories";

import { createMockDataset } from "./data";

interface PageParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  communityId?: string;
  category?: string;
  tag?: string;
  recommended?: boolean;
  sort?: "recommended" | "name" | "latest" | "likes" | "favorites" | "comments";
  authorUserId?: string;
  language?: "zh" | "en";
  status?: string;
  postId?: string;
  targetType?: string;
  targetId?: string;
  actorUserId?: string;
  reason?: string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const paginate = <TItem>(
  items: TItem[],
  params: PageParams = {}
): { items: TItem[]; page: number; pageSize: number; total: number } => {
  const page = params.page ?? DEFAULT_PAGE;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const start = (page - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length
  };
};

const keywordMatch = (value: string | null | undefined, keyword?: string) => {
  if (!keyword) {
    return true;
  }

  return (value ?? "").toLowerCase().includes(keyword.toLowerCase());
};

const normalizeTagId = (value: string) =>
  value
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, "-")
    .toLowerCase();

const idFrom = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 8)}`;

const shortAddress = (value: string) =>
  value.split("，")[0]?.split(",")[0] ?? value;

const sortPlaces = (items: Place[], sort: PageParams["sort"]) => {
  if (sort === "name") {
    return [...items].sort((left, right) =>
      left.name_en.localeCompare(right.name_en)
    );
  }

  return [...items].sort((left, right) => {
    if (left.is_recommended !== right.is_recommended) {
      return left.is_recommended ? -1 : 1;
    }

    if (left.recommended_rank !== right.recommended_rank) {
      return left.recommended_rank - right.recommended_rank;
    }

    return left.name_en.localeCompare(right.name_en);
  });
};

const discoverSortValue = (
  post: Post,
  sort: PageParams["sort"] = "latest"
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

const sortDiscoverPosts = (items: Post[], sort: PageParams["sort"]) =>
  [...items].sort((left, right) => {
    if (left.is_pinned !== right.is_pinned) {
      return left.is_pinned ? -1 : 1;
    }

    const valueDelta = discoverSortValue(right, sort) - discoverSortValue(left, sort);
    if (valueDelta !== 0) {
      return valueDelta;
    }

    return Date.parse(right.created_at) - Date.parse(left.created_at);
  });

const sortPlacesForMapMarkers = (items: Place[]) =>
  [...items].sort((left, right) => {
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

const hasUsableCoordinates = (place: Pick<Place, "location">) => {
  const { latitude, longitude } = place.location;

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

const toPlaceListItem = (place: Place): PlaceListItem => ({
  _id: place._id,
  name_zh: place.name_zh,
  name_en: place.name_en,
  cover_url: place.cover_url,
  category_level_1: place.category_level_1,
  category_level_2: place.category_level_2,
  short_address_zh: shortAddress(place.address_zh),
  short_address_en: shortAddress(place.address_en),
  summary_zh: place.intro_zh,
  summary_en: place.intro_en,
  tag_ids: place.tag_ids,
  is_recommended: place.is_recommended,
  recommended_reason_zh: place.recommended_reason_zh,
  recommended_reason_en: place.recommended_reason_en,
  supports_navigation: place.supports_navigation
});

const mockPublicFileUrls: Record<string, string> = {
  "public/places/place_001/1.jpg":
    "https://images.unsplash.com/photo-1494526585095-c41746248156",
  "public/places/place_002/1.jpg":
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb"
};

const publicFileUrl = (cloudPath: string) =>
  mockPublicFileUrls[cloudPath] ??
  `https://example.com/${cloudPath.replace(/^\/+/, "")}`;

const sanitizeFileName = (fileName: string, fallback: string) =>
  fileName.replace(/[^\w.-]+/g, "-").replace(/^-+/, "") || fallback;

export class MockServiceError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export const isMockServiceError = (error: unknown): error is MockServiceError =>
  error instanceof MockServiceError;

const mockError = (
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: unknown
) => new MockServiceError(code, message, status, details);

const isAdmin = (user: User) =>
  user.role_flags.includes("community_admin") ||
  user.role_flags.includes("system_admin");

export const PENDING_PLACE_GALLERY_BIZ_ID = "__pending_place_gallery__";
export const PENDING_EVENT_COVER_BIZ_ID = "__pending_event_cover__";

const isLaunchVisibleEvent = (event: Event) =>
  event.review_status === "approved" && event.publish_status === "published";

const isActiveRegistration = (registration: EventRegistration) =>
  !["cancelled", "closed"].includes(registration.registration_status);

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

const isLaunchVisiblePost = (post: Post) =>
  post.status === "visible" &&
  !["hidden", "deleted"].includes(post.review_status);

const isVisibleComment = (comment: Comment) =>
  comment.status === "visible" || comment.status === "reported";

const POST_MEDIA_BIZ_TYPES = new Set([
  "post_image",
  "post_video",
  "post_media"
]);

const toPlaceGalleryMedia = (
  place: Place,
  fileAssets: FileAsset[]
): PlaceGalleryMedia[] => {
  const activeGalleryAssets = new Map(
    fileAssets
      .filter(
        (asset) =>
          asset.biz_type === "place_gallery" &&
          asset.biz_id === place._id &&
          asset.visibility === "public" &&
          asset.status === "active"
      )
      .map((asset) => [asset.file_id, asset])
  );

  return place.gallery_file_ids
    .map((fileId, index) => {
      const asset = activeGalleryAssets.get(fileId);
      if (!asset) {
        return null;
      }

      return {
        file_id: asset.file_id,
        cloud_path: asset.cloud_path,
        url: publicFileUrl(asset.cloud_path),
        alt_zh: `${place.name_zh} 图集 ${index + 1}`,
        alt_en: `${place.name_en} gallery ${index + 1}`
      };
    })
    .filter((item): item is PlaceGalleryMedia => item !== null);
};

const toPlaceDetail = (
  place: Place,
  fileAssets: FileAsset[] = []
): PlaceDetail => {
  const gallery_media = toPlaceGalleryMedia(place, fileAssets);

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
      summary_zh: place.recommended_reason_zh ?? place.intro_zh,
      summary_en: place.recommended_reason_en ?? place.intro_en
    }
  };
};

export const createMockService = (seed?: Partial<MockDataset>) => {
  const state: MockDataset = {
    ...createMockDataset(),
    ...seed,
    postInteractions: seed?.postInteractions ?? createMockDataset().postInteractions,
    userFollows: seed?.userFollows ?? createMockDataset().userFollows,
    discoverTags: seed?.discoverTags ?? createMockDataset().discoverTags
  };

  const findUser = (userId?: string) => {
    const user = state.users.find(
      (item) => item._id === (userId ?? "user_001")
    );

    if (!user || user.status !== "active") {
      return null;
    }

    return user;
  };

  const requireUser = (userId?: string) => {
    const user = findUser(userId);
    if (!user) {
      throw mockError("UNAUTHORIZED", "Invalid actor.", 401);
    }
    return user;
  };

  const createSession = (user: User): AuthSession => ({
    user,
    token: `mock-token-${user._id}`
  });

  const requireAdminUser = (actorId?: string) => {
    const actor = requireUser(actorId);
    if (!isAdmin(actor)) {
      throw mockError("FORBIDDEN", "Insufficient permission.", 403);
    }
    return actor;
  };

  const ensureUserEnforcement = (userId: string): UserEnforcementState => {
    const existing = state.userEnforcements[userId];
    if (existing) {
      return existing;
    }

    const next: UserEnforcementState = {
      status: "active",
      reason: null,
      notes: null,
      expires_at: null,
      updated_at: null,
      updated_by: null
    };
    state.userEnforcements[userId] = next;
    return next;
  };

  const getEffectiveUserEnforcement = (
    userId: string
  ): UserEnforcementState => {
    const enforcement = ensureUserEnforcement(userId);
    if (
      enforcement.status !== "active" &&
      enforcement.expires_at &&
      Date.parse(enforcement.expires_at) <= Date.now()
    ) {
      const next: UserEnforcementState = {
        status: "active",
        reason: null,
        notes: enforcement.notes,
        expires_at: null,
        updated_at: new Date().toISOString(),
        updated_by: enforcement.updated_by
      };
      state.userEnforcements[userId] = next;
      return next;
    }

    return enforcement;
  };

  const assertActorAllowed = (
    actor: User,
    action: "create_post" | "create_comment" | "report" | "read_mine"
  ) => {
    const enforcement = getEffectiveUserEnforcement(actor._id);
    const blockedByMuted =
      enforcement.status === "muted" &&
      (action === "create_post" || action === "create_comment");
    const blockedByBanned =
      enforcement.status === "banned" &&
      ["create_post", "create_comment", "report", "read_mine"].includes(action);

    if (!blockedByMuted && !blockedByBanned) {
      return;
    }

    throw mockError("FORBIDDEN", "User enforcement blocks this action.", 403, {
      enforcement_status: enforcement.status,
      action
    });
  };

  const addNotification = (input: {
    user_id: string;
    title: string;
    body: string;
    target_type?: Notification["target_type"];
    post_id?: string | null;
    comment_id?: string | null;
    place_id?: string | null;
    event_id?: string | null;
    report_id?: string | null;
  }) => {
    const notification: Notification = {
      _id: idFrom("notification"),
      user_id: input.user_id,
      title: input.title,
      body: input.body,
      target_type: input.target_type ?? null,
      post_id: input.post_id ?? null,
      comment_id: input.comment_id ?? null,
      place_id: input.place_id ?? null,
      event_id: input.event_id ?? null,
      report_id: input.report_id ?? null,
      status: "unread",
      created_at: new Date().toISOString()
    };
    state.notifications.unshift(notification);
    return notification;
  };

  const addEnforcementNotification = (
    user: User,
    enforcement: UserEnforcementState
  ) => {
    const reasonText = enforcement.reason ? `原因：${enforcement.reason}` : "";
    const copy: Record<
      UserEnforcementState["status"],
      { title: string; body: string }
    > = {
      active: {
        title: "账号状态已恢复",
        body: "你的账号治理状态已恢复为正常。"
      },
      warned: {
        title: "社区提醒",
        body: `你的账号收到一条社区提醒。${reasonText}`
      },
      muted: {
        title: "账号已被禁言",
        body: `你暂时不能发布帖子或评论。${reasonText}`
      },
      banned: {
        title: "账号已被封禁",
        body: `你暂时不能发布、评论、举报或查看个人内容。${reasonText}`
      }
    };
    addNotification({
      user_id: user._id,
      title: copy[enforcement.status].title,
      body: copy[enforcement.status].body,
      target_type: "user"
    });
  };

  const addAuditRecord = (input: {
    actor_user_id: string;
    action: string;
    target_type: DiscoverAuditRecord["target_type"];
    target_id: string;
    reason?: string | null;
    previous_state?: Record<string, unknown> | null;
    next_state?: Record<string, unknown> | null;
  }) => {
    const record: DiscoverAuditRecord = {
      _id: idFrom("audit"),
      community_id: "tongzilin",
      actor_user_id: input.actor_user_id,
      action: input.action,
      target_type: input.target_type,
      target_id: input.target_id,
      reason: input.reason ?? null,
      previous_state: input.previous_state ?? null,
      next_state: input.next_state ?? null,
      created_at: new Date().toISOString()
    };
    state.auditRecords.unshift(record);
    return record;
  };

  const normalizeReportCase = (
    report: DiscoverReportCase,
    includeEvidenceUrls = false
  ): DiscoverReportCase => {
    const evidence = report.evidence_file_ids
      .map((fileId) =>
        state.fileAssets.find(
          (asset) => asset.file_id === fileId && asset.status === "active"
        )
      )
      .filter((asset): asset is FileAsset => !!asset)
      .map((asset) => ({
        file_id: asset.file_id,
        cloud_path: asset.cloud_path,
        visibility: asset.visibility,
        ...(includeEvidenceUrls
          ? { temp_url: `https://example.com/temp/${asset.file_id}` }
          : {})
      }));

    return {
      ...report,
      evidence
    };
  };

  const assertReportEvidenceAccess = (
    evidenceFileIds: string[],
    actor: User
  ) => {
    for (const fileId of evidenceFileIds) {
      const asset = state.fileAssets.find(
        (item) => item.file_id === fileId && item.status === "active"
      );

      if (
        !asset ||
        asset.visibility !== "private" ||
        asset.biz_type !== "report_evidence" ||
        !asset.cloud_path.startsWith(FILE_PATH_RULES.reports) ||
        (asset.uploaded_by !== actor._id && !isAdmin(actor))
      ) {
        throw mockError("FORBIDDEN", "Report evidence access denied.", 403);
      }
    }
  };

  const createReportCase = (input: {
    target_type: "post" | "comment";
    post: Post;
    comment?: Comment;
    reason: string;
    description?: string;
    evidence_file_ids?: string[];
    actor: User;
  }) => {
    const evidenceFileIds = input.evidence_file_ids ?? [];
    assertReportEvidenceAccess(evidenceFileIds, input.actor);

    const now = new Date().toISOString();
    const report: DiscoverReportCase = {
      _id: idFrom("report"),
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
    };
    state.reportCases.unshift(report);

    for (const fileId of evidenceFileIds) {
      const asset = state.fileAssets.find((item) => item.file_id === fileId);
      if (asset) {
        asset.biz_id = report._id;
      }
    }

    return normalizeReportCase(report);
  };

  const buildUserGovernanceSummary = (
    user: User
  ): DiscoverUserGovernanceSummary => {
    const userReports = state.reportCases.filter(
      (report) => report.reporter_user_id === user._id
    );
    const userAudit = state.auditRecords.filter(
      (record) => record.target_type === "user" && record.target_id === user._id
    );

    return {
      user,
      enforcement: getEffectiveUserEnforcement(user._id),
      post_count: state.posts.filter((post) => post.author_user_id === user._id)
        .length,
      comment_count: state.comments.filter(
        (comment) => comment.author_user_id === user._id
      ).length,
      report_count: userReports.length,
      violation_count: userAudit.length
    };
  };

  const buildUserGovernanceDetail = (
    user: User
  ): DiscoverUserGovernanceDetail => ({
    ...buildUserGovernanceSummary(user),
    posts: state.posts
      .filter((post) => post.author_user_id === user._id)
      .map((post) => post),
    comments: state.comments.filter(
      (comment) => comment.author_user_id === user._id
    ),
    reports: state.reportCases
      .filter(
        (report) =>
          report.reporter_user_id === user._id ||
          state.posts.some(
            (post) =>
              post._id === report.post_id && post.author_user_id === user._id
          )
      )
      .map((report) => normalizeReportCase(report, true)),
    audit_records: state.auditRecords.filter(
      (record) =>
        record.target_id === user._id || record.actor_user_id === user._id
    )
  });

  const buildMeGovernance = (user: User): DiscoverMeGovernance => ({
    ...buildUserGovernanceSummary(user),
    unread_notification_count: state.notifications.filter(
      (notification) =>
        notification.user_id === user._id && notification.status === "unread"
    ).length
  });

  const hideBannedUserPosts = (userId: string) => {
    const hiddenPosts = state.posts
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

    for (const hiddenPost of hiddenPosts) {
      const post = state.posts.find((item) => item._id === hiddenPost._id);
      if (post) {
        post.status = "hidden";
        post.review_status = "hidden";
        post.updated_at = now;
      }
    }

    return hiddenPosts;
  };

  const restoreBannedUserPosts = (userId: string) => {
    const latestBan = state.auditRecords.find(
      (record) =>
        record.action === "enforce_user" &&
        record.target_type === "user" &&
        record.target_id === userId &&
        (record.next_state as { status?: unknown } | null)?.status === "banned"
    );
    const hiddenPosts = Array.isArray(
      (
        latestBan?.next_state as {
          banned_hidden_posts?: unknown;
        } | null
      )?.banned_hidden_posts
    )
      ? ((
          latestBan?.next_state as {
            banned_hidden_posts: Array<{
              _id?: unknown;
              status?: unknown;
              review_status?: unknown;
            }>;
          }
        ).banned_hidden_posts ?? [])
      : [];
    const restoredPostIds: string[] = [];
    const now = new Date().toISOString();

    for (const hiddenPost of hiddenPosts) {
      if (
        typeof hiddenPost._id !== "string" ||
        !POST_CONTENT_STATUSES.includes(hiddenPost.status as any) ||
        !POST_CONTENT_STATUSES.includes(hiddenPost.review_status as any)
      ) {
        continue;
      }

      const post = state.posts.find((item) => item._id === hiddenPost._id);
      if (
        post &&
        post.author_user_id === userId &&
        post.status === "hidden" &&
        post.review_status === "hidden"
      ) {
        post.status = hiddenPost.status as Post["status"];
        post.review_status = hiddenPost.review_status as Post["review_status"];
        post.updated_at = now;
        restoredPostIds.push(post._id);
      }
    }

    return restoredPostIds;
  };

  return {
    auth: {
      login(input: {
        mock_user_id?: string;
        preferred_language?: "zh" | "en";
      }) {
        const user = requireUser(input.mock_user_id);
        if (input.preferred_language) {
          user.preferred_language = input.preferred_language;
        }

        return createSession(user);
      },
      me(userId?: string) {
        return createSession(requireUser(userId));
      }
    },
    events: {
      list(params: PageParams = {}) {
        const events = state.events.filter(
          (event) =>
            isLaunchVisibleEvent(event) &&
            (!params.communityId ||
              event.community_id === params.communityId) &&
            (keywordMatch(event.title_zh, params.keyword) ||
              keywordMatch(event.title_en, params.keyword) ||
              keywordMatch(event.summary_zh, params.keyword) ||
              keywordMatch(event.summary_en, params.keyword))
        );

        return paginate(events, params);
      },
      listAdmin() {
        return paginate(
          state.events.map((event) =>
            toEventAdminListItem(event, state.registrations)
          ),
          { pageSize: state.events.length || 20 }
        );
      },
      detail(id: string) {
        const event = state.events.find((item) => item._id === id);
        return event && isLaunchVisibleEvent(event) ? event : null;
      },
      listRegistrationsForAdmin(eventId: string) {
        const event = state.events.find((item) => item._id === eventId);
        if (!event) {
          return null;
        }

        return state.registrations
          .filter((registration) => registration.event_id === eventId)
          .map((registration) =>
            toEventAdminRegistrationRow(
              registration,
              state.tickets.find(
                (ticket) => ticket._id === registration.ticket_id
              )
            )
          );
      },
      createRegistration(
        eventId: string,
        input: {
          contact_name: string;
          contact_phone: string;
          attendee_count: number;
          source_channel: string;
        },
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        const event = state.events.find((item) => item._id === eventId);

        if (!event || !isLaunchVisibleEvent(event)) {
          throw mockError("NOT_FOUND", "Event not found.", 404);
        }

        const now = Date.now();

        if (new Date(event.end_time).getTime() <= now) {
          throw mockError("CONFLICT", "Event has ended.", 409, {
            reason: "event_ended"
          });
        }

        if (new Date(event.signup_deadline).getTime() <= now) {
          throw mockError("CONFLICT", "Event signup is closed.", 409, {
            reason: "signup_deadline_passed"
          });
        }

        const hasActiveRegistration = state.registrations.some(
          (registration) =>
            registration.event_id === eventId &&
            registration.user_id === actor._id &&
            isActiveRegistration(registration)
        );

        if (hasActiveRegistration) {
          throw mockError("CONFLICT", "Registration already exists.", 409, {
            reason: "already_registered"
          });
        }

        const confirmedAttendees = state.registrations
          .filter(
            (registration) =>
              registration.event_id === eventId &&
              isActiveRegistration(registration)
          )
          .reduce((sum, registration) => sum + registration.attendee_count, 0);

        if (confirmedAttendees + input.attendee_count > event.capacity) {
          throw mockError("CONFLICT", "Event capacity is full.", 409, {
            reason: "capacity_exceeded",
            remaining: Math.max(event.capacity - confirmedAttendees, 0)
          });
        }

        const ticketId = idFrom("ticket");
        const registration: EventRegistration = {
          _id: idFrom("reg"),
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

        state.registrations.unshift(registration);
        state.tickets.unshift(ticket);

        return { registration, ticket };
      },
      listMyRegistrations(actorId?: string) {
        const actor = requireUser(actorId);
        return state.registrations.filter(
          (registration) => registration.user_id === actor._id
        );
      },
      getTicketByRegistration(registrationId: string, actorId?: string) {
        const actor = requireUser(actorId);
        const registration = state.registrations.find(
          (item) => item._id === registrationId
        );

        if (!registration) {
          return null;
        }

        if (registration.user_id !== actor._id && !isAdmin(actor)) {
          throw mockError("FORBIDDEN", "Ticket access denied.", 403);
        }

        return (
          state.tickets.find(
            (ticket) => ticket._id === registration.ticket_id
          ) ?? null
        );
      },
      uploadCoverFile(
        id: string | null,
        input: { file_name: string; content_type: string },
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        const event = id ? state.events.find((item) => item._id === id) : null;

        if (id && !event) {
          return null;
        }

        const safeFileName = sanitizeFileName(input.file_name, "event-cover");
        const targetPath = id ?? `_pending/${idFrom("event_cover")}`;
        const cloudPath = `${FILE_PATH_RULES.eventCovers}${targetPath}/${idFrom("cover")}-${safeFileName}`;
        const asset: FileAsset = {
          _id: idFrom("file"),
          file_id: `cloud://${cloudPath}`,
          cloud_path: cloudPath,
          visibility: "public",
          biz_type: "event_cover",
          biz_id: id ?? PENDING_EVENT_COVER_BIZ_ID,
          uploaded_by: actor._id,
          status: "active"
        };

        state.fileAssets.unshift(asset);

        return {
          file_asset: asset,
          cover_file_id: asset.file_id,
          cover_cloud_path: asset.cloud_path,
          cover_url: publicFileUrl(asset.cloud_path)
        };
      },
      create(input: Partial<Event>, actorId?: string) {
        const actor = requireUser(actorId);
        const event: Event = {
          _id: idFrom("event"),
          community_id: "tongzilin",
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
          organizer_user_id: actor._id,
          review_status: "draft",
          publish_status: "draft"
        };

        if (input.cover_file_id) {
          const pendingCover = state.fileAssets.find(
            (asset) =>
              asset.file_id === input.cover_file_id &&
              asset.biz_type === "event_cover" &&
              asset.biz_id === PENDING_EVENT_COVER_BIZ_ID
          );

          if (pendingCover) {
            pendingCover.biz_id = event._id;
          }
        }

        state.events.unshift(event);
        return event;
      },
      update(id: string, input: Partial<Event>) {
        const existing = state.events.find((event) => event._id === id);
        if (!existing) {
          return null;
        }
        Object.assign(existing, input);
        return existing;
      },
      delete(id: string) {
        const index = state.events.findIndex((event) => event._id === id);

        if (index === -1) {
          return null;
        }

        state.events.splice(index, 1);
        return { deleted_id: id };
      },
      review(
        id: string,
        input: {
          review_status: Event["review_status"];
          publish_status?: Event["publish_status"];
        }
      ) {
        const existing = state.events.find((event) => event._id === id);
        if (!existing) {
          return null;
        }

        existing.review_status = input.review_status;
        if (input.publish_status) {
          existing.publish_status = input.publish_status;
        }
        return existing;
      },
      checkin(id: string, ticketId: string) {
        const event = state.events.find((item) => item._id === id);
        const ticket = state.tickets.find((item) => item._id === ticketId);
        if (!event || !ticket) {
          return null;
        }

        const registration = state.registrations.find(
          (item) => item._id === ticket.registration_id
        );

        if (!registration || registration.event_id !== event._id) {
          throw mockError("CONFLICT", "Ticket does not belong to event.", 409, {
            reason: "ticket_event_mismatch"
          });
        }

        if (ticket.status !== "valid") {
          throw mockError(
            "CONFLICT",
            "Ticket is not valid for check-in.",
            409,
            {
              reason: "ticket_not_valid",
              ticket_status: ticket.status
            }
          );
        }

        ticket.status = "used";
        ticket.used_at = new Date().toISOString();
        return ticket;
      }
    },
    posts: {
      normalize(post: Post): Post {
        const author = state.users.find(
          (user) => user._id === post.author_user_id
        );
        const visibleComments = state.comments.filter(
          (comment) => comment.post_id === post._id && isVisibleComment(comment)
        );
        const fileUrls = post.image_file_ids
          .map((fileId) =>
            state.fileAssets.find(
              (asset) =>
                asset.file_id === fileId &&
                asset.visibility === "public" &&
                asset.status === "active"
            )
          )
          .filter((asset): asset is FileAsset => !!asset)
          .map((asset) => publicFileUrl(asset.cloud_path));

        return {
          ...post,
          author_display: post.author_display ?? {
            nickname: author?.nickname ?? post.author_user_id,
            avatar_url: author?.avatar_url ?? null
          },
          place_id: post.place_id ?? null,
          event_id: post.event_id ?? null,
          comment_count: visibleComments.length,
          like_count: Math.max(0, post.like_count ?? 0),
          favorite_count: Math.max(0, post.favorite_count ?? 0),
          share_count: Math.max(0, post.share_count ?? 0),
          created_at: post.created_at ?? new Date().toISOString(),
          updated_at:
            post.updated_at ?? post.created_at ?? new Date().toISOString(),
          image_urls: [...fileUrls, ...post.image_urls]
        };
      },
      normalizeComment(comment: Comment): Comment {
        const author = state.users.find(
          (user) => user._id === comment.author_user_id
        );

        return {
          ...comment,
          author_display: {
            nickname:
              comment.author_display?.nickname ??
              author?.nickname ??
              "Community member",
            avatar_url:
              comment.author_display?.avatar_url ?? author?.avatar_url ?? null
          }
        };
      },
      buildInteractionState(
        post: Post,
        actor: User,
        record?: PostInteractionRecord
      ): PostInteractionState {
        return {
          post_id: post._id,
          actor_user_id: actor._id,
          liked: record?.liked ?? false,
          favorited: record?.favorited ?? false,
          like_count: Math.max(0, post.like_count ?? 0),
          favorite_count: Math.max(0, post.favorite_count ?? 0),
          share_count: Math.max(0, post.share_count ?? 0)
        };
      },
      findInteractionRecord(
        postId: string,
        actorId: string
      ): PostInteractionRecord | undefined {
        return state.postInteractions.find(
          (record) =>
            record.post_id === postId && record.actor_user_id === actorId
        );
      },
      ensureInteractionRecord(
        postId: string,
        actorId: string
      ): PostInteractionRecord {
        const existing = this.findInteractionRecord(postId, actorId);
        if (existing) {
          return existing;
        }

        const now = new Date().toISOString();
        const record: PostInteractionRecord = {
          _id: `post_interaction_${postId}_${actorId}`,
          post_id: postId,
          actor_user_id: actorId,
          liked: false,
          favorited: false,
          created_at: now,
          updated_at: now
        };
        state.postInteractions.unshift(record);
        return record;
      },
      interaction(id: string, actorId?: string): PostInteractionState {
        const actor = requireUser(actorId);
        const post = state.posts.find((item) => item._id === id);
        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        return this.buildInteractionState(
          post,
          actor,
          this.findInteractionRecord(post._id, actor._id)
        );
      },
      setLike(
        id: string,
        input: { liked: boolean },
        actorId?: string
      ): PostInteractionState {
        const actor = requireUser(actorId);
        const post = state.posts.find((item) => item._id === id);
        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        const record = this.ensureInteractionRecord(post._id, actor._id);
        if (record.liked !== input.liked) {
          post.like_count = Math.max(
            0,
            post.like_count + (input.liked ? 1 : -1)
          );
          post.updated_at = new Date().toISOString();
          record.liked = input.liked;
          record.updated_at = post.updated_at;
        }

        return this.buildInteractionState(post, actor, record);
      },
      setFavorite(
        id: string,
        input: { favorited: boolean },
        actorId?: string
      ): PostInteractionState {
        const actor = requireUser(actorId);
        const post = state.posts.find((item) => item._id === id);
        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        const record = this.ensureInteractionRecord(post._id, actor._id);
        if (record.favorited !== input.favorited) {
          post.favorite_count = Math.max(
            0,
            post.favorite_count + (input.favorited ? 1 : -1)
          );
          post.updated_at = new Date().toISOString();
          record.favorited = input.favorited;
          record.updated_at = post.updated_at;
        }

        return this.buildInteractionState(post, actor, record);
      },
      recordShare(
        id: string,
        _input: {
          channel?: "wechat" | "moments" | "copy_link" | "system" | "other";
        } = {},
        actorId?: string
      ): PostInteractionState {
        const actor = requireUser(actorId);
        const post = state.posts.find((item) => item._id === id);
        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        post.share_count = Math.max(0, post.share_count + 1);
        post.updated_at = new Date().toISOString();

        return this.buildInteractionState(
          post,
          actor,
          this.findInteractionRecord(post._id, actor._id)
        );
      },
      buildFollowState(
        followerId: string,
        followedId: string
      ): ProfileFollowState {
        const following = state.userFollows.some(
          (record) =>
            record.follower_user_id === followerId &&
            record.followed_user_id === followedId
        );

        return {
          follower_user_id: followerId,
          followed_user_id: followedId,
          following,
          follower_count: state.userFollows.filter(
            (record) => record.followed_user_id === followedId
          ).length,
          following_count: state.userFollows.filter(
            (record) => record.follower_user_id === followedId
          ).length
        };
      },
      profile(userId: string, actorId?: string): PublicProfile | null {
        const actor = requireUser(actorId);
        const user = state.users.find((item) => item._id === userId);
        const enforcement = user ? getEffectiveUserEnforcement(user._id) : null;
        if (!user || user.status !== "active" || enforcement?.status === "banned") {
          return null;
        }

        const posts = state.posts
          .filter(
            (post) => post.author_user_id === user._id && isLaunchVisiblePost(post)
          )
          .map((post) => this.normalize(post));
        const videoPosts = posts.filter(postHasVideoMedia);
        const followState = this.buildFollowState(actor._id, user._id);

        return {
          user: {
            _id: user._id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            preferred_language: user.preferred_language,
            status: user.status
          },
          stats: {
            post_count: posts.length,
            video_post_count: videoPosts.length,
            follower_count: followState.follower_count,
            following_count: followState.following_count
          },
          followed_by_actor: followState.following,
          is_self: actor._id === user._id,
          posts,
          video_posts: videoPosts
        };
      },
      setProfileFollow(
        userId: string,
        input: { following: boolean },
        actorId?: string
      ): ProfileFollowState {
        const actor = requireUser(actorId);
        const user = state.users.find((item) => item._id === userId);
        const enforcement = user ? getEffectiveUserEnforcement(user._id) : null;
        if (!user || user.status !== "active" || enforcement?.status === "banned") {
          throw mockError("NOT_FOUND", "Profile not found.", 404);
        }
        if (actor._id === user._id) {
          throw mockError("CONFLICT", "Users cannot follow themselves.", 409, {
            reason: "self_follow"
          });
        }

        const existingIndex = state.userFollows.findIndex(
          (record) =>
            record.follower_user_id === actor._id &&
            record.followed_user_id === user._id
        );
        if (input.following && existingIndex === -1) {
          const now = new Date().toISOString();
          const record: UserFollowRecord = {
            _id: `user_follow_${actor._id}_${user._id}`,
            follower_user_id: actor._id,
            followed_user_id: user._id,
            created_at: now,
            updated_at: now
          };
          state.userFollows.unshift(record);
        }
        if (!input.following && existingIndex >= 0) {
          state.userFollows.splice(existingIndex, 1);
        }

        return this.buildFollowState(actor._id, user._id);
      },
      buildProfileFollowListItem(
        user: User,
        actorId: string
      ): ProfileFollowListItem {
        const followedByActor = state.userFollows.some(
          (record) =>
            record.follower_user_id === actorId &&
            record.followed_user_id === user._id
        );
        const followsActor = state.userFollows.some(
          (record) =>
            record.follower_user_id === user._id &&
            record.followed_user_id === actorId
        );

        return {
          user: {
            _id: user._id,
            nickname: user.nickname,
            avatar_url: user.avatar_url,
            preferred_language: user.preferred_language,
            status: user.status
          },
          following: followedByActor,
          followed_by_actor: followedByActor,
          follows_actor: followsActor,
          mutual: followedByActor && followsActor
        };
      },
      listProfileFollowers(
        userId: string,
        params: PageParams = {},
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        const user = state.users.find((item) => item._id === userId);
        const enforcement = user ? getEffectiveUserEnforcement(user._id) : null;
        if (!user || user.status !== "active" || enforcement?.status === "banned") {
          return null;
        }

        const followers = state.userFollows
          .filter((record) => record.followed_user_id === userId)
          .map((record) =>
            state.users.find((item) => item._id === record.follower_user_id)
          )
          .filter((item): item is User => !!item && item.status === "active")
          .map((item) => this.buildProfileFollowListItem(item, actor._id));

        return paginate(followers, params);
      },
      listProfileFollowing(
        userId: string,
        params: PageParams = {},
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        const user = state.users.find((item) => item._id === userId);
        const enforcement = user ? getEffectiveUserEnforcement(user._id) : null;
        if (!user || user.status !== "active" || enforcement?.status === "banned") {
          return null;
        }

        const following = state.userFollows
          .filter((record) => record.follower_user_id === userId)
          .map((record) =>
            state.users.find((item) => item._id === record.followed_user_id)
          )
          .filter((item): item is User => !!item && item.status === "active")
          .map((item) => this.buildProfileFollowListItem(item, actor._id));

        return paginate(following, params);
      },
      list(params: PageParams = {}) {
        const posts = sortDiscoverPosts(state.posts.filter(
          (post) =>
            isLaunchVisiblePost(post) &&
            (!params.communityId || post.community_id === params.communityId) &&
            (!params.tag || post.tag_ids.includes(normalizeTagId(params.tag))) &&
            (keywordMatch(post.title, params.keyword) ||
              keywordMatch(post.content, params.keyword) ||
              post.tag_ids.some((tag) => keywordMatch(tag, params.keyword)))
        ), params.sort);

        return paginate(
          posts.map((post) => this.normalize(post)),
          params
        );
      },
      listMine(params: PageParams = {}, actorId?: string) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "read_mine");
        const posts = state.posts.filter(
          (post) =>
            post.author_user_id === actor._id &&
            (!params.communityId || post.community_id === params.communityId)
        );

        return paginate(
          posts.map((post) => this.normalize(post)),
          params
        );
      },
      listRelatedByPlace(placeId: string, params: PageParams = {}) {
        const place = state.places.find((item) => item._id === placeId);
        if (
          !place ||
          place.status !== "published" ||
          (params.communityId && place.community_id !== params.communityId)
        ) {
          return null;
        }

        const posts = state.posts.filter(
          (post) =>
            post.place_id === placeId &&
            isLaunchVisiblePost(post) &&
            post.community_id === place.community_id
        );

        return paginate(
          posts.map((post) => this.normalize(post)),
          params
        );
      },
      listRelatedByEvent(eventId: string, params: PageParams = {}) {
        const event = state.events.find((item) => item._id === eventId);
        if (
          !event ||
          !isLaunchVisibleEvent(event) ||
          (params.communityId && event.community_id !== params.communityId)
        ) {
          return null;
        }

        const posts = state.posts.filter(
          (post) =>
            post.event_id === eventId &&
            isLaunchVisiblePost(post) &&
            post.community_id === event.community_id
        );

        return paginate(
          posts.map((post) => this.normalize(post)),
          params
        );
      },
      meGovernance(actorId?: string) {
        const actor = requireUser(actorId);
        return buildMeGovernance(actor);
      },
      listAdmin(params: PageParams = {}, actorId?: string) {
        requireAdminUser(actorId);
        const posts = state.posts.filter((post) => {
          const status = params.status ?? "all";
          return (
            (!params.communityId || post.community_id === params.communityId) &&
            (status === "all" ||
              post.status === status ||
              post.review_status === status) &&
            (!params.authorUserId ||
              post.author_user_id === params.authorUserId) &&
            (!params.language || post.language === params.language) &&
            (!params.tag || post.tag_ids.includes(params.tag)) &&
            (keywordMatch(post.title, params.keyword) ||
              keywordMatch(post.content, params.keyword))
          );
        });

        return paginate(
          posts.map((post) => this.normalize(post)),
          params
        );
      },
      updateOps(
        id: string,
        input: Partial<
          Pick<
            Post,
            | "is_pinned"
            | "is_featured"
            | "is_recommended"
            | "is_official"
            | "ops_rank"
          >
        > & { reason?: string },
        actorId?: string
      ) {
        const actor = requireAdminUser(actorId);
        const post = state.posts.find((item) => item._id === id);
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
        Object.assign(post, {
          ...input,
          updated_at: new Date().toISOString()
        });
        addAuditRecord({
          actor_user_id: actor._id,
          action: "update_post_ops",
          target_type: "post",
          target_id: post._id,
          reason: input.reason ?? "Update discover post ops metadata",
          previous_state: previous,
          next_state: {
            is_pinned: post.is_pinned,
            is_featured: post.is_featured,
            is_recommended: post.is_recommended,
            is_official: post.is_official,
            ops_rank: post.ops_rank
          }
        });
        return this.normalize(post);
      },
      listPublicTags(params: PageParams = {}) {
        const tags = state.discoverTags
          .filter(
            (tag) =>
              tag.status === "active" &&
              (keywordMatch(tag._id, params.keyword) ||
                keywordMatch(tag.label_zh, params.keyword) ||
                keywordMatch(tag.label_en, params.keyword))
          )
          .map((tag) => ({
            ...tag,
            post_count: state.posts.filter((post) => post.tag_ids.includes(tag._id))
              .length
          }));

        return paginate(tags, params);
      },
      createTag(input: { label: string }, actorId?: string): DiscoverTag {
        const actor = requireUser(actorId);
        const id = normalizeTagId(input.label);
        if (!id) {
          throw mockError("VALIDATION_ERROR", "Tag label is required.", 400);
        }

        const existing = state.discoverTags.find((tag) => tag._id === id);
        if (existing?.status === "hidden") {
          throw mockError("CONFLICT", "Tag is hidden by moderation.", 409, {
            reason: "hidden_tag"
          });
        }
        if (existing) {
          return {
            ...existing,
            post_count: state.posts.filter((post) => post.tag_ids.includes(id))
              .length
          };
        }

        const now = new Date().toISOString();
        const tag: DiscoverTag = {
          _id: id,
          label_zh: input.label.trim().replace(/^#+/, ""),
          label_en: input.label.trim().replace(/^#+/, ""),
          status: "active",
          post_count: 0,
          created_at: now,
          updated_at: now
        };
        state.discoverTags.unshift(tag);
        addAuditRecord({
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
      listTags(actorId?: string) {
        requireAdminUser(actorId);
        const tags = state.discoverTags.map((tag) => ({
          ...tag,
          post_count: state.posts.filter((post) => post.tag_ids.includes(tag._id))
            .length
        }));
        return paginate(tags, { page: 1, pageSize: tags.length || 20 });
      },
      upsertTag(
        id: string,
        input: { label_zh: string; label_en: string; status?: "active" | "hidden" },
        actorId?: string
      ): DiscoverTag {
        const actor = requireAdminUser(actorId);
        const existing = state.discoverTags.find((tag) => tag._id === id);
        const now = new Date().toISOString();
        const previous = existing ? { ...existing } : null;
        const tag: DiscoverTag = {
          _id: id,
          label_zh: input.label_zh,
          label_en: input.label_en,
          status: input.status ?? "active",
          post_count: state.posts.filter((post) => post.tag_ids.includes(id))
            .length,
          created_at: existing?.created_at ?? now,
          updated_at: now
        };
        if (existing) {
          Object.assign(existing, tag);
        } else {
          state.discoverTags.unshift(tag);
        }
        addAuditRecord({
          actor_user_id: actor._id,
          action: "upsert_tag",
          target_type: "tag",
          target_id: id,
          reason: "Maintain discover tag taxonomy",
          previous_state: previous,
          next_state: tag
        });
        return tag;
      },
      detail(id: string) {
        const post = state.posts.find((item) => item._id === id);
        return post && isLaunchVisiblePost(post) ? this.normalize(post) : null;
      },
      listComments(postId: string, params: PageParams = {}) {
        const post = state.posts.find((item) => item._id === postId);

        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        return paginate(
          state.comments.filter(
            (comment) => comment.post_id === postId && isVisibleComment(comment)
          ).map((comment) => this.normalizeComment(comment)),
          params
        );
      },
      listAdminComments(params: PageParams = {}, actorId?: string) {
        requireAdminUser(actorId);
        const comments = state.comments.filter((comment) => {
          const status = params.status ?? "all";
          return (
            (!params.postId || comment.post_id === params.postId) &&
            (status === "all" || comment.status === status) &&
            (!params.authorUserId ||
              comment.author_user_id === params.authorUserId) &&
            keywordMatch(comment.content, params.keyword)
          );
        });

        return paginate(
          comments.map((comment) => this.normalizeComment(comment)),
          params
        );
      },
      listMyComments(params: PageParams = {}, actorId?: string) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "read_mine");
        const comments = state.comments.filter(
          (comment) => comment.author_user_id === actor._id
        );

        return paginate(
          comments.map((comment) => this.normalizeComment(comment)),
          params
        );
      },
      detailMyComment(id: string, actorId?: string) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "read_mine");
        const comment = state.comments.find(
          (item) => item._id === id && item.author_user_id === actor._id
        );
        return comment ? this.normalizeComment(comment) : null;
      },
      create(input: Partial<Post>, actorId?: string) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "create_post");
        const now = new Date().toISOString();
        const imageFileIds = input.image_file_ids ?? [];
        const postId = idFrom("post");
        const assets = imageFileIds.map((fileId) =>
          state.fileAssets.find((asset) => asset.file_id === fileId)
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
          throw mockError("FORBIDDEN", "Post media file access denied.", 403);
        }

        if (input.place_id) {
          const place = state.places.find((item) => item._id === input.place_id);
          if (
            !place ||
            place.status !== "published" ||
            place.community_id !== "tongzilin"
          ) {
            throw mockError("NOT_FOUND", "Place association not found.", 404);
          }
        }

        if (input.event_id) {
          const event = state.events.find((item) => item._id === input.event_id);
          if (
            !event ||
            !isLaunchVisibleEvent(event) ||
            event.community_id !== "tongzilin"
          ) {
            throw mockError("NOT_FOUND", "Event association not found.", 404);
          }
        }

        const post: Post = {
          _id: postId,
          author_user_id: actor._id,
          author_display: {
            nickname: actor.nickname,
            avatar_url: actor.avatar_url
          },
          community_id: "tongzilin",
          title: input.title ?? "",
          content: input.content ?? "",
          language: input.language ?? "zh",
          tag_ids: input.tag_ids ?? [],
          location_text: input.location_text ?? null,
          image_file_ids: imageFileIds,
          image_urls: [
            ...assets
              .filter((asset): asset is FileAsset => !!asset)
              .map((asset) => publicFileUrl(asset.cloud_path)),
            ...(input.image_urls ?? [])
          ],
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
        };
        state.posts.unshift(post);
        for (const asset of assets) {
          if (asset) {
            asset.biz_id = post._id;
          }
        }
        return this.normalize(post);
      },
      createComment(
        postId: string,
        input: Pick<Comment, "content" | "language">,
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "create_comment");
        const post = state.posts.find((item) => item._id === postId);

        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        const comment: Comment = {
          _id: idFrom("comment"),
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
        };
        state.comments.unshift(comment);
        if (post.author_user_id !== actor._id) {
          addNotification({
            user_id: post.author_user_id,
            title: "帖子收到新评论",
            body: `${actor.nickname} 评论了你的帖子：${post.title}`,
            target_type: "comment",
            post_id: post._id,
            comment_id: comment._id,
            place_id: post.place_id,
            event_id: post.event_id
          });
        }
        return comment;
      },
      report(
        id: string,
        input: {
          reason: string;
          description?: string;
          evidence_file_ids?: string[];
        },
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "report");
        const post = state.posts.find((item) => item._id === id);
        if (!post || !isLaunchVisiblePost(post)) {
          return null;
        }
        post.review_status = "reported";
        post.updated_at = new Date().toISOString();
        createReportCase({
          target_type: "post",
          post,
          reason: input.reason,
          description: input.description,
          evidence_file_ids: input.evidence_file_ids,
          actor
        });
        return this.normalize(post);
      },
      reportComment(
        postId: string,
        commentId: string,
        input: {
          reason: string;
          description?: string;
          evidence_file_ids?: string[];
        },
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "report");
        const post = state.posts.find((item) => item._id === postId);
        const comment = state.comments.find(
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

        comment.status = "reported";
        return createReportCase({
          target_type: "comment",
          post,
          comment,
          reason: input.reason,
          description: input.description,
          evidence_file_ids: input.evidence_file_ids,
          actor
        });
      },
      moderate(
        id: string,
        input: { review_status: Post["review_status"]; reason?: string },
        actorId?: string
      ) {
        const actor = requireAdminUser(actorId);
        const post = state.posts.find((item) => item._id === id);
        if (!post) {
          return null;
        }
        const previous = {
          status: post.status,
          review_status: post.review_status
        };
        post.review_status = input.review_status;
        post.status = input.review_status;
        post.updated_at = new Date().toISOString();
        addAuditRecord({
          actor_user_id: actor._id,
          action: "moderate_post",
          target_type: "post",
          target_id: post._id,
          reason: input.reason ?? null,
          previous_state: previous,
          next_state: {
            status: post.status,
            review_status: post.review_status
          }
        });
        if (post.author_user_id !== actor._id) {
          addNotification({
            user_id: post.author_user_id,
            title: "帖子治理状态已更新",
            body: `你的帖子“${post.title}”状态已更新。`,
            target_type: "post",
            post_id: post._id,
            place_id: post.place_id,
            event_id: post.event_id
          });
        }
        return this.normalize(post);
      },
      moderateComment(
        id: string,
        input: { status: Comment["status"]; reason?: string },
        actorId?: string
      ) {
        const actor = requireAdminUser(actorId);
        const comment = state.comments.find((item) => item._id === id);
        if (!comment) {
          return null;
        }
        const previous = { status: comment.status };
        comment.status = input.status;
        addAuditRecord({
          actor_user_id: actor._id,
          action: "moderate_comment",
          target_type: "comment",
          target_id: comment._id,
          reason: input.reason ?? null,
          previous_state: previous,
          next_state: { status: comment.status }
        });
        if (comment.author_user_id !== actor._id) {
          addNotification({
            user_id: comment.author_user_id,
            title: "评论治理状态已更新",
            body: "你的评论状态已更新。",
            target_type: "comment",
            post_id: comment.post_id,
            comment_id: comment._id
          });
        }
        return comment;
      },
      listReportCases(params: PageParams = {}, actorId?: string) {
        requireAdminUser(actorId);
        const reports = state.reportCases.filter((report) => {
          const status = params.status ?? "all";
          return (
            (status === "all" || report.status === status) &&
            (!params.targetType || report.target_type === params.targetType) &&
            (!params.reason || report.reason === params.reason)
          );
        });

        return paginate(
          reports.map((report) => normalizeReportCase(report, true)),
          params
        );
      },
      listMyReportCases(params: PageParams = {}, actorId?: string) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "read_mine");
        const reports = state.reportCases.filter(
          (report) => report.reporter_user_id === actor._id
        );

        return paginate(
          reports.map((report) => normalizeReportCase(report, true)),
          params
        );
      },
      detailMyReportCase(id: string, actorId?: string) {
        const actor = requireUser(actorId);
        assertActorAllowed(actor, "read_mine");
        const report = state.reportCases.find(
          (item) => item._id === id && item.reporter_user_id === actor._id
        );
        return report ? normalizeReportCase(report, true) : null;
      },
      detailReportCase(id: string, actorId?: string) {
        requireAdminUser(actorId);
        const report = state.reportCases.find((item) => item._id === id);
        return report ? normalizeReportCase(report, true) : null;
      },
      resolveReportCase(
        id: string,
        input: {
          status: "actioned" | "rejected";
          reason: string;
          moderation_action?: "none" | "hide" | "restore" | "delete";
        },
        actorId?: string
      ) {
        const actor = requireAdminUser(actorId);
        const report = state.reportCases.find((item) => item._id === id);
        if (!report) {
          return null;
        }

        const now = new Date().toISOString();
        const previous = {
          status: report.status,
          handler_user_id: report.handler_user_id,
          resolution_note: report.resolution_note
        };
        report.status = input.status;
        report.handler_user_id = actor._id;
        report.resolution_note = input.reason;
        report.updated_at = now;
        report.resolved_at = now;

        const targetPost = state.posts.find(
          (post) => post._id === report.post_id
        );
        const targetComment =
          report.comment_id === null
            ? null
            : state.comments.find(
                (comment) => comment._id === report.comment_id
              );
        const action = input.moderation_action ?? "none";
        const hasOtherOpenReport = state.reportCases.some(
          (item) =>
            item._id !== report._id &&
            item.status === "open" &&
            item.target_type === report.target_type &&
            item.target_id === report.target_id
        );

        if (targetPost && report.target_type === "post" && action !== "none") {
          const nextStatus =
            action === "restore"
              ? "visible"
              : action === "delete"
                ? "deleted"
                : "hidden";
          targetPost.status = nextStatus;
          targetPost.review_status = nextStatus;
          targetPost.updated_at = now;
        }

        if (
          targetPost &&
          report.target_type === "post" &&
          input.status === "rejected" &&
          action === "none" &&
          !hasOtherOpenReport &&
          targetPost.status === "visible" &&
          targetPost.review_status === "reported"
        ) {
          targetPost.review_status = "visible";
          targetPost.updated_at = now;
        }

        if (
          targetComment &&
          report.target_type === "comment" &&
          action !== "none"
        ) {
          targetComment.status =
            action === "restore"
              ? "visible"
              : action === "delete"
                ? "deleted"
                : "hidden";
        }

        if (
          targetComment &&
          report.target_type === "comment" &&
          input.status === "rejected" &&
          action === "none" &&
          !hasOtherOpenReport &&
          targetComment.status === "reported"
        ) {
          targetComment.status = "visible";
        }

        addAuditRecord({
          actor_user_id: actor._id,
          action: "resolve_report",
          target_type: "report",
          target_id: report._id,
          reason: input.reason,
          previous_state: previous,
          next_state: {
            status: report.status,
            handler_user_id: report.handler_user_id,
            resolution_note: report.resolution_note,
            moderation_action: action
          }
        });
        if (report.reporter_user_id !== actor._id) {
          addNotification({
            user_id: report.reporter_user_id,
            title: "举报处理结果",
            body: `你的举报已处理：${input.reason}`,
            target_type: "report",
            post_id: report.post_id,
            comment_id: report.comment_id,
            report_id: report._id,
            place_id: targetPost?.place_id ?? null,
            event_id: targetPost?.event_id ?? null
          });
        }

        return normalizeReportCase(report, true);
      },
      listGovernanceUsers(params: PageParams = {}, actorId?: string) {
        requireAdminUser(actorId);
        const summaries = state.users
          .map((user) => buildUserGovernanceSummary(user))
          .filter((summary) => {
            const status = params.status ?? "all";
            return (
              (status === "all" ||
                summary.enforcement.status === status ||
                summary.user.status === status) &&
              (keywordMatch(summary.user.nickname, params.keyword) ||
                keywordMatch(summary.user.phone, params.keyword) ||
                keywordMatch(summary.user._id, params.keyword))
            );
          });

        return paginate(summaries, params);
      },
      detailGovernanceUser(id: string, actorId?: string) {
        requireAdminUser(actorId);
        const user = state.users.find((item) => item._id === id);
        return user ? buildUserGovernanceDetail(user) : null;
      },
      enforceUser(
        id: string,
        input: {
          status: UserEnforcementState["status"];
          reason: string;
          notes?: string;
          expires_at?: string | null;
        },
        actorId?: string
      ) {
        const actor = requireAdminUser(actorId);
        const user = state.users.find((item) => item._id === id);
        if (!user) {
          return null;
        }
        if (
          user.role_flags.includes("system_admin") &&
          actor._id !== user._id
        ) {
          throw mockError("FORBIDDEN", "System admin enforcement denied.", 403);
        }

        const previous = { ...ensureUserEnforcement(user._id) };
        const bannedHiddenPosts =
          input.status === "banned" ? hideBannedUserPosts(user._id) : [];
        const restoredPostIds =
          input.status === "active" && previous.status === "banned"
            ? restoreBannedUserPosts(user._id)
            : [];
        state.userEnforcements[user._id] = {
          status: input.status,
          reason: input.reason,
          notes: input.notes ?? null,
          expires_at: input.expires_at ?? null,
          updated_at: new Date().toISOString(),
          updated_by: actor._id
        };
        addEnforcementNotification(user, state.userEnforcements[user._id]);
        addAuditRecord({
          actor_user_id: actor._id,
          action: "enforce_user",
          target_type: "user",
          target_id: user._id,
          reason: input.reason,
          previous_state: previous,
          next_state: {
            ...state.userEnforcements[user._id],
            ...(bannedHiddenPosts.length
              ? { banned_hidden_posts: bannedHiddenPosts }
              : {}),
            ...(restoredPostIds.length
              ? { restored_post_ids: restoredPostIds }
              : {})
          }
        });

        return buildUserGovernanceDetail(user);
      },
      listAuditRecords(params: PageParams = {}, actorId?: string) {
        requireAdminUser(actorId);
        const records = state.auditRecords.filter(
          (record) =>
            (!params.targetType || record.target_type === params.targetType) &&
            (!params.targetId || record.target_id === params.targetId) &&
            (!params.actorUserId || record.actor_user_id === params.actorUserId)
        );

        return paginate(records, params);
      },
      analytics(params: { windowDays?: number } = {}, actorId?: string) {
        requireAdminUser(actorId);
        const windowDays = params.windowDays ?? 30;
        const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
        const inWindow = (value: string) => Date.parse(value) >= cutoff;
        const posts = state.posts.filter((post) => inWindow(post.created_at));
        const comments = state.comments.filter((comment) =>
          inWindow(comment.created_at)
        );
        const reports = state.reportCases.filter((report) =>
          inWindow(report.created_at)
        );
        const authorIds = new Set([
          ...posts.map((post) => post.author_user_id),
          ...comments.map((comment) => comment.author_user_id)
        ]);
        const resolvedDurations = reports
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
          post_count: posts.length,
          comment_count: comments.length,
          report_count: reports.length,
          open_report_count: reports.filter((report) => report.status === "open")
            .length,
          pending_workload_count:
            reports.filter((report) => report.status === "open").length +
            state.comments.filter((comment) => comment.status === "reported")
              .length +
            state.posts.filter((post) => post.review_status === "reported")
              .length,
          average_moderation_hours: resolvedDurations.length
            ? resolvedDurations.reduce((sum, value) => sum + value, 0) /
              resolvedDurations.length
            : null,
          engagement: {
            like_count: posts.reduce((sum, post) => sum + post.like_count, 0),
            favorite_count: posts.reduce(
              (sum, post) => sum + post.favorite_count,
              0
            ),
            share_count: posts.reduce((sum, post) => sum + post.share_count, 0)
          },
          active_authors: [...authorIds]
            .map((userId) => ({
              user_id: userId,
              post_count: posts.filter((post) => post.author_user_id === userId)
                .length,
              comment_count: comments.filter(
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
          popular_places: countBy(posts, (post) => post.place_id).map(
            ([place_id, post_count]) => ({ place_id, post_count })
          ),
          popular_events: countBy(posts, (post) => post.event_id).map(
            ([event_id, post_count]) => ({ event_id, post_count })
          )
        };
      }
    },
    places: {
      list(params: PageParams = {}) {
        const places = sortPlaces(
          state.places.filter((place) => {
            if (place.status !== "published") {
              return false;
            }

            if (
              params.communityId &&
              place.community_id !== params.communityId
            ) {
              return false;
            }

            if (
              params.category &&
              place.category_level_1 !== params.category &&
              place.category_level_2 !== params.category
            ) {
              return false;
            }

            if (params.tag && !place.tag_ids.includes(params.tag)) {
              return false;
            }

            if (params.recommended && !place.is_recommended) {
              return false;
            }

            return (
              keywordMatch(place.name_zh, params.keyword) ||
              keywordMatch(place.name_en, params.keyword) ||
              keywordMatch(place.intro_zh, params.keyword) ||
              keywordMatch(place.intro_en, params.keyword)
            );
          }),
          params.sort
        );

        return paginate(places.map(toPlaceListItem), params);
      },
      listAdmin() {
        return paginate(state.places, { pageSize: state.places.length || 20 });
      },
      detail(id: string) {
        const place = state.places.find((item) => item._id === id);
        if (!place || place.status !== "published") {
          return null;
        }

        return toPlaceDetail(place, state.fileAssets);
      },
      mapMarkers() {
        return sortPlacesForMapMarkers(
          state.places.filter(
            (place) =>
              place.community_id === "tongzilin" &&
              place.status === "published" &&
              hasUsableCoordinates(place)
          )
        ).map((place) => ({
          _id: place._id,
          name_zh: place.name_zh,
          name_en: place.name_en,
          cover_url: place.cover_url,
          category_level_1: place.category_level_1,
          is_recommended: place.is_recommended,
          location: place.location
        }));
      },
      create(input: Partial<Place>) {
        const place: Place = {
          _id: idFrom("place"),
          community_id: "tongzilin",
          name_zh: input.name_zh ?? "",
          name_en: input.name_en ?? "",
          cover_file_id: input.cover_file_id ?? null,
          cover_url: input.cover_url ?? null,
          cover_source: input.cover_source ?? null,
          category_level_1:
            input.category_level_1 ?? PLACE_TOP_LEVEL_CATEGORIES[0],
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
        };

        state.places.unshift(place);
        for (const asset of state.fileAssets) {
          if (
            place.gallery_file_ids.includes(asset.file_id) &&
            asset.biz_type === "place_gallery" &&
            asset.biz_id === PENDING_PLACE_GALLERY_BIZ_ID
          ) {
            asset.biz_id = place._id;
          }
        }
        return place;
      },
      update(id: string, input: Partial<Place>) {
        const existing = state.places.find((place) => place._id === id);
        if (!existing) {
          return null;
        }
        Object.assign(existing, input);
        return existing;
      },
      delete(id: string) {
        const existingIndex = state.places.findIndex(
          (place) => place._id === id
        );
        if (existingIndex < 0) {
          return null;
        }

        state.places.splice(existingIndex, 1);
        return { deleted_id: id };
      }
    },
    announcements: {
      list(params: PageParams = {}) {
        return paginate(state.announcements, params);
      },
      detail(id: string) {
        return state.announcements.find((item) => item._id === id) ?? null;
      }
    },
    notifications: {
      list(actorId?: string) {
        const actor = requireUser(actorId);
        return state.notifications.filter(
          (notification) => notification.user_id === actor._id
        );
      },
      markRead(id: string, actorId?: string) {
        const actor = requireUser(actorId);
        const notification = state.notifications.find(
          (item) => item._id === id && item.user_id === actor._id
        );
        if (!notification) {
          return null;
        }
        notification.status = "read";
        return notification;
      }
    },
    files: {
      createUploadRequest(input: {
        biz_type: string;
        biz_id: string;
        file_name: string;
        target_prefix: string;
      }) {
        const cloud_path = `${input.target_prefix}${input.biz_id}/${input.file_name}`;
        return {
          cloud_path,
          upload_url: `https://example.com/upload/${encodeURIComponent(cloud_path)}`,
          expires_in: 900
        };
      },
      complete(
        input: {
          biz_type: string;
          biz_id: string;
          file_id: string;
          cloud_path: string;
          visibility: FileAsset["visibility"];
        },
        actorId?: string
      ) {
        const actor = requireUser(actorId);
        const asset: FileAsset = {
          _id: idFrom("file"),
          file_id: input.file_id,
          cloud_path: input.cloud_path,
          visibility: input.visibility,
          biz_type: input.biz_type,
          biz_id: input.biz_id,
          uploaded_by: actor._id,
          status: "active"
        };
        state.fileAssets.unshift(asset);
        return asset;
      },
      privateUrl(input: { file_id: string }, actorId?: string) {
        const actor = requireUser(actorId);
        const asset = state.fileAssets.find(
          (item) => item.file_id === input.file_id && item.status === "active"
        );

        if (!asset) {
          throw mockError("NOT_FOUND", "File not found.", 404);
        }

        if (
          asset.visibility === "private" &&
          asset.uploaded_by !== actor._id &&
          !isAdmin(actor)
        ) {
          throw mockError("FORBIDDEN", "File access denied.", 403);
        }

        return {
          temp_url: `https://example.com/temp/${input.file_id}`,
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
      }
    },
    _state: state
  };
};
