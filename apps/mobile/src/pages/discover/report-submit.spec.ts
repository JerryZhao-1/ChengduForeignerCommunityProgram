import { describe, expect, it, vi } from "vitest";

import { submitDiscoverReport } from "./report-submit";

describe("discover report submission", () => {
  it("submits comment targets through the comment report API", async () => {
    const reportPost = vi.fn(async () => undefined);
    const reportComment = vi.fn(async () => undefined);
    const input = { reason: "spam" };

    await submitDiscoverReport(
      { reportPost, reportComment },
      { postId: "post_001", commentId: "comment_001" },
      input
    );

    expect(reportComment).toHaveBeenCalledWith(
      "post_001",
      "comment_001",
      input
    );
    expect(reportPost).not.toHaveBeenCalled();
  });

  it("keeps post targets on the post report API", async () => {
    const reportPost = vi.fn(async () => undefined);
    const reportComment = vi.fn(async () => undefined);
    const input = { reason: "spam" };

    await submitDiscoverReport(
      { reportPost, reportComment },
      { postId: "post_001" },
      input
    );

    expect(reportPost).toHaveBeenCalledWith("post_001", input);
    expect(reportComment).not.toHaveBeenCalled();
  });
});
