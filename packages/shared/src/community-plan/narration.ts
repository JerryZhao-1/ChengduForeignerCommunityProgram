import type { PlaceTopLevelCategory } from "../schemas/place-categories";
import type {
  CommunityPlanAccessibilityNeed,
  CommunityPlanArrivalContext,
  CommunityPlanHouseholdType,
  CommunityPlanInterest
} from "../schemas/community-plans";
import { CommunityPlanFeedbackCatalogSchema } from "../schemas/community-plans";
import type { CommunityPlanCatalogText } from "../types/entities";

export interface BilingualNarration {
  reason_zh: string;
  reason_en: string;
  tips_zh: string;
  tips_en: string;
  social_action_zh: string;
  social_action_en: string;
}

const PLACE_NARRATION: Record<PlaceTopLevelCategory, BilingualNarration> = {
  "public-service": {
    reason_zh: "社区服务点是了解在地政务、便民指引和居民服务的首选入口。",
    reason_en: "Community service points are a practical first stop for local guidance.",
    tips_zh: "先询问可提供的语言支持和最适合新居民的服务窗口。",
    tips_en: "Ask which language support and newcomer services are currently available.",
    social_action_zh: "向工作人员或志愿者自我介绍，询问最近的邻里活动。",
    social_action_en: "Introduce yourself to staff or volunteers and ask about nearby activities."
  },
  "food-drink": {
    reason_zh: "餐饮空间适合用一杯饮品或一顿轻食开始低压力的邻里交流。",
    reason_en: "Food and drink spaces offer a low-pressure way to start a neighborhood conversation.",
    tips_zh: "建议错峰前往，并在点单前确认菜单和沟通方式。",
    tips_en: "Visit off-peak and confirm the menu and communication options before ordering.",
    social_action_zh: "向店员询问附近的社区活动或兴趣小组。",
    social_action_en: "Ask staff about nearby community activities or interest groups."
  },
  shopping: {
    reason_zh: "购物点能帮助你快速补齐生活物资并熟悉周边消费环境。",
    reason_en: "Shopping stops help you stock up and learn the local retail environment.",
    tips_zh: "先列出当天必需品，避免路线被临时采购拖慢。",
    tips_en: "List today's essentials first so shopping does not overrun the route.",
    social_action_zh: "询问店员是否有社区公告或居民常用服务信息。",
    social_action_en: "Ask staff about community notices or commonly used resident services."
  },
  lifestyle: {
    reason_zh: "生活服务点可以补充日常维修、洗护和便民需求信息。",
    reason_en: "Lifestyle services help you understand everyday repair and convenience options.",
    tips_zh: "首次到访先确认营业时间、预约方式和费用范围。",
    tips_en: "On a first visit, confirm hours, booking method, and price range.",
    social_action_zh: "保存公开联系方式，方便以后按需咨询。",
    social_action_en: "Save the public contact details for future questions."
  },
  education: {
    reason_zh: "教育与语言资源适合家庭和希望建立持续学习节奏的居民。",
    reason_en: "Education and language resources suit families and residents building a learning routine.",
    tips_zh: "先询问开放活动、试听或家长交流的具体安排。",
    tips_en: "Ask about open sessions, trials, or parent meet-ups before joining.",
    social_action_zh: "了解是否有公开的语言交换或亲子群体活动。",
    social_action_en: "Find out whether public language-exchange or family activities are available."
  },
  "health-wellness": {
    reason_zh: "健康服务点能帮助你提前了解日常医疗与健康资源。",
    reason_en: "Health services help you identify everyday medical and wellness resources early.",
    tips_zh: "记录营业时间和公开咨询方式；紧急情况请使用正式急救渠道。",
    tips_en: "Note opening hours and public contact methods; use official emergency channels when needed.",
    social_action_zh: "询问公开的社区健康活动或讲座信息。",
    social_action_en: "Ask about public community health events or talks."
  },
  entertainment: {
    reason_zh: "文化娱乐场所适合在轻松情境中理解社区氛围。",
    reason_en: "Culture and leisure venues help you understand the neighborhood in a relaxed setting.",
    tips_zh: "出发前确认当天开放时间和是否需要预约。",
    tips_en: "Confirm opening hours and whether advance booking is needed.",
    social_action_zh: "留意公开展览、沙龙或居民活动预告。",
    social_action_en: "Look for public exhibitions, salons, or resident activity notices."
  },
  "outdoor-sports": {
    reason_zh: "户外运动空间适合用散步或轻运动建立稳定的社区日常。",
    reason_en: "Outdoor spaces help build a steady neighborhood routine through walking or light exercise.",
    tips_zh: "根据天气准备饮水、防晒和合适的运动节奏。",
    tips_en: "Prepare water, sun protection, and a pace appropriate for the weather.",
    social_action_zh: "观察公开活动信息，再决定是否加入固定运动小组。",
    social_action_en: "Check public activity information before joining a regular exercise group."
  },
  transport: {
    reason_zh: "交通节点能快速建立通勤方向感和社区空间坐标。",
    reason_en: "Transport nodes quickly establish commute orientation and a mental map of the area.",
    tips_zh: "保存常用出口、线路和返程地标，避免只依赖实时定位。",
    tips_en: "Save key exits, routes, and return landmarks instead of relying only on live location.",
    social_action_zh: "留意站点附近的公开社区公告。",
    social_action_en: "Check public community notices near the station."
  },
  community: {
    reason_zh: "社区公共空间是认识服务人员、志愿者和长期居民的自然入口。",
    reason_en: "Community spaces are natural entry points for meeting staff, volunteers, and long-term residents.",
    tips_zh: "先确认当天是否有公开活动，再安排停留时间。",
    tips_en: "Confirm whether a public activity is running before planning your stay.",
    social_action_zh: "简单介绍自己搬来多久，并询问适合新居民的参与方式。",
    social_action_en: "Share how recently you arrived and ask how newcomers can participate."
  }
};

