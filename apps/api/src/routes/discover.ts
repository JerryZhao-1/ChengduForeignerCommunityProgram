import Router from "@koa/router";
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
  DiscoverTagListQuerySchema,
  DiscoverPostOpsInputSchema,
  DiscoverAnalyticsQuerySchema,
  EnforceUserInputSchema,
  ModeratePostInputSchema,
  ModerateCommentInputSchema,
  MyCommentListQuerySchema,
  MyPostListQuerySchema,
  MyReportListQuerySchema,
  PostListQuerySchema,
  ProfileFollowListQuerySchema,
  RecordPostShareInputSchema,
  RelatedPostListQuerySchema,
  ReportCommentInputSchema,
  ResolveReportInputSchema,
  ReportPostInputSchema,
  SetProfileFollowInputSchema,
  SetPostFavoriteInputSchema,
  SetPostLikeInputSchema,
  UpsertDiscoverTagInputSchema
} from "@community-map/shared";

import { requireRole } from "../lib/auth";
import { apiError } from "../lib/errors";
import { parseOrThrow, sendSuccess } from "../lib/http";

export const registerDiscoverRoutes = (router: Router) => {
  router.get("/discover/tags", async (ctx) => {
    const query = parseOrThrow(DiscoverTagListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listPublicTags(query);
    sendSuccess(ctx, data);
  });

  router.post("/discover/tags", async (ctx) => {
    const input = parseOrThrow(CreateDiscoverTagInputSchema, ctx.request.body);
    const tag = await ctx.state.provider.posts.createTag(
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, tag, 201);
  });

  router.get("/discover/posts", async (ctx) => {
    const query = parseOrThrow(PostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.list(query);
    sendSuccess(ctx, data);
  });

  router.get("/discover/posts/:id", async (ctx) => {
    const post = await ctx.state.provider.posts.detail(ctx.params.id);
    if (!post) {
      throw apiError("NOT_FOUND", "Post not found.", 404);
    }
    sendSuccess(ctx, post);
  });

  router.get("/discover/posts/:id/interaction", async (ctx) => {
    const data = await ctx.state.provider.posts.interaction(
      ctx.params.id,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.post("/discover/posts/:id/like", async (ctx) => {
    const input = parseOrThrow(SetPostLikeInputSchema, ctx.request.body);
    const data = await ctx.state.provider.posts.setLike(
      ctx.params.id,
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.post("/discover/posts/:id/favorite", async (ctx) => {
    const input = parseOrThrow(SetPostFavoriteInputSchema, ctx.request.body);
    const data = await ctx.state.provider.posts.setFavorite(
      ctx.params.id,
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.post("/discover/posts/:id/share", async (ctx) => {
    const input = parseOrThrow(RecordPostShareInputSchema, ctx.request.body);
    const data = await ctx.state.provider.posts.recordShare(
      ctx.params.id,
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/profiles/:userId", async (ctx) => {
    const data = await ctx.state.provider.posts.profile(
      ctx.params.userId,
      ctx.state.actor._id
    );
    if (!data) {
      throw apiError("NOT_FOUND", "Profile not found.", 404);
    }
    sendSuccess(ctx, data);
  });

  router.post("/discover/profiles/:userId/follow", async (ctx) => {
    const input = parseOrThrow(SetProfileFollowInputSchema, ctx.request.body);
    const data = await ctx.state.provider.posts.setProfileFollow(
      ctx.params.userId,
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/profiles/:userId/followers", async (ctx) => {
    const query = parseOrThrow(ProfileFollowListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listProfileFollowers(
      ctx.params.userId,
      query,
      ctx.state.actor._id
    );
    if (!data) {
      throw apiError("NOT_FOUND", "Profile not found.", 404);
    }
    sendSuccess(ctx, data);
  });

  router.get("/discover/profiles/:userId/following", async (ctx) => {
    const query = parseOrThrow(ProfileFollowListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listProfileFollowing(
      ctx.params.userId,
      query,
      ctx.state.actor._id
    );
    if (!data) {
      throw apiError("NOT_FOUND", "Profile not found.", 404);
    }
    sendSuccess(ctx, data);
  });

  router.get("/discover/places/:placeId/posts", async (ctx) => {
    const query = parseOrThrow(RelatedPostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listRelatedByPlace({
      ...query,
      placeId: ctx.params.placeId
    });
    if (!data) {
      throw apiError("NOT_FOUND", "Place not found.", 404);
    }
    sendSuccess(ctx, data);
  });

  router.get("/discover/events/:eventId/posts", async (ctx) => {
    const query = parseOrThrow(RelatedPostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listRelatedByEvent({
      ...query,
      eventId: ctx.params.eventId
    });
    if (!data) {
      throw apiError("NOT_FOUND", "Event not found.", 404);
    }
    sendSuccess(ctx, data);
  });

  router.get("/discover/me/posts", async (ctx) => {
    const query = parseOrThrow(MyPostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listMine(
      query,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/me/liked-posts", async (ctx) => {
    const query = parseOrThrow(MyPostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listLiked(
      query,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/me/favorited-posts", async (ctx) => {
    const query = parseOrThrow(MyPostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listFavorited(
      query,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/me/comments", async (ctx) => {
    const query = parseOrThrow(MyCommentListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listMyComments(
      query,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/me/comments/:id", async (ctx) => {
    const comment = await ctx.state.provider.posts.detailMyComment(
      ctx.params.id,
      ctx.state.actor._id
    );
    if (!comment) {
      throw apiError("NOT_FOUND", "Comment not found.", 404);
    }
    sendSuccess(ctx, comment);
  });

  router.get("/discover/me/reports", async (ctx) => {
    const query = parseOrThrow(MyReportListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listMyReportCases(
      query,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.get("/discover/me/reports/:id", async (ctx) => {
    const report = await ctx.state.provider.posts.detailMyReportCase(
      ctx.params.id,
      ctx.state.actor._id
    );
    if (!report) {
      throw apiError("NOT_FOUND", "Report not found.", 404);
    }
    sendSuccess(ctx, report);
  });

  router.get("/discover/me/governance", async (ctx) => {
    const data = await ctx.state.provider.posts.meGovernance(
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.post("/discover/posts", async (ctx) => {
    const input = parseOrThrow(CreatePostInputSchema, ctx.request.body);
    const post = await ctx.state.provider.posts.create(
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, post);
  });

  router.post("/discover/posts/:id/comments", async (ctx) => {
    const input = parseOrThrow(CreateCommentInputSchema, ctx.request.body);
    const comment = await ctx.state.provider.posts.createComment(
      ctx.params.id,
      input,
      ctx.state.actor._id
    );
    sendSuccess(ctx, comment, 201);
  });

  router.get("/discover/posts/:id/comments", async (ctx) => {
    const query = parseOrThrow(CommentListQuerySchema, ctx.query);
    const comments = await ctx.state.provider.posts.listComments(
      ctx.params.id,
      query
    );
    sendSuccess(ctx, comments);
  });

  router.post("/discover/posts/:id/report", async (ctx) => {
    const input = parseOrThrow(ReportPostInputSchema, ctx.request.body);
    const post = await ctx.state.provider.posts.report(
      ctx.params.id,
      input,
      ctx.state.actor._id
    );
    if (!post) {
      throw apiError("NOT_FOUND", "Post not found.", 404);
    }
    sendSuccess(ctx, post);
  });

  router.post(
    "/discover/posts/:postId/comments/:commentId/report",
    async (ctx) => {
      const input = parseOrThrow(ReportCommentInputSchema, ctx.request.body);
      const report = await ctx.state.provider.posts.reportComment(
        ctx.params.postId,
        ctx.params.commentId,
        input,
        ctx.state.actor._id
      );
      if (!report) {
        throw apiError("NOT_FOUND", "Comment not found.", 404);
      }
      sendSuccess(ctx, report, 201);
    }
  );

  router.get(
    "/admin/discover/posts",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const query = parseOrThrow(AdminDiscoverPostListQuerySchema, ctx.query);
      const data = await ctx.state.provider.posts.listAdmin(
        query,
        ctx.state.actor._id
      );
      sendSuccess(ctx, data);
    }
  );

  router.get(
    "/admin/discover/comments",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const query = parseOrThrow(
        AdminDiscoverCommentListQuerySchema,
        ctx.query
      );
      const data = await ctx.state.provider.posts.listAdminComments(
        query,
        ctx.state.actor._id
      );
      sendSuccess(ctx, data);
    }
  );

  router.get(
    "/admin/discover/reports",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const query = parseOrThrow(AdminDiscoverReportListQuerySchema, ctx.query);
      const data = await ctx.state.provider.posts.listReportCases(
        query,
        ctx.state.actor._id
      );
      sendSuccess(ctx, data);
    }
  );

  router.get(
    "/admin/discover/reports/:id",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const report = await ctx.state.provider.posts.detailReportCase(
        ctx.params.id,
        ctx.state.actor._id
      );
      if (!report) {
        throw apiError("NOT_FOUND", "Report not found.", 404);
      }
      sendSuccess(ctx, report);
    }
  );

  router.post(
    "/admin/discover/posts/:id/moderation",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(ModeratePostInputSchema, ctx.request.body);
      const post = await ctx.state.provider.posts.moderate(
        ctx.params.id,
        input,
        ctx.state.actor._id
      );
      if (!post) {
        throw apiError("NOT_FOUND", "Post not found.", 404);
      }
      sendSuccess(ctx, post);
    }
  );

  router.delete(
    "/admin/discover/posts/:id",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const result = await ctx.state.provider.posts.permanentlyDelete(
        ctx.params.id,
        ctx.state.actor._id
      );
      if (!result) {
        throw apiError("NOT_FOUND", "Post not found.", 404);
      }
      sendSuccess(ctx, result);
    }
  );

  router.post(
    "/admin/discover/posts/:id/ops",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(DiscoverPostOpsInputSchema, ctx.request.body);
      const post = await ctx.state.provider.posts.updateOps(
        ctx.params.id,
        input,
        ctx.state.actor._id
      );
      if (!post) {
        throw apiError("NOT_FOUND", "Post not found.", 404);
      }
      sendSuccess(ctx, post);
    }
  );

  router.get(
    "/admin/discover/tags",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const data = await ctx.state.provider.posts.listTags(ctx.state.actor._id);
      sendSuccess(ctx, data);
    }
  );

  router.post(
    "/admin/discover/tags/:id",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(UpsertDiscoverTagInputSchema, ctx.request.body);
      const tag = await ctx.state.provider.posts.upsertTag(
        ctx.params.id,
        input,
        ctx.state.actor._id
      );
      sendSuccess(ctx, tag);
    }
  );

  router.post(
    "/admin/discover/comments/:id/moderation",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(ModerateCommentInputSchema, ctx.request.body);
      const comment = await ctx.state.provider.posts.moderateComment(
        ctx.params.id,
        input,
        ctx.state.actor._id
      );
      if (!comment) {
        throw apiError("NOT_FOUND", "Comment not found.", 404);
      }
      sendSuccess(ctx, comment);
    }
  );

  router.post(
    "/admin/discover/reports/:id/resolve",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(ResolveReportInputSchema, ctx.request.body);
      const report = await ctx.state.provider.posts.resolveReportCase(
        ctx.params.id,
        input,
        ctx.state.actor._id
      );
      if (!report) {
        throw apiError("NOT_FOUND", "Report not found.", 404);
      }
      sendSuccess(ctx, report);
    }
  );

  router.get(
    "/admin/discover/users",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const query = parseOrThrow(AdminDiscoverUserListQuerySchema, ctx.query);
      const data = await ctx.state.provider.posts.listGovernanceUsers(
        query,
        ctx.state.actor._id
      );
      sendSuccess(ctx, data);
    }
  );

  router.get(
    "/admin/discover/users/:id",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const data = await ctx.state.provider.posts.detailGovernanceUser(
        ctx.params.id,
        ctx.state.actor._id
      );
      if (!data) {
        throw apiError("NOT_FOUND", "User not found.", 404);
      }
      sendSuccess(ctx, data);
    }
  );

  router.post(
    "/admin/discover/users/:id/enforcement",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(EnforceUserInputSchema, ctx.request.body);
      const data = await ctx.state.provider.posts.enforceUser(
        ctx.params.id,
        input,
        ctx.state.actor._id
      );
      if (!data) {
        throw apiError("NOT_FOUND", "User not found.", 404);
      }
      sendSuccess(ctx, data);
    }
  );

  router.get(
    "/admin/discover/audit",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const query = parseOrThrow(AdminDiscoverAuditListQuerySchema, ctx.query);
      const data = await ctx.state.provider.posts.listAuditRecords(
        query,
        ctx.state.actor._id
      );
      sendSuccess(ctx, data);
    }
  );

  router.get(
    "/admin/discover/analytics",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const query = parseOrThrow(DiscoverAnalyticsQuerySchema, ctx.query);
      const data = await ctx.state.provider.posts.analytics(
        query,
        ctx.state.actor._id
      );
      sendSuccess(ctx, data);
    }
  );
};
