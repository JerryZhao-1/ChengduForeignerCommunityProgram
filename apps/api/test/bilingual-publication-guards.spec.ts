import { createServer } from "node:http";

import type { ApiErrorCode } from "@community-map/shared";
import { afterEach, describe, expect, it } from "vitest";

import { createApp } from "../src/app";
import { createCloudbaseProvider } from "../src/providers/cloudbase";
import { createMockProvider } from "../src/providers/mock";

const completeEventInput = {
  title_zh: "双语活动",
  title_en: "Bilingual Event",
  summary_zh: "活动简介",
  summary_en: "Event summary",
  content_zh: "活动正文",
  content_en: "Event details",
  address_text: "桐梓林社区中心",
  address_zh: "桐梓林社区中心",
  address_en: "Tongzilin Community Center",
  cover_file_id: "cloud://managed-event-cover",
  cover_cloud_path: "public/events/test/cover.jpg",
  cover_url: "https://example.com/managed-event-cover.jpg",
  location: { latitude: 30.615, longitude: 104.062 },
  start_time: "2030-08-02T10:00:00+08:00",
  end_time: "2030-08-02T12:00:00+08:00",
  signup_deadline: "2030-08-01T18:00:00+08:00",
  capacity: 12
};

const completePlaceInput = {
  name_zh: "双语地点",
  name_en: "Bilingual Place",
  cover_file_id: null,
  cover_url: null,
  cover_source: null,
  category_level_1: "community" as const,
  category_level_2: "community-center",
  tag_ids: [],
  address_zh: "桐梓林",
  address_en: "Tongzilin",
  location: { latitude: 30.615, longitude: 104.062 },
  tencent_map_poi_id: null,
  business_hours_zh: "每天",
  business_hours_en: "Every day",
  intro_zh: "社区地点介绍",
  intro_en: "Community place introduction",
  recommended_reason_zh: null,
  recommended_reason_en: null,
  is_recommended: false,
  recommended_rank: 0,
  gallery_file_ids: [],
  external_gallery_media: [],
  gallery_urls: [],
  supports_navigation: true,
  supports_favorite: true,
  supports_share: true,
  status: "draft" as const,
  import_review: null
};

const expectValidationError = async (operation: Promise<unknown>, field: string) => {
  try {
    await operation;
  } catch (error) {
    const candidate = error as {
      code?: ApiErrorCode;
      status?: number;
      details?: { fields?: Array<{ field?: string }> };
    };
    expect(candidate.code).toBe("VALIDATION_ERROR");
    expect(candidate.status).toBe(400);
    expect(candidate.details?.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })])
    );
    return;
  }
  throw new Error("Expected bilingual publication validation to fail.");
};

