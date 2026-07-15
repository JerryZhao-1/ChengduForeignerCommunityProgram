import {
  CreateEventInputSchema,
  CreatePlaceInputSchema,
  PostSchema,
  UserSchema
} from "../packages/shared/src/index.ts";

const COMMUNITY_ID = "tongzilin";
const COMMUNITY_LOCATION = {
  latitude: 30.618887,
  longitude: 104.065468
};

export const COMPETITION_DEMO_PLACE_ALIASES = [
  "newcomer-hub",
  "community-living-room",
  "family-reading-corner",
  "community-tool-station"
] as const;

export const COMPETITION_DEMO_EVENT_ALIASES = [
  "newcomer-walk",
  "bilingual-tea",
  "map-workshop"
] as const;

export type CompetitionDemoPlaceAlias =
  (typeof COMPETITION_DEMO_PLACE_ALIASES)[number];
export type CompetitionDemoEventAlias =
  (typeof COMPETITION_DEMO_EVENT_ALIASES)[number];

export interface CompetitionDemoReferenceIds {
  places: Record<CompetitionDemoPlaceAlias, string>;
  events: Record<CompetitionDemoEventAlias, string>;
}

const normalizeAssetBaseUrl = (assetBaseUrl: string) =>
  assetBaseUrl.replace(/\/$/, "");

export const buildCompetitionDemoUsers = (assetBaseUrl: string) => {
  const baseUrl = normalizeAssetBaseUrl(assetBaseUrl);
  return UserSchema.array().parse([
    {
      _id: "demo_user_lin_xiao",
      nickname: "林晓",
      avatar_url: `${baseUrl}/static/demo-content/avatar-lin-xiao.svg`,
      preferred_language: "zh",
      role_flags: ["user"],
      status: "active"
    },
    {
      _id: "demo_user_maya_chen",
      nickname: "Maya Chen",
      avatar_url: `${baseUrl}/static/demo-content/avatar-maya-chen.svg`,
      preferred_language: "en",
      role_flags: ["user"],
      status: "active"
    },
    {
      _id: "demo_user_ajie",
      nickname: "阿杰在桐梓林",
      avatar_url: `${baseUrl}/static/demo-content/avatar-ajie.svg`,
      preferred_language: "zh",
      role_flags: ["user"],
      status: "active"
    },
    {
      _id: "demo_user_samir_k",
      nickname: "Samir K.",
      avatar_url: `${baseUrl}/static/demo-content/avatar-samir.svg`,
      preferred_language: "en",
      role_flags: ["user"],
      status: "active"
    },
    {
      _id: "demo_user_grace_notes",
      nickname: "Grace 邻里笔记",
      avatar_url: `${baseUrl}/static/demo-content/avatar-grace.svg`,
      preferred_language: "zh",
      role_flags: ["user"],
      status: "active"
    }
  ]);
};

