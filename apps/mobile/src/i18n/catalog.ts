import { appCopy } from "./copy";
import { placesCopy } from "../pages/places/copy";

import type { MobileLocale } from "./localized";

const foundationCopy = {
  zh: {
    common: {
      loading: "加载中...",
      retry: "重试",
      unavailable: "暂无信息",
      fallbackLanguage: "当前内容暂以{language}显示",
      languageZh: "中文",
      languageEn: "English",
      save: "保存",
      cancel: "取消",
      confirm: "确认",
      error: "操作失败，请稍后重试"
    },
    navigation: {
      home: "首页",
      events: "活动",
      discover: "发现",
      places: "地点",
      me: "我的",
      eventDetail: "活动详情",
      eventSignup: "活动报名",
      discoverDetail: "帖子详情",
      discoverCreate: "发布帖子",
      discoverSearch: "搜索",
      discoverReport: "举报内容",
      placesList: "地点列表",
      placeDetail: "地点详情",
      placeMap: "地点地图",
      recommendedPlaces: "推荐地点",
      notifications: "通知中心",
      registrations: "我的报名",
      favorites: "我的收藏",
      likes: "我的点赞",
      posts: "我的帖子",
      comments: "我的评论",
      commentDetail: "评论详情",
      reports: "我的举报",
      reportDetail: "举报详情",
      profile: "个人主页",
      follows: "关注列表",
      login: "登录",
      languageSettings: "语言设置"
    },
    home: {
      title: appCopy.zh.homeTitle,
      subtitle: appCopy.zh.homeSubtitle,
      events: "活动",
      eventsSubtitle: "浏览社区活动并完成报名。",
      announcements: "公告",
      announcementsSubtitle: "查看社区最新消息。",
      places: "地点",
      placesSubtitle: "浏览社区地点和推荐去处。",
      viewPlaces: "查看地点列表",
      viewRecommendedPlaces: "查看推荐地点",
      quickActions: appCopy.zh.moreActions,
      profile: "个人主页",
      notifications: "通知中心",
      registrations: "我的报名",
      language: "语言设置"
    },
    events: {
      tabs: {
        all: "全部",
        thisWeek: "本周",
        upcoming: "即将开始",
        mine: "我的"
      },
      states: {
        loading: "活动加载中...",
        error: "活动加载失败，请稍后重试",
        empty: "暂无活动",
        emptyAll: "请稍后再来看看",
        emptyWeek: "本周暂无活动",
        emptyUpcoming: "暂无即将开始的活动",
        emptyMine: "你还没有报名活动",
        missing: "活动不存在",
        missingId: "缺少活动 ID",
        ongoing: "进行中",
        registrationOpen: "报名中"
      },
      signupStates: {
        unavailable: {
          label: "暂不可报名",
          reason: "活动暂不可访问或已下线。"
        },
        offline: {
          label: "活动已下线",
          reason: "该活动已下线，暂不可报名。"
        },
        notOpen: {
          label: "暂不可报名",
          reason: "该活动暂未开放报名。"
        },
        alreadyRegistered: {
          label: "已报名",
          reason: "你已报名该活动，不能重复报名。"
        },
        ended: {
          label: "活动已结束",
          reason: "活动已结束，无法继续报名。"
        },
        closed: {
          label: "报名已截止",
          reason: "报名时间已截止，无法继续提交报名。"
        },
        available: { label: "立即报名", reason: "" }
      },
      time: "时间",
      place: "地点",
      capacity: "名额",
      capacityValue: "名额 {count}",
      details: "活动介绍",
      relatedDiscussion: "相关讨论",
      startDiscussion: "发起活动讨论",
      ticket: "入场凭证",
      viewDetail: "查看详情",
      commentsCount: "{count} 条评论",
      registration: {
        title: "报名信息",
        name: "姓名",
        namePlaceholder: "请输入姓名",
        phone: "电话",
        phonePlaceholder: "请输入联系电话",
        attendees: "人数",
        attendeesPlaceholder: "请输入人数",
        submit: "提交报名",
        success: "报名成功",
        ticketCode: "凭证号",
        namePhoneRequired: "请填写姓名和电话",
        phoneInvalid: "请输入 11 位手机号码",
        attendeesInvalid: "报名人数需为 1-10 人",
        failed: "报名失败，请稍后重试"
      }
    },
    auth: {
      title: "微信登录",
      signIn: "登录",
      signingIn: "登录中...",
      success: "登录成功",
      error: "登录失败，请稍后重试",
      signedInAs: "当前用户：{name}"
    },
    language: {
      title: "语言设置",
      caption: "选择界面语言。正式内容会优先显示所选语言，并在缺失时明确回退。",
      chinese: "中文",
      english: "English",
      selected: "当前语言",
      saved: "语言偏好已保存",
      syncPending: "已保存在本机，将在网络恢复后同步。"
    },
    notifications: {
      title: "通知中心",
      loading: "通知加载中...",
      empty: "暂无通知",
      error: "通知加载失败，请稍后重试",
      markRead: "标记已读",
      read: "已读",
      unread: "未读",
      markingRead: "处理中..."
    },
    registrations: {
      title: "我的报名",
      loading: "报名记录加载中...",
      empty: "暂无报名记录",
      error: "报名记录加载失败，请稍后重试",
      record: "报名记录",
      status: "状态",
      contact: "联系人",
      phone: "联系电话",
      attendees: "报名人数",
      ticket: "票券编号",
      statuses: {
        submitted: "已提交",
        confirmed: "已确认",
        cancelled: "已取消",
        closed: "已关闭"
      }
    },
    onboarding: {
      heroTitle: "今天，什么能让桐梓林变成你的家？",
      heroSubtitle: "30 秒生成你的专属社区融入路线",
      judgeEntry: "30 秒评委体验",
      judgeEntryCaption: "使用预置偏好，快速体验完整流程",
      planEntry: "为我制定计划",
      planEntryCaption: "回答 4 个问题，生成你的路线",
      guestNotice: "评委模式 · 无需登录、验证码或微信授权",
      communityDefault: "桐梓林",
      communityManualHint: "默认定位桐梓林，你也可以手动选择",
      stepIndicator: "第 {current} / {total} 步",
      step1Title: "你更希望使用哪种语言？",
      step2Title: "你对哪些社区活动感兴趣？",
      step2Hint: "至少选择一项",
      step3Title: "你来到桐梓林多久了？",
      step4Title: "还有什么我们需要知道的？",
      step4Hint: "可跳过",
      languageZh: "中文",
      languageEn: "English",
      useExample: "使用示例偏好",
      next: "下一步",
      back: "返回",
      submit: "生成我的路线",
      skip: "跳过",
      interests: {
        "community-service": "社区服务",
        "food-drink": "美食饮品",
        social: "社交聚会",
        "language-exchange": "语言交换",
        "family-kids": "亲子家庭",
        "health-wellness": "健康养生",
        transport: "交通出行",
        "outdoor-sports": "户外运动"
      },
      arrivalContexts: {
        "first-week": "刚到第一周",
        "first-month": "第一个月内",
        settled: "已经安顿"
      },
      householdTypes: {
        solo: "独自居住",
        couple: "伴侣同住",
        "family-with-kids": "带小孩家庭",
        shared: "合租共享"
      },
      accessibilityNeeds: {
        wheelchair: "轮椅通行",
        "low-vision": "低视力支持",
        "low-mobility": "行动不便支持",
        "hearing-support": "听力支持",
        "quiet-environment": "安静环境"
      },
      generating: {
        title: "正在为你组织路线...",
        checkTime: "检查可用时间",
        matchPlaces: "匹配附近地点",
        checkCapacity: "检查活动名额",
        organizeTips: "组织双语提示"
      },
      plan: {
        title: "你的桐邻 120 分钟",
        offlineNotice: "离线演示模式 · 使用预置路线",
        validationError: "输入有误，请检查后重试",
        networkError: "网络异常，已切换到离线演示",
        forbiddenError: "当前评委会话不可用，请重新开始",
        notFoundError: "路线生成服务暂不可用，请稍后重试",
        conflictError: "当前状态已变化，请重新生成路线",
        rateLimitedError: "请求过于频繁，请稍后再试",
        genericError: "暂时无法生成路线，请稍后重试",
        requestId: "请求编号：{requestId}",
        retry: "重试",
        startOver: "重新开始",
        duration: "总时长 {minutes} 分钟",
        viewRoute: "查看路线详情",
        stopLabel: "第 {index} 站",
        openPlace: "打开地点详情",
        markVisited: "标记为已到访",
        visited: "已到访",
        unavailable: "地点暂不可用",
        demoConfirm: "演示确认",
        demoConfirmed: "已演示确认",
        demoDisclosure: "仅作本地演示，不创建报名、预约、票券或名额占用。",
        finish: "完成路线",
        finishGuidance: "到访地点并完成活动演示确认后即可结束路线",
        itemTypes: {
          place_visit: "地点到访",
          event_attend: "活动演示"
        },
        generationSources: {
          rule_based: "规则路线",
          ai_enhanced: "AI 双语增强",
          rule_based_fallback: "安全回退路线"
        },
        aiStatuses: {
          ok: "AI 双语提示已生成",
          not_configured: "使用确定性社区路线",
          timeout: "AI 响应超时，已使用安全路线",
          validation_failed: "AI 内容未通过校验，已使用安全路线",
          upstream_error: "AI 服务暂不可用，已使用安全路线",
          unavailable: "AI 未启用，已使用安全路线"
        }
      },
      route: {
        title: "路线清单",
        subtitle: "按顺序完成你的桐梓林第一程",
        mapUnavailable: "地图增强未启用，路线清单仍可正常使用",
        back: "返回计划",
        openPlace: "查看地点",
        coordinates: "位置 {latitude}, {longitude}"
      },
      complete: {
        title: "你的第一程已完成",
        subtitle: "欢迎来到桐梓林，社区探索才刚刚开始。",
        places: "地点到访 {visited}/{total}",
        events: "演示确认 {confirmed}/{total}",
        unavailablePlaces: "地点暂不可用，本次按 {visited}/{total} 计算",
        demoDisclosure: "演示确认未创建任何报名、预约、票券或名额占用。",
        startOver: "重新体验"
      },
      mpOnly: {
        title: "请在 H5 体验桐邻路线",
        description:
          "当前微信小程序仅保留现有社区功能，评委体验请使用 H5 链接。"
      },
      continueExploring: "继续探索"
    }
  },
  en: {
    common: {
      loading: "Loading...",
      retry: "Retry",
      unavailable: "Unavailable",
      fallbackLanguage: "This content is currently shown in {language}",
      languageZh: "Chinese",
      languageEn: "English",
      save: "Save",
      cancel: "Cancel",
      confirm: "Confirm",
      error: "Something went wrong. Please try again."
    },
    navigation: {
      home: "Home",
      events: "Events",
      discover: "Discover",
      places: "Places",
      me: "Me",
      eventDetail: "Event Details",
      eventSignup: "Event Registration",
      discoverDetail: "Post Details",
      discoverCreate: "Create Post",
      discoverSearch: "Search",
      discoverReport: "Report Content",
      placesList: "Places",
      placeDetail: "Place Details",
      placeMap: "Places Map",
      recommendedPlaces: "Recommended Places",
      notifications: "Notifications",
      registrations: "My Registrations",
      favorites: "My Favorites",
      likes: "My Likes",
      posts: "My Posts",
      comments: "My Comments",
      commentDetail: "Comment Details",
      reports: "My Reports",
      reportDetail: "Report Details",
      profile: "Profile",
      follows: "Follows",
      login: "Sign In",
      languageSettings: "Language"
    },
    home: {
      title: appCopy.en.homeTitle,
      subtitle: appCopy.en.homeSubtitle,
      events: "Events",
      eventsSubtitle: "Browse community events and register.",
      announcements: "Announcements",
      announcementsSubtitle: "Read the latest community updates.",
      places: "Places",
      placesSubtitle: "Browse local places and recommendations.",
      viewPlaces: "View Places",
      viewRecommendedPlaces: "Recommended Places",
      quickActions: appCopy.en.moreActions,
      profile: "Profile",
      notifications: "Notifications",
      registrations: "My Registrations",
      language: "Language"
    },
    events: {
      tabs: {
        all: "All",
        thisWeek: "This Week",
        upcoming: "Upcoming",
        mine: "Mine"
      },
      states: {
        loading: "Loading events...",
        error: "Could not load events. Please try again.",
        empty: "No events",
        emptyAll: "Check back soon.",
        emptyWeek: "No events this week.",
        emptyUpcoming: "No upcoming events.",
        emptyMine: "You have not registered for an event yet.",
        missing: "Event not found",
        missingId: "Missing event ID",
        ongoing: "In Progress",
        registrationOpen: "Registration Open"
      },
      signupStates: {
        unavailable: {
          label: "Registration Unavailable",
          reason: "This event is unavailable or offline."
        },
        offline: {
          label: "Event Offline",
          reason: "This event is offline and registration is unavailable."
        },
        notOpen: {
          label: "Registration Unavailable",
          reason: "Registration is not open for this event."
        },
        alreadyRegistered: {
          label: "Registered",
          reason: "You are already registered for this event."
        },
        ended: {
          label: "Event Ended",
          reason: "This event has ended and registration is closed."
        },
        closed: {
          label: "Registration Closed",
          reason: "The registration deadline has passed."
        },
        available: { label: "Register Now", reason: "" }
      },
      time: "Time",
      place: "Location",
      capacity: "Capacity",
      capacityValue: "{count} spots",
      details: "About This Event",
      relatedDiscussion: "Related Discussion",
      startDiscussion: "Start Discussion",
      ticket: "Entry Ticket",
      viewDetail: "View Details",
      commentsCount: "{count} comments",
      registration: {
        title: "Registration Details",
        name: "Name",
        namePlaceholder: "Enter your name",
        phone: "Phone",
        phonePlaceholder: "Enter your phone number",
        attendees: "Attendees",
        attendeesPlaceholder: "Enter attendee count",
        submit: "Submit Registration",
        success: "Registration Successful",
        ticketCode: "Ticket Code",
        namePhoneRequired: "Enter your name and phone number",
        phoneInvalid: "Enter an 11-digit mobile number",
        attendeesInvalid: "Attendee count must be between 1 and 10",
        failed: "Registration failed. Please try again."
      }
    },
    auth: {
      title: "WeChat Sign In",
      signIn: "Sign In",
      signingIn: "Signing in...",
      success: "Signed in",
      error: "Sign-in failed. Please try again.",
      signedInAs: "Signed in as {name}"
    },
    language: {
      title: "Language",
      caption:
        "Choose the interface language. Formal content uses your selection and clearly indicates any fallback.",
      chinese: "中文",
      english: "English",
      selected: "Current language",
      saved: "Language preference saved",
      syncPending:
        "Saved on this device and will sync when the network returns."
    },
    notifications: {
      title: "Notifications",
      loading: "Loading notifications...",
      empty: "No notifications yet",
      error: "Could not load notifications. Please try again.",
      markRead: "Mark as Read",
      read: "Read",
      unread: "Unread",
      markingRead: "Updating..."
    },
    registrations: {
      title: "My Registrations",
      loading: "Loading registrations...",
      empty: "No registrations yet",
      error: "Could not load registrations. Please try again.",
      record: "Registration",
      status: "Status",
      contact: "Contact",
      phone: "Phone",
      attendees: "Attendees",
      ticket: "Ticket ID",
      statuses: {
        submitted: "Submitted",
        confirmed: "Confirmed",
        cancelled: "Cancelled",
        closed: "Closed"
      }
    },
    onboarding: {
      heroTitle: "What would make Tongzilin feel like home today?",
      heroSubtitle: "Generate your personalized community route in 30 seconds",
      judgeEntry: "30-second judge experience",
      judgeEntryCaption: "Use preset preferences to try the full flow",
      planEntry: "Build my plan",
      planEntryCaption: "Answer 4 questions to generate your route",
      guestNotice: "Judge mode · No login, code, or WeChat authorization",
      communityDefault: "Tongzilin",
      communityManualHint:
        "Defaults to Tongzilin — you can also choose manually",
      stepIndicator: "Step {current} of {total}",
      step1Title: "Which language do you prefer?",
      step2Title: "What are you interested in?",
      step2Hint: "Select at least one",
      step3Title: "How new are you to Tongzilin?",
      step4Title: "Anything else we should know?",
      step4Hint: "Optional",
      languageZh: "中文",
      languageEn: "English",
      useExample: "Use example preferences",
      next: "Next",
      back: "Back",
      submit: "Generate my route",
      skip: "Skip",
      interests: {
        "community-service": "Community Service",
        "food-drink": "Food & Drink",
        social: "Social",
        "language-exchange": "Language Exchange",
        "family-kids": "Family & Kids",
        "health-wellness": "Health & Wellness",
        transport: "Transport",
        "outdoor-sports": "Outdoor Sports"
      },
      arrivalContexts: {
        "first-week": "First week",
        "first-month": "First month",
        settled: "Settled in"
      },
      householdTypes: {
        solo: "Solo",
        couple: "Couple",
        "family-with-kids": "Family with kids",
        shared: "Shared"
      },
      accessibilityNeeds: {
        wheelchair: "Wheelchair access",
        "low-vision": "Low vision support",
        "low-mobility": "Low mobility support",
        "hearing-support": "Hearing support",
        "quiet-environment": "Quiet environment"
      },
      generating: {
        title: "Building your route...",
        checkTime: "Checking available time",
        matchPlaces: "Matching nearby places",
        checkCapacity: "Checking event availability",
        organizeTips: "Organizing bilingual tips"
      },
      plan: {
        title: "Your Tonglin 120 Minutes",
        offlineNotice: "Offline demo mode · Using preset route",
        validationError: "Please check your input and try again",
        networkError: "Network issue, switched to offline demo",
        forbiddenError: "This judge session is unavailable. Please start over.",
        notFoundError:
          "The route service is temporarily unavailable. Please retry.",
        conflictError:
          "The current state changed. Please generate a new route.",
        rateLimitedError: "Too many requests. Please try again shortly.",
        genericError: "Unable to generate a route right now. Please retry.",
        requestId: "Request ID: {requestId}",
        retry: "Retry",
        startOver: "Start over",
        duration: "{minutes} minutes total",
        viewRoute: "View route details",
        stopLabel: "Stop {index}",
        openPlace: "Open place details",
        markVisited: "Mark visited",
        visited: "Visited",
        unavailable: "Place unavailable",
        demoConfirm: "Demo Confirm",
        demoConfirmed: "Demo confirmed",
        demoDisclosure:
          "Local demo only. This creates no booking, reservation, ticket, or capacity hold.",
        finish: "Finish route",
        finishGuidance: "Visit the place and confirm the demo event to finish",
        itemTypes: {
          place_visit: "Place visit",
          event_attend: "Demo event"
        },
        generationSources: {
          rule_based: "Rule-based route",
          ai_enhanced: "AI bilingual enhancement",
          rule_based_fallback: "Safe fallback route"
        },
        aiStatuses: {
          ok: "AI bilingual tips generated",
          not_configured: "Using the deterministic community route",
          timeout: "AI timed out; using the safe route",
          validation_failed:
            "AI content did not validate; using the safe route",
          upstream_error: "AI is temporarily unavailable; using the safe route",
          unavailable: "AI is not enabled; using the safe route"
        }
      },
      route: {
        title: "Route list",
        subtitle: "Follow your first Tongzilin journey in order",
        mapUnavailable:
          "Map enhancement is unavailable; the route list remains fully usable",
        back: "Back to plan",
        openPlace: "View place",
        coordinates: "Location {latitude}, {longitude}"
      },
      complete: {
        title: "Your first journey is complete",
        subtitle:
          "Welcome to Tongzilin. Your community exploration has just begun.",
        places: "Place visits {visited}/{total}",
        events: "Demo confirms {confirmed}/{total}",
        unavailablePlaces:
          "A place was unavailable; this result is {visited}/{total}",
        demoDisclosure:
          "Demo Confirm created no booking, reservation, ticket, or capacity hold.",
        startOver: "Start over"
      },
      mpOnly: {
        title: "Open the Tonglin route in H5",
        description:
          "The Mini Program keeps the existing community features. Use the H5 link for the judge experience."
      },
      continueExploring: "Continue exploring"
    }
  }
} as const;

type WidenCatalog<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer TItem)[]
        ? readonly WidenCatalog<TItem>[]
        : T extends object
          ? { readonly [TKey in keyof T]: WidenCatalog<T[TKey]> }
          : T;

export const mobileCatalog = {
  zh: {
    ...foundationCopy.zh,
    discover: appCopy.zh.discover,
    places: placesCopy.zh,
    me: appCopy.zh.me,
    profile: appCopy.zh.profile
  },
  en: {
    ...foundationCopy.en,
    discover: appCopy.en.discover,
    places: placesCopy.en,
    me: appCopy.en.me,
    profile: appCopy.en.profile
  }
} as const;

type ChineseCatalog = WidenCatalog<(typeof mobileCatalog)["zh"]>;
type EnglishCatalog = WidenCatalog<(typeof mobileCatalog)["en"]>;

const englishCatalogParity: ChineseCatalog = mobileCatalog.en;
const chineseCatalogParity: EnglishCatalog = mobileCatalog.zh;
void englishCatalogParity;
void chineseCatalogParity;

export type MobileCatalog = ChineseCatalog;

export const getMobileCopy = (locale: MobileLocale): MobileCatalog =>
  mobileCatalog[locale];
