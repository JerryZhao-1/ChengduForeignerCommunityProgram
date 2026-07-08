import { describe, expect, it } from "vitest";

import { ApiClientError } from "@community-map/shared";

import { resolveCloudbaseFunctionPath } from "./cloudbase-path";
import { assertSuccessfulApiResponse, normalizeApiPayload } from "./response";

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

  it("parses string API envelopes before checking failure responses", () => {
    const payload = JSON.stringify({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Blocked",
        details: {
          enforcement_status: "muted",
          action: "create_comment"
        }
      },
      requestId: "req_forbidden"
    });

    expect(normalizeApiPayload(payload)).toMatchObject({
      success: false,
      requestId: "req_forbidden"
    });
    expect(() => assertSuccessfulApiResponse(payload, 403)).toThrow(
      ApiClientError
    );

    try {
      assertSuccessfulApiResponse(payload, 403);
    } catch (err) {
      expect(err).toMatchObject({
        code: "FORBIDDEN",
        details: {
          enforcement_status: "muted",
          action: "create_comment"
        },
        status: 403
      });
    }
  });
});
