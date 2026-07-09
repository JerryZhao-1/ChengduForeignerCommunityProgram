import { defineContract } from "./define-contract";
import {
  AdminDiscoverAuditListQuerySchema,
  AdminDiscoverCommentListQuerySchema,
  AdminDiscoverPostListQuerySchema,
  AdminDiscoverReportListQuerySchema,
  AdminDiscoverUserListQuerySchema,
  CommentListQuerySchema,
  CreateDiscoverTagInputSchema,
  CreateCommentInputSchema,
  CreatePostInputSchema,
  DiscoverAuditRecordSchema,
  DiscoverAnalyticsQuerySchema,
  DiscoverAnalyticsSchema,
  DiscoverTagListQuerySchema,
  DiscoverMeGovernanceSchema,
  DiscoverPostOpsInputSchema,
  DiscoverReportCaseSchema,
  DiscoverTagSchema,
  DiscoverUserGovernanceDetailSchema,
  DiscoverUserGovernanceSummarySchema,
  EnforceUserInputSchema,
  ModeratePostInputSchema,
  ModerateCommentInputSchema,
  MyCommentListQuerySchema,
  MyPostListQuerySchema,
  MyReportListQuerySchema,
  PostInteractionStateSchema,
  PostListQuerySchema,
  ProfileFollowListItemSchema,
  ProfileFollowListQuerySchema,
  ProfileFollowStateSchema,
  PublicProfileSchema,
  RecordPostShareInputSchema,
  RelatedPostListQuerySchema,
  ReportCommentInputSchema,
  ResolveReportInputSchema,
  ReportPostInputSchema,
  SetProfileFollowInputSchema,
  SetPostFavoriteInputSchema,
  SetPostLikeInputSchema,
  UpsertDiscoverTagInputSchema
} from "../schemas/discover";
import { CommentSchema, PostSchema } from "../schemas/entities";
import { PageResultSchema } from "../schemas/common";

