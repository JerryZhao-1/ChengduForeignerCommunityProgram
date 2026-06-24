import type {
  Announcement,
  Comment,
  Event,
  EventRegistration,
  EventTicket,
  FileAsset,
  Notification,
  Place,
  Post,
  User
} from "../types/entities";

export interface MockDataset {
  users: User[];
  events: Event[];
  registrations: EventRegistration[];
  tickets: EventTicket[];
  places: Place[];
  posts: Post[];
  comments: Comment[];
  announcements: Announcement[];
  notifications: Notification[];
  fileAssets: FileAsset[];
}

export const createMockDataset = (): MockDataset => ({
  users: [
    {
      _id: "user_001",
      openid: "openid_001",
      unionid: "unionid_001",
      nickname: "Jerry",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      phone: "13800000000",
      preferred_language: "zh",
      role_flags: ["user", "community_admin", "system_admin"],
      status: "active"
    },
    {
      _id: "user_002",
      openid: "openid_002",
      unionid: "unionid_002",
      nickname: "Emma",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      phone: "13900000000",
      preferred_language: "en",
      role_flags: ["user", "organizer"],
      status: "active"
    },
    {
      _id: "user_inactive",
      openid: "openid_inactive",
      nickname: "Inactive User",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
      preferred_language: "en",
      role_flags: ["user"],
      status: "inactive"
    }
  ],
  events: [
    {
      _id: "event_001",
      community_id: "tongzilin",
      title_zh: "周末国际邻里早午餐",
      title_en: "Weekend Neighborhood Brunch",
      summary_zh: "面向桐梓林新老居民的轻社交活动。",
      summary_en: "A casual meet-up for old and new Tongzilin neighbors.",
      content_zh: "现场提供轻食、社区介绍和志愿者报名入口。",
      content_en: "Light food, community overview, and volunteer onboarding.",
      cover_file_id: "cloud://event-cover-001",
      cover_cloud_path: "public/events/event_001/cover.jpg",
      cover_url: "https://example.com/public/events/event_001/cover.jpg",
      place_id: "place_001",
      address_text: "桐梓林社区中心一楼活动厅",
      location: {
        latitude: 30.6151,
        longitude: 104.0628
      },
      start_time: "2027-04-02T10:00:00+08:00",
      end_time: "2027-04-02T12:00:00+08:00",
      signup_deadline: "2027-04-01T18:00:00+08:00",
      capacity: 60,
      organizer_user_id: "user_002",
      review_status: "approved",
      publish_status: "published"
    },
    {
      _id: "event_draft",
      community_id: "tongzilin",
      title_zh: "草稿活动",
      title_en: "Draft Event",
      summary_zh: "不应出现在公开列表。",
      summary_en: "Should not appear in public lists.",
      content_zh: "草稿内容",
      content_en: "Draft content",
      cover_file_id: "cloud://event-cover-draft",
      cover_cloud_path: "public/events/event_draft/cover.jpg",
      cover_url: "https://example.com/public/events/event_draft/cover.jpg",
      address_text: "桐梓林",
      location: { latitude: 30.6152, longitude: 104.0629 },
      start_time: "2027-05-02T10:00:00+08:00",
      end_time: "2027-05-02T12:00:00+08:00",
      signup_deadline: "2027-05-01T18:00:00+08:00",
      capacity: 20,
      organizer_user_id: "user_002",
      review_status: "draft",
      publish_status: "draft"
    },
    {
      _id: "event_full",
      community_id: "tongzilin",
      title_zh: "满员活动",
      title_en: "Full Event",
      summary_zh: "用于容量边界测试。",
      summary_en: "Used for capacity boundary tests.",
      content_zh: "满员内容",
      content_en: "Full content",
      cover_file_id: "cloud://event-cover-full",
      cover_cloud_path: "public/events/event_full/cover.jpg",
      cover_url: "https://example.com/public/events/event_full/cover.jpg",
      address_text: "桐梓林",
      location: { latitude: 30.6153, longitude: 104.063 },
      start_time: "2027-06-02T10:00:00+08:00",
      end_time: "2027-06-02T12:00:00+08:00",
      signup_deadline: "2027-06-01T18:00:00+08:00",
      capacity: 2,
      organizer_user_id: "user_002",
      review_status: "approved",
      publish_status: "published"
    },
    {
      _id: "event_closed",
      community_id: "tongzilin",
      title_zh: "报名关闭活动",
      title_en: "Closed Signup Event",
      summary_zh: "用于截止时间边界测试。",
      summary_en: "Used for signup deadline tests.",
      content_zh: "关闭内容",
      content_en: "Closed content",
      cover_file_id: "cloud://event-cover-closed",
      cover_cloud_path: "public/events/event_closed/cover.jpg",
      cover_url: "https://example.com/public/events/event_closed/cover.jpg",
      address_text: "桐梓林",
      location: { latitude: 30.6154, longitude: 104.0631 },
      start_time: "2026-01-02T10:00:00+08:00",
      end_time: "2026-01-02T12:00:00+08:00",
      signup_deadline: "2026-01-01T18:00:00+08:00",
      capacity: 20,
      organizer_user_id: "user_002",
      review_status: "approved",
      publish_status: "published"
    }
  ],
  registrations: [
    {
      _id: "reg_001",
      event_id: "event_001",
      user_id: "user_001",
      contact_name: "Jerry",
      contact_phone: "13800000000",
      attendee_count: 2,
      registration_status: "confirmed",
      ticket_id: "ticket_001",
      source_channel: "miniapp"
    },
    {
      _id: "reg_full_001",
      event_id: "event_full",
      user_id: "user_001",
      contact_name: "Jerry",
      contact_phone: "13800000000",
      attendee_count: 2,
      registration_status: "confirmed",
      ticket_id: "ticket_full_001",
      source_channel: "miniapp"
    }
  ],
  tickets: [
    {
      _id: "ticket_001",
      registration_id: "reg_001",
      ticket_code: "TZL-20260402-001",
      qr_file_id: "cloud://private-ticket-001",
      qr_cloud_path: "private/tickets/event_001/ticket_001.png",
      visibility: "private",
      status: "valid",
      issued_at: "2026-03-28T10:00:00+08:00",
      used_at: null
    },
    {
      _id: "ticket_full_001",
      registration_id: "reg_full_001",
      ticket_code: "TZL-FULL-001",
      qr_file_id: "cloud://private-ticket-full-001",
      qr_cloud_path: "private/tickets/event_full/ticket_full_001.png",
      visibility: "private",
      status: "valid",
      issued_at: "2026-03-28T10:00:00+08:00",
      used_at: null
    }
  ],
  places: [
    {
      _id: "place_001",
      community_id: "tongzilin",
      name_zh: "桐梓林社区中心",
      name_en: "Tongzilin Community Center",
      cover_file_id: "cloud://place-cover-001",
      cover_url: "https://example.com/public/places/place_001/cover.jpg",
      category_level_1: "public-service",
      category_level_2: "community-center",
      tag_ids: ["service", "family", "community"],
      address_zh: "成都市武侯区桐梓林北路 88 号",
      address_en: "No. 88, Tongzilin North Road, Wuhou District, Chengdu",
      location: {
        latitude: 30.615,
        longitude: 104.0625
      },
      tencent_map_poi_id: "poi_001",
      business_hours_zh: "周一至周日 09:00-18:00",
      business_hours_en: "Mon-Sun 09:00-18:00",
      intro_zh: "社区活动、公告展示和居民服务的主要线下节点。",
      intro_en: "Main offline hub for events, announcements, and resident services.",
      recommended_reason_zh: "初次到访桐梓林时最适合先了解社区服务的地点。",
      recommended_reason_en: "Best first stop to understand local community services.",
      is_recommended: true,
      recommended_rank: 1,
      gallery_file_ids: ["cloud://place-001-1"],
      gallery_urls: [],
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      status: "published"
    },
    {
      _id: "place_002",
      community_id: "tongzilin",
      name_zh: "国际友好咖啡馆",
      name_en: "Global Corner Cafe",
      cover_file_id: "cloud://place-cover-002",
      cover_url: "https://example.com/public/places/place_002/cover.jpg",
      category_level_1: "food-drink",
      category_level_2: "cafe",
      tag_ids: ["coffee", "social", "english-friendly"],
      address_zh: "成都市武侯区桐梓林南路 26 号",
      address_en: "No. 26, Tongzilin South Road, Wuhou District, Chengdu",
      location: {
        latitude: 30.6137,
        longitude: 104.0609
      },
      tencent_map_poi_id: "poi_002",
      business_hours_zh: "周一至周日 08:00-22:00",
      business_hours_en: "Mon-Sun 08:00-22:00",
      intro_zh: "适合国际居民会面和英语角的咖啡空间。",
      intro_en: "A cafe often used for meet-ups and language exchange.",
      recommended_reason_zh: "适合第一次和邻里见面，环境对外籍居民友好。",
      recommended_reason_en: "A friendly meet-up spot for newcomers and neighbors.",
      is_recommended: true,
      recommended_rank: 2,
      gallery_file_ids: ["cloud://place-002-1"],
      gallery_urls: [],
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      status: "published"
    },
    {
      _id: "place_003",
      community_id: "tongzilin",
      name_zh: "桐梓林便民服务站",
      name_en: "Tongzilin Service Point",
      cover_file_id: null,
      cover_url: null,
      category_level_1: "public-service",
      category_level_2: "service-desk",
      tag_ids: ["service", "documents"],
      address_zh: "成都市武侯区桐梓林东路 12 号",
      address_en: "No. 12, Tongzilin East Road, Wuhou District, Chengdu",
      location: {
        latitude: 30.6164,
        longitude: 104.0641
      },
      tencent_map_poi_id: null,
      business_hours_zh: "周一至周五 09:00-17:30",
      business_hours_en: "Mon-Fri 09:00-17:30",
      intro_zh: "提供基础便民咨询与社区事务引导。",
      intro_en: "Offers basic community guidance and service referrals.",
      recommended_reason_zh: null,
      recommended_reason_en: null,
      is_recommended: false,
      recommended_rank: 0,
      gallery_file_ids: [],
      gallery_urls: [],
      supports_navigation: true,
      supports_favorite: true,
      supports_share: true,
      status: "draft"
    }
  ],
  posts: [
    {
      _id: "post_001",
      author_user_id: "user_001",
      community_id: "tongzilin",
      title: "周边哪里能买到合适的婴儿用品？",
      content: "刚搬来桐梓林，想找靠谱的母婴店或药店，欢迎推荐。",
      language: "zh",
      tag_ids: ["family", "help"],
      location_text: "桐梓林地铁站附近",
      image_file_ids: [],
      image_urls: [],
      status: "visible",
      review_status: "visible"
    },
    {
      _id: "post_002",
      author_user_id: "user_002",
      community_id: "tongzilin",
      title: "Any tennis groups in Tongzilin?",
      content: "Looking for a weekend tennis group within 20 minutes from Tongzilin.",
      language: "en",
      tag_ids: ["sports", "social"],
      location_text: null,
      image_file_ids: ["cloud://post-002-1"],
      image_urls: ["https://example.com/public/posts/post_002/1.jpg"],
      status: "visible",
      review_status: "visible"
    },
    {
      _id: "post_hidden",
      author_user_id: "user_001",
      community_id: "tongzilin",
      title: "Hidden moderation post",
      content: "This post must not appear publicly.",
      language: "en",
      tag_ids: ["moderation"],
      location_text: null,
      image_file_ids: [],
      image_urls: [],
      status: "hidden",
      review_status: "hidden"
    },
    {
      _id: "post_deleted",
      author_user_id: "user_002",
      community_id: "tongzilin",
      title: "Deleted moderation post",
      content: "This post must not appear publicly.",
      language: "en",
      tag_ids: ["moderation"],
      location_text: null,
      image_file_ids: [],
      image_urls: [],
      status: "deleted",
      review_status: "deleted"
    }
  ],
  comments: [
    {
      _id: "comment_001",
      post_id: "post_001",
      author_user_id: "user_002",
      content: "社区中心附近有一家口碑不错的母婴店。",
      language: "zh",
      created_at: "2026-03-28T09:30:00+08:00"
    }
  ],
  announcements: [
    {
      _id: "announcement_001",
      community_id: "tongzilin",
      title_zh: "清明节期间社区开放时间调整",
      title_en: "Community Center Hours for Qingming Festival",
      summary_zh: "4 月 4 日至 4 月 6 日部分服务时段调整。",
      summary_en: "Some resident services will operate on adjusted hours from Apr 4 to Apr 6.",
      content_zh: "请提前预约线下窗口服务，活动报名不受影响。",
      content_en: "Please reserve offline service slots in advance. Event registrations stay open.",
      cover_file_id: "cloud://announcement-cover-001",
      cover_url: "https://example.com/public/announcements/announcement_001/cover.jpg",
      status: "published",
      published_at: "2026-03-26T12:00:00+08:00"
    }
  ],
  notifications: [
    {
      _id: "notification_001",
      user_id: "user_001",
      title: "报名成功",
      body: "你已成功报名周末国际邻里早午餐。",
      status: "unread",
      created_at: "2026-03-28T10:05:00+08:00"
    },
    {
      _id: "notification_002",
      user_id: "user_002",
      title: "Comment reply",
      body: "Someone replied to your post.",
      status: "unread",
      created_at: "2026-03-28T10:10:00+08:00"
    }
  ],
  fileAssets: [
    {
      _id: "file_001",
      file_id: "cloud://event-cover-001",
      cloud_path: "public/events/event_001/cover.jpg",
      visibility: "public",
      biz_type: "event_cover",
      biz_id: "event_001",
      uploaded_by: "user_002",
      status: "active"
    },
    {
      _id: "file_place_001_1",
      file_id: "cloud://place-001-1",
      cloud_path: "public/places/place_001/1.jpg",
      visibility: "public",
      biz_type: "place_gallery",
      biz_id: "place_001",
      uploaded_by: "user_001",
      status: "active"
    },
    {
      _id: "file_place_002_1",
      file_id: "cloud://place-002-1",
      cloud_path: "public/places/place_002/1.jpg",
      visibility: "public",
      biz_type: "place_gallery",
      biz_id: "place_002",
      uploaded_by: "user_001",
      status: "active"
    },
    {
      _id: "file_ticket_001",
      file_id: "cloud://private-ticket-001",
      cloud_path: "private/tickets/event_001/ticket_001.png",
      visibility: "private",
      biz_type: "event_ticket",
      biz_id: "ticket_001",
      uploaded_by: "user_001",
      status: "active"
    }
  ]
});
