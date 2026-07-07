import { defineContract } from "./define-contract";
import {
  CommentListQuerySchema,
  CreateCommentInputSchema,
  CreatePostInputSchema,
  ModeratePostInputSchema,
  MyPostListQuerySchema,
  PostListQuerySchema,
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
  reportPost: defineContract({
    method: "POST",
    path: "/discover/posts/:id/report",
    request: ReportPostInputSchema,
    response: PostSchema
  }),
  moderatePost: defineContract({
    method: "POST",
    path: "/admin/discover/posts/:id/moderation",
    request: ModeratePostInputSchema,
    response: PostSchema
  })
};
