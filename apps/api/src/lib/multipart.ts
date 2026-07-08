import type { Context } from "koa";

import { apiError } from "./errors";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_MULTIPART_BYTES = MAX_VIDEO_BYTES + 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);
const SUPPORTED_VIDEO_TYPES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm"
]);

export interface UploadedImageFile {
  file_name: string;
  content_type: string;
  buffer: Buffer;
}

export interface UploadedPostMediaFile extends UploadedImageFile {
  kind: "image" | "video";
  fields: Record<string, string>;
}

const readRequestBuffer = async (ctx: Context) => {
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of ctx.req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;

    if (totalBytes > MAX_MULTIPART_BYTES) {
      throw apiError("VALIDATION_ERROR", "Gallery upload is too large.", 400, {
        max_bytes: MAX_MULTIPART_BYTES
      });
    }

    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
};

const splitBuffer = (buffer: Buffer, separator: Buffer) => {
  const parts: Buffer[] = [];
  let start = 0;
  let index = buffer.indexOf(separator, start);

  while (index >= 0) {
    parts.push(buffer.subarray(start, index));
    start = index + separator.length;
    index = buffer.indexOf(separator, start);
  }

  parts.push(buffer.subarray(start));
  return parts;
};

const parseContentDisposition = (value: string) => {
  const params = new Map<string, string>();

  for (const part of value.split(";").slice(1)) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey || rawValue.length === 0) {
      continue;
    }
    params.set(rawKey, rawValue.join("=").replace(/^"|"$/g, ""));
  }

  return params;
};

const stripTrailingCrlf = (buffer: Buffer) =>
  buffer.subarray(
    0,
    buffer.length >= 2 && buffer.subarray(-2).toString() === "\r\n"
      ? -2
      : undefined
  );

const inferContentTypeFromFileName = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    mp4: "video/mp4",
    mov: "video/quicktime",
    webm: "video/webm"
  };

  return extension ? types[extension] : undefined;
};

const parseMultipartUpload = async (
  ctx: Context,
  options: {
    purpose: string;
    allowVideo: boolean;
  }
): Promise<UploadedPostMediaFile> => {
  const contentType = ctx.get("content-type");
  const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
  const contentLength = Number(ctx.get("content-length"));

  if (!boundary) {
    throw apiError(
      "VALIDATION_ERROR",
      "Multipart form boundary is required.",
      400
    );
  }

  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    throw apiError(
      "VALIDATION_ERROR",
      `${options.purpose} is too large.`,
      400,
      {
        max_bytes: MAX_MULTIPART_BYTES
      }
    );
  }

  const body = await readRequestBuffer(ctx);
  const parts = splitBuffer(body, Buffer.from(`--${boundary}`));
  const fields: Record<string, string> = {};
  let uploadedFile: UploadedPostMediaFile | null = null;

  for (const rawPart of parts) {
    let part = rawPart;
    if (part.subarray(0, 2).toString() === "\r\n") {
      part = part.subarray(2);
    }
    if (part.length === 0 || part.subarray(0, 2).toString() === "--") {
      continue;
    }

    const headerEnd = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEnd < 0) {
      continue;
    }

    const headerLines = part
      .subarray(0, headerEnd)
      .toString("utf8")
      .split("\r\n");
    const headers = new Map(
      headerLines.map((line) => {
        const [name, ...valueParts] = line.split(":");
        return [name.toLowerCase(), valueParts.join(":").trim()];
      })
    );
    const disposition = headers.get("content-disposition");
    if (!disposition) {
      continue;
    }

    const params = parseContentDisposition(disposition);
    const fieldName = params.get("name");
    if (!fieldName) {
      continue;
    }

    const partBody = stripTrailingCrlf(part.subarray(headerEnd + 4));
    if (fieldName !== "file") {
      fields[fieldName] = partBody.toString("utf8");
      continue;
    }

    const fileName = params.get("filename")?.trim();
    const fileBody = partBody;
    const fileContentType =
      headers.get("content-type")?.toLowerCase() || "application/octet-stream";

    if (!fileName || fileBody.length === 0) {
      throw apiError(
        "VALIDATION_ERROR",
        `Uploaded ${options.purpose} file is required.`,
        400
      );
    }

    const normalizedContentType =
      fileContentType === "application/octet-stream"
        ? (inferContentTypeFromFileName(fileName) ?? fileContentType)
        : fileContentType;
    const isImage = SUPPORTED_IMAGE_TYPES.has(normalizedContentType);
    const isVideo =
      options.allowVideo && SUPPORTED_VIDEO_TYPES.has(normalizedContentType);

    if (!isImage && !isVideo) {
      throw apiError(
        "VALIDATION_ERROR",
        `Unsupported ${options.purpose} type.`,
        400,
        {
          content_type: normalizedContentType
        }
      );
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (fileBody.length > maxBytes) {
      throw apiError(
        "VALIDATION_ERROR",
        `${options.purpose} is too large.`,
        400,
        {
          max_bytes: maxBytes
        }
      );
    }

    uploadedFile = {
      file_name: fileName,
      content_type: normalizedContentType,
      buffer: fileBody,
      kind: isVideo ? "video" : "image",
      fields
    };
  }

  if (uploadedFile) {
    return uploadedFile;
  }

  throw apiError(
    "VALIDATION_ERROR",
    `Uploaded ${options.purpose} file is required.`,
    400
  );
};

export const parseMultipartImageUpload = async (
  ctx: Context
): Promise<UploadedImageFile> =>
  parseMultipartUpload(ctx, {
    purpose: "image",
    allowVideo: false
  });

export const parseMultipartPostMediaUpload = async (
  ctx: Context
): Promise<UploadedPostMediaFile> =>
  parseMultipartUpload(ctx, {
    purpose: "post media",
    allowVideo: true
  });

export const parseMultipartReportEvidenceUpload = async (
  ctx: Context
): Promise<UploadedPostMediaFile> =>
  parseMultipartUpload(ctx, {
    purpose: "report evidence",
    allowVideo: true
  });
