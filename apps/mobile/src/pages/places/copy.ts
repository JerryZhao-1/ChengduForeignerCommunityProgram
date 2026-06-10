export type PlacesLocale = "zh" | "en";

const placesCopy = {
  zh: {
    list: {
      title: "社区地点",
      subtitle: "浏览社区地点卡片，按关键词、分类或推荐状态快速筛选。",
      loading: "地点列表加载中...",
      empty: "当前筛选条件下暂无地点。",
      error: "列表加载失败",
      searchPlaceholder: "搜索地点名称或简介",
      allCategories: "全部",
      activeTag: "标签",
      recommendedFilter: "推荐地点",
      recommendedSort: "推荐优先",
      nameSort: "名称排序",
      clearFilters: "清空筛选",
      categoryLabel: "分类",
      recommendedBadge: "推荐"
    },
    map: {
      title: "社区地点地图",
      subtitle: "先在地图上浏览地点，再进入列表筛选或详情页。",
      loading: "地图点位加载中...",
      empty: "暂无已发布地点可显示。",
      error: "地图点位加载失败",
      openList: "查看完整列表",
      openRecommended: "推荐地点",
      openDetail: "查看地点详情",
      openNavigation: "发起导航",
      navigationUnavailable: "该地点暂不能导航",
      navigationFailed: "打开导航失败，请稍后再试",
      recommendedBadge: "推荐地点"
    },
    detail: {
      loading: "详情加载中...",
      missingId: "缺少地点 ID",
      empty: "地点详情不可用。",
      error: "详情加载失败",
      businessHours: "营业时间",
      address: "地址",
      intro: "简介",
      gallery: "地点图集",
      noGallery: "暂无图集图片",
      openNavigation: "发起导航",
      openMapPosition: "查看地图位置",
      favoriteEntry: "收藏",
      favoriteActive: "已收藏",
      favoriteAdded: "已收藏此地点",
      favoriteRemoved: "已取消收藏",
      shareEntry: "分享",
      shareReady: "可通过系统分享发送此地点",
      shareCopied: "地点链接已复制",
      shareUnavailable: "暂不可分享",
      shareFallbackTitle: "社区地点",
      navigationUnavailable: "该地点暂不能导航",
      navigationFailed: "打开导航失败，请稍后再试",
      recommendedFallback: "推荐地点"
    }
  },
  en: {
    list: {
      title: "Community Places",
      subtitle:
        "Browse community places with keyword search, category switching, and recommended filters.",
      loading: "Loading places...",
      empty: "No places match the current filters.",
      error: "Failed to load places",
      searchPlaceholder: "Search place name or summary",
      allCategories: "All",
      activeTag: "Tag",
      recommendedFilter: "Recommended places",
      recommendedSort: "Recommended first",
      nameSort: "Sort by name",
      clearFilters: "Clear filters",
      categoryLabel: "Category",
      recommendedBadge: "Recommended"
    },
    map: {
      title: "Community Places Map",
      subtitle:
        "Start on the map, then move into list filters or place details.",
      loading: "Loading map markers...",
      empty: "No published places are available on the map yet.",
      error: "Failed to load map markers",
      openList: "Open full list",
      openRecommended: "Recommended places",
      openDetail: "View place detail",
      openNavigation: "Start navigation",
      navigationUnavailable: "Navigation is unavailable for this place",
      navigationFailed: "Could not open navigation. Please try again.",
      recommendedBadge: "Recommended"
    },
    detail: {
      loading: "Loading place detail...",
      missingId: "Missing place ID",
      empty: "Place detail is unavailable.",
      error: "Failed to load place detail",
      businessHours: "Business hours",
      address: "Address",
      intro: "Intro",
      gallery: "Gallery",
      noGallery: "No gallery images yet",
      openNavigation: "Start navigation",
      openMapPosition: "View on map",
      favoriteEntry: "Favorite",
      favoriteActive: "Favorited",
      favoriteAdded: "Place saved",
      favoriteRemoved: "Place removed",
      shareEntry: "Share",
      shareReady: "Use the system share panel to send this place",
      shareCopied: "Place link copied",
      shareUnavailable: "Sharing unavailable",
      shareFallbackTitle: "Community place",
      navigationUnavailable: "Navigation is unavailable for this place",
      navigationFailed: "Could not open navigation. Please try again.",
      recommendedFallback: "Recommended place"
    }
  }
} as const;

export const getPlacesCopy = <
  TSection extends keyof (typeof placesCopy)["zh"]
>(
  locale: PlacesLocale,
  section: TSection
) => placesCopy[locale][section];
