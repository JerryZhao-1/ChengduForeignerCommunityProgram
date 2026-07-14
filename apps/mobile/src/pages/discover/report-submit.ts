export interface DiscoverReportInput {
  reason: string;
  description?: string;
  evidence_file_ids?: string[];
}

export interface DiscoverReportApi {
  reportPost(postId: string, input: DiscoverReportInput): Promise<unknown>;
  reportComment(
    postId: string,
    commentId: string,
    input: DiscoverReportInput
  ): Promise<unknown>;
}

export const submitDiscoverReport = (
  api: DiscoverReportApi,
  target: { postId: string; commentId?: string },
  input: DiscoverReportInput
) =>
  target.commentId
    ? api.reportComment(target.postId, target.commentId, input)
    : api.reportPost(target.postId, input);
