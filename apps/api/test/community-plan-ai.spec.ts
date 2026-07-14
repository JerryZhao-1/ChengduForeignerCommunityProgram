import {
  communityPlanOfflineBundle,
  type NewResidentPreference
} from "@community-map/shared";
import { describe, expect, it, vi } from "vitest";

import { enhanceCommunityPlanNarration } from "../src/lib/community-plan-ai";

const preference: NewResidentPreference = {
  preferred_language: "en",
  interests: ["social"],
  arrival_context: "first-week",
  household_type: "solo",
  accessibility_needs: ["wheelchair"]
};

const successPayload = {
  choices: [
    {
      finish_reason: "stop",
      message: {
        content: JSON.stringify({
          items: communityPlanOfflineBundle.plan.items.map((item) => ({
            item_id: item.item_id,
            summary_zh: `增强摘要 ${item.item_id}`,
            summary_en: `Enhanced summary ${item.item_id}`,
            tips_zh: `增强提示 ${item.item_id}`,
            tips_en: `Enhanced tip ${item.item_id}`
          }))
        })
      }
    }
  ],
  usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
};

describe("Community Plan DeepSeek narration", () => {
  it("merges only validated narration and excludes accessibility input", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(successPayload), {
        status: 200,
        headers: { "content-type": "application/json" }
      })
    );

    const result = await enhanceCommunityPlanNarration(
      communityPlanOfflineBundle.plan,
      preference,
      { enabled: true, apiKey: "test-secret", fetchImpl }
    );

    expect(result.generation_source).toBe("ai_enhanced");
    expect(result.ai_status).toBe("ok");
    expect(result.usage?.total_tokens).toBe(30);
    expect(result.items.map((item) => item.ref_id)).toEqual(
      communityPlanOfflineBundle.plan.items.map((item) => item.ref_id)
    );

    const request = fetchImpl.mock.calls[0][1] as RequestInit;
    const body = String(request.body);
    expect(body).toContain('"model":"deepseek-v4-flash"');
    expect(body).toContain('"thinking":{"type":"disabled"}');
    expect(body).not.toContain("wheelchair");
  });

  it("maps missing credentials and HTTP 401/402 to unavailable", async () => {
    const missingKey = await enhanceCommunityPlanNarration(
      communityPlanOfflineBundle.plan,
      preference,
      { enabled: true, apiKey: "" }
    );
    expect(missingKey.ai_status).toBe("unavailable");

    for (const status of [401, 402]) {
      const result = await enhanceCommunityPlanNarration(
        communityPlanOfflineBundle.plan,
        preference,
        {
          enabled: true,
          apiKey: "test-secret",
          fetchImpl: vi.fn().mockResolvedValue(new Response("{}", { status }))
        }
      );
      expect(result.ai_status).toBe("unavailable");
    }
  });

  it("maps upstream and invalid output failures without changing structure", async () => {
    const upstream = await enhanceCommunityPlanNarration(
      communityPlanOfflineBundle.plan,
      preference,
      {
        enabled: true,
        apiKey: "test-secret",
        fetchImpl: vi
          .fn()
          .mockResolvedValue(new Response("{}", { status: 503 }))
      }
    );
    expect(upstream.ai_status).toBe("upstream_error");

    const invalid = await enhanceCommunityPlanNarration(
      communityPlanOfflineBundle.plan,
      preference,
      {
        enabled: true,
        apiKey: "test-secret",
        fetchImpl: vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({
              ...successPayload,
              choices: [{ finish_reason: "length", message: { content: "{}" } }]
            }),
            { status: 200 }
          )
        )
      }
    );
    expect(invalid.ai_status).toBe("validation_failed");
    expect(invalid.items.map((item) => item.ref_id)).toEqual(
      communityPlanOfflineBundle.plan.items.map((item) => item.ref_id)
    );
  });

  it("aborts a timed-out request and returns deterministic fallback", async () => {
    let aborted = false;
    const fetchImpl = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            aborted = true;
            reject(new DOMException("Aborted", "AbortError"));
          });
        })
    ) as unknown as typeof fetch;

    const result = await enhanceCommunityPlanNarration(
      communityPlanOfflineBundle.plan,
      preference,
      { enabled: true, apiKey: "test-secret", fetchImpl, timeoutMs: 5 }
    );

    expect(aborted).toBe(true);
    expect(result.ai_status).toBe("timeout");
    expect(result.generation_source).toBe("rule_based_fallback");
  });
});
