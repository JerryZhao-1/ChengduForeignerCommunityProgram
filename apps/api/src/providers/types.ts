import type {
  Announcement,
  AuthSession,
  Comment,
  DiscoverAuditRecord,
  DiscoverAnalytics,
  DiscoverTag,
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
  PostInteractionState,
  ProfileFollowListItem,
  ProfileFollowState,
  PublicProfile,
  UserEnforcementState,
  User
} from "@community-map/shared";

export interface WechatMiniappIdentity {
  openid: string;
  appid: string;
  unionid?: string;
  preferredLanguage?: "zh" | "en";
}

export interface ApiProvider {
  auth: {
    resolveActor(
      userId?: string,
      identity?: WechatMiniappIdentity
    ): Promise<User>;
    login(input: {
      mock_user_id?: string;
      preferred_language?: "zh" | "en";
    }): Promise<AuthSession>;
    adminLogin(input: {
      username: string;
      password: string;
    }): Promise<AuthSession>;
    me(userId?: string): Promise<AuthSession>;
    wechatMiniappSession(input: {
      preferred_language?: "zh" | "en";
      identity?: WechatMiniappIdentity;
    }): Promise<AuthSession>;
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
      tag?: string;
      sort?: "latest" | "likes" | "favorites" | "comments";
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
    listLiked(
      input: {
        page?: number;
        pageSize?: number;
        communityId?: string;
      },
      actorId?: string
    ): Promise<PageResult<Post>>;
    listFavorited(
      input: {
        page?: number;
        pageSize?: number;
        communityId?: string;
      },
      actorId?: string
    ): Promise<PageResult<Post>>;
    listRelatedByPlace(input: {
      placeId: string;
      page?: number;
      pageSize?: number;
      communityId?: string;
    }): Promise<PageResult<Post> | null>;
    listRelatedByEvent(input: {
      eventId: string;
      page?: number;
      pageSize?: number;
      communityId?: string;
    }): Promise<PageResult<Post> | null>;
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
    interaction(id: string, actorId?: string): Promise<PostInteractionState>;
    setLike(
      id: string,
      input: { liked: boolean },
      actorId?: string
    ): Promise<PostInteractionState>;
    setFavorite(
      id: string,
      input: { favorited: boolean },
      actorId?: string
    ): Promise<PostInteractionState>;
    recordShare(
      id: string,
      input: {
        channel?: "wechat" | "moments" | "copy_link" | "system" | "other";
      },
      actorId?: string
    ): Promise<PostInteractionState>;
    profile(userId: string, actorId?: string): Promise<PublicProfile | null>;
    setProfileFollow(
      userId: string,
      input: { following: boolean },
      actorId?: string
    ): Promise<ProfileFollowState>;
    listProfileFollowers(
      userId: string,
      input: { page?: number; pageSize?: number },
      actorId?: string
    ): Promise<PageResult<ProfileFollowListItem> | null>;
    listProfileFollowing(
      userId: string,
      input: { page?: number; pageSize?: number },
      actorId?: string
    ): Promise<PageResult<ProfileFollowListItem> | null>;
    listPublicTags(input: {
      page?: number;
      pageSize?: number;
      keyword?: string;
    }): Promise<PageResult<DiscoverTag>>;
    createTag(input: { label: string }, actorId?: string): Promise<DiscoverTag>;
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
    listMyComments(
      input: { page?: number; pageSize?: number },
      actorId?: string
    ): Promise<PageResult<Comment>>;
    detailMyComment(id: string, actorId?: string): Promise<Comment | null>;
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
    ): Promise<Post | null>;
    listTags(actorId?: string): Promise<PageResult<DiscoverTag>>;
    upsertTag(
      id: string,
      input: { label_zh: string; label_en: string; status?: "active" | "hidden" },
      actorId?: string
    ): Promise<DiscoverTag>;
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
    listMyReportCases(
      input: { page?: number; pageSize?: number },
      actorId?: string
    ): Promise<PageResult<DiscoverReportCase>>;
    detailMyReportCase(
      id: string,
      actorId?: string
    ): Promise<DiscoverReportCase | null>;
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
        targetType?: "post" | "comment" | "report" | "user" | "tag";
        targetId?: string;
        actorUserId?: string;
      },
      actorId?: string
    ): Promise<PageResult<DiscoverAuditRecord>>;
    analytics(
      input: { windowDays?: number },
      actorId?: string
    ): Promise<DiscoverAnalytics>;
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
