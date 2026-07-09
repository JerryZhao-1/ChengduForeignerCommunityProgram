import { afterEach, describe, expect, it, vi } from "vitest";

type CollectionRows = Record<string, Record<string, unknown>[]>;

interface CloudbaseMainResponse {
  statusCode: number;
  body: unknown;
}

interface SuccessBody<TData> {
  success: true;
  data: TData;
  requestId: string;
}

interface FailureBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

const createRows = (): CollectionRows => ({
  users: [],
  posts: [],
  comments: [],
  file_assets: [],
  discover_tags: [],
  discover_audit_records: [],
  discover_post_interactions: [],
  discover_user_follows: [],
  discover_report_cases: [],
  places: [],
  events: [],
  event_registrations: [],
  event_tickets: []
});

const installCloudbaseMock = (rows: CollectionRows) => {
  vi.doMock("@cloudbase/node-sdk", () => ({
    default: {
      init: () => ({
        database: () => ({
          collection: (name: string) => {
            rows[name] = rows[name] ?? [];
            return {
              limit: () => ({
                get: async () => ({
                  data: rows[name]
                })
              }),
              doc: (id: string) => ({
                set: async (payload: Record<string, unknown>) => {
                  const next = { _id: id, ...payload };
                  const index = rows[name].findIndex((item) => item._id === id);
                  if (index >= 0) {
                    rows[name][index] = next;
                  } else {
                    rows[name].push(next);
                  }
                  return { requestId: `set_${name}_${id}` };
                },
                update: async (payload: Record<string, unknown>) => {
                  const item = rows[name].find((row) => row._id === id);
                  if (item) {
                    Object.assign(item, payload);
                  }
                  return { requestId: `update_${name}_${id}` };
                }
              })
            };
          }
        }),
        getTempFileURL: async () => ({ fileList: [] })
      })
    }
  }));
};

const callMain = async (
  event: Record<string, unknown>,
  input: {
    eventID: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
  }
): Promise<CloudbaseMainResponse> => {
  const { main } = await import("../src/cloudbase");
  return main(event, {
    eventID: input.eventID,
    httpContext: {
      url: input.url,
      httpMethod: input.method,
      headers: input.headers
    }
  });
};

const wechatHeaders = {
  "x-wx-openid": "openid_real_user_001",
  "x-wx-appid": "wx_app_001",
  "x-wx-unionid": "union_real_user_001"
};

