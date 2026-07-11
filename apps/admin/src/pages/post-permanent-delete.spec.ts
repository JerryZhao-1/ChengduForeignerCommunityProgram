import { describe, expect, it, vi } from "vitest";

import { confirmPermanentPostDeletion } from "./post-permanent-delete";

const post = { _id: "post_001", title: "Test post" };

describe("confirmPermanentPostDeletion", () => {
  it("does not call the API when confirmation is cancelled", async () => {
    const deletePost = vi.fn();

    await expect(
      confirmPermanentPostDeletion(
        post,
        () => Promise.reject(new Error("cancelled")),
        deletePost
      )
    ).resolves.toEqual({ status: "cancelled" });
    expect(deletePost).not.toHaveBeenCalled();
  });

  it("deletes the confirmed post by id", async () => {
    const deletePost = vi.fn().mockResolvedValue({ deleted: true });

    await expect(
      confirmPermanentPostDeletion(post, () => Promise.resolve(), deletePost)
    ).resolves.toEqual({
      status: "deleted",
      result: { deleted: true }
    });
    expect(deletePost).toHaveBeenCalledWith("post_001");
  });

  it("surfaces API failures so the caller can preserve the current UI", async () => {
    const failure = new Error("API unavailable");

    await expect(
      confirmPermanentPostDeletion(
        post,
        () => Promise.resolve(),
        () => Promise.reject(failure)
      )
    ).rejects.toBe(failure);
  });
});
