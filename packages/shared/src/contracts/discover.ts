import { defineContract } from "./define-contract";
import {
  AdminDiscoverAuditListQuerySchema,
  AdminDiscoverCommentListQuerySchema,
  AdminDiscoverPostListQuerySchema,
  AdminDiscoverReportListQuerySchema,
  AdminDiscoverUserListQuerySchema,
  CommentListQuerySchema,
  CreateCommentInputSchema,
  CreatePostInputSchema,
  DiscoverAuditRecordSchema,
  DiscoverMeGovernanceSchema,
  DiscoverReportCaseSchema,
  DiscoverUserGovernanceDetailSchema,
  DiscoverUserGovernanceSummarySchema,
  EnforceUserInputSchema,
  ModeratePostInputSchema,
  ModerateCommentInputSchema,
  MyPostListQuerySchema,
  PostListQuerySchema,
  RelatedPostListQuerySchema,
  ReportCommentInputSchema,
  ResolveReportInputSchema,
  ReportPostInputSchema
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
  })
};
