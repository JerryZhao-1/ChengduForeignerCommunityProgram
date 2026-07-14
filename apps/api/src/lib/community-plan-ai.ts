import { z } from "zod";

import {
  AI_GENERATOR_ID,
  CommunityPlanSchema,
  createCommunityPlanAIEnhancementSchema,
  type CommunityPlan,
  type NewResidentPreference
} from "@community-map/shared";

const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";
const DEFAULT_TIMEOUT_MS = 8_000;

const DeepSeekResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        finish_reason: z.string().nullable(),
        message: z.object({ content: z.string().nullable() })
      })
    )
    .min(1),
  usage: z.object({
    prompt_tokens: z.number().int().nonnegative(),
    completion_tokens: z.number().int().nonnegative(),
    total_tokens: z.number().int().positive()
  })
});

type FallbackStatus =
  | "timeout"
  | "validation_failed"
  | "upstream_error"
  | "unavailable";

const fallbackPlan = (
  plan: CommunityPlan,
  aiStatus: FallbackStatus
): CommunityPlan => {
  const withoutUsage: Partial<CommunityPlan> = { ...plan };
  delete withoutUsage.usage;
  return CommunityPlanSchema.parse({
    ...withoutUsage,
    generation_source: "rule_based_fallback",
    ai_status: aiStatus,
    generated_by: "tongzilin-rule-engine-v1-fallback"
  });
};

const timeoutFromEnvironment = () => {
  const parsed = Number(process.env.COMMUNITY_PLAN_AI_TIMEOUT_MS);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIMEOUT_MS;
};

const buildPromptInput = (
  plan: CommunityPlan,
  preference: NewResidentPreference
) => ({
  preference: {
    preferred_language: preference.preferred_language,
    interests: preference.interests,
    arrival_context: preference.arrival_context,
    household_type: preference.household_type
  },
  items: plan.items.map((item) => ({
    item_id: item.item_id,
    type: item.type,
    title_zh: item.title_zh,
    title_en: item.title_en,
    projection: item.type === "place_visit" ? item.place : item.event
  }))
});

export interface CommunityPlanAiOptions {
  fetchImpl?: typeof fetch;
  apiKey?: string;
  enabled?: boolean;
  timeoutMs?: number;
}

export const enhanceCommunityPlanNarration = async (
  plan: CommunityPlan,
  preference: NewResidentPreference,
  options: CommunityPlanAiOptions = {}
): Promise<CommunityPlan> => {
  const enabled =
    options.enabled ?? process.env.COMMUNITY_PLAN_AI_ENABLED === "true";
  if (!enabled) {
    return plan;
  }

  const apiKey = options.apiKey ?? process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return fallbackPlan(plan, "unavailable");
  }

  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs ?? timeoutFromEnvironment());

  try {
    const response = await (options.fetchImpl ?? fetch)(DEEPSEEK_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        thinking: { type: "disabled" },
        stream: false,
        response_format: { type: "json_object" },
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content:
              'Return JSON only with shape {"items":[{"item_id":string,"summary_zh":string,"summary_en":string,"tips_zh":string,"tips_en":string}]}. Preserve every item_id exactly and provide narration only.'
          },
          {
            role: "user",
            content: JSON.stringify(buildPromptInput(plan, preference))
          }
        ]
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      return fallbackPlan(
        plan,
        response.status === 401 || response.status === 402
          ? "unavailable"
          : "upstream_error"
      );
    }

    const parsedResponse = DeepSeekResponseSchema.safeParse(
      await response.json()
    );
    if (!parsedResponse.success) {
      return fallbackPlan(plan, "validation_failed");
    }

    const [choice] = parsedResponse.data.choices;
    if (choice.finish_reason !== "stop" || !choice.message.content?.trim()) {
      return fallbackPlan(plan, "validation_failed");
    }

    let rawEnhancement: unknown;
    try {
      rawEnhancement = JSON.parse(choice.message.content);
    } catch {
      return fallbackPlan(plan, "validation_failed");
    }

    const enhancement = createCommunityPlanAIEnhancementSchema(
      plan.items.map((item) => item.item_id)
    ).safeParse(rawEnhancement);
    if (!enhancement.success) {
      return fallbackPlan(plan, "validation_failed");
    }

    return CommunityPlanSchema.parse({
      ...plan,
      items: plan.items.map((item) => {
        const narration = enhancement.data.items.find(
          (candidate) => candidate.item_id === item.item_id
        );
        return narration ? { ...item, ...narration } : item;
      }),
      generation_source: "ai_enhanced",
      ai_status: "ok",
      generated_by: AI_GENERATOR_ID,
      usage: parsedResponse.data.usage
    });
  } catch {
    return fallbackPlan(plan, timedOut ? "timeout" : "upstream_error");
  } finally {
    clearTimeout(timer);
  }
};
