import Router from "@koa/router";
import {
  CommentListQuerySchema,
  CreateCommentInputSchema,
  CreatePostInputSchema,
  ModeratePostInputSchema,
  MyPostListQuerySchema,
  PostListQuerySchema,
  ReportPostInputSchema
} from "@community-map/shared";

import { requireRole } from "../lib/auth";
import { apiError } from "../lib/errors";
import { parseOrThrow, sendSuccess } from "../lib/http";

export const registerDiscoverRoutes = (router: Router) => {
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

  router.get("/discover/me/posts", async (ctx) => {
    const query = parseOrThrow(MyPostListQuerySchema, ctx.query);
    const data = await ctx.state.provider.posts.listMine(
      query,
      ctx.state.actor._id
    );
    sendSuccess(ctx, data);
  });

  router.post("/discover/posts", async (ctx) => {
    const input = parseOrThrow(CreatePostInputSchema, ctx.request.body);
    const post = await ctx.state.provider.posts.create(input, ctx.state.actor._id);
    sendSuccess(ctx, post, 201);
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
    parseOrThrow(ReportPostInputSchema, ctx.request.body);
    const post = await ctx.state.provider.posts.report(ctx.params.id);
    if (!post) {
      throw apiError("NOT_FOUND", "Post not found.", 404);
    }
    sendSuccess(ctx, post);
  });

  router.post(
    "/admin/discover/posts/:id/moderation",
    requireRole("community_admin", "system_admin"),
    async (ctx) => {
      const input = parseOrThrow(ModeratePostInputSchema, ctx.request.body);
      const post = await ctx.state.provider.posts.moderate(ctx.params.id, input);
      if (!post) {
        throw apiError("NOT_FOUND", "Post not found.", 404);
      }
      sendSuccess(ctx, post);
    }
  );
};
