import { z } from "zod";

import {
  CommentSchema,
  PostSchema,
  UserSchema
} from "./entities";

export const PostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  communityId: z.string().default("tongzilin"),
  keyword: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  sort: z.enum(["latest", "likes", "favorites", "comments"]).default("latest")
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

export const MyCommentListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
});

export const MyReportListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10)
});

export const ProfileFollowListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20)
});

export const RelatedPostListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(20).default(5),
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

export const PostInteractionStateSchema = z.object({
  post_id: z.string(),
  actor_user_id: z.string(),
  liked: z.boolean(),
  favorited: z.boolean(),
  like_count: z.number().int().min(0),
  favorite_count: z.number().int().min(0),
  share_count: z.number().int().min(0)
});

export const PostInteractionRecordSchema = z.object({
  _id: z.string(),
  post_id: z.string(),
  actor_user_id: z.string(),
  liked: z.boolean(),
  favorited: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const PermanentDeletePostResponseSchema = z.object({
  post_id: z.string(),
  audit_record_id: z.string(),
  deleted: z.object({
    posts: z.number().int().nonnegative(),
    comments: z.number().int().nonnegative(),
    interactions: z.number().int().nonnegative(),
    reports: z.number().int().nonnegative(),
    notifications: z.number().int().nonnegative(),
    file_assets: z.number().int().nonnegative(),
    storage_objects: z.number().int().nonnegative(),
    audit_records: z.number().int().nonnegative()
  })
});

export const UserFollowRecordSchema = z.object({
  _id: z.string(),
  follower_user_id: z.string(),
  followed_user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const ProfileFollowStateSchema = z.object({
  follower_user_id: z.string(),
  followed_user_id: z.string(),
  following: z.boolean(),
  follower_count: z.number().int().min(0),
  following_count: z.number().int().min(0)
});

export const PublicProfileUserSchema = UserSchema.pick({
  _id: true,
  nickname: true,
  avatar_url: true,
  preferred_language: true,
  status: true
});

export const ProfileFollowListItemSchema = z.object({
  user: PublicProfileUserSchema,
  following: z.boolean(),
  followed_by_actor: z.boolean(),
  follows_actor: z.boolean(),
  mutual: z.boolean()
});

export const PublicProfileStatsSchema = z.object({
  post_count: z.number().int().min(0),
  video_post_count: z.number().int().min(0),
  follower_count: z.number().int().min(0),
  following_count: z.number().int().min(0)
});

export const PublicProfileSchema = z.object({
  user: PublicProfileUserSchema,
  stats: PublicProfileStatsSchema,
  followed_by_actor: z.boolean(),
  is_self: z.boolean(),
  posts: z.array(PostSchema),
  video_posts: z.array(PostSchema)
});

export const SetPostLikeInputSchema = z.object({
  liked: z.boolean()
});

export const SetPostFavoriteInputSchema = z.object({
  favorited: z.boolean()
});

export const RecordPostShareInputSchema = z.object({
  channel: z
    .enum(["wechat", "moments", "copy_link", "system", "other"])
    .default("other")
});

export const SetProfileFollowInputSchema = z.object({
  following: z.boolean()
});

export const DiscoverPostOpsInputSchema = z.object({
  is_pinned: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  is_recommended: z.boolean().optional(),
  is_official: z.boolean().optional(),
  ops_rank: z.number().int().min(0).optional(),
  reason: z.string().trim().optional()
});

export const DiscoverTagSchema = z.object({
  _id: z.string(),
  label_zh: z.string(),
  label_en: z.string(),
  status: z.enum(["active", "hidden"]),
  post_count: z.number().int().min(0),
  created_at: z.string(),
  updated_at: z.string()
});

export const DiscoverTagListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  keyword: z.string().trim().optional()
});

export const CreateDiscoverTagInputSchema = z.object({
  label: z.string().trim().min(1).max(32)
});

export const UpsertDiscoverTagInputSchema = z.object({
  label_zh: z.string().min(1),
  label_en: z.string().min(1),
  status: z.enum(["active", "hidden"]).default("active")
});

export const DiscoverAnalyticsQuerySchema = z.object({
  windowDays: z.coerce.number().int().min(1).max(90).default(30)
});

export const DiscoverAnalyticsSchema = z.object({
  window_days: z.number().int().min(1),
  post_count: z.number().int().min(0),
  comment_count: z.number().int().min(0),
  report_count: z.number().int().min(0),
  open_report_count: z.number().int().min(0),
  pending_workload_count: z.number().int().min(0),
  average_moderation_hours: z.number().min(0).nullable(),
  engagement: z.object({
    like_count: z.number().int().min(0),
    favorite_count: z.number().int().min(0),
    share_count: z.number().int().min(0)
  }),
  active_authors: z.array(
    z.object({
      user_id: z.string(),
      post_count: z.number().int().min(0),
      comment_count: z.number().int().min(0)
    })
  ),
  popular_places: z.array(
    z.object({
      place_id: z.string(),
      post_count: z.number().int().min(0)
    })
  ),
  popular_events: z.array(
    z.object({
      event_id: z.string(),
      post_count: z.number().int().min(0)
    })
  )
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
  targetType: z.enum(["post", "comment", "report", "user", "tag"]).optional(),
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
