import { describe, expect, it } from "vitest";

import { resolveCloudbaseFunctionPath } from "./cloudbase-path";

describe("mobile API client helpers", () => {
  it("resolves absolute URLs without depending on the browser URL global", () => {
    expect(
      resolveCloudbaseFunctionPath(
        "https://cloud1-d7gxdk8t43bd639c0.service.tcloudbase.com/api/places/map-markers"
      )
    ).toBe("/api/places/map-markers");
  });

  it("preserves query strings for CloudBase function calls", () => {
    expect(
      resolveCloudbaseFunctionPath(
        "http://localhost:8787/places?recommended=true&sort=recommended"
      )
    ).toBe("/places?recommended=true&sort=recommended");
  });

  it("normalizes relative paths", () => {
    expect(resolveCloudbaseFunctionPath("places/map-markers")).toBe(
      "/places/map-markers"
    );
    expect(resolveCloudbaseFunctionPath("/places/map-markers")).toBe(
      "/places/map-markers"
    );
  });
});
