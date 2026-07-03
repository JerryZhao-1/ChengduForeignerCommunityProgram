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
    createComment: (id: string) => `/discover/posts/${id}/comments`,
    reportPost: (id: string) => `/discover/posts/${id}/report`
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
    privateUrl: "/files/private-url"
  },
  admin: {
    createEvent: "/admin/events",
    updateEvent: (id: string) => `/admin/events/${id}`,
    reviewEvent: (id: string) => `/admin/events/${id}/review`,
    checkinEvent: (id: string) => `/admin/events/${id}/checkin`,
    moderatePost: (id: string) => `/admin/discover/posts/${id}/moderation`,
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
