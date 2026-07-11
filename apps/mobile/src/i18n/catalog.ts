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
      syncPending: "Saved on this device and will sync when the network returns."
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
