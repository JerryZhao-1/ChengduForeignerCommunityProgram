import {
  ApiClientError,
  ApiFailureResultSchema,
  CreateApiSuccessSchema,
  FILE_PATH_RULES,
  FileAssetSchema,
  apiPaths,
  type ApiError,
  type FileAsset
} from "@community-map/shared";

import { mobileEnv } from "@/config/env";
import { mobileApi } from "./client";

declare const wx:
  | {
      cloud?: {
        uploadFile?: (input: {
          cloudPath: string;
          filePath: string;
        }) => Promise<{ fileID?: string; fileId?: string }>;
      };
    }
  | undefined;

interface ReportEvidenceUploadInput {
  filePath: string;
  fileName: string;
  bizId: string;
}

const cloudFileIdFromPath = (cloudPath: string) =>
  `cloud://${mobileEnv.cloudbaseEnvId}/${cloudPath}`;

const buildApiUrl = (path: string) =>
  `${mobileEnv.apiBaseUrl.replace(/\/$/, "")}${path}`;

const parseUploadResponse = (rawData: string) => {
  const payload = JSON.parse(rawData) as unknown;
  const failure = ApiFailureResultSchema.safeParse(payload);

  if (failure.success) {
    throw new ApiClientError(failure.data.error);
  }

  const success = CreateApiSuccessSchema(FileAssetSchema).safeParse(payload);
  if (!success.success) {
    const error: ApiError = {
      code: "UPSTREAM_ERROR",
      message: "Unexpected report evidence upload response.",
      details: success.error.flatten()
    };
    throw new ApiClientError(error);
  }

  return success.data.data;
};

const uploadViaHttpApi = (
  input: ReportEvidenceUploadInput
): Promise<FileAsset> =>
  new Promise((resolve, reject) => {
    uni.uploadFile({
      url: buildApiUrl(apiPaths.files.uploadReportEvidence),
      filePath: input.filePath,
      name: "file",
      fileName: input.fileName,
      header: mobileEnv.actorId
        ? {
            "x-mock-user-id": mobileEnv.actorId
          }
        : undefined,
      formData: {
        biz_id: input.bizId
      },
      success: (result) => {
        try {
          if (result.statusCode < 200 || result.statusCode >= 300) {
            const error: ApiError = {
              code: "UPSTREAM_ERROR",
              message: `Report evidence upload failed with status ${result.statusCode}.`,
              details: result.data
            };
            throw new ApiClientError(error, { status: result.statusCode });
          }

          resolve(parseUploadResponse(String(result.data)));
        } catch (error) {
          reject(error);
        }
      },
      fail: reject
    });
  });

const uploadViaWxCloud = async (
  input: ReportEvidenceUploadInput
): Promise<FileAsset | null> => {
  const uploadFile =
    typeof wx === "undefined" ? undefined : wx.cloud?.uploadFile;
  if (mobileEnv.apiMode !== "cloudbase-function" || !uploadFile) {
    return null;
  }

  const uploadRequest = await mobileApi.files.createUploadRequest({
    biz_type: "report_evidence",
    biz_id: input.bizId,
    file_name: input.fileName,
    target_prefix: FILE_PATH_RULES.reports,
    visibility: "private"
  });
  const uploadResult = await uploadFile({
    cloudPath: uploadRequest.data.cloud_path,
    filePath: input.filePath
  });
  const fileId =
    uploadResult.fileID ??
    uploadResult.fileId ??
    cloudFileIdFromPath(uploadRequest.data.cloud_path);
  const completed = await mobileApi.files.complete({
    biz_type: "report_evidence",
    biz_id: input.bizId,
    file_id: fileId,
    cloud_path: uploadRequest.data.cloud_path,
    visibility: "private"
  });

  return completed.data;
};

const uploadViaMockClient = async (
  input: ReportEvidenceUploadInput
): Promise<FileAsset> => {
  const uploadRequest = await mobileApi.files.createUploadRequest({
    biz_type: "report_evidence",
    biz_id: input.bizId,
    file_name: input.fileName,
    target_prefix: FILE_PATH_RULES.reports,
    visibility: "private"
  });
  const completed = await mobileApi.files.complete({
    biz_type: "report_evidence",
    biz_id: input.bizId,
    file_id: `cloud://${uploadRequest.data.cloud_path}`,
    cloud_path: uploadRequest.data.cloud_path,
    visibility: "private"
  });

  return completed.data;
};

export const uploadReportEvidence = async (
  input: ReportEvidenceUploadInput
): Promise<FileAsset> => {
  if (mobileEnv.apiMode === "mock") {
    return uploadViaMockClient(input);
  }

  const cloudAsset = await uploadViaWxCloud(input);
  if (cloudAsset) {
    return cloudAsset;
  }

  return uploadViaHttpApi(input);
};
