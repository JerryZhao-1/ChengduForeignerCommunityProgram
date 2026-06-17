import type { Post } from "@community-map/shared";

export type DiscoverMediaKind = "image" | "video";

export interface DiscoverMediaItem {
  url: string;
  kind: DiscoverMediaKind;
}

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm", ".m3u8"];

export const getMediaKind = (url: string): DiscoverMediaKind => {
  const normalized = url.trim().toLowerCase();

  if (VIDEO_EXTENSIONS.some((extension) => normalized.includes(extension))) {
    return "video";
  }

  if (normalized.includes("video")) {
    return "video";
  }

  return "image";
};

export const normalizePostMedia = (post: Post): DiscoverMediaItem[] =>
  post.image_urls.map((url) => ({
    url,
    kind: getMediaKind(url)
  }));

export const getFirstMedia = (post: Post) => normalizePostMedia(post)[0] ?? null;

export const getMediaSummary = (post: Post) => {
  const media = normalizePostMedia(post);
  const imageCount = media.filter((item) => item.kind === "image").length;
  const videoCount = media.filter((item) => item.kind === "video").length;

  return {
    total: media.length,
    imageCount,
    videoCount
  };
};

export const getVisibleTags = (post: Post, limit = 3) =>
  post.tag_ids.slice(0, limit);

export const getHiddenTagCount = (post: Post, limit = 3) =>
  Math.max(0, post.tag_ids.length - limit);
