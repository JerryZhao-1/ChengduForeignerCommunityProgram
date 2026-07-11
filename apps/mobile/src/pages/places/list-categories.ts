import {
  PLACE_SECONDARY_CATEGORY_OPTIONS,
  PLACE_TOP_LEVEL_CATEGORIES,
  type PlaceTopLevelCategory
} from "@community-map/shared";

import { getMobileCopy, type MobileLocale } from "../../i18n";

export interface PlaceCategoryOption {
  value: PlaceTopLevelCategory;
}

type SecondaryCategory =
  (typeof PLACE_SECONDARY_CATEGORY_OPTIONS)[PlaceTopLevelCategory][number];

export const PLACE_LIST_CATEGORIES: PlaceCategoryOption[] =
  PLACE_TOP_LEVEL_CATEGORIES.map((value) => ({ value }));

const titleCaseCode = (value: string) =>
  value
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

export const getPlaceCategoryLabel = (
  locale: MobileLocale,
  category: string
) => {
  const categories = getMobileCopy(locale).places.categories;
  const topLevel = categories.topLevel as Record<string, string>;
  const secondary = categories.secondary as Record<string, string>;

  return topLevel[category] || secondary[category] || titleCaseCode(category);
};

export const getPlaceCategoryPathLabel = (
  locale: MobileLocale,
  levelOne: PlaceTopLevelCategory,
  levelTwo?: SecondaryCategory | string | null
) => {
  const levelOneLabel = getPlaceCategoryLabel(locale, levelOne);
  return levelTwo
    ? `${levelOneLabel} / ${getPlaceCategoryLabel(locale, levelTwo)}`
    : levelOneLabel;
};

export const getPlaceTagLabel = (locale: MobileLocale, tag: string) => {
  const tags = getMobileCopy(locale).places.categories.tags as Record<
    string,
    string
  >;
  return tags[tag] || titleCaseCode(tag);
};
