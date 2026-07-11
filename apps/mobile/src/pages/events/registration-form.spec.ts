import { describe, expect, it } from "vitest";

import {
  isValidPhoneNumber,
  normalizePhoneNumber,
  PHONE_NUMBER_LENGTH
} from "./registration-form";

describe("event registration phone input", () => {
  it("limits phone numbers to 11 digits", () => {
    expect(normalizePhoneNumber("1380000000000000000")).toBe("13800000000");
    expect(normalizePhoneNumber("138-0000-0000")).toBe("13800000000");
    expect(PHONE_NUMBER_LENGTH).toBe(11);
  });

  it("validates normalized 11-digit values", () => {
    expect(isValidPhoneNumber("13800000000")).toBe(true);
    expect(isValidPhoneNumber("1380000000")).toBe(false);
    // Values from legacy profiles are truncated before validation.
    expect(isValidPhoneNumber("138000000000")).toBe(true);
  });
});
