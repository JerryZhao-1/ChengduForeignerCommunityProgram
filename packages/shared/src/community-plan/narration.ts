import type { PlaceTopLevelCategory } from "../schemas/place-categories";
import type {
  CommunityPlanArrivalContext,
  CommunityPlanHouseholdType,
  CommunityPlanInterest
} from "../schemas/community-plans";

/**
 * Central bilingual narration catalog for the deterministic Community Plan
 * engine. All text is fixed editorial copy; no AI is involved. Every entry
 * has paired zh/en strings so the judge flow can render either locale.
 */

export interface BilingualNarration {
  reason_zh: string;
  reason_en: string;
  tips_zh: string;
  tips_en: string;
  social_action_zh: string;
  social_action_en: string;
}

// --- Place narration keyed by top-level category ---

const PLACE_NARRATION: Record<PlaceTopLevelCategory, BilingualNarration> = {
  "public-service": {
    reason_zh: "社区服务点是了解在地政务、便民指引和居民服务的首选入口。",
    reason_en:
      "Community service points are the best first stop for local services and resident guidance.",
    tips_zh: "前台通常提供中英双语指引，可询问最近的国际居民服务窗口。",
    tips_en:
      "The front desk usually offers bilingual guidance; ask about international resident services.",
    social_action_zh: "向工作人员或志愿者自我介绍，留下联系方式加入邻里群。",
    social_action_en:
      "Introduce yourself to staff or volunteers and join the neighborhood contact list."
  },
  "food-drink": {
    reason_zh: "餐饮空间是桐梓林最容易开始轻社交的场所，环境对外籍居民友好。",
    reason_en:
      "Food and drink spots are the easiest places in Tongzilin to start casual socializing.",
    tips_zh: "高峰时段可能需要等位，建议错峰前往；部分门店菜单有英文标注。",
    tips_en:
      "Peak hours may require waiting; some menus include English labels.",
    social_action_zh: "主动和邻桌打招呼，询问推荐的社区活动或兴趣小组。",
    social_action_en:
      "Greet neighboring tables and ask about recommended community activities."
  },
  shopping: {
    reason_zh: "购物点能帮助你快速补齐生活物资，了解周边消费环境。",
    reason_en:
      "Shopping spots help you quickly stock up and learn the local retail landscape.",
    tips_zh: "大型商超通常有双语标识，社区小店可用翻译软件辅助沟通。",
    tips_en:
      "Large stores usually have bilingual signage; translation apps help at small shops.",
    social_action_zh: "结账时询问店员是否有社区优惠或会员群。",
    social_action_en:
      "Ask staff at checkout about community discounts or member chat groups."
  },
  lifestyle: {
    reason_zh: "生活服务点覆盖日常美容、洗衣、维修等高频需求。",
    reason_en:
      "Lifestyle service spots cover frequent daily needs like beauty, laundry, and repairs.",
    tips_zh: "部分服务需提前预约，建议首次到店咨询营业时间。",
    tips_en:
      "Some services require advance booking; ask about hours on your first visit.",
    social_action_zh: "和店主建立联系，方便后续预约和紧急需求。",
    social_action_en:
      "Build a relationship with the shop owner for easier future bookings."
  },
  education: {
    reason_zh: "教育资源是带娃家庭和语言学习者的核心关注点。",
    reason_en:
      "Education resources are a key focus for families and language learners.",
    tips_zh: "语言学校和培训机构通常提供试听课，可提前电话或到店咨询。",
    tips_en:
      "Language schools and training centers often offer trial classes; ask in person.",
    social_action_zh: "报名试听课或加入家长群，获取同龄伙伴信息。",
    social_action_en:
      "Sign up for a trial class or join a parent group to meet peers."
  },
  "health-wellness": {
    reason_zh: "健康服务点帮助你了解周边医疗和药房资源，安心安家。",
    reason_en:
      "Health and wellness spots help you locate nearby medical and pharmacy resources.",
    tips_zh: "诊所和药房营业时间不同，建议记录离你最近的24小时药房。",
    tips_en:
      "Clinic and pharmacy hours vary; note your nearest 24-hour pharmacy.",
    social_action_zh: "登记家庭医生或咨询社区健康志愿者。",
    social_action_en:
      "Register with a family doctor or ask community health volunteers."
  },
  entertainment: {
    reason_zh: "娱乐场所是下班后放松和结识邻居的好去处。",
    reason_en:
      "Entertainment venues are great for after-work relaxation and meeting neighbors.",
    tips_zh: "周末热门场所建议提前预约，工作日人少体验更佳。",
    tips_en:
      "Book popular venues in advance for weekends; weekdays are quieter.",
    social_action_zh: "邀请一位新邻居一起参加，加深社区连接。",
    social_action_en:
      "Invite a new neighbor to join you and deepen community connections."
  },
  "outdoor-sports": {
    reason_zh: "户外运动空间适合晨练、遛弯和亲子活动，是桐梓林的天然社交场。",
    reason_en:
      "Outdoor sports spaces are perfect for morning exercise, walks, and family activities.",
    tips_zh: "早晨和傍晚人最多，是认识邻居的自然时机；注意防晒和补水。",
    tips_en:
      "Mornings and evenings are busiest and best for meeting neighbors; bring water and sun protection.",
    social_action_zh: "加入晨练或遛狗小群，固定的作息有助于建立社交。",
    social_action_en:
      "Join a morning exercise or dog-walking group; regular routines build social ties."
  },
  transport: {
    reason_zh: "交通节点帮助你快速熟悉通勤和出行选项。",
    reason_en:
      "Transport nodes help you quickly learn commute and travel options.",
    tips_zh: "桐梓林地铁站连接主要线路，建议保存常用线路图。",
    tips_en:
      "Tongzilin metro station connects major lines; save your frequent routes.",
    social_action_zh: "在站口留意社区公告栏，常有活动和拼车信息。",
    social_action_en:
      "Check community bulletin boards near station exits for events and carpools."
  },
  community: {
    reason_zh: "社区公共空间是结识长期居民和参与邻里活动的核心节点。",
    reason_en:
      "Community public spaces are core nodes for meeting long-term residents and joining activities.",
    tips_zh: "社区广场和小型社交空间常有自发聚会，欢迎主动加入。",
    tips_en:
      "Community squares and social spaces often host informal gatherings; feel free to join.",
    social_action_zh: "主动介绍自己来自哪里、搬来多久，邻居会很乐意帮忙。",
    social_action_en:
      "Introduce where you are from and how long you have lived here; neighbors are happy to help."
  }
};

