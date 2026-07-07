import { describe, expect, it } from "vitest";

import { ApiClientError, type EventRegistration } from "@community-map/shared";
import {
  findActiveRegistrationForEvent,
  isActiveEventRegistration,
  shouldConfirmRegistrationAfterSubmitError
} from "./event-signup-state";

const registration = (
  overrides: Partial<EventRegistration>
): EventRegistration => ({
  _id: "reg_001",
  event_id: "event_001",
  user_id: "user_001",
  contact_name: "Jerry",
  contact_phone: "13800000000",
  attendee_count: 1,
  registration_status: "confirmed",
  ticket_id: "ticket_001",
  source_channel: "miniapp",
  ...overrides
});

describe("event signup state helpers", () => {
  it("treats confirmed registrations as active and cancelled registrations as inactive", () => {
    expect(
      isActiveEventRegistration(
        registration({ registration_status: "confirmed" })
      )
    ).toBe(true);
    expect(
      isActiveEventRegistration(
        registration({ registration_status: "cancelled" })
      )
    ).toBe(false);
  });

  it("finds the active registration for the submitted event only", () => {
    const inactiveMatch = registration({
      _id: "reg_cancelled",
      registration_status: "cancelled"
    });
    const otherEvent = registration({
      _id: "reg_other",
      event_id: "event_other"
    });
    const activeMatch = registration({
      _id: "reg_confirmed"
    });

    expect(
      findActiveRegistrationForEvent(
        [inactiveMatch, otherEvent, activeMatch],
        "event_001"
      )
    ).toBe(activeMatch);
  });

  it("returns null when confirmation finds no active registration for the event", () => {
    expect(
      findActiveRegistrationForEvent(
        [
          registration({ registration_status: "closed" }),
          registration({ event_id: "event_other" })
        ],
        "event_001"
      )
    ).toBeNull();
  });

  it("confirms submit errors only when the write may have succeeded", () => {
    expect(
      shouldConfirmRegistrationAfterSubmitError(
        new ApiClientError({
          code: "CONFLICT",
          message: "Registration already exists.",
          details: { reason: "already_registered" }
        })
      )
    ).toBe(true);

    expect(
      shouldConfirmRegistrationAfterSubmitError(
        new ApiClientError({
          code: "CONFLICT",
          message: "Event capacity is full.",
          details: { reason: "capacity_exceeded" }
        })
      )
    ).toBe(false);

    expect(
      shouldConfirmRegistrationAfterSubmitError(new Error("HTTP 409"))
    ).toBe(false);
    expect(
      shouldConfirmRegistrationAfterSubmitError(
        new TypeError("Network request failed")
      )
    ).toBe(true);
  });
});
