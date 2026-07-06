import { randomUUID } from "node:crypto";

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
  type Event,
  type EventAdminListItem,
  type EventAdminRegistrationRow,
  type EventRegistration,
  type EventTicket,
  type FileAsset,
  type PageResult,
  type Place,
  type PlaceDetail,
  type PlaceGalleryMedia,
  type PlaceListItem,
  type PlaceMapMarker
} from "@community-map/shared";

import { apiError } from "../../lib/errors";
import { createMockProvider } from "../mock";
import type { ApiProvider } from "../types";

const DEFAULT_COMMUNITY_ID = "tongzilin";
const MAX_PLACES_FETCH = 1000;
const MAX_EVENTS_FETCH = 1000;

type CloudbaseApp = ReturnType<typeof tcb.init>;
type CloudbaseDatabase = ReturnType<CloudbaseApp["database"]>;
type CloudbaseCollection = ReturnType<
  ReturnType<ReturnType<typeof tcb.init>["database"]>["collection"]
>;

interface CloudbaseDocumentGetResult {
  data: unknown;
}

interface CloudbaseListGetResult {
  data: unknown[];
}

interface CloudbaseUpdateResult {
  updated?: number;
}

interface CloudbaseDocumentReference {
  get(): Promise<CloudbaseDocumentGetResult>;
  set(data: object): Promise<unknown>;
  update(data: object): Promise<CloudbaseUpdateResult>;
}

interface CloudbaseTransactionQuery {
  where(query: object): CloudbaseTransactionQuery;
  limit(limit: number): CloudbaseTransactionQuery;
  get(): Promise<CloudbaseListGetResult>;
}

interface CloudbaseTransactionCollection extends CloudbaseTransactionQuery {
  doc(id: string | number): CloudbaseDocumentReference;
}

interface CloudbaseTransaction {
  collection(collectionName: string): CloudbaseTransactionCollection;
}

interface LiveCloudbaseContext {
  app: CloudbaseApp;
  db: CloudbaseDatabase;
  events: CloudbaseCollection;
  eventRegistrations: CloudbaseCollection;
  eventTickets: CloudbaseCollection;
  places: CloudbaseCollection;
  fileAssets: CloudbaseCollection;
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

const isAdmin = (user: { role_flags: string[] }) =>
  user.role_flags.includes("community_admin") ||
  user.role_flags.includes("system_admin");

const isLaunchVisibleEvent = (event: Event) =>
  event.review_status === "approved" && event.publish_status === "published";

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
      getTempFileURL(input: {
        fileList: string[];
      }): Promise<{ fileList: Array<{ fileID: string; tempFileURL?: string }> }>;
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
    events: db.collection("events"),
    eventRegistrations: db.collection("event_registrations"),
    eventTickets: db.collection("event_tickets"),
    places: db.collection("places"),
    fileAssets: db.collection("file_assets")
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

const normalizePlace = (raw: unknown): Place | null => {
  const parsed = PlaceSchema.safeParse(raw);
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
  const result = await context.eventRegistrations
    .limit(MAX_EVENTS_FETCH)
    .get();
  return result.data
    .map(normalizeEventRegistration)
    .filter((registration): registration is EventRegistration => !!registration);
};

const readEventTickets = async (context: LiveCloudbaseContext) => {
  const result = await context.eventTickets.limit(MAX_EVENTS_FETCH).get();
  return result.data
    .map(normalizeEventTicket)
    .filter((ticket): ticket is EventTicket => !!ticket);
};

const readPlaces = async (context: LiveCloudbaseContext) => {
  const result = await context.places.limit(MAX_PLACES_FETCH).get();
  return result.data
    .map(normalizePlace)
    .filter((place): place is Place => !!place);
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
    const result: unknown = await context.db.runTransaction(
      async (transaction: CloudbaseTransaction) => {
        const [eventResult, registrationResult] = await Promise.all([
          transaction.collection("events").doc(eventId).get(),
          transaction
            .collection("event_registrations")
            .where({ event_id: eventId })
            .limit(MAX_EVENTS_FETCH)
            .get()
        ]);
        const event = normalizeEvent(eventResult.data);
        const registrations = Array.isArray(registrationResult.data)
          ? registrationResult.data
              .map(normalizeEventRegistration)
              .filter(
                (registration): registration is EventRegistration =>
                  !!registration
              )
          : [];

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
            registration.user_id === actor._id &&
            isActiveRegistration(registration)
        );

        if (hasActiveRegistration) {
          throw apiError("CONFLICT", "Registration already exists.", 409, {
            reason: "already_registered"
          });
        }

        const confirmedAttendees = registrations
          .filter(isActiveRegistration)
          .reduce(
            (sum, registration) => sum + registration.attendee_count,
            0
          );
        const currentConfirmedAttendees = Math.max(
          storedConfirmedAttendeeCount(eventResult.data) ?? 0,
          confirmedAttendees
        );

        if (
          currentConfirmedAttendees + input.attendee_count >
          event.capacity
        ) {
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
          transaction.collection("events").doc(eventId).update({
            confirmed_attendee_count: nextConfirmedAttendees
          }),
          transaction
            .collection("event_registrations")
            .doc(registration._id)
            .set(toCloudbaseSetDocument(registration)),
          transaction
            .collection("event_tickets")
            .doc(ticket._id)
            .set(toCloudbaseSetDocument(ticket))
        ]);

        return { registration, ticket };
      }
    );

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

export const createCloudbaseProvider = (): ApiProvider => {
  const fallback = createMockProvider();
  const liveContext = createLiveContext();

  if (!liveContext) {
    return fallback;
  }

  return {
    ...fallback,
    events: createLiveEventsProvider(liveContext, fallback.auth),
    places: createLivePlacesProvider(liveContext)
  };
};
