import {
  getMobileCopy,
  interpolate,
  resolveLocalized,
  type LocalizedValueResult,
  type MobileLocale
} from "../../i18n";

export const resolvePlaceField = (
  locale: MobileLocale,
  zh: string | null | undefined,
  en: string | null | undefined,
  optional = false
) => resolveLocalized(locale, { zh, en }, { optional });

export const formatPlaceFallbackNotice = (
  locale: MobileLocale,
  fields: LocalizedValueResult[]
) => {
  const fallback = fields.find(
    (field) => field.usedFallback && field.resolvedLocale
  );
  if (!fallback || !fallback.resolvedLocale) {
    return "";
  }

  const common = getMobileCopy(locale).common;
  const language =
    fallback.resolvedLocale === "zh"
      ? common.languageZh
      : common.languageEn;
  return interpolate(common.fallbackLanguage, { language });
};

export const formatPlaceGalleryAlt = (
  locale: MobileLocale,
  name: string,
  index: number,
  external = false
) => {
  const copy = getMobileCopy(locale).places.detail;
  return interpolate(
    external ? copy.externalGalleryAlt : copy.galleryAlt,
    { name, index }
  );
};

export const formatPlaceCommentsCount = (
  locale: MobileLocale,
  count: number
) =>
  interpolate(getMobileCopy(locale).places.detail.commentsCount, { count });
