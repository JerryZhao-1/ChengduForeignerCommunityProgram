export type PermanentDeletePostTarget = {
  _id: string;
  title: string;
};

export type PermanentDeletePostDecision<TResult> =
  | { status: "cancelled" }
  | { status: "deleted"; result: TResult };

export const confirmPermanentPostDeletion = async <TResult>(
  post: PermanentDeletePostTarget,
  confirm: (post: PermanentDeletePostTarget) => Promise<unknown>,
  deletePost: (postId: string) => Promise<TResult>
): Promise<PermanentDeletePostDecision<TResult>> => {
  try {
    await confirm(post);
  } catch {
    return { status: "cancelled" };
  }

  return {
    status: "deleted",
    result: await deletePost(post._id)
  };
};
