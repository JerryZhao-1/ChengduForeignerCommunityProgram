import { createServer } from "node:http";

import { FILE_PATH_RULES } from "@community-map/shared";

import { createApp } from "../src/app";

const createTestBaseUrl = async () => {
  const app = createApp("mock");
  const server = createServer(app.callback());

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to create test server.");
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      })
  };
};

describe("api routes", () => {
  it("serves events list, detail, registration, posts, places, announcements, and validation errors", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const eventsResponse = await fetch(`${baseUrl}/events`);
      const eventsData = await eventsResponse.json();
      expect(eventsResponse.status).toBe(200);
      expect(eventsData.data.items.length).toBeGreaterThan(0);

      const eventId = eventsData.data.items[0]._id;
      const detailResponse = await fetch(`${baseUrl}/events/${eventId}`);
      expect(detailResponse.status).toBe(200);

      const registerResponse = await fetch(
        `${baseUrl}/events/${eventId}/registrations`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            contact_name: "Jerry",
            contact_phone: "13800000000",
            attendee_count: 1,
            source_channel: "miniapp"
          })
        }
      );
      const registerData = await registerResponse.json();
      expect(registerResponse.status).toBe(201);
      expect(registerData.data.ticket.ticket_code).toContain("TZL");

      const invalidRegistration = await fetch(
        `${baseUrl}/events/${eventId}/registrations`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            contact_name: "",
            contact_phone: "1",
            attendee_count: 0
          })
        }
      );
      expect(invalidRegistration.status).toBe(400);

      const postsResponse = await fetch(`${baseUrl}/discover/posts`);
      expect(postsResponse.status).toBe(200);

      const createPostResponse = await fetch(`${baseUrl}/discover/posts`, {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          title: "Need a local dentist recommendation",
          content: "Prefer around Tongzilin station.",
          language: "en",
          tag_ids: ["help"],
          location_text: "Tongzilin",
          image_file_ids: [],
          image_urls: []
        })
      });
      expect(createPostResponse.status).toBe(201);

      const placesResponse = await fetch(`${baseUrl}/places`);
      const placesData = await placesResponse.json();
      expect(placesResponse.status).toBe(200);
      expect(placesData.data.items.length).toBeGreaterThan(0);
      expect(placesData.data.items[0]).toHaveProperty("short_address_zh");
      expect(placesData.data.items[0]).not.toHaveProperty("gallery_urls");
      expect(placesData.data.items[0]).not.toHaveProperty("gallery_media");
      expect(placesData.data.items[0]).not.toHaveProperty("navigation");
      expect(placesData.data.items[0]).not.toHaveProperty("address_zh");

      const placeDetailResponse = await fetch(
        `${baseUrl}/places/${placesData.data.items[0]._id}`
      );
      const placeDetailData = await placeDetailResponse.json();
      expect(placeDetailResponse.status).toBe(200);
      expect(placeDetailData.data).toHaveProperty("navigation");
      expect(placeDetailData.data).toHaveProperty("share");
      expect(placeDetailData.data.gallery_media.length).toBeGreaterThan(0);
      expect(placeDetailData.data.gallery_media[0].url).toContain(
        "images.unsplash.com"
      );
      expect(placeDetailData.data.gallery_urls).toEqual(
        placeDetailData.data.gallery_media.map((media: { url: string }) => media.url)
      );

      const markersBeforeResponse = await fetch(
        `${baseUrl}/places/map-markers`
      );
      const markersBeforeData = await markersBeforeResponse.json();
      expect(markersBeforeResponse.status).toBe(200);
      expect(markersBeforeData.data.length).toBeGreaterThan(0);
      expect(markersBeforeData.data[0]).toHaveProperty("category_level_1");
      expect(markersBeforeData.data[0]).toHaveProperty("is_recommended");
      expect(markersBeforeData.data[0]).not.toHaveProperty("address_zh");
      expect(markersBeforeData.data[0]).not.toHaveProperty("gallery_media");

      const recommendedResponse = await fetch(
        `${baseUrl}/places?recommended=true`
      );
      const recommendedData = await recommendedResponse.json();
      expect(recommendedResponse.status).toBe(200);
      expect(recommendedData.data.items.every((item: { is_recommended: boolean }) => item.is_recommended)).toBe(true);

      const taggedResponse = await fetch(`${baseUrl}/places?tag=service`);
      const taggedData = await taggedResponse.json();
      expect(taggedResponse.status).toBe(200);
      expect(
        taggedData.data.items.every((item: { tag_ids: string[] }) =>
          item.tag_ids.includes("service")
        )
      ).toBe(true);
      expect(taggedData.data.items[0]).not.toHaveProperty("gallery_media");

      const createDraftPlaceResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "地图草稿地点",
          name_en: "Draft Map Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "public-service",
          category_level_2: "community",
          tag_ids: ["service"],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.616, longitude: 104.063 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Mon-Sun",
          intro_zh: "草稿",
          intro_en: "Draft",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "draft"
        })
      });
      const draftPlaceData = await createDraftPlaceResponse.json();
      expect(createDraftPlaceResponse.status).toBe(201);

      const publicDraftListResponse = await fetch(
        `${baseUrl}/places?keyword=Draft%20Map%20Place`
      );
      const publicDraftListData = await publicDraftListResponse.json();
      expect(publicDraftListResponse.status).toBe(200);
      expect(publicDraftListData.data.items).toEqual([]);
      expect(publicDraftListData.data.total).toBe(0);

      const markersAfterResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markersAfterData = await markersAfterResponse.json();
      expect(markersAfterResponse.status).toBe(200);
      expect(
        markersAfterData.data.some(
          (item: { _id: string }) => item._id === draftPlaceData.data._id
        )
      ).toBe(false);

      const draftDetailResponse = await fetch(
        `${baseUrl}/places/${draftPlaceData.data._id}`
      );
      expect(draftDetailResponse.status).toBe(404);

      const adminPlacesResponse = await fetch(`${baseUrl}/admin/places`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminPlacesData = await adminPlacesResponse.json();
      expect(adminPlacesResponse.status).toBe(200);
      expect(adminPlacesData.data.items.some((item: { _id: string }) => item._id === draftPlaceData.data._id)).toBe(true);

      const announcementsResponse = await fetch(`${baseUrl}/announcements`);
      expect(announcementsResponse.status).toBe(200);
    } finally {
      await close();
    }
  });

  it("serves health and places routes with the CloudBase /api prefix", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const healthResponse = await fetch(`${baseUrl}/api/health`);
      const healthData = await healthResponse.json();
      expect(healthResponse.status).toBe(200);
      expect(healthData).toEqual({ ok: true });

      const placesResponse = await fetch(`${baseUrl}/api/places?page=1&pageSize=1`);
      const placesData = await placesResponse.json();
      expect(placesResponse.status).toBe(200);
      expect(placesData.success).toBe(true);
      expect(placesData.data.items).toHaveLength(1);

      const markersResponse = await fetch(`${baseUrl}/api/places/map-markers`);
      const markersData = await markersResponse.json();
      expect(markersResponse.status).toBe(200);
      expect(markersData.success).toBe(true);
      expect(markersData.data.length).toBeGreaterThan(0);
    } finally {
      await close();
    }
  });

  it("blocks admin routes for non-admin actors", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/admin/events`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_002"
        },
        body: JSON.stringify({
          title_zh: "无权限活动",
          title_en: "Forbidden Event",
          summary_zh: "简介",
          summary_en: "Summary",
          content_zh: "正文",
          content_en: "Body",
          address_text: "Address",
          location: { latitude: 30.6, longitude: 104.0 },
          start_time: "2026-03-28T10:00:00+08:00",
          end_time: "2026-03-28T12:00:00+08:00",
          signup_deadline: "2026-03-27T18:00:00+08:00",
          capacity: 20
        })
      });
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body.error.code).toBe("FORBIDDEN");

      const placeGalleryResponse = await fetch(`${baseUrl}/admin/places/place_001`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_002"
        },
        body: JSON.stringify({
          gallery_file_ids: ["cloud://forbidden-place-gallery"]
        })
      });
      const placeGalleryBody = await placeGalleryResponse.json();

      expect(placeGalleryResponse.status).toBe(403);
      expect(placeGalleryBody.error.code).toBe("FORBIDDEN");

      const createPlaceResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "无权限图集测试地点",
          name_en: "Forbidden Gallery Test Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: [],
          address_zh: "成都",
          address_en: "Chengdu",
          location: { latitude: 30.616, longitude: 104.064 },
          business_hours_zh: "周一至周日",
          business_hours_en: "Every day",
          intro_zh: "图集权限测试",
          intro_en: "Gallery permission test",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: null,
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "published"
        })
      });
      const createPlaceBody = await createPlaceResponse.json();
      expect(createPlaceResponse.status).toBe(201);

      const forbiddenCloudPath = `${FILE_PATH_RULES.placeGallery}${createPlaceBody.data._id}/forbidden.jpg`;
      const forbiddenFileId = `cloud://${forbiddenCloudPath}`;
      const forbiddenUploadRequest = await fetch(
        `${baseUrl}/files/upload-requests`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_002"
          },
          body: JSON.stringify({
            biz_type: "place_gallery",
            biz_id: createPlaceBody.data._id,
            file_name: "forbidden.jpg",
            visibility: "public",
            target_prefix: FILE_PATH_RULES.placeGallery
          })
        }
      );
      const forbiddenUploadBody = await forbiddenUploadRequest.json();

      expect(forbiddenUploadRequest.status).toBe(403);
      expect(forbiddenUploadBody.error.code).toBe("FORBIDDEN");

      const forbiddenCompleteResponse = await fetch(`${baseUrl}/files/complete`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_002"
        },
        body: JSON.stringify({
          biz_type: "place_gallery",
          biz_id: createPlaceBody.data._id,
          file_id: forbiddenFileId,
          cloud_path: forbiddenCloudPath,
          visibility: "public"
        })
      });
      const forbiddenCompleteBody = await forbiddenCompleteResponse.json();

      expect(forbiddenCompleteResponse.status).toBe(403);
      expect(forbiddenCompleteBody.error.code).toBe("FORBIDDEN");

      const attachForbiddenFileResponse = await fetch(
        `${baseUrl}/admin/places/${createPlaceBody.data._id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            gallery_file_ids: [forbiddenFileId],
            gallery_urls: []
          })
        }
      );
      expect(attachForbiddenFileResponse.status).toBe(200);

      const detailResponse = await fetch(
        `${baseUrl}/places/${createPlaceBody.data._id}`
      );
      const detailBody = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailBody.data.gallery_media).toEqual([]);
      expect(detailBody.data.gallery_urls).toEqual([]);
    } finally {
      await close();
    }
  });

  it("supports admin places metadata create, update, and publish visibility", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const createResponse = await fetch(`${baseUrl}/admin/places`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-mock-user-id": "user_001"
        },
        body: JSON.stringify({
          name_zh: "共享分类地点",
          name_en: "Shared Taxonomy Place",
          cover_file_id: null,
          cover_url: null,
          category_level_1: "community",
          category_level_2: "support-desk",
          tag_ids: ["community"],
          address_zh: "成都高新区",
          address_en: "Chengdu High-tech Zone",
          location: { latitude: 30.617, longitude: 104.0635 },
          business_hours_zh: "周一至周五",
          business_hours_en: "Mon-Fri",
          intro_zh: "初始草稿",
          intro_en: "Initial draft",
          recommended_reason_zh: null,
          recommended_reason_en: null,
          is_recommended: false,
          recommended_rank: 0,
          gallery_file_ids: [],
          gallery_urls: [],
          tencent_map_poi_id: "poi_admin_001",
          supports_navigation: true,
          supports_favorite: true,
          supports_share: true,
          status: "draft"
        })
      });
      const createData = await createResponse.json();

      expect(createResponse.status).toBe(201);
      expect(createData.data.category_level_1).toBe("community");
      expect(createData.data.tencent_map_poi_id).toBe("poi_admin_001");
      expect(createData.data.status).toBe("draft");

      const updateResponse = await fetch(
        `${baseUrl}/admin/places/${createData.data._id}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-mock-user-id": "user_001"
          },
          body: JSON.stringify({
            category_level_1: "health-wellness",
            category_level_2: "clinic",
            location: { latitude: 30.6182, longitude: 104.0651 },
            tencent_map_poi_id: "poi_admin_002",
            is_recommended: true,
            recommended_reason_zh: "后台推荐理由",
            recommended_reason_en: "Admin recommendation reason",
            recommended_rank: 3,
            status: "published"
          })
        }
      );
      const updateData = await updateResponse.json();

      expect(updateResponse.status).toBe(200);
      expect(updateData.data.category_level_1).toBe("health-wellness");
      expect(updateData.data.category_level_2).toBe("clinic");
      expect(updateData.data.location).toEqual({
        latitude: 30.6182,
        longitude: 104.0651
      });
      expect(updateData.data.tencent_map_poi_id).toBe("poi_admin_002");
      expect(updateData.data.is_recommended).toBe(true);
      expect(updateData.data.recommended_reason_en).toBe(
        "Admin recommendation reason"
      );
      expect(updateData.data.recommended_rank).toBe(3);
      expect(updateData.data.status).toBe("published");

      const adminListResponse = await fetch(`${baseUrl}/admin/places`, {
        headers: {
          "x-mock-user-id": "user_001"
        }
      });
      const adminListData = await adminListResponse.json();

      expect(adminListResponse.status).toBe(200);
      expect(
        adminListData.data.items.some(
          (item: { _id: string; category_level_1: string; status: string }) =>
            item._id === createData.data._id &&
            item.category_level_1 === "health-wellness" &&
            item.status === "published"
        )
      ).toBe(true);

      const detailResponse = await fetch(`${baseUrl}/places/${createData.data._id}`);
      const detailData = await detailResponse.json();

      expect(detailResponse.status).toBe(200);
      expect(detailData.data.category_level_1).toBe("health-wellness");
      expect(detailData.data.recommended_reason_zh).toBe("后台推荐理由");

      const markerResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markerData = await markerResponse.json();

      expect(markerResponse.status).toBe(200);
      expect(
        markerData.data.some(
          (item: { _id: string; category_level_1: string }) =>
            item._id === createData.data._id &&
            item.category_level_1 === "health-wellness"
        )
      ).toBe(true);
    } finally {
      await close();
    }
  });

  it("supports the places v1 query baseline", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const keywordResponse = await fetch(`${baseUrl}/places?keyword=cafe`);
      const keywordData = await keywordResponse.json();

      expect(keywordResponse.status).toBe(200);
      expect(keywordData.data.items).toHaveLength(1);
      expect(keywordData.data.items[0].name_en).toBe("Global Corner Cafe");
      expect(keywordData.data.items[0]).not.toHaveProperty("gallery_urls");
      expect(keywordData.data.items[0]).not.toHaveProperty("gallery_media");
      expect(keywordData.data.items[0]).not.toHaveProperty("navigation");
      expect(keywordData.data.items[0]).not.toHaveProperty("address_zh");

      const filteredResponse = await fetch(
        `${baseUrl}/places?communityId=tongzilin&category=public-service&tag=service&recommended=true&sort=recommended`
      );
      const filteredData = await filteredResponse.json();

      expect(filteredResponse.status).toBe(200);
      expect(filteredData.data.page).toBe(1);
      expect(filteredData.data.items.length).toBeGreaterThan(0);
      expect(
        filteredData.data.items.every(
          (item: {
            category_level_1: string;
            tag_ids: string[];
            is_recommended: boolean;
          }) =>
            item.category_level_1 === "public-service" &&
            item.tag_ids.includes("service") &&
            item.is_recommended
        )
      ).toBe(true);

      const emptyTagResponse = await fetch(`${baseUrl}/places?tag=missing-tag`);
      const emptyTagData = await emptyTagResponse.json();

      expect(emptyTagResponse.status).toBe(200);
      expect(emptyTagData.data.items).toEqual([]);
      expect(emptyTagData.data.total).toBe(0);

      const nameSortResponse = await fetch(`${baseUrl}/places?sort=name`);
      const nameSortData = await nameSortResponse.json();

      expect(nameSortResponse.status).toBe(200);
      expect(
        nameSortData.data.items.map((item: { name_en: string }) => item.name_en)
      ).toEqual(["Global Corner Cafe", "Tongzilin Community Center"]);

      const pagedResponse = await fetch(
        `${baseUrl}/places?page=2&pageSize=1&sort=name`
      );
      const pagedData = await pagedResponse.json();

      expect(pagedResponse.status).toBe(200);
      expect(pagedData.data.items).toHaveLength(1);
      expect(pagedData.data.page).toBe(2);
      expect(pagedData.data.pageSize).toBe(1);
      expect(pagedData.data.total).toBe(2);
      expect(pagedData.data.items[0].name_en).toBe(
        "Tongzilin Community Center"
      );

      const emptyResponse = await fetch(
        `${baseUrl}/places?communityId=other-community&page=1&pageSize=5`
      );
      const emptyData = await emptyResponse.json();

      expect(emptyResponse.status).toBe(200);
      expect(emptyData.data.items).toEqual([]);
      expect(emptyData.data.page).toBe(1);
      expect(emptyData.data.pageSize).toBe(5);
      expect(emptyData.data.total).toBe(0);

      const markerResponse = await fetch(`${baseUrl}/places/map-markers`);
      const markerData = await markerResponse.json();

      expect(markerResponse.status).toBe(200);
      expect(markerData.data).toHaveLength(2);
      expect(Object.keys(markerData.data[0]).sort()).toEqual([
        "_id",
        "category_level_1",
        "is_recommended",
        "location",
        "name_en",
        "name_zh"
      ]);
      expect(markerData.data.map((item: { _id: string }) => item._id)).toEqual([
        "place_001",
        "place_002"
      ]);
      expect(markerData.data[0]).not.toHaveProperty("gallery_urls");
      expect(markerData.data[0]).not.toHaveProperty("gallery_media");
      expect(markerData.data[0]).not.toHaveProperty("navigation");
      expect(markerData.data[0]).not.toHaveProperty("address_zh");

      const invalidSortResponse = await fetch(`${baseUrl}/places?sort=latest`);
      const invalidSortData = await invalidSortResponse.json();

      expect(invalidSortResponse.status).toBe(400);
      expect(invalidSortData.error.code).toBe("VALIDATION_ERROR");
    } finally {
      await close();
    }
  });
});
