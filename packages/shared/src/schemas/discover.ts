import { z } from "zod";

import {
  CommentSchema,
  DiscoverAuditRecordSchema,
  DiscoverMeGovernanceSchema,
  DiscoverReportCaseSchema,
  DiscoverUserGovernanceDetailSchema,
  DiscoverUserGovernanceSummarySchema,
  PostSchema
} from "./entities";

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
  description: z.string().optional(),
  evidence_file_ids: z.array(z.string()).default([])
});

export const ModeratePostInputSchema = z.object({
  review_status: z.enum(["visible", "hidden", "deleted"]),
  reason: z.string().optional()
});

export const ReportCommentInputSchema = ReportPostInputSchema;

export const AdminDiscoverPostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  communityId: z.string().default("tongzilin"),
  keyword: z.string().trim().optional(),
  authorUserId: z.string().trim().optional(),
  language: z.enum(["zh", "en"]).optional(),
  tag: z.string().trim().optional(),
  status: z
    .enum(["all", "visible", "reported", "hidden", "deleted"])
    .default("all")
});

export const AdminDiscoverCommentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  postId: z.string().trim().optional(),
  authorUserId: z.string().trim().optional(),
  keyword: z.string().trim().optional(),
  status: z
    .enum(["all", "visible", "reported", "hidden", "deleted"])
    .default("all")
});

export const AdminDiscoverReportListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  targetType: z.enum(["post", "comment"]).optional(),
  status: z.enum(["all", "open", "actioned", "rejected"]).default("all"),
  reason: z.string().trim().optional()
});

export const AdminDiscoverUserListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  keyword: z.string().trim().optional(),
  status: z
    .enum(["all", "active", "warned", "muted", "banned", "inactive"])
    .default("all")
});

export const AdminDiscoverAuditListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  targetType: z.enum(["post", "comment", "report", "user"]).optional(),
  targetId: z.string().trim().optional(),
  actorUserId: z.string().trim().optional()
});

export const ModerateCommentInputSchema = z.object({
  status: z.enum(["visible", "hidden", "deleted"]),
  reason: z.string().optional()
});

export const ResolveReportInputSchema = z.object({
  status: z.enum(["actioned", "rejected"]),
  reason: z.string().min(1),
  moderation_action: z
    .enum(["none", "hide", "restore", "delete"])
    .default("none")
});

export const EnforceUserInputSchema = z.object({
  status: z.enum(["active", "warned", "muted", "banned"]),
  reason: z.string().min(1),
  notes: z.string().optional(),
  expires_at: z.string().nullable().optional()
});

export {
  DiscoverAuditRecordSchema,
  DiscoverMeGovernanceSchema,
  DiscoverReportCaseSchema,
  DiscoverUserGovernanceDetailSchema,
  DiscoverUserGovernanceSummarySchema
};
