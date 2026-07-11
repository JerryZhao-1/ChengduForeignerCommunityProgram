import type { Notification } from "@community-map/shared";

import {
  getMobileCopy,
  resolveLocalized,
  type MobileLocale
} from "../../i18n";

const resolveNotificationText = (
  locale: MobileLocale,
  zh: string | null | undefined,
  en: string | null | undefined,
  legacy: string
) => {
  const localized = resolveLocalized(locale, { zh, en }, { optional: true });
  const legacyValue = legacy.trim();
  return {
    value:
      localized.value ||
      legacyValue ||
      getMobileCopy(locale).common.unavailable,
    usedFallback: localized.usedFallback,
    usedLegacy: !localized.value && Boolean(legacyValue)
  };
};

export const resolveNotificationPresentation = (
  notification: Notification,
  locale: MobileLocale
) => ({
  title: resolveNotificationText(
    locale,
    notification.title_zh,
    notification.title_en,
    notification.title
  ),
  body: resolveNotificationText(
    locale,
    notification.body_zh,
    notification.body_en,
    notification.body
  )
});
