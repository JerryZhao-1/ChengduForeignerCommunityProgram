import type {
  AuthSession,
  Comment,
  Event,
  EventAdminListItem,
  EventAdminRegistrationRow,
  EventRegistration,
  EventTicket,
  FileAsset,
  Place,
  PlaceDetail,
  PlaceGalleryMedia,
  PlaceListItem,
  Post,
  User
} from "../types/entities";
import type { ApiErrorCode } from "../enums";
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
  sort?: "recommended" | "name";
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
  post.status === "visible" && post.review_status === "visible";

const isVisibleComment = (comment: Comment) => comment.status === "visible";

const POST_MEDIA_BIZ_TYPES = new Set(["post_image", "post_video", "post_media"]);

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
    ...seed
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
        const author = state.users.find((user) => user._id === post.author_user_id);
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
          updated_at: post.updated_at ?? post.created_at ?? new Date().toISOString(),
          image_urls: [...fileUrls, ...post.image_urls]
        };
      },
      list(params: PageParams = {}) {
        const posts = state.posts.filter(
          (post) =>
            isLaunchVisiblePost(post) &&
            (!params.communityId || post.community_id === params.communityId) &&
            (keywordMatch(post.title, params.keyword) ||
              keywordMatch(post.content, params.keyword))
        );

        return paginate(posts.map((post) => this.normalize(post)), params);
      },
      listMine(params: PageParams = {}, actorId?: string) {
        const actor = requireUser(actorId);
        const posts = state.posts.filter(
          (post) =>
            post.author_user_id === actor._id &&
            (!params.communityId || post.community_id === params.communityId)
        );

        return paginate(posts.map((post) => this.normalize(post)), params);
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
          ),
          params
        );
      },
      create(input: Partial<Post>, actorId?: string) {
        const actor = requireUser(actorId);
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
          throw mockError(
            "FORBIDDEN",
            "Post media file access denied.",
            403
          );
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
        const post = state.posts.find((item) => item._id === postId);

        if (!post || !isLaunchVisiblePost(post)) {
          throw mockError("NOT_FOUND", "Post not found.", 404);
        }

        const comment: Comment = {
          _id: idFrom("comment"),
          post_id: postId,
          author_user_id: actor._id,
          content: input.content,
          language: input.language,
          status: "visible",
          created_at: new Date().toISOString()
        };
        state.comments.unshift(comment);
        return comment;
      },
      report(id: string) {
        const post = state.posts.find((item) => item._id === id);
        if (!post || !isLaunchVisiblePost(post)) {
          return null;
        }
        post.review_status = "reported";
        return this.normalize(post);
      },
      moderate(id: string, input: { review_status: Post["review_status"] }) {
        const post = state.posts.find((item) => item._id === id);
        if (!post) {
          return null;
        }
        post.review_status = input.review_status;
        post.status = input.review_status;
        post.updated_at = new Date().toISOString();
        return this.normalize(post);
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
