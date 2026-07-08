export const apiPaths = {
  auth: {
    login: "/auth/login",
    me: "/auth/me"
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
    createPost: "/discover/posts",
    myPosts: "/discover/me/posts",
    meGovernance: "/discover/me/governance",
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
    moderateComment: (id: string) =>
      `/admin/discover/comments/${id}/moderation`,
    resolveDiscoverReport: (id: string) =>
      `/admin/discover/reports/${id}/resolve`,
    listDiscoverUsers: "/admin/discover/users",
    detailDiscoverUser: (id: string) => `/admin/discover/users/${id}`,
    enforceDiscoverUser: (id: string) =>
      `/admin/discover/users/${id}/enforcement`,
    listDiscoverAudit: "/admin/discover/audit",
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
