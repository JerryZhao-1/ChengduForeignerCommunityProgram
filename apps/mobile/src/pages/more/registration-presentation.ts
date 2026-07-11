import type { EventRegistration } from "@community-map/shared";

import { getMobileCopy, type MobileLocale } from "../../i18n";

export const getRegistrationStatusLabel = (
  locale: MobileLocale,
  status: EventRegistration["registration_status"]
) => getMobileCopy(locale).registrations.statuses[status];
