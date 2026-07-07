import {
  ApiClientError,
  type Event,
  type EventRegistration
} from "@community-map/shared";

export interface EventSignupState {
  canSignup: boolean;
  label: string;
  reason: string;
}

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
  if (!isPublicEvent(event)) {
    return {
      canSignup: false,
      label: "暂不可报名",
      reason: "活动暂不可访问或已下线。"
    };
  }

  if (event.publish_status === "offline") {
    return {
      canSignup: false,
      label: "活动已下线",
      reason: "该活动已下线，暂不可报名。"
    };
  }

  if (event.publish_status !== "published") {
    return {
      canSignup: false,
      label: "暂不可报名",
      reason: "该活动暂未开放报名。"
    };
  }

  if (options.isRegistered) {
    return {
      canSignup: false,
      label: "已报名",
      reason: "你已报名该活动，不能重复报名。"
    };
  }

  if (new Date(event.end_time).getTime() <= now.getTime()) {
    return {
      canSignup: false,
      label: "活动已结束",
      reason: "活动已结束，无法继续报名。"
    };
  }

  if (new Date(event.signup_deadline).getTime() <= now.getTime()) {
    return {
      canSignup: false,
      label: "报名已截止",
      reason: "报名时间已截止，无法继续提交报名。"
    };
  }

  return {
    canSignup: true,
    label: "立即报名",
    reason: ""
  };
};
