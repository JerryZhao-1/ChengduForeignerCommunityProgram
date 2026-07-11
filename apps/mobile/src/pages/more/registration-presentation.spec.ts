import { describe, expect, it } from "vitest";

import { getRegistrationStatusLabel } from "./registration-presentation";

describe("registration presentation", () => {
  it("maps stable registration codes to both locales", () => {
    expect(getRegistrationStatusLabel("zh", "confirmed")).toBe("已确认");
    expect(getRegistrationStatusLabel("en", "confirmed")).toBe("Confirmed");
    expect(getRegistrationStatusLabel("en", "cancelled")).toBe("Cancelled");
  });
});
