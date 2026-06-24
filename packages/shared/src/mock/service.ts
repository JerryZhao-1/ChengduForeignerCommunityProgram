import type {
  AuthSession,
  Comment,
  Event,
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

const shortAddress = (value: string) => value.split("，")[0]?.split(",")[0] ?? value;

const sortPlaces = (items: Place[], sort: PageParams["sort"]) => {
  if (sort === "name") {
    return [...items].sort((left, right) => left.name_en.localeCompare(right.name_en));
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

const isLaunchVisibleEvent = (event: Event) =>
  event.review_status === "approved" && event.publish_status === "published";

const isLaunchVisiblePost = (post: Post) =>
  post.status === "visible" && post.review_status === "visible";

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
    const user = state.users.find((item) => item._id === (userId ?? "user_001"));

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
            (!params.communityId || event.community_id === params.communityId) &&
            (keywordMatch(event.title_zh, params.keyword) ||
              keywordMatch(event.title_en, params.keyword) ||
              keywordMatch(event.summary_zh, params.keyword) ||
              keywordMatch(event.summary_en, params.keyword))
        );

        return paginate(events, params);
      },
      detail(id: string) {
        const event = state.events.find((item) => item._id === id);
        return event && isLaunchVisibleEvent(event) ? event : null;
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

        if (new Date(event.signup_deadline).getTime() <= Date.now()) {
          throw mockError("CONFLICT", "Event signup is closed.", 409);
        }

        const hasActiveRegistration = state.registrations.some(
          (registration) =>
            registration.event_id === eventId &&
            registration.user_id === actor._id &&
            registration.registration_status !== "cancelled"
        );

        if (hasActiveRegistration) {
          throw mockError("CONFLICT", "Registration already exists.", 409);
        }

        const confirmedAttendees = state.registrations
          .filter(
            (registration) =>
              registration.event_id === eventId &&
              registration.registration_status === "confirmed"
          )
          .reduce((sum, registration) => sum + registration.attendee_count, 0);

        if (confirmedAttendees + input.attendee_count > event.capacity) {
          throw mockError("CONFLICT", "Event capacity is full.", 409);
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
          cover_file_id: input.cover_file_id ?? "cloud://placeholder-cover",
          cover_cloud_path:
            input.cover_cloud_path ?? "public/events/placeholder/cover.jpg",
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
          throw mockError("CONFLICT", "Ticket does not belong to event.", 409);
        }

        if (ticket.status !== "valid") {
          throw mockError("CONFLICT", "Ticket is not valid for check-in.", 409);
        }

        ticket.status = "used";
        ticket.used_at = new Date().toISOString();
        return ticket;
      }
    },
    posts: {
      list(params: PageParams = {}) {
        const posts = state.posts.filter(
          (post) =>
            isLaunchVisiblePost(post) &&
            (!params.communityId || post.community_id === params.communityId) &&
            (keywordMatch(post.title, params.keyword) ||
              keywordMatch(post.content, params.keyword))
        );

        return paginate(posts, params);
      },
      detail(id: string) {
        const post = state.posts.find((item) => item._id === id);
        return post && isLaunchVisiblePost(post) ? post : null;
      },
      create(input: Partial<Post>, actorId?: string) {
        const actor = requireUser(actorId);
        const post: Post = {
          _id: idFrom("post"),
          author_user_id: actor._id,
          community_id: "tongzilin",
          title: input.title ?? "",
          content: input.content ?? "",
          language: input.language ?? "zh",
          tag_ids: input.tag_ids ?? [],
          location_text: input.location_text ?? null,
          image_file_ids: input.image_file_ids ?? [],
          image_urls: input.image_urls ?? [],
          status: "visible",
          review_status: "visible"
        };
        state.posts.unshift(post);
        return post;
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
        return post;
      },
      moderate(id: string, input: { review_status: Post["review_status"] }) {
        const post = state.posts.find((item) => item._id === id);
        if (!post) {
          return null;
        }
        post.review_status = input.review_status;
        post.status = input.review_status;
        return post;
      }
    },
    places: {
      list(params: PageParams = {}) {
        const places = sortPlaces(
          state.places.filter((place) => {
            if (place.status !== "published") {
              return false;
            }

            if (params.communityId && place.community_id !== params.communityId) {
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
        )
          .map((place) => ({
            _id: place._id,
            name_zh: place.name_zh,
            name_en: place.name_en,
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
          gallery_urls: input.gallery_urls ?? [],
          supports_navigation: input.supports_navigation ?? true,
          supports_favorite: input.supports_favorite ?? true,
          supports_share: input.supports_share ?? true,
          status: input.status ?? "draft",
          import_review: input.import_review ?? null
        };

        state.places.unshift(place);
        return place;
      },
      update(id: string, input: Partial<Place>) {
        const existing = state.places.find((place) => place._id === id);
        if (!existing) {
          return null;
        }
        Object.assign(existing, input);
        return existing;
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
