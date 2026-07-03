import type {
  Announcement,
  AuthSession,
  Comment,
  Event,
  EventRegistration,
  EventTicket,
  FileAsset,
  Notification,
  Place,
  DeletePlaceResponse,
  PlaceDetail,
  PlaceAmapMediaSearchItem,
  PlaceListItem,
  PlaceMapMarker,
  PlacePoiSearchItem,
  Post
} from "../types/entities";
import type { ApiResult, PageResult } from "../types/common";

import { createMockService } from "./service";

export interface ClientContext {
  actorId?: string;
}

export interface CommunityMapApiClient {
  auth: {
    login(input: {
      code?: string;
      mock_user_id?: string;
      preferred_language?: "zh" | "en";
    }): Promise<ApiResult<AuthSession>>;
    me(): Promise<ApiResult<AuthSession>>;
  };
  events: {
    list(query?: {
      page?: number;
      pageSize?: number;
      communityId?: string;
      keyword?: string;
    }): Promise<ApiResult<PageResult<Event>>>;
    detail(id: string): Promise<ApiResult<Event>>;
    register(
      eventId: string,
      input: {
        contact_name: string;
        contact_phone: string;
        attendee_count: number;
        source_channel: string;
      }
    ): Promise<
      ApiResult<{ registration: EventRegistration; ticket: EventTicket }>
    >;
    myRegistrations(): Promise<ApiResult<EventRegistration[]>>;
    registrationTicket(registrationId: string): Promise<ApiResult<EventTicket>>;
  };
  discover: {
    listPosts(query?: {
      page?: number;
      pageSize?: number;
      communityId?: string;
      keyword?: string;
    }): Promise<ApiResult<PageResult<Post>>>;
    detailPost(id: string): Promise<ApiResult<Post>>;
    createPost(input: {
      title: string;
      content: string;
      language: "zh" | "en";
      tag_ids: string[];
      location_text?: string | null;
      image_file_ids?: string[];
      image_urls?: string[];
    }): Promise<ApiResult<Post>>;
    createComment(
      postId: string,
      input: { content: string; language: "zh" | "en" }
    ): Promise<ApiResult<Comment>>;
  };
  places: {
    list(query?: {
      page?: number;
      pageSize?: number;
      communityId?: string;
      keyword?: string;
      category?: string;
      tag?: string;
      recommended?: boolean;
      sort?: "recommended" | "name";
    }): Promise<ApiResult<PageResult<PlaceListItem>>>;
    detail(id: string): Promise<ApiResult<PlaceDetail>>;
    mapMarkers(): Promise<ApiResult<PlaceMapMarker[]>>;
  };
  announcements: {
    list(): Promise<ApiResult<PageResult<Announcement>>>;
    detail(id: string): Promise<ApiResult<Announcement>>;
  };
  notifications: {
    list(): Promise<ApiResult<Notification[]>>;
    markRead(id: string): Promise<ApiResult<Notification>>;
  };
  files: {
    createUploadRequest(input: {
      biz_type: string;
      biz_id: string;
      file_name: string;
      target_prefix: string;
      visibility: "public" | "private";
    }): Promise<
      ApiResult<{ cloud_path: string; upload_url: string; expires_in: number }>
    >;
    complete(input: {
      biz_type: string;
      biz_id: string;
      file_id: string;
      cloud_path: string;
      visibility: "public" | "private";
    }): Promise<ApiResult<FileAsset>>;
    privateUrl(input: {
      file_id: string;
    }): Promise<ApiResult<{ temp_url: string; expires_at: string }>>;
  };
  admin: {
    listPlaces(): Promise<ApiResult<PageResult<Place>>>;
    createEvent(input: Partial<Event>): Promise<ApiResult<Event>>;
    updateEvent(id: string, input: Partial<Event>): Promise<ApiResult<Event>>;
    reviewEvent(
      id: string,
      input: {
        review_status: Event["review_status"];
        publish_status?: Event["publish_status"];
      }
    ): Promise<ApiResult<Event>>;
    checkinEvent(
      id: string,
      input: { ticket_id: string }
    ): Promise<ApiResult<EventTicket>>;
    moderatePost(
      id: string,
      input: { review_status: Post["review_status"] }
    ): Promise<ApiResult<Post>>;
    createPlace(input: Partial<Place>): Promise<ApiResult<Place>>;
    updatePlace(id: string, input: Partial<Place>): Promise<ApiResult<Place>>;
    deletePlace(id: string): Promise<ApiResult<DeletePlaceResponse>>;
    searchPlacePoi(input: {
      keyword: string;
    }): Promise<ApiResult<PlacePoiSearchItem[]>>;
    searchPlaceAmapMedia(input: {
      keyword: string;
      city?: string;
    }): Promise<ApiResult<PlaceAmapMediaSearchItem[]>>;
    uploadPlaceGalleryFile(
      id: string,
      input: { file: Blob; file_name?: string; content_type?: string }
    ): Promise<
      ApiResult<{ file_asset: FileAsset; gallery_file_ids: string[] }>
    >;
    uploadPendingPlaceGalleryFile(input: {
      file: Blob;
      file_name?: string;
      content_type?: string;
    }): Promise<
      ApiResult<{ file_asset: FileAsset; gallery_file_ids: string[] }>
    >;
  };
}

