import {
  ApiClientError,
  type Event,
  type EventRegistration
} from "@community-map/shared";

export interface EventSignupState {
  canSignup: boolean;
  code: EventSignupStateCode;
}

export type EventSignupStateCode =
  | "unavailable"
  | "offline"
  | "notOpen"
  | "alreadyRegistered"
  | "ended"
  | "closed"
  | "available";

export interface EventSignupStateOptions {
  isRegistered?: boolean;
}

export const isActiveEventRegistration = (registration: EventRegistration) =>
  registration.registration_status !== "cancelled" &&
  registration.registration_status !== "closed";

export const findActiveRegistrationForEvent = (
  registrations: EventRegistration[],
  eventId: string
) =>
  registrations.find(
    (registration) =>
      registration.event_id === eventId &&
      isActiveEventRegistration(registration)
  ) ?? null;

const submitErrorReason = (err: ApiClientError) => {
  if (
    err.details &&
    typeof err.details === "object" &&
    "reason" in err.details
  ) {
    const reason = err.details.reason;
    return typeof reason === "string" ? reason : "";
  }

  return "";
};

export const shouldConfirmRegistrationAfterSubmitError = (err: unknown) => {
  if (err instanceof ApiClientError) {
    return (
      err.code === "CONFLICT" && submitErrorReason(err) === "already_registered"
    );
  }

  if (err instanceof Error && /^HTTP \d{3}/.test(err.message)) {
    return false;
  }

  return true;
};

export const isPublicEvent = (
  event: Pick<Event, "review_status" | "publish_status">
) => event.review_status === "approved" && event.publish_status === "published";

export const getEventSignupState = (
  event: Event,
  now = new Date(),
  options: EventSignupStateOptions = {}
): EventSignupState => {
  if (event.review_status !== "approved") {
    return {
      canSignup: false,
      code: "unavailable"
    };
  }

  if (event.publish_status === "offline") {
    return {
      canSignup: false,
      code: "offline"
    };
  }

  if (event.publish_status !== "published") {
    return {
      canSignup: false,
      code: "notOpen"
    };
  }

  if (options.isRegistered) {
    return {
      canSignup: false,
      code: "alreadyRegistered"
    };
  }

  if (new Date(event.end_time).getTime() <= now.getTime()) {
    return {
      canSignup: false,
      code: "ended"
    };
  }

  if (new Date(event.signup_deadline).getTime() <= now.getTime()) {
    return {
      canSignup: false,
      code: "closed"
    };
  }

  return {
    canSignup: true,
    code: "available"
  };
};