// --- Event narration (single canonical template for community gatherings) ---

const EVENT_NARRATION: BilingualNarration = {
  reason_zh: "公开社区活动是融入桐梓林最高效的方式，现场有志愿者协助。",
  reason_en:
    "Public community events are the most efficient way to settle into Tongzilin; volunteers are on site.",
  tips_zh: "提前到场可和志愿者交流；演示确认不创建真实报名或票券。",
  tips_en:
    "Arrive early to chat with volunteers; Demo Confirm creates no real booking or ticket.",
  social_action_zh: "主动和至少三位邻居交换联系方式，加入社区兴趣群。",
  social_action_en:
    "Exchange contacts with at least three neighbors and join a community interest group."
};

// --- Interest to category mapping for scoring ---

export const INTEREST_CATEGORY_MAP: Record<
  CommunityPlanInterest,
  PlaceTopLevelCategory[]
> = {
  "community-service": ["public-service", "community"],
  "food-drink": ["food-drink"],
  social: ["community", "food-drink", "entertainment"],
  "language-exchange": ["education", "community", "food-drink"],
  "family-kids": ["education", "community", "outdoor-sports"],
  "health-wellness": ["health-wellness", "outdoor-sports"],
  transport: ["transport"],
  "outdoor-sports": ["outdoor-sports"]
};

// --- Arrival context priority categories ---

export const ARRIVAL_CONTEXT_PRIORITY: Record<
  CommunityPlanArrivalContext,
  PlaceTopLevelCategory[]
> = {
  "first-week": ["public-service", "community", "transport"],
  "first-month": ["community", "food-drink", "entertainment"],
  settled: ["outdoor-sports", "entertainment", "lifestyle"]
};

// --- Household type priority categories ---

export const HOUSEHOLD_TYPE_PRIORITY: Record<
  CommunityPlanHouseholdType,
  PlaceTopLevelCategory[]
> = {
  solo: ["food-drink", "community", "entertainment"],
  couple: ["food-drink", "entertainment", "outdoor-sports"],
  "family-with-kids": ["education", "community", "outdoor-sports"],
  shared: ["community", "public-service", "food-drink"]
};

export function getPlaceNarration(
  category: PlaceTopLevelCategory
): BilingualNarration {
  return PLACE_NARRATION[category];
}

export function getEventNarration(): BilingualNarration {
  return EVENT_NARRATION;
}