export const discoverContracts = {
  listPosts: defineContract({
    method: "GET",
    path: "/discover/posts",
    request: PostListQuerySchema,
    response: PostSchema
  }),
  detailPost: defineContract({
    method: "GET",
    path: "/discover/posts/:id",
    response: PostSchema
  }),
  postInteraction: defineContract({
    method: "GET",
    path: "/discover/posts/:id/interaction",
    response: PostInteractionStateSchema
  }),
  setPostLike: defineContract({
    method: "POST",
    path: "/discover/posts/:id/like",
    request: SetPostLikeInputSchema,
    response: PostInteractionStateSchema
  }),
  setPostFavorite: defineContract({
    method: "POST",
    path: "/discover/posts/:id/favorite",
    request: SetPostFavoriteInputSchema,
    response: PostInteractionStateSchema
  }),
  recordPostShare: defineContract({
    method: "POST",
    path: "/discover/posts/:id/share",
    request: RecordPostShareInputSchema,
    response: PostInteractionStateSchema
  }),
  profile: defineContract({
    method: "GET",
    path: "/discover/profiles/:userId",
    response: PublicProfileSchema
  }),
  setProfileFollow: defineContract({
    method: "POST",
    path: "/discover/profiles/:userId/follow",
    request: SetProfileFollowInputSchema,
    response: ProfileFollowStateSchema
  }),
  listProfileFollowers: defineContract({
    method: "GET",
    path: "/discover/profiles/:userId/followers",
    request: ProfileFollowListQuerySchema,
    response: PageResultSchema(ProfileFollowListItemSchema)
  }),
  listProfileFollowing: defineContract({
    method: "GET",
    path: "/discover/profiles/:userId/following",
    request: ProfileFollowListQuerySchema,
    response: PageResultSchema(ProfileFollowListItemSchema)
  }),
  listPublicTags: defineContract({
    method: "GET",
    path: "/discover/tags",
    request: DiscoverTagListQuerySchema,
    response: PageResultSchema(DiscoverTagSchema)
  }),
  createTag: defineContract({
    method: "POST",
    path: "/discover/tags",
    request: CreateDiscoverTagInputSchema,
    response: DiscoverTagSchema
  }),
  createPost: defineContract({
    method: "POST",
    path: "/discover/posts",
    request: CreatePostInputSchema,
    response: PostSchema
  }),
  createComment: defineContract({
    method: "POST",
    path: "/discover/posts/:id/comments",
    request: CreateCommentInputSchema,
    response: CommentSchema
  }),
  listComments: defineContract({
    method: "GET",
    path: "/discover/posts/:id/comments",
    request: CommentListQuerySchema,
    response: PageResultSchema(CommentSchema)
  }),
  myPosts: defineContract({
    method: "GET",
    path: "/discover/me/posts",
    request: MyPostListQuerySchema,
    response: PageResultSchema(PostSchema)
  }),
  myLikedPosts: defineContract({
    method: "GET",
    path: "/discover/me/liked-posts",
    request: MyPostListQuerySchema,
    response: PageResultSchema(PostSchema)
  }),
  myFavoritedPosts: defineContract({
    method: "GET",
    path: "/discover/me/favorited-posts",
    request: MyPostListQuerySchema,
    response: PageResultSchema(PostSchema)
  }),
  myComments: defineContract({
    method: "GET",
    path: "/discover/me/comments",
    request: MyCommentListQuerySchema,
    response: PageResultSchema(CommentSchema)
  }),
  myCommentDetail: defineContract({
    method: "GET",
    path: "/discover/me/comments/:id",
    response: CommentSchema
  }),
  myReports: defineContract({
    method: "GET",
    path: "/discover/me/reports",
    request: MyReportListQuerySchema,
    response: PageResultSchema(DiscoverReportCaseSchema)
  }),
  myReportDetail: defineContract({
    method: "GET",
    path: "/discover/me/reports/:id",
    response: DiscoverReportCaseSchema
  }),
  listPlaceRelatedPosts: defineContract({
    method: "GET",
    path: "/discover/places/:placeId/posts",
    request: RelatedPostListQuerySchema,
    response: PageResultSchema(PostSchema)
  }),
  listEventRelatedPosts: defineContract({
    method: "GET",
    path: "/discover/events/:eventId/posts",
    request: RelatedPostListQuerySchema,
    response: PageResultSchema(PostSchema)
  }),
  meGovernance: defineContract({
    method: "GET",
    path: "/discover/me/governance",
    response: DiscoverMeGovernanceSchema
  }),
  reportPost: defineContract({
    method: "POST",
    path: "/discover/posts/:id/report",
    request: ReportPostInputSchema,
    response: PostSchema
  }),
  reportComment: defineContract({
    method: "POST",
    path: "/discover/posts/:postId/comments/:commentId/report",
    request: ReportCommentInputSchema,
    response: DiscoverReportCaseSchema
  }),
  listAdminPosts: defineContract({
    method: "GET",
    path: "/admin/discover/posts",
    request: AdminDiscoverPostListQuerySchema,
    response: PageResultSchema(PostSchema)
  }),
  listAdminComments: defineContract({
    method: "GET",
    path: "/admin/discover/comments",
    request: AdminDiscoverCommentListQuerySchema,
    response: PageResultSchema(CommentSchema)
  }),
  listAdminReports: defineContract({
    method: "GET",
    path: "/admin/discover/reports",
    request: AdminDiscoverReportListQuerySchema,
    response: PageResultSchema(DiscoverReportCaseSchema)
  }),
  detailAdminReport: defineContract({
    method: "GET",
    path: "/admin/discover/reports/:id",
    response: DiscoverReportCaseSchema
  }),
  moderatePost: defineContract({
    method: "POST",
    path: "/admin/discover/posts/:id/moderation",
    request: ModeratePostInputSchema,
    response: PostSchema
  }),
  updatePostOps: defineContract({
    method: "POST",
    path: "/admin/discover/posts/:id/ops",
    request: DiscoverPostOpsInputSchema,
    response: PostSchema
  }),
  listTags: defineContract({
    method: "GET",
    path: "/admin/discover/tags",
    response: PageResultSchema(DiscoverTagSchema)
  }),
  upsertTag: defineContract({
    method: "POST",
    path: "/admin/discover/tags/:id",
    request: UpsertDiscoverTagInputSchema,
    response: DiscoverTagSchema
  }),
  moderateComment: defineContract({
    method: "POST",
    path: "/admin/discover/comments/:id/moderation",
    request: ModerateCommentInputSchema,
    response: CommentSchema
  }),
  resolveReport: defineContract({
    method: "POST",
    path: "/admin/discover/reports/:id/resolve",
    request: ResolveReportInputSchema,
    response: DiscoverReportCaseSchema
  }),
  listAdminUsers: defineContract({
    method: "GET",
    path: "/admin/discover/users",
    request: AdminDiscoverUserListQuerySchema,
    response: PageResultSchema(DiscoverUserGovernanceSummarySchema)
  }),
  detailAdminUser: defineContract({
    method: "GET",
    path: "/admin/discover/users/:id",
    response: DiscoverUserGovernanceDetailSchema
  }),
  enforceUser: defineContract({
    method: "POST",
    path: "/admin/discover/users/:id/enforcement",
    request: EnforceUserInputSchema,
    response: DiscoverUserGovernanceDetailSchema
  }),
  listAdminAudit: defineContract({
    method: "GET",
    path: "/admin/discover/audit",
    request: AdminDiscoverAuditListQuerySchema,
    response: PageResultSchema(DiscoverAuditRecordSchema)
  }),
  analytics: defineContract({
    method: "GET",
    path: "/admin/discover/analytics",
    request: DiscoverAnalyticsQuerySchema,
    response: DiscoverAnalyticsSchema
  })
};
