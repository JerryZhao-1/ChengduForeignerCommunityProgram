import { z } from "zod";

export const PLACE_TOP_LEVEL_CATEGORIES = [
  "public-service",
  "food-drink",
  "shopping",
  "lifestyle",
  "education",
  "health-wellness",
  "entertainment",
  "outdoor-sports",
  "transport",
  "community"
] as const;

export const PlaceTopLevelCategorySchema = z.enum(PLACE_TOP_LEVEL_CATEGORIES);

export type PlaceTopLevelCategory = (typeof PLACE_TOP_LEVEL_CATEGORIES)[number];

export const PLACE_SECONDARY_CATEGORY_OPTIONS: Record<
  PlaceTopLevelCategory,
  readonly string[]
> = {
  "public-service": [
    "community-center",
    "service-desk",
    "government-service",
    "public-facility"
  ],
  "food-drink": ["cafe", "restaurant", "bakery-dessert", "bar"],
  shopping: ["supermarket", "mall", "market", "retail-store"],
  lifestyle: ["beauty-salon", "laundry", "repair-service", "pet-service"],
  education: ["kindergarten", "language-school", "training-center", "library"],
  "health-wellness": ["clinic", "pharmacy", "dental", "hospital"],
  entertainment: ["cinema", "ktv", "arts-culture", "leisure"],
  "outdoor-sports": ["park", "sports-field", "gym", "trail"],
  transport: ["metro-station", "bus-stop", "parking", "taxi-point"],
  community: [
    "public-square",
    "neighborhood-space",
    "social-space",
    "volunteer-point"
  ]
} as const;
