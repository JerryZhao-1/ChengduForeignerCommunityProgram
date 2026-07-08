import { ApiClientError } from "@community-map/shared";
import { describe, expect, it } from "vitest";

import { getDiscoverEnforcementMessage } from "./enforcement-error";

const copy = {
  accountMutedPost: "muted post",
  accountMutedComment: "muted comment",
  accountBannedAction: "banned action"
};

const forbiddenEnvelope = {
  success: false,
  error: {
    code: "FORBIDDEN",
    message: "User enforcement blocks this action.",
    details: {
      enforcement_status: "muted",
      action: "create_comment"
    }
  },
  requestId: "req_test"
};

describe("discover enforcement error messages", () => {
  it("reads standard ApiClientError details", () => {
    const error = new ApiClientError({
      code: "FORBIDDEN",
      message: "Blocked",
      details: {
        enforcement_status: "muted",
        action: "create_comment"
      }
    });

    expect(getDiscoverEnforcementMessage(error, copy)).toBe("muted comment");
  });

  it("reads plain forbidden error objects", () => {
    expect(
      getDiscoverEnforcementMessage(
        {
          code: "FORBIDDEN",
          details: {
            enforcement_status: "muted",
            action: "create_post"
          }
        },
        copy
      )
    ).toBe("muted post");
  });

  it("unwraps upstream errors with failure envelope objects", () => {
    expect(
      getDiscoverEnforcementMessage(
        {
          code: "UPSTREAM_ERROR",
          details: forbiddenEnvelope
        },
        copy
      )
    ).toBe("muted comment");
  });

  it("unwraps upstream errors with failure envelope JSON strings", () => {
    expect(
      getDiscoverEnforcementMessage(
        {
          code: "UPSTREAM_ERROR",
          details: JSON.stringify({
            ...forbiddenEnvelope,
            error: {
              ...forbiddenEnvelope.error,
              details: JSON.stringify({
                enforcement_status: "banned",
                action: "report"
              })
            }
          })
        },
        copy
      )
    ).toBe("banned action");
  });
});