const EVENT_NARRATION: BilingualNarration = {
  reason_zh: "公开社区活动提供一个有明确主题的邻里交流场景。",
  reason_en: "A public community activity offers a neighborhood interaction with a clear shared topic.",
  tips_zh: "提前到场了解流程；演示确认不创建真实报名、预约或票券。",
  tips_en: "Arrive early to understand the format; Demo Confirm creates no booking, reservation, or ticket.",
  social_action_zh: "先和一位组织者或志愿者交流，再认识其他参与者。",
  social_action_en: "Speak with an organizer or volunteer before meeting other participants."
};

export const INTEREST_CATEGORY_MAP: Record<
  CommunityPlanInterest,
  PlaceTopLevelCategory[]
> = {
  "community-service": ["public-service", "community"],
  "food-drink": ["food-drink"],
  social: ["community", "food-drink", "entertainment"],
  "language-exchange": ["community", "food-drink", "education"],
  "family-kids": ["outdoor-sports", "community", "education"],
  "health-wellness": ["health-wellness", "outdoor-sports"],
  transport: ["transport"],
  "outdoor-sports": ["outdoor-sports"]
};

export const ARRIVAL_CONTEXT_PRIORITY: Record<
  CommunityPlanArrivalContext,
  PlaceTopLevelCategory[]
> = {
  "first-week": ["public-service", "community", "transport"],
  "first-month": ["community", "food-drink", "entertainment"],
  settled: ["outdoor-sports", "entertainment", "lifestyle"]
};

export const HOUSEHOLD_TYPE_PRIORITY: Record<
  CommunityPlanHouseholdType,
  PlaceTopLevelCategory[]
> = {
  solo: ["food-drink", "community", "entertainment"],
  couple: ["food-drink", "entertainment", "outdoor-sports"],
  "family-with-kids": ["outdoor-sports", "community", "education"],
  shared: ["community", "public-service", "food-drink"]
};