describe("CloudBase Mini Program auth", () => {
  const previousProvider = process.env.API_PROVIDER;
  const previousProviderMode = process.env.CLOUDBASE_PROVIDER_MODE;
  const previousEnvId = process.env.CLOUDBASE_ENV_ID;
  const previousAllowMock = process.env.API_ALLOW_MOCK_ACTOR_HEADER;

  afterEach(() => {
    if (previousProvider === undefined) {
      delete process.env.API_PROVIDER;
    } else {
      process.env.API_PROVIDER = previousProvider;
    }
    if (previousProviderMode === undefined) {
      delete process.env.CLOUDBASE_PROVIDER_MODE;
    } else {
      process.env.CLOUDBASE_PROVIDER_MODE = previousProviderMode;
    }
    if (previousEnvId === undefined) {
      delete process.env.CLOUDBASE_ENV_ID;
    } else {
      process.env.CLOUDBASE_ENV_ID = previousEnvId;
    }
    if (previousAllowMock === undefined) {
      delete process.env.API_ALLOW_MOCK_ACTOR_HEADER;
    } else {
      process.env.API_ALLOW_MOCK_ACTOR_HEADER = previousAllowMock;
    }

    vi.doUnmock("@cloudbase/node-sdk");
    vi.resetModules();
  });

  const configureLiveMode = (rows: CollectionRows) => {
    vi.resetModules();
    installCloudbaseMock(rows);
    process.env.API_PROVIDER = "cloudbase";
    process.env.CLOUDBASE_PROVIDER_MODE = "live";
    process.env.CLOUDBASE_ENV_ID = "test-env";
    delete process.env.API_ALLOW_MOCK_ACTOR_HEADER;
  };

  it("creates and reuses a durable user from Mini Program identity headers", async () => {
    const rows = createRows();
    configureLiveMode(rows);

    const first = await callMain(
      { preferred_language: "en" },
      {
        eventID: "req_wechat_session_first",
        url: "http://localhost/auth/wechat-miniapp/session",
        method: "POST",
        headers: wechatHeaders
      }
    );
    const firstBody = first.body as SuccessBody<{
      user: { _id: string; openid: string; preferred_language: string };
    }>;

    expect(first.statusCode).toBe(200);
    expect(firstBody.success).toBe(true);
    expect(firstBody.data.user._id).toMatch(/^wx_/);
    expect(firstBody.data.user._id).not.toBe(wechatHeaders["x-wx-openid"]);
    expect(firstBody.data.user.openid).toBe(wechatHeaders["x-wx-openid"]);
    expect(firstBody.data.user.preferred_language).toBe("en");
    expect(rows.users).toHaveLength(1);

    const second = await callMain(
      { preferred_language: "zh" },
      {
        eventID: "req_wechat_session_second",
        url: "http://localhost/auth/wechat-miniapp/session",
        method: "POST",
        headers: wechatHeaders
      }
    );
    const secondBody = second.body as SuccessBody<{
      user: { _id: string; preferred_language: string };
    }>;

    expect(second.statusCode).toBe(200);
    expect(secondBody.data.user._id).toBe(firstBody.data.user._id);
    expect(secondBody.data.user.preferred_language).toBe("zh");
    expect(rows.users).toHaveLength(1);
  });

  it("rejects live Mini Program session calls without WeChat identity", async () => {
    const rows = createRows();
    configureLiveMode(rows);

    const response = await callMain(
      {},
      {
        eventID: "req_wechat_session_missing",
        url: "http://localhost/auth/wechat-miniapp/session",
        method: "POST"
      }
    );
    const body = response.body as FailureBody;

    expect(response.statusCode).toBe(401);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("creates tags and posts with the resolved WeChat project user", async () => {
    const rows = createRows();
    configureLiveMode(rows);

    const tagResponse = await callMain(
      { label: "community" },
      {
        eventID: "req_wechat_tag",
        url: "http://localhost/discover/tags",
        method: "POST",
        headers: wechatHeaders
      }
    );
    const tagBody = tagResponse.body as SuccessBody<{ _id: string }>;

    expect(tagResponse.statusCode).toBe(201);
    expect(tagBody.data._id).toBe("community");

    const duplicateTagResponse = await callMain(
      { label: "#community" },
      {
        eventID: "req_wechat_tag_duplicate",
        url: "http://localhost/discover/tags",
        method: "POST",
        headers: wechatHeaders
      }
    );
    const duplicateTagBody = duplicateTagResponse.body as SuccessBody<{
      _id: string;
    }>;

    expect(duplicateTagResponse.statusCode).toBe(201);
    expect(duplicateTagBody.data._id).toBe("community");
    expect(rows.discover_tags).toHaveLength(1);

    const postResponse = await callMain(
      {
        title: "WeChat identity post",
        content: "Created with Mini Program identity.",
        language: "en",
        tag_ids: ["community"],
        location_text: null,
        image_file_ids: [],
        image_urls: [],
        place_id: null,
        event_id: null
      },
      {
        eventID: "req_wechat_post",
        url: "http://localhost/discover/posts",
        method: "POST",
        headers: wechatHeaders
      }
    );
    const postBody = postResponse.body as SuccessBody<{
      author_user_id: string;
      author_display: { nickname: string };
    }>;
    const liveUserId = rows.users[0]._id;

    expect(postResponse.statusCode).toBe(200);
    expect(postBody.data.author_user_id).toBe(liveUserId);
    expect(postBody.data.author_user_id).not.toBe("user_001");
    expect(postBody.data.author_display.nickname).toBe("微信用户");
  });
});
