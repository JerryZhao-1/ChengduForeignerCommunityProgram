import type { Event, EventRegistration } from "@community-map/shared";

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

export const getEventSignupState = (
  event: Event,
  now = new Date(),
  options: EventSignupStateOptions = {}
): EventSignupState => {
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
