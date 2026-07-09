import type { Post } from "./types/entities";

const VIDEO_MEDIA_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm", ".m3u8"];

export const isVideoMediaUrl = (url: string) => {
  const normalized = url.trim().toLowerCase();

  return (
    VIDEO_MEDIA_EXTENSIONS.some((extension) =>
      normalized.includes(extension)
    ) || normalized.includes("video")
  );
};

export const postHasVideoMedia = (post: Pick<Post, "image_urls">) =>
  post.image_urls.some(isVideoMediaUrl);
