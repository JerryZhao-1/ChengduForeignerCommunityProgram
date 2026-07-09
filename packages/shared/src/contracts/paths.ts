export const apiPaths = {
  auth: {
    login: "/auth/login",
    adminLogin: "/auth/admin/login",
    me: "/auth/me",
    wechatMiniappSession: "/auth/wechat-miniapp/session"
  },
  events: {
    list: "/events",
    detail: (id: string) => `/events/${id}`,
    createRegistration: (id: string) => `/events/${id}/registrations`,
    myRegistrations: "/events/me/registrations",
    registrationTicket: (id: string) => `/events/registrations/${id}/ticket`
  },
  discover: {
    listPosts: "/discover/posts",
    detailPost: (id: string) => `/discover/posts/${id}`,
    postInteraction: (id: string) => `/discover/posts/${id}/interaction`,
    likePost: (id: string) => `/discover/posts/${id}/like`,
    favoritePost: (id: string) => `/discover/posts/${id}/favorite`,
    sharePost: (id: string) => `/discover/posts/${id}/share`,
    profile: (userId: string) => `/discover/profiles/${userId}`,
    followProfile: (userId: string) => `/discover/profiles/${userId}/follow`,
    profileFollowers: (userId: string) =>
      `/discover/profiles/${userId}/followers`,
    profileFollowing: (userId: string) =>
      `/discover/profiles/${userId}/following`,
    listTags: "/discover/tags",
    createTag: "/discover/tags",
    createPost: "/discover/posts",
    myPosts: "/discover/me/posts",
    myLikedPosts: "/discover/me/liked-posts",
    myFavoritedPosts: "/discover/me/favorited-posts",
    myComments: "/discover/me/comments",
    myCommentDetail: (id: string) => `/discover/me/comments/${id}`,
    myReports: "/discover/me/reports",
    myReportDetail: (id: string) => `/discover/me/reports/${id}`,
    meGovernance: "/discover/me/governance",
    listPlaceRelatedPosts: (placeId: string) =>
      `/discover/places/${placeId}/posts`,
    listEventRelatedPosts: (eventId: string) =>
      `/discover/events/${eventId}/posts`,
    listComments: (id: string) => `/discover/posts/${id}/comments`,
    createComment: (id: string) => `/discover/posts/${id}/comments`,
    reportPost: (id: string) => `/discover/posts/${id}/report`,
    reportComment: (postId: string, commentId: string) =>
      `/discover/posts/${postId}/comments/${commentId}/report`
  },
  places: {
    list: "/places",
    detail: (id: string) => `/places/${id}`,
    mapMarkers: "/places/map-markers"
  },
  announcements: {
    list: "/announcements",
    detail: (id: string) => `/announcements/${id}`
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string) => `/notifications/${id}/read`
  },
  files: {
    createUploadRequest: "/files/upload-requests",
    completeUpload: "/files/complete",
    privateUrl: "/files/private-url",
    uploadPostMedia: "/files/post-media",
    uploadReportEvidence: "/files/report-evidence"
  },
  admin: {
    listEvents: "/admin/events",
    createEvent: "/admin/events",
    updateEvent: (id: string) => `/admin/events/${id}`,
    deleteEvent: (id: string) => `/admin/events/${id}`,
    reviewEvent: (id: string) => `/admin/events/${id}/review`,
    eventRegistrations: (id: string) => `/admin/events/${id}/registrations`,
    checkinEvent: (id: string) => `/admin/events/${id}/checkin`,
    uploadPendingEventCoverFile: "/admin/events/cover-file",
    uploadEventCoverFile: (id: string) => `/admin/events/${id}/cover-file`,
    listDiscoverPosts: "/admin/discover/posts",
    listDiscoverComments: "/admin/discover/comments",
    listDiscoverReports: "/admin/discover/reports",
    detailDiscoverReport: (id: string) => `/admin/discover/reports/${id}`,
    moderatePost: (id: string) => `/admin/discover/posts/${id}/moderation`,
    updateDiscoverPostOps: (id: string) => `/admin/discover/posts/${id}/ops`,
    listDiscoverTags: "/admin/discover/tags",
    upsertDiscoverTag: (id: string) => `/admin/discover/tags/${id}`,
    moderateComment: (id: string) =>
      `/admin/discover/comments/${id}/moderation`,
    resolveDiscoverReport: (id: string) =>
      `/admin/discover/reports/${id}/resolve`,
    listDiscoverUsers: "/admin/discover/users",
    detailDiscoverUser: (id: string) => `/admin/discover/users/${id}`,
    enforceDiscoverUser: (id: string) =>
      `/admin/discover/users/${id}/enforcement`,
    listDiscoverAudit: "/admin/discover/audit",
    discoverAnalytics: "/admin/discover/analytics",
    listPlaces: "/admin/places",
    searchPlacePoi: "/admin/places/poi-search",
    searchPlaceAmapMedia: "/admin/places/amap-media-search",
    createPlace: "/admin/places",
    updatePlace: (id: string) => `/admin/places/${id}`,
    deletePlace: (id: string) => `/admin/places/${id}`,
    uploadPendingPlaceGalleryFile: "/admin/places/gallery-files",
    uploadPlaceGalleryFile: (id: string) => `/admin/places/${id}/gallery-files`
  }
};