const catalogText = (
  summary_zh: string,
  summary_en: string,
  reason_zh: string,
  reason_en: string,
  tip_zh: string,
  tip_en: string
) => ({ summary_zh, summary_en, reason_zh, reason_en, tip_zh, tip_en });

export const COMMUNITY_PLAN_FEEDBACK_CATALOG =
  CommunityPlanFeedbackCatalogSchema.parse({
    primary_interest: {
      "community-service": catalogText(
        "先找到社区服务入口，再用一场公开活动建立第一条邻里联系。",
        "Start with a community service entry point, then build a first neighborhood connection at a public activity.",
        "你最关心社区服务，因此路线优先帮助你找到可继续咨询的线下入口。",
        "Community service is your priority, so the route starts with an in-person source of ongoing guidance.",
        "准备一到两个最想解决的生活问题，现场沟通会更高效。",
        "Prepare one or two practical questions to make the visit more useful."
      ),
      "food-drink": catalogText(
        "从一处低压力的餐饮空间开始，再把轻松交流延伸到社区活动。",
        "Begin at a low-pressure food or drink spot, then continue the conversation at a community activity.",
        "你偏好美食与饮品，因此首站优先选择容易短暂停留和开始交流的空间。",
        "Food and drink is your priority, so the first stop favors an easy place to pause and start a conversation.",
        "错峰前往，并在点单前确认菜单和沟通方式。",
        "Visit off-peak and confirm menu and communication options before ordering."
      ),
      social: catalogText(
        "先在开放的社区空间建立轻联系，再参加有明确主题的邻里活动。",
        "Make a light connection in an open community space, then join a neighborhood activity with a clear topic.",
        "你希望认识邻居，因此路线优先选择有自然互动机会的公共空间。",
        "Meeting neighbors is your priority, so the route favors a public space with natural opportunities to interact.",
        "先和工作人员或志愿者交流，再逐步认识其他参与者。",
        "Start with staff or volunteers before meeting other participants."
      ),
      "language-exchange": catalogText(
        "先找到适合沟通和语言交流的社区节点，再在活动中继续练习。",
        "Find a community point suited to communication and language exchange, then continue practicing at an activity.",
        "你关注语言交流，因此路线优先选择能降低开口压力的社区场景。",
        "Language exchange is your priority, so the route favors a setting that lowers the pressure to speak.",
        "准备一句自我介绍和两个日常话题，方便自然开始交流。",
        "Prepare a short introduction and two everyday topics to start naturally."
      ),
      "family-kids": catalogText(
        "先用适合家庭节奏的公共空间熟悉周边，再参加一项邻里活动。",
        "Use a family-paced public space to learn the area, then join a neighborhood activity.",
        "你关注亲子生活，因此路线优先考虑家庭容易共同停留的场景。",
        "Family life is your priority, so the route favors a setting where the household can pause together.",
        "出发前确认当天开放安排，并为儿童准备饮水和必要物品。",
        "Confirm today's opening arrangements and bring water and essentials for children."
      ),
      "health-wellness": catalogText(
        "先建立日常健康资源坐标，再通过社区活动补充邻里支持网络。",
        "Identify an everyday health resource, then add a neighborhood support connection through a community activity.",
        "你关注健康生活，因此路线优先帮助你认识一处日常健康资源。",
        "Health and wellness is your priority, so the route first identifies an everyday health resource.",
        "记录营业时间和公开咨询方式；紧急情况使用正式急救渠道。",
        "Note hours and public contact methods; use official emergency channels when needed."
      ),
      transport: catalogText(
        "先建立清晰的通勤地标，再用社区活动补充人与空间的连接。",
        "Establish a clear commute landmark, then add social context through a community activity.",
        "你最关心出行，因此路线优先帮助你建立桐梓林的方向感。",
        "Transport is your priority, so the route first builds orientation around Tongzilin.",
        "保存常用出口、线路和返程地标。",
        "Save key exits, routes, and return landmarks."
      ),
      "outdoor-sports": catalogText(
        "先用步行或轻运动认识社区，再把固定作息转化为邻里联系。",
        "Learn the neighborhood through walking or light exercise, then turn a routine into a social connection.",
        "你偏好户外运动，因此路线优先选择适合建立日常活动节奏的空间。",
        "Outdoor activity is your priority, so the route favors a place suited to building a regular routine.",
        "根据天气准备饮水、防晒和合适的运动节奏。",
        "Prepare water, sun protection, and a suitable pace for the weather."
      )
    },
    arrival_context: {
      "first-week": catalogText(
        "第一周先解决方向感和服务入口。",
        "In the first week, prioritize orientation and service entry points.",
        "你刚到第一周，反馈会把可立即执行和可继续咨询放在前面。",
        "Because this is your first week, the plan prioritizes immediate actions and places to ask follow-up questions.",
        "只安排今天最重要的一步，避免一次吸收过多信息。",
        "Focus on today's most important step instead of taking in too much at once."
      ),
      "first-month": catalogText(
        "第一个月开始把地点认识转化为稳定日常。",
        "During the first month, turn familiar places into a steady routine.",
        "你已度过最初几天，反馈会增加重复参与和认识邻居的机会。",
        "You are past the first few days, so the plan adds opportunities for repeat participation and meeting neighbors.",
        "选择一个愿意在未来两周再次参加的活动。",
        "Choose one activity you would be willing to repeat in the next two weeks."
      ),
      settled: catalogText(
        "稳定居住后，把熟悉感转化为更深入的社区参与。",
        "Once settled, turn familiarity into deeper community participation.",
        "你已经较熟悉周边，反馈会强调兴趣延伸和持续贡献。",
        "You already know the area, so the plan emphasizes extending interests and contributing over time.",
        "留意可以长期参与或帮助他人的公开机会。",
        "Look for public opportunities to participate or help over the longer term."
      )
    },
    household_type: {
      solo: catalogText(
        "单人路线强调低压力进入和清晰的离场选择。",
        "The solo route emphasizes low-pressure entry and a clear way to leave.",
        "你独自参与，建议先从有工作人员或志愿者的场景开始。",
        "You are joining alone, so start in a setting with staff or volunteers present.",
        "提前设定停留时间，感觉合适再延长。",
        "Set a planned stay and extend it only if the setting feels right."
      ),
      couple: catalogText(
        "两人同行可以分工观察，再共同选择值得重复的社区节点。",
        "As a couple, observe different details and choose together which community point to revisit.",
        "你与伴侣同行，反馈会保留共同体验和分别交流的空间。",
        "You are joining as a couple, so the plan leaves room for a shared experience and separate conversations.",
        "结束后各自说出一个想再次参与的理由。",
        "Afterward, each choose one reason you would return."
      ),
      "family-with-kids": catalogText(
        "家庭路线强调节奏、补给和孩子可以随时休息。",
        "The family route emphasizes pacing, supplies, and the option for children to rest.",
        "你与孩子同行，反馈会优先给出更易调整节奏的参与方式。",
        "You are joining with children, so the plan prioritizes participation that is easier to pace and adjust.",
        "预留休息和临时离场时间，不把完成路线当成必须。",
        "Allow time for breaks and early departure; completing every step is optional."
      ),
      shared: catalogText(
        "合住居民可以把路线变成一次共同认识周边的轻任务。",
        "Housemates can turn the route into a light shared task for learning the area.",
        "你与室友合住，反馈会鼓励分工收集信息并共享社区联系人。",
        "You share a household, so the plan encourages dividing information-gathering and sharing community contacts.",
        "每人负责记录一类信息，结束后交换。",
        "Have each person record one kind of information and compare afterward."
      )
    },
    accessibility_need: {
      none: catalogText(
        "当前使用标准路线提示。",
        "Standard route guidance is used for this profile.",
        "你未选择额外支持需求；路线使用标准参与提示，仍可按实际情况调整。",
        "You selected no additional support need, so the route uses standard guidance and can still be adjusted as needed.",
        "出发前按天气、时间和个人状态做最后确认。",
        "Make a final check based on weather, timing, and how you feel."
      ),
      wheelchair: catalogText(
        "出发前需要单独确认通行条件。",
        "Access conditions need to be confirmed before departure.",
        "目录没有认证地点设施；请提前联系现场确认入口、通行空间和卫生间情况。",
        "The directory does not certify venue facilities; contact the venue to confirm entrances, circulation space, and toilets.",
        "如无法获得确认，请准备替代地点或同行支持。",
        "If confirmation is unavailable, prepare an alternative stop or companion support."
      ),
      "low-vision": catalogText(
        "出发前确认标识、照明和同行支持。",
        "Confirm signage, lighting, and companion support before departure.",
        "目录没有认证现场导视；建议提前询问标识和照明情况，并携带常用辅助工具。",
        "The directory does not certify on-site wayfinding; ask about signage and lighting and bring your usual aids.",
        "保存地点名称和公开联系方式，便于途中求助。",
        "Save the place name and public contact details for assistance en route."
      ),
      "low-mobility": catalogText(
        "路线需要更慢节奏和明确休息安排。",
        "The route needs a slower pace and clear rest planning.",
        "目录没有认证座位或步行距离；请提前确认停留条件并预留休息时间。",
        "The directory does not certify seating or walking distance; confirm conditions and allow rest time.",
        "任一步骤都可以缩短，不以走完整条路线为必须。",
        "Any step can be shortened; completing the entire route is not required."
      ),
      "hearing-support": catalogText(
        "准备文字沟通方式并提前联系组织者。",
        "Prepare a written communication method and contact the organizer in advance.",
        "目录没有认证听力支持设备；建议提前询问沟通安排并准备文字信息。",
        "The directory does not certify hearing-support equipment; ask about communication arrangements and prepare written information.",
        "把关键问题写在手机备忘录中，现场可直接展示。",
        "Write key questions in a phone note that can be shown on site."
      ),
      "quiet-environment": catalogText(
        "建议错峰并在出发前询问现场人流。",
        "Visit off-peak and ask about expected crowds before departure.",
        "目录不对安静程度作认证；请提前询问人流和噪声情况，并保留随时离开的选择。",
        "The directory does not certify quietness; ask about crowds and noise and keep the option to leave early.",
        "选择较短停留时间，感觉合适再延长。",
        "Plan a shorter stay and extend it only if the environment feels suitable."
      )
    }
  });