const createRequestId = () => {
  const runtimeCrypto =
    typeof globalThis === "undefined" ? undefined : globalThis.crypto;

  if (runtimeCrypto?.randomUUID) {
    return runtimeCrypto.randomUUID();
  }

  return `mock_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const ok = <TData>(data: TData): ApiResult<TData> => ({
  success: true,
  data,
  requestId: createRequestId()
});

export const createMockClient = (
  context: ClientContext = {}
): CommunityMapApiClient => {
  const service = createMockService();
  const actorId = context.actorId;

  return {
    auth: {
      async login(input) {
        return ok(service.auth.login(input));
      },
      async me() {
        return ok(service.auth.me(actorId));
      }
    },
    events: {
      async list(query) {
        return ok(service.events.list(query));
      },
      async detail(id) {
        return ok(service.events.detail(id) as Event);
      },
      async register(eventId, input) {
        return ok(service.events.createRegistration(eventId, input, actorId));
      },
      async myRegistrations() {
        return ok(service.events.listMyRegistrations(actorId));
      },
      async registrationTicket(registrationId) {
        return ok(
          service.events.getTicketByRegistration(registrationId) as EventTicket
        );
      }
    },
    discover: {
      async listPosts(query) {
        return ok(service.posts.list(query));
      },
      async detailPost(id) {
        return ok(service.posts.detail(id) as Post);
      },
      async createPost(input) {
        return ok(service.posts.create(input, actorId));
      },
      async createComment(postId, input) {
        return ok(service.posts.createComment(postId, input, actorId));
      }
    },
    places: {
      async list(query) {
        return ok(service.places.list(query));
      },
      async detail(id) {
        return ok(service.places.detail(id) as PlaceDetail);
      },
      async mapMarkers() {
        return ok(service.places.mapMarkers());
      }
    },
    announcements: {
      async list() {
        return ok(service.announcements.list());
      },
      async detail(id) {
        return ok(service.announcements.detail(id) as Announcement);
      }
    },
    notifications: {
      async list() {
        return ok(service.notifications.list(actorId));
      },
      async markRead(id) {
        return ok(service.notifications.markRead(id, actorId) as Notification);
      }
    },
    files: {
      async createUploadRequest(input) {
        return ok(service.files.createUploadRequest(input));
      },
      async complete(input) {
        return ok(service.files.complete(input, actorId));
      },
      async privateUrl(input) {
        return ok(service.files.privateUrl(input));
      }
    },
    admin: {
      async listPlaces() {
        return ok(service.places.listAdmin());
      },
      async createEvent(input) {
        return ok(service.events.create(input, actorId));
      },
      async updateEvent(id, input) {
        return ok(service.events.update(id, input) as Event);
      },
      async reviewEvent(id, input) {
        return ok(service.events.review(id, input) as Event);
      },
      async checkinEvent(id, input) {
        return ok(service.events.checkin(id, input.ticket_id) as EventTicket);
      },
      async moderatePost(id, input) {
        return ok(service.posts.moderate(id, input) as Post);
      },
      async createPlace(input) {
        return ok(service.places.create(input));
      },
      async updatePlace(id, input) {
        return ok(service.places.update(id, input) as Place);
      },
      async deletePlace(id) {
        return ok(service.places.delete(id) as DeletePlaceResponse);
      },
      async searchPlacePoi(input) {
        return ok([
          {
            id: `mock_poi_${encodeURIComponent(input.keyword)}`,
            title: input.keyword,
            address: "四川省成都市武侯区桐梓林路",
            category: "生活服务",
            location: {
              latitude: 30.615,
              longitude: 104.062
            },
            province: "四川省",
            city: "成都市",
            district: "武侯区"
          },
          {
            id: `mock_poi_${encodeURIComponent(input.keyword)}_metro`,
            title: `${input.keyword} A口`,
            address: "四川省成都市武侯区人民南路四段",
            category: "交通设施",
            location: {
              latitude: 30.6162,
              longitude: 104.0634
            },
            province: "四川省",
            city: "成都市",
            district: "武侯区"
          },
          {
            id: `mock_poi_${encodeURIComponent(input.keyword)}_business`,
            title: `${input.keyword} 商圈`,
            address: "四川省成都市武侯区桐梓林东路",
            category: "商务住宅",
            location: {
              latitude: 30.6143,
              longitude: 104.0608
            },
            province: "四川省",
            city: "成都市",
            district: "武侯区"
          }
        ]);
      },
      async searchPlaceAmapMedia(input) {
        const encodedKeyword = encodeURIComponent(input.keyword);
        return ok([
          {
            id: `amap_${encodedKeyword}`,
            title: input.keyword,
            address: "四川省成都市武侯区桐梓林路",
            category: "生活服务",
            location: {
              latitude: 30.615,
              longitude: 104.062
            },
            province: "四川省",
            city: input.city ?? "成都",
            district: "武侯区",
            image_candidates: [
              {
                source: "amap",
                source_place_id: `amap_${encodedKeyword}`,
                image_url: `https://store.is.autonavi.com/showpic/mock-${encodedKeyword}.jpg`,
                image_title: `${input.keyword} photo`,
                attribution: {
                  label: "Image source: Amap",
                  provider_name: "Amap"
                }
              }
            ]
          }
        ]);
      },
      async uploadPlaceGalleryFile(id, input) {
        const fileName = input.file_name ?? "gallery-upload.jpg";
        const cloudPath = `${id}/${fileName}`;
        const completion = service.files.complete(
          {
            biz_type: "place_gallery",
            biz_id: id,
            file_id: `cloud://public/places/${cloudPath}`,
            cloud_path: `public/places/${cloudPath}`,
            visibility: "public"
          },
          actorId
        );
        const place = service.places.update(id, {
          gallery_file_ids: [
            ...new Set([
              ...(service._state.places.find((item) => item._id === id)
                ?.gallery_file_ids ?? []),
              completion.file_id
            ])
          ]
        });

        return ok({
          file_asset: completion,
          gallery_file_ids: place?.gallery_file_ids ?? [completion.file_id]
        });
      },
      async uploadPendingPlaceGalleryFile(input) {
        const fileName = input.file_name ?? "gallery-upload.jpg";
        const pendingId = `pending_${Date.now().toString(36)}`;
        const completion = service.files.complete(
          {
            biz_type: "place_gallery",
            biz_id: "__pending_place_gallery__",
            file_id: `cloud://public/places/_pending/${pendingId}/${fileName}`,
            cloud_path: `public/places/_pending/${pendingId}/${fileName}`,
            visibility: "public"
          },
          actorId
        );

        return ok({
          file_asset: completion,
          gallery_file_ids: [completion.file_id]
        });
      }
    }
  };
};
