import type { Event, Notification, Place } from "./types/entities";

export const PUBLICATION_PLACEHOLDERS = [
  "tbd",
  "todo",
  "n/a",
  "na",
  "pending",
  "placeholder",
  "draft",
  "to be translated",
  "new draft place",
  "new draft event",
  "summary pending",
  "content pending",
  "address pending",
  "introduction pending",
  "待补充",
  "待完善",
  "暂无",
  "草稿",
  "占位",
  "新增地点草稿",
  "新活动草稿",
  "待补充简介",
  "待补充正文",
  "桐梓林待补充地址"
] as const;

const placeholderSet = new Set<string>(PUBLICATION_PLACEHOLDERS);

export interface PublicationReadinessIssue {
  field: string;
  code: "required" | "placeholder" | "managed_cover_required";
  message: string;
}

export interface PublicationReadinessResult {
  ready: boolean;
  issues: PublicationReadinessIssue[];
}

export const isPublicationPlaceholder = (value: unknown) => {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLocaleLowerCase("en");
  return placeholderSet.has(normalized);
};

const validateFields = (
  input: Record<string, unknown>,
  fields: readonly string[]
): PublicationReadinessResult => {
  const issues = fields.flatMap<PublicationReadinessIssue>((field) => {
    const value = input[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return [
        {
          field,
          code: "required",
          message: `${field} is required for publication.`
        }
      ];
    }
    if (isPublicationPlaceholder(value)) {
      return [
        {
          field,
          code: "placeholder",
          message: `${field} must not contain placeholder copy.`
        }
      ];
    }
    return [];
  });

  return { ready: issues.length === 0, issues };
};

export const EVENT_PUBLICATION_FIELDS = [
  "title_zh",
  "title_en",
  "summary_zh",
  "summary_en",
  "content_zh",
  "content_en",
  "address_zh",
  "address_en"
] as const;

export const PLACE_PUBLICATION_FIELDS = [
  "name_zh",
  "name_en",
  "address_zh",
  "address_en",
  "business_hours_zh",
  "business_hours_en",
  "intro_zh",
  "intro_en"
] as const;

export const validateEventPublicationReadiness = (
  event: Partial<Event>
): PublicationReadinessResult => {
  const content = validateFields(
    event as Record<string, unknown>,
    EVENT_PUBLICATION_FIELDS
  );
  const hasManagedCover =
    typeof event.cover_file_id === "string" &&
    event.cover_file_id.trim().length > 0 &&
    typeof event.cover_cloud_path === "string" &&
    ["public/events/", "public/places/"].some((prefix) =>
      event.cover_cloud_path?.startsWith(prefix)
    );
  const issues = hasManagedCover
    ? content.issues
    : [
        ...content.issues,
        {
          field: "cover_file_id",
          code: "managed_cover_required" as const,
          message: "A CloudBase-managed event cover is required for publication."
        }
      ];
  return { ready: issues.length === 0, issues };
};

export const validatePlacePublicationReadiness = (
  place: Partial<Place>
): PublicationReadinessResult => {
  const fields = place.is_recommended
    ? [
        ...PLACE_PUBLICATION_FIELDS,
        "recommended_reason_zh",
        "recommended_reason_en"
      ]
    : PLACE_PUBLICATION_FIELDS;
  return validateFields(place as Record<string, unknown>, fields);
};

export const normalizeEventBilingualAddress = <TEvent extends Partial<Event>>(
  event: TEvent
) => {
  const legacy = event.address_text?.trim() ?? "";
  const addressZh = event.address_zh?.trim() || legacy;
  const addressEn = event.address_en?.trim() || "";
  return {
    ...event,
    address_text: addressZh,
    address_zh: addressZh,
    address_en: addressEn
  };
};

export const normalizeNotificationLocalization = <
  TNotification extends Partial<Notification>
>(
  notification: TNotification
) => ({
  ...notification,
  title: notification.title?.trim() ?? "",
  body: notification.body?.trim() ?? "",
  title_zh: notification.title_zh?.trim() || null,
  title_en: notification.title_en?.trim() || null,
  body_zh: notification.body_zh?.trim() || null,
  body_en: notification.body_en?.trim() || null
});