export const getPlaceNarration = (
  category: PlaceTopLevelCategory
): BilingualNarration => PLACE_NARRATION[category];

export const getEventNarration = (): BilingualNarration => EVENT_NARRATION;

const requireCatalogEntry = <Key extends string>(
  record: Partial<Record<Key, CommunityPlanCatalogText>>,
  key: Key
): CommunityPlanCatalogText => {
  const entry = record[key];
  if (!entry) {
    throw new Error(`Community Plan catalog entry is missing: ${key}`);
  }
  return entry;
};

export const getInterestFeedback = (interest: CommunityPlanInterest) =>
  requireCatalogEntry(COMMUNITY_PLAN_FEEDBACK_CATALOG.primary_interest, interest);

export const getArrivalFeedback = (arrival: CommunityPlanArrivalContext) =>
  requireCatalogEntry(COMMUNITY_PLAN_FEEDBACK_CATALOG.arrival_context, arrival);

export const getHouseholdFeedback = (household: CommunityPlanHouseholdType) =>
  requireCatalogEntry(
    COMMUNITY_PLAN_FEEDBACK_CATALOG.household_type,
    household
  );

export const getAccessibilityFeedback = (
  need: CommunityPlanAccessibilityNeed
) =>
  requireCatalogEntry(COMMUNITY_PLAN_FEEDBACK_CATALOG.accessibility_need, need);