describe("provider bilingual publication gates", () => {
  it("keeps Event and Place mutations atomic in mock and CloudBase adapters", async () => {
    const previousMode = process.env.CLOUDBASE_PROVIDER_MODE;
    const previousEnv = process.env.CLOUDBASE_ENV_ID;
    delete process.env.CLOUDBASE_PROVIDER_MODE;
    delete process.env.CLOUDBASE_ENV_ID;
    try {
      for (const provider of [createMockProvider(), createCloudbaseProvider()]) {
        const canonicalAddressEvent = await provider.events.create(
          { ...completeEventInput, address_text: undefined },
          "user_001"
        );
        expect(canonicalAddressEvent.address_text).toBe(
          completeEventInput.address_zh
        );
        expect(
          await provider.events.update(canonicalAddressEvent._id, {
            address_zh: "桐梓林新中文地址"
          })
        ).toMatchObject({
          address_text: "桐梓林新中文地址",
          address_zh: "桐梓林新中文地址"
        });

        const draftEvent = await provider.events.create(
          { ...completeEventInput, title_en: "" },
          "user_001"
        );
        await expectValidationError(
          provider.events.review(draftEvent._id, {
            review_status: "approved",
            publish_status: "published"
          }),
          "title_en"
        );
        const unchangedEvent = (await provider.events.listAdmin()).items.find(
          (item) => item._id === draftEvent._id
        );
        expect(unchangedEvent).toMatchObject({
          review_status: "draft",
          publish_status: "draft"
        });

        const publicEvent = await provider.events.create(
          completeEventInput,
          "user_001"
        );
        await provider.events.review(publicEvent._id, {
          review_status: "approved",
          publish_status: "published"
        });
        await expectValidationError(
          provider.events.update(publicEvent._id, { summary_en: " TBD " }),
          "summary_en"
        );
        expect(
          (await provider.events.listAdmin()).items.find(
            (item) => item._id === publicEvent._id
          )?.summary_en
        ).toBe("Event summary");

        const externalCoverEvent = await provider.events.create(
          {
            ...completeEventInput,
            cover_file_id: null,
            cover_cloud_path: null,
            cover_url: "https://store.is.autonavi.com/showpic/test"
          },
          "user_001"
        );
        await expectValidationError(
          provider.events.review(externalCoverEvent._id, {
            review_status: "approved",
            publish_status: "published"
          }),
          "cover_file_id"
        );

        const draftPlace = await provider.places.create({
          ...completePlaceInput,
          intro_en: ""
        });
        await expectValidationError(
          provider.places.update(draftPlace._id, { status: "published" }),
          "intro_en"
        );
        expect(
          (await provider.places.listAdmin()).items.find(
            (item) => item._id === draftPlace._id
          )?.status
        ).toBe("draft");

        await expectValidationError(
          provider.places.create({
            ...completePlaceInput,
            name_en: "   ",
            status: "published"
          }),
          "name_en"
        );

        const publicPlace = await provider.places.create({
          ...completePlaceInput,
          status: "published"
        });
        await expectValidationError(
          provider.places.update(publicPlace._id, {
            is_recommended: true,
            recommended_reason_zh: "适合新居民",
            recommended_reason_en: "placeholder"
          }),
          "recommended_reason_en"
        );
        expect(
          (await provider.places.listAdmin()).items.find(
            (item) => item._id === publicPlace._id
          )?.is_recommended
        ).toBe(false);
      }
    } finally {
      if (previousMode === undefined) delete process.env.CLOUDBASE_PROVIDER_MODE;
      else process.env.CLOUDBASE_PROVIDER_MODE = previousMode;
      if (previousEnv === undefined) delete process.env.CLOUDBASE_ENV_ID;
      else process.env.CLOUDBASE_ENV_ID = previousEnv;
    }
  });
});

const servers: Array<ReturnType<typeof createServer>> = [];
afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) =>
          server.close((error) => (error ? reject(error) : resolve()))
        )
    )
  );
});

const startApi = async () => {
  const server = createServer(createApp("mock").callback());
  servers.push(server);
  await new Promise<void>((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve())
  );
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No test port");
  return `http://127.0.0.1:${address.port}`;
};

const adminFetch = (url: string, method: string, body: unknown) =>
  fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      "x-mock-user-id": "user_001"
    },
    body: JSON.stringify(body)
  });

describe("API bilingual publication errors", () => {
  it("returns field-level 400 envelopes and preserves previous public state", async () => {
    const baseUrl = await startApi();
    const beforeEvent = await (await fetch(`${baseUrl}/events/event_001`)).json();
    const eventResponse = await adminFetch(
      `${baseUrl}/admin/events/event_001`,
      "PATCH",
      { address_en: "TBD" }
    );
    const eventBody = await eventResponse.json();
    const afterEvent = await (await fetch(`${baseUrl}/events/event_001`)).json();

    expect(eventResponse.status).toBe(400);
    expect(eventBody).toMatchObject({
      success: false,
      error: { code: "VALIDATION_ERROR" }
    });
    expect(eventBody.error.details.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "address_en" })])
    );
    expect(afterEvent.data.address_en).toBe(beforeEvent.data.address_en);

    const beforePlace = await (await fetch(`${baseUrl}/places/place_001`)).json();
    const placeResponse = await adminFetch(
      `${baseUrl}/admin/places/place_001`,
      "PATCH",
      { intro_en: "  " }
    );
    const placeBody = await placeResponse.json();
    const afterPlace = await (await fetch(`${baseUrl}/places/place_001`)).json();

    expect(placeResponse.status).toBe(400);
    expect(placeBody.error.details.fields).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: "intro_en" })])
    );
    expect(afterPlace.data.intro_en).toBe(beforePlace.data.intro_en);
  });
});
