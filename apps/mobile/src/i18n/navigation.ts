import { getMobileCopy, type MobileCatalog } from "./catalog";
import type { MobileLocale } from "./localized";

type NavigationKey = keyof MobileCatalog["navigation"];

export const ROUTE_TITLE_KEYS: Record<string, NavigationKey> = {
  "pages/home/index": "home",
  "pages/events/index": "events",
  "pages/events/detail": "eventDetail",
  "pages/events/signup": "eventSignup",
  "pages/discover/index": "discover",
  "pages/discover/detail": "discoverDetail",
  "pages/discover/create": "discoverCreate",
  "pages/discover/search": "discoverSearch",
  "pages/discover/report": "discoverReport",
  "pages/places/index": "placesList",
  "pages/places/detail": "placeDetail",
  "pages/places/map": "placeMap",
  "pages/places/recommended": "recommendedPlaces",
  "pages/more/login": "login",
  "pages/more/index": "me",
  "pages/more/notifications": "notifications",
  "pages/more/my-registrations": "registrations",
  "pages/more/my-favorites": "favorites",
  "pages/more/my-likes": "likes",
  "pages/more/my-posts": "posts",
  "pages/more/my-comments": "comments",
  "pages/more/my-comment-detail": "commentDetail",
  "pages/more/my-reports": "reports",
  "pages/more/my-report-detail": "reportDetail",
  "pages/more/profile": "profile",
  "pages/more/follows": "follows",
  "pages/more/language-settings": "languageSettings"
};

export const TAB_ITEMS: Array<{
  index: number;
  pagePath: string;
  titleKey: NavigationKey;
}> = [
  { index: 0, pagePath: "pages/home/index", titleKey: "home" },
  { index: 1, pagePath: "pages/events/index", titleKey: "events" },
  { index: 2, pagePath: "pages/discover/index", titleKey: "discover" },
  { index: 3, pagePath: "pages/places/map", titleKey: "places" },
  { index: 4, pagePath: "pages/more/index", titleKey: "me" }
];

const currentRoute = () => {
  if (typeof getCurrentPages !== "function") {
    return undefined;
  }
  const pages = getCurrentPages();
  const current = pages.length > 0 ? pages[pages.length - 1] : undefined;
  return current && "route" in current ? current.route : undefined;
};

export const routeTitle = (route: string, locale: MobileLocale) => {
  const key = ROUTE_TITLE_KEYS[route];
  return key ? getMobileCopy(locale).navigation[key] : undefined;
};

const ignoreUniApiRejection = (result: unknown) => {
  if (
    result &&
    typeof (result as { then?: unknown }).then === "function"
  ) {
    void Promise.resolve(result).catch(() => undefined);
  }
};

export const updateRuntimeNavigation = (
  locale: MobileLocale,
  route = currentRoute()
) => {
  if (typeof uni === "undefined") {
    return;
  }
  const title = route ? routeTitle(route, locale) : undefined;
  if (title && typeof document !== "undefined") {
    document.title = title;
  }
  if (title && typeof uni.setNavigationBarTitle === "function") {
    ignoreUniApiRejection(uni.setNavigationBarTitle({ title }));
  }
  const isTabBarRoute = TAB_ITEMS.some((item) => item.pagePath === route);
  if (isTabBarRoute && typeof uni.setTabBarItem === "function") {
    for (const item of TAB_ITEMS) {
      ignoreUniApiRejection(
        uni.setTabBarItem({
          index: item.index,
          text: getMobileCopy(locale).navigation[item.titleKey]
        })
      );
    }
  }
};
