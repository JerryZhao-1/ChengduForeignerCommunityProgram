import { createServer } from "node:http";

import { createApp } from "../src/app";

interface ApiSuccess<TData> {
  success: true;
  data: TData;
  requestId: string;
}

interface ApiFailure {
  success: false;
  error: { code: string; message: string; details?: unknown };
  requestId: string;
}

interface CommunityPlanItem {
  item_id: string;
  ref_id: string;
  ref_type: "place" | "event";
  type: "place_visit" | "event_attend";
  start_offset_minutes: number;
  duration_minutes: number;
  title_zh: string;
  title_en: string;
  status: "pending";
}

interface CommunityPlan {
  plan_id: string;
  community_id: string;
  total_duration_minutes: number;
  generation_source: "rule_based" | "ai_enhanced" | "rule_based_fallback";
  ai_status:
    | "ok"
    | "not_configured"
    | "timeout"
    | "validation_failed"
    | "upstream_error"
    | "unavailable";
  items: CommunityPlanItem[];
}

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

const validPreference = {
  preferred_language: "zh" as const,
  interests: ["community-service", "food-drink"],
  arrival_context: "first-week" as const,
  household_type: "solo" as const,
  accessibility_needs: []
};

describe("community-plan routes", () => {
  it("generates a deterministic plan for a guest judge without authentication", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/community-plan/generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-guest-mode": "judge"
        },
        body: JSON.stringify(validPreference)
      });
      const body = (await response.json()) as ApiSuccess<CommunityPlan>;

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(typeof body.requestId).toBe("string");
      expect(body.requestId.length).toBeGreaterThan(0);
      expect(body.data.community_id).toBe("tongzilin");
      expect(body.data.items).toHaveLength(2);
      expect(body.data.total_duration_minutes).toBe(120);
      expect(body.data.generation_source).toBe("rule_based");
      expect(body.data.ai_status).toBe("not_configured");
      const types = body.data.items.map((item) => item.type);
      expect(types).toContain("place_visit");
      expect(types).toContain("event_attend");
    } finally {
      await close();
    }
  });

  it("returns identical plans for identical preferences (determinism)", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const first = await fetch(`${baseUrl}/community-plan/generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-guest-mode": "judge"
        },
        body: JSON.stringify(validPreference)
      });
      const firstBody = (await first.json()) as ApiSuccess<CommunityPlan>;

      const second = await fetch(`${baseUrl}/community-plan/generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-guest-mode": "judge"
        },
        body: JSON.stringify(validPreference)
      });
      const secondBody = (await second.json()) as ApiSuccess<CommunityPlan>;

      expect(firstBody.data.plan_id).toBe(secondBody.data.plan_id);
      expect(firstBody.data.items.map((item) => item.ref_id)).toEqual(
        secondBody.data.items.map((item) => item.ref_id)
      );
    } finally {
      await close();
    }
  });

  it("rejects anonymous calls without the guest judge marker", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/community-plan/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validPreference)
      });
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("UNAUTHORIZED");
    } finally {
      await close();
    }
  });

  it("denies every other guest mutation with 403", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/notifications/n_001/read`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-guest-mode": "judge"
        },
        body: "{}"
      });
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(403);
      expect(body.error.code).toBe("FORBIDDEN");
    } finally {
      await close();
    }
  });

  it("limits the eleventh guest generation request in one minute", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const responses = [];
      for (let index = 0; index < 11; index += 1) {
        responses.push(
          await fetch(`${baseUrl}/community-plan/generate`, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-guest-mode": "judge",
              "x-forwarded-for": `203.0.113.${index}`
            },
            body: JSON.stringify(validPreference)
          })
        );
      }

      expect(
        responses.slice(0, 10).every((response) => response.status === 200)
      ).toBe(true);
      expect(responses[10].status).toBe(429);
      expect(responses[10].headers.get("x-ratelimit-limit")).toBe("10");
      expect(responses[10].headers.get("x-ratelimit-remaining")).toBe("0");
      const body = (await responses[10].json()) as ApiFailure;
      expect(body.error.code).toBe("RATE_LIMITED");
    } finally {
      await close();
    }
  });

  it("returns 400 VALIDATION_ERROR for empty interests", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/community-plan/generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-guest-mode": "judge"
        },
        body: JSON.stringify({
          ...validPreference,
          interests: []
        })
      });
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    } finally {
      await close();
    }
  });

  it("returns 400 VALIDATION_ERROR for an unknown field (strict schema)", async () => {
    const { baseUrl, close } = await createTestBaseUrl();

    try {
      const response = await fetch(`${baseUrl}/community-plan/generate`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-guest-mode": "judge"
        },
        body: JSON.stringify({
          ...validPreference,
          community_id: "tongzilin"
        })
      });
      const body = (await response.json()) as ApiFailure;

      expect(response.status).toBe(400);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    } finally {
      await close();
    }
  });
});
