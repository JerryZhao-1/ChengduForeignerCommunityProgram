import { z } from "zod";

import { CommentSchema, PostSchema } from "./entities";

export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  communityId: z.string().default("tongzilin"),
  keyword: z.string().trim().optional()
});

export const CommentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
});

export const MyPostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  communityId: z.string().default("tongzilin")
});

export const CreatePostInputSchema = PostSchema.pick({
  title: true,
  content: true,
  language: true,
  tag_ids: true
}).extend({
  location_text: z.string().nullable().default(null),
  image_file_ids: z.array(z.string()).default([]),
  image_urls: z.array(z.string().url()).default([]),
  place_id: z.string().nullable().default(null),
  event_id: z.string().nullable().default(null)
});

export const CreateCommentInputSchema = CommentSchema.pick({
  content: true,
  language: true
});

export const ReportPostInputSchema = z.object({
  reason: z.string().min(1),
  description: z.string().optional()
});

export const ModeratePostInputSchema = z.object({
  review_status: z.enum(["visible", "hidden", "deleted"]),
  reason: z.string().optional()
});