export const buildCompetitionDemoPlaces = (assetBaseUrl: string) => {
  const baseUrl = normalizeAssetBaseUrl(assetBaseUrl);
  const common = {
    cover_file_id: null,
    cover_source: null,
    tag_ids: ["community", "newcomer"],
    address_zh: "桐梓林社区",
    address_en: "Tongzilin Community",
    location: COMMUNITY_LOCATION,
    tencent_map_poi_id: null,
    business_hours_zh: "以活动通知为准",
    business_hours_en: "See individual event notices",
    recommended_reason_zh: null,
    recommended_reason_en: null,
    is_recommended: false,
    recommended_rank: 0,
    gallery_file_ids: [],
    external_gallery_media: [],
    gallery_urls: [],
    supports_navigation: false,
    supports_favorite: true,
    supports_share: true,
    status: "published" as const
  };

  return CreatePlaceInputSchema.array().parse([
    {
      ...common,
      name_zh: "桐邻新居民服务站",
      name_en: "Tonglin Newcomer Service Hub",
      cover_url: `${baseUrl}/static/demo-content/place-newcomer.svg`,
      category_level_1: "public-service",
      category_level_2: "service-desk",
      intro_zh: "汇集新居民常用社区信息、办事提示和活动入口。",
      intro_en:
        "A starting point for newcomer information, practical guidance, and community activities."
    },
    {
      ...common,
      name_zh: "桐邻共享客厅",
      name_en: "Tonglin Community Living Room",
      cover_url: `${baseUrl}/static/demo-content/place-living-room.svg`,
      category_level_1: "community",
      category_level_2: "social-space",
      intro_zh: "面向邻里交流、小型分享和双语活动的社区空间。",
      intro_en:
        "A neighborhood space for small gatherings, shared learning, and bilingual activities."
    },
    {
      ...common,
      name_zh: "桐邻亲子阅读角",
      name_en: "Tonglin Family Reading Corner",
      cover_url: `${baseUrl}/static/demo-content/place-reading.svg`,
      category_level_1: "education",
      category_level_2: "library",
      intro_zh: "为家庭准备的轻量阅读、故事分享和安静交流空间。",
      intro_en:
        "A calm family corner for reading, story sharing, and gentle conversation."
    },
    {
      ...common,
      name_zh: "桐邻便民工具站",
      name_en: "Tonglin Community Tool Station",
      cover_url: `${baseUrl}/static/demo-content/place-tools.svg`,
      category_level_1: "community",
      category_level_2: "volunteer-point",
      intro_zh: "提供工具共享、邻里互助规则和志愿协作信息。",
      intro_en:
        "A community point for tool sharing, neighborly support guidelines, and volunteering."
    }
  ]);
};

export const buildCompetitionDemoEvents = (
  assetBaseUrl: string,
  placeIds: CompetitionDemoReferenceIds["places"]
) => {
  const baseUrl = normalizeAssetBaseUrl(assetBaseUrl);
  return CreateEventInputSchema.array().parse([
    {
      title_zh: "新居民社区散步与办事指南",
      title_en: "Newcomer Walk and Community Essentials",
      summary_zh: "用两小时认识社区方向、常用服务和邻里参与入口。",
      summary_en:
        "A two-hour introduction to neighborhood orientation, everyday services, and ways to participate.",
      content_zh:
        "从新居民服务站出发，按轻松步速了解社区信息、常见办事准备和后续活动。请穿舒适鞋履，并根据天气自行准备。",
      content_en:
        "Start at the newcomer hub for an easy-paced introduction to local information, everyday preparation, and follow-up activities. Wear comfortable shoes and prepare for the weather.",
      place_id: placeIds["newcomer-hub"],
      cover_url: `${baseUrl}/static/demo-content/event-walk.svg`,
      address_zh: "桐梓林社区",
      address_en: "Tongzilin Community",
      location: COMMUNITY_LOCATION,
      start_time: "2027-04-17T10:00:00+08:00",
      end_time: "2027-04-17T12:00:00+08:00",
      signup_deadline: "2027-04-16T18:00:00+08:00",
      capacity: 30
    },
    {
      title_zh: "中英双语邻里茶话会",
      title_en: "Bilingual Neighborhood Tea Meetup",
      summary_zh: "用中英文交换生活提示，认识愿意继续联系的邻居。",
      summary_en:
        "Swap everyday tips in Chinese and English and meet neighbors who want to stay connected.",
      content_zh:
        "活动包含简短自我介绍、生活词汇交换和邻里问题卡。无需流利双语，愿意倾听和分享即可。",
      content_en:
        "The meetup includes short introductions, everyday vocabulary exchange, and neighborhood prompt cards. Fluency is not required; curiosity and listening are enough.",
      place_id: placeIds["community-living-room"],
      cover_url: `${baseUrl}/static/demo-content/event-tea.svg`,
      address_zh: "桐梓林社区",
      address_en: "Tongzilin Community",
      location: COMMUNITY_LOCATION,
      start_time: "2027-04-24T15:00:00+08:00",
      end_time: "2027-04-24T17:00:00+08:00",
      signup_deadline: "2027-04-23T18:00:00+08:00",
      capacity: 24
    },
    {
      title_zh: "社区地图共创工作坊",
      title_en: "Community Map Co-creation Workshop",
      summary_zh: "一起整理对新居民真正有用的地点线索和参与提示。",
      summary_en:
        "Work together on place clues and participation tips that are genuinely useful to newcomers.",
      content_zh:
        "参与者将围绕服务、亲子、日常互助和社区活动整理地图卡片。欢迎带来问题与建议，不收集私人联系方式。",
      content_en:
        "Participants will organize map cards around services, family life, everyday support, and community activities. Bring questions and suggestions; no private contact details are collected.",
      place_id: placeIds["community-living-room"],
      cover_url: `${baseUrl}/static/demo-content/event-workshop.svg`,
      address_zh: "桐梓林社区",
      address_en: "Tongzilin Community",
      location: COMMUNITY_LOCATION,
      start_time: "2027-05-08T14:00:00+08:00",
      end_time: "2027-05-08T16:00:00+08:00",
      signup_deadline: "2027-05-07T18:00:00+08:00",
      capacity: 20
    }
  ]);
};

