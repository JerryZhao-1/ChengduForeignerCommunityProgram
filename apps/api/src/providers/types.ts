import type {
  Announcement,
  AuthSession,
  Comment,
  DiscoverAuditRecord,
  DiscoverMeGovernance,
  DiscoverReportCase,
  DiscoverUserGovernanceDetail,
  DiscoverUserGovernanceSummary,
  Event,
  EventAdminListItem,
  EventAdminRegistrationRow,
  DeleteEventResponse,
  EventRegistration,
  EventTicket,
  FileAsset,
  Notification,
  PageResult,
  Place,
  DirectPlaceGalleryUploadResponse,
  DirectEventCoverUploadResponse,
  DeletePlaceResponse,
  PlaceDetail,
  PlaceListItem,
  PlaceMapMarker,
  Post,
  UserEnforcementState,
  User
} from "@community-map/shared";

export interface ApiProvider {
  auth: {
    resolveActor(userId?: string): Promise<User>;
    login(input: {
      mock_user_id?: string;
      preferred_language?: "zh" | "en";
    }): Promise<AuthSession>;
    me(userId?: string): Promise<AuthSession>;
  };
  events: {
    list(input: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      communityId?: string;
    }): Promise<PageResult<Event>>;
    listAdmin(): Promise<PageResult<EventAdminListItem>>;
    detail(id: string): Promise<Event | null>;
    listRegistrationsForAdmin(
      eventId: string
    ): Promise<EventAdminRegistrationRow[] | null>;
    createRegistration(
      eventId: string,
      input: {
        contact_name: string;
        contact_phone: string;
        attendee_count: number;
        source_channel: string;
      },
      actorId?: string
    ): Promise<{ registration: EventRegistration; ticket: EventTicket }>;
    listMyRegistrations(actorId?: string): Promise<EventRegistration[]>;
    getTicketByRegistration(
      registrationId: string,
      actorId?: string
    ): Promise<EventTicket | null>;
    create(input: Partial<Event>, actorId?: string): Promise<Event>;
    update(id: string, input: Partial<Event>): Promise<Event | null>;
    delete(id: string): Promise<DeleteEventResponse | null>;
    uploadCoverFile(
      id: string | null,
      input: {
        file_name: string;
        content_type: string;
        buffer: Buffer;
      },
      actorId?: string
    ): Promise<DirectEventCoverUploadResponse | null>;
    review(
      id: string,
      input: {
        review_status: Event["review_status"];
        publish_status?: Event["publish_status"];
      }
    ): Promise<Event | null>;
    checkin(id: string, ticketId: string): Promise<EventTicket | null>;
  };
  posts: {
    list(input: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      communityId?: string;
    }): Promise<PageResult<Post>>;
    listMine(
      input: {
        page?: number;
        pageSize?: number;
        communityId?: string;
      },
      actorId?: string
    ): Promise<PageResult<Post>>;
    meGovernance(actorId?: string): Promise<DiscoverMeGovernance>;
    listAdmin(
      input: {
        page?: number;
        pageSize?: number;
        communityId?: string;
        keyword?: string;
        authorUserId?: string;
        language?: "zh" | "en";
        tag?: string;
        status?: string;
      },
      actorId?: string
    ): Promise<PageResult<Post>>;
    detail(id: string): Promise<Post | null>;
    listComments(
      postId: string,
      input: { page?: number; pageSize?: number }
    ): Promise<PageResult<Comment>>;
    listAdminComments(
      input: {
        page?: number;
        pageSize?: number;
        postId?: string;
        authorUserId?: string;
        keyword?: string;
        status?: string;
      },
      actorId?: string
    ): Promise<PageResult<Comment>>;
    create(input: Partial<Post>, actorId?: string): Promise<Post>;
    createComment(
      postId: string,
      input: Pick<Comment, "content" | "language">,
      actorId?: string
    ): Promise<Comment>;
    report(
      id: string,
      input: {
        reason: string;
        description?: string;
        evidence_file_ids?: string[];
      },
      actorId?: string
    ): Promise<Post | null>;
    reportComment(
      postId: string,
      commentId: string,
      input: {
        reason: string;
        description?: string;
        evidence_file_ids?: string[];
      },
      actorId?: string
    ): Promise<DiscoverReportCase | null>;
    moderate(
      id: string,
      input: { review_status: Post["review_status"]; reason?: string },
      actorId?: string
    ): Promise<Post | null>;
    moderateComment(
      id: string,
      input: { status: Comment["status"]; reason?: string },
      actorId?: string
    ): Promise<Comment | null>;
    listReportCases(
      input: {
        page?: number;
        pageSize?: number;
        targetType?: "post" | "comment";
        status?: string;
        reason?: string;
      },
      actorId?: string
    ): Promise<PageResult<DiscoverReportCase>>;
    detailReportCase(
      id: string,
      actorId?: string
    ): Promise<DiscoverReportCase | null>;
    resolveReportCase(
      id: string,
      input: {
        status: "actioned" | "rejected";
        reason: string;
        moderation_action?: "none" | "hide" | "restore" | "delete";
      },
      actorId?: string
    ): Promise<DiscoverReportCase | null>;
    listGovernanceUsers(
      input: {
        page?: number;
        pageSize?: number;
        keyword?: string;
        status?: string;
      },
      actorId?: string
    ): Promise<PageResult<DiscoverUserGovernanceSummary>>;
    detailGovernanceUser(
      id: string,
      actorId?: string
    ): Promise<DiscoverUserGovernanceDetail | null>;
    enforceUser(
      id: string,
      input: {
        status: UserEnforcementState["status"];
        reason: string;
        notes?: string;
        expires_at?: string | null;
      },
      actorId?: string
    ): Promise<DiscoverUserGovernanceDetail | null>;
    listAuditRecords(
      input: {
        page?: number;
        pageSize?: number;
        targetType?: "post" | "comment" | "report" | "user";
        targetId?: string;
        actorUserId?: string;
      },
      actorId?: string
    ): Promise<PageResult<DiscoverAuditRecord>>;
  };
  places: {
    list(input: {
      page?: number;
      pageSize?: number;
      keyword?: string;
      communityId?: string;
      category?: string;
      tag?: string;
      recommended?: boolean;
      sort?: "recommended" | "name";
    }): Promise<PageResult<PlaceListItem>>;
    listAdmin(): Promise<PageResult<Place>>;
    detail(id: string): Promise<PlaceDetail | null>;
    mapMarkers(): Promise<PlaceMapMarker[]>;
    create(input: Partial<Place>): Promise<Place>;
    update(id: string, input: Partial<Place>): Promise<Place | null>;
    delete(id: string): Promise<DeletePlaceResponse | null>;
    uploadGalleryFile(
      id: string | null,
      input: {
        file_name: string;
        content_type: string;
        buffer: Buffer;
      },
      actorId?: string
    ): Promise<DirectPlaceGalleryUploadResponse | null>;
  };
  announcements: {
    list(input: {
      page?: number;
      pageSize?: number;
    }): Promise<PageResult<Announcement>>;
    detail(id: string): Promise<Announcement | null>;
  };
  notifications: {
    list(actorId?: string): Promise<Notification[]>;
    markRead(id: string, actorId?: string): Promise<Notification | null>;
  };
  files: {
    createUploadRequest(input: {
      biz_type: string;
      biz_id: string;
      file_name: string;
      target_prefix: string;
    }): Promise<{ cloud_path: string; upload_url: string; expires_in: number }>;
    complete(
      input: {
        biz_type: string;
        biz_id: string;
        file_id: string;
        cloud_path: string;
        visibility: FileAsset["visibility"];
      },
      actorId?: string
    ): Promise<FileAsset>;
    privateUrl(
      input: { file_id: string },
      actorId?: string
    ): Promise<{
      temp_url: string;
      expires_at: string;
    }>;
    uploadPostMedia(
      input: {
        file_name: string;
        content_type: string;
        buffer: Buffer;
        kind: "image" | "video";
      },
      actorId?: string
    ): Promise<FileAsset>;
    uploadReportEvidence(
      input: {
        file_name: string;
        content_type: string;
        buffer: Buffer;
        kind: "image" | "video";
        biz_id?: string;
      },
      actorId?: string
    ): Promise<FileAsset>;
  };
}
