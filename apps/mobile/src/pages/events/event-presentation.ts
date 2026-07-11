import type { Event } from "@community-map/shared";

import {
  formatLocalizedDate,
  formatLocalizedNumber,
  interpolate,
  resolveLocalized,
  type MobileLocale
} from "../../i18n";

const eventDateOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
};

export const resolveEventAddress = (event: Event, locale: MobileLocale) =>
  resolveLocalized(locale, {
    zh: event.address_zh || event.address_text,
    en: event.address_en
  });

export const formatEventTimeRange = (
  locale: MobileLocale,
  startTime: string,
  endTime: string
) =>
  `${formatLocalizedDate(locale, startTime, eventDateOptions)} – ${formatLocalizedDate(
    locale,
    endTime,
    eventDateOptions
  )}`;

export const formatEventCapacity = (
  locale: MobileLocale,
  template: string,
  capacity: number
) =>
  interpolate(template, {
    count: formatLocalizedNumber(locale, capacity)
  });

export const resolveEventCoverUrl = (coverUrl: string | null | undefined) => {
  if (!coverUrl) {
    return null;
  }

  try {
    return new URL(coverUrl).hostname === "example.com" ? null : coverUrl;
  } catch {
    return null;
  }
};

export type EventCoverSourceOptions = {
  preferCloudFileId: boolean;
  failedSources?: readonly string[];
};

export const resolveEventCoverSource = (
  event: Pick<Event, "cover_file_id" | "cover_url">,
  options: EventCoverSourceOptions
) => {
  const failedSources = new Set(options.failedSources ?? []);
  const httpsUrl = resolveEventCoverUrl(event.cover_url);
  const candidates = options.preferCloudFileId
    ? [event.cover_file_id, httpsUrl]
    : [httpsUrl];

  return (
    candidates.find(
      (candidate): candidate is string =>
        typeof candidate === "string" &&
        candidate.length > 0 &&
        !failedSources.has(candidate)
    ) ?? null
  );
};