export const buildCompetitionDemoPosts = ({
  assetBaseUrl,
  referenceIds,
  createdAt
}: {
  assetBaseUrl: string;
  referenceIds: CompetitionDemoReferenceIds;
  createdAt: string;
}) => {
  const users = buildCompetitionDemoUsers(assetBaseUrl);
  const usersById = new Map(users.map((user) => [user._id, user]));
  const post = (
    id: string,
    authorId: string,
    input: {
      title: string;
      content: string;
      language: "zh" | "en";
      tags: string[];
      placeId?: string;
      eventId?: string;
      locationText?: string;
    },
    offsetMinutes: number
  ) => {
    const author = usersById.get(authorId);
    if (!author) {
      throw new Error(`Unknown demo author: ${authorId}`);
    }
    const timestamp = new Date(
      new Date(createdAt).getTime() + offsetMinutes * 60_000
    ).toISOString();
    return {
      _id: id,
      author_user_id: author._id,
      author_display: {
        nickname: author.nickname,
        avatar_url: author.avatar_url
      },
      community_id: COMMUNITY_ID,
      title: input.title,
      content: input.content,
      language: input.language,
      tag_ids: input.tags,
      location_text: input.locationText ?? null,
      image_file_ids: [],
      image_urls: [],
      place_id: input.placeId ?? null,
      event_id: input.eventId ?? null,
      comment_count: 0,
      like_count: 0,
      favorite_count: 0,
      share_count: 0,
      is_pinned: false,
      is_featured: false,
      is_recommended: false,
      is_official: false,
      ops_rank: 0,
      created_at: timestamp,
      updated_at: timestamp,
      status: "visible" as const,
      review_status: "visible" as const
    };
  };

  return PostSchema.array().parse([
    post(
      "demo_post_newcomer_checklist_zh",
      "demo_user_lin_xiao",
      {
        title: "新居民第一周可以先准备这三件事",
        content:
          "先记下常用服务入口，再确认一条步行路线，最后挑一场愿意参加的邻里活动。新居民服务站会整理持续更新的提示，欢迎补充你最想了解的问题。",
        language: "zh",
        tags: ["newcomer", "community"],
        placeId: referenceIds.places["newcomer-hub"],
        locationText: "桐梓林社区"
      },
      0
    ),
    post(
      "demo_post_first_week_questions_en",
      "demo_user_maya_chen",
      {
        title: "Three questions for a first week in Tongzilin",
        content:
          "Where can I find reliable community updates? Which route is easiest to remember? What is one low-pressure activity where newcomers can listen first? I am adding these to my newcomer checklist.",
        language: "en",
        tags: ["newcomer", "questions"],
        placeId: referenceIds.places["newcomer-hub"],
        locationText: "Tongzilin Community"
      },
      1
    ),
    post(
      "demo_post_family_reading_zh",
      "demo_user_ajie",
      {
        title: "周末想约一次轻松的亲子共读",
        content:
          "计划带一本孩子最近喜欢的书，到阅读角做二十分钟安静阅读，再交换一个故事问题。希望节奏轻松，不要求孩子一直坐着。",
        language: "zh",
        tags: ["family", "reading"],
        placeId: referenceIds.places["family-reading-corner"]
      },
      2
    ),
    post(
      "demo_post_tool_sharing_en",
      "demo_user_samir_k",
      {
        title: "A simple checklist for sharing household tools",
        content:
          "Label the item, agree on a return time, explain any safety notes, and report damage early. A small shared rule can make neighbor-to-neighbor borrowing much easier.",
        language: "en",
        tags: ["sharing", "volunteer"],
        placeId: referenceIds.places["community-tool-station"]
      },
      3
    ),
    post(
      "demo_post_bilingual_tea_zh",
      "demo_user_grace_notes",
      {
        title: "茶话会问题卡：你最想学的一句邻里表达",
        content:
          "我准备了几张中英双语问题卡：怎样礼貌问路、怎样邀请邻居一起散步、怎样说明自己还在学习语言。欢迎把你最常用的一句带到茶话会。",
        language: "zh",
        tags: ["bilingual", "neighbors"],
        placeId: referenceIds.places["community-living-room"],
        eventId: referenceIds.events["bilingual-tea"]
      },
      4
    ),
    post(
      "demo_post_walk_reminder_zh",
      "demo_user_lin_xiao",
      {
        title: "社区散步前的小提醒",
        content:
          "请穿舒适鞋履，按天气准备饮水或雨具。路线以认识方向和服务入口为主，不追求速度；需要休息时可以随时提出。",
        language: "zh",
        tags: ["walking", "newcomer"],
        eventId: referenceIds.events["newcomer-walk"]
      },
      5
    ),
    post(
      "demo_post_everyday_phrases_en",
      "demo_user_maya_chen",
      {
        title: "Everyday phrases I want to practice with neighbors",
        content:
          "Could you show me where this is? Is there a quieter time to visit? May I join and listen first? I plan to bring these phrases to the bilingual meetup and learn the Chinese versions.",
        language: "en",
        tags: ["language", "bilingual"],
        eventId: referenceIds.events["bilingual-tea"]
      },
      6
    ),
    post(
      "demo_post_map_workshop_en",
      "demo_user_samir_k",
      {
        title: "What makes a community map useful to a newcomer?",
        content:
          "I would prioritize clear categories, short bilingual descriptions, honest uncertainty, and a next action for each place. I am bringing this checklist to the map workshop.",
        language: "en",
        tags: ["community-map", "workshop"],
        eventId: referenceIds.events["map-workshop"]
      },
      7
    ),
    post(
      "demo_post_borrowing_etiquette_zh",
      "demo_user_ajie",
      {
        title: "邻里借用工具，先约定四件小事",
        content:
          "借什么、什么时候还、怎样安全使用、损坏后怎样沟通。规则写清楚以后，互助会更轻松，也更容易持续。",
        language: "zh",
        tags: ["sharing", "community"],
        placeId: referenceIds.places["community-tool-station"]
      },
      8
    ),
    post(
      "demo_post_weekly_roundup_zh",
      "demo_user_grace_notes",
      {
        title: "本周邻里参与清单：散步、茶话会和地图共创",
        content:
          "如果刚来到社区，可以先从散步认识方向；想练习语言，可以参加茶话会；愿意贡献经验，可以把问题和建议带到地图共创工作坊。按自己的节奏选一项即可。",
        language: "zh",
        tags: ["events", "community"],
        placeId: referenceIds.places["community-living-room"],
        eventId: referenceIds.events["map-workshop"]
      },
      9
    )
  ]);
};
