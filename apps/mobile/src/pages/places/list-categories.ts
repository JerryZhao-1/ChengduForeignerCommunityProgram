import { PLACE_TOP_LEVEL_CATEGORIES } from "@community-map/shared";

export interface PlaceCategoryOption {
  value: (typeof PLACE_TOP_LEVEL_CATEGORIES)[number];
  label: {
    zh: string;
    en: string;
  };
}

const CATEGORY_LABELS: Record<
  (typeof PLACE_TOP_LEVEL_CATEGORIES)[number],
  PlaceCategoryOption["label"]
> = {
  "public-service": {
    zh: "公共服务",
    en: "Public Services"
  },
  "food-drink": {
    zh: "餐饮",
    en: "Food & Drink"
  },
  shopping: {
    zh: "购物",
    en: "Shopping"
  },
  lifestyle: {
    zh: "生活方式",
    en: "Lifestyle"
  },
  education: {
    zh: "教育",
    en: "Education"
  },
  "health-wellness": {
    zh: "健康",
    en: "Health & Wellness"
  },
  entertainment: {
    zh: "娱乐",
    en: "Entertainment"
  },
  "outdoor-sports": {
    zh: "户外运动",
    en: "Outdoor Sports"
  },
  transport: {
    zh: "交通",
    en: "Transport"
  },
  community: {
    zh: "社区",
    en: "Community"
  }
};

export const PLACE_LIST_CATEGORIES: PlaceCategoryOption[] =
  PLACE_TOP_LEVEL_CATEGORIES.map((value) => ({
    value,
    label: CATEGORY_LABELS[value]
  }));
