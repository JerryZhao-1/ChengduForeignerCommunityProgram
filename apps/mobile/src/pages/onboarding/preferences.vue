<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

import { getMobileCopy } from "@/i18n";
import { interpolate } from "@/i18n/localized";
import { generateCommunityPlanForGuest } from "@/api/community-plan-adapter";
import {
  ACCESSIBILITY_NEED_OPTIONS,
  ARRIVAL_CONTEXT_OPTIONS,
  buildPreferenceFromDraft,
  HOUSEHOLD_TYPE_OPTIONS,
  INTEREST_OPTIONS,
  isPreferenceComplete,
  useOnboardingStore
} from "@/stores/onboarding-store";
import { useAppStore } from "@/stores/app-store";

const app = useAppStore();
const onboarding = useOnboardingStore();
const copy = computed(
  () => getMobileCopy(onboarding.state.draft.preferred_language).onboarding
);

const generatingStepIndex = ref(0);
const generatingSteps = computed(() => [
  copy.value.generating.checkTime,
  copy.value.generating.matchPlaces,
  copy.value.generating.organizeTips,
  copy.value.generating.prepareRoute
]);

const stepNumber = computed(() => {
  const step = onboarding.state.step;
  if (step === "preferences-1") return 1;
  if (step === "preferences-2") return 2;
  if (step === "preferences-3") return 3;
  if (step === "preferences-4") return 4;
  return 0;
});

const stepTitle = computed(() => {
  switch (onboarding.state.step) {
    case "preferences-1":
      return copy.value.step1Title;
    case "preferences-2":
      return copy.value.step2Title;
    case "preferences-3":
      return copy.value.step3Title;
    case "preferences-4":
      return copy.value.step4Title;
    default:
      return "";
  }
});

const canProceed = computed(() => {
  const draft = onboarding.state.draft;
  switch (onboarding.state.step) {
    case "preferences-1":
      return draft.preferred_language !== null;
    case "preferences-2":
      return draft.primary_interest !== null;
    case "preferences-3":
      return draft.arrival_context !== null && draft.household_type !== null;
    case "preferences-4":
      return isPreferenceComplete(draft);
    default:
      return false;
  }
});

const generationErrorText = computed(() => {
  const key = onboarding.state.planErrorKey;
  return key ? copy.value.plan[key] : "";
});

const generationErrorRequestId = computed(() =>
  onboarding.state.planErrorRequestId
    ? interpolate(copy.value.plan.requestId, {
        requestId: onboarding.state.planErrorRequestId
      })
    : ""
);

const selectInterest = (interest: (typeof INTEREST_OPTIONS)[number]) =>
  onboarding.updateDraft({ primary_interest: interest });

const selectAccessibilityNeed = (
  need: (typeof ACCESSIBILITY_NEED_OPTIONS)[number]
) => onboarding.updateDraft({ accessibility_need: need });

const isInterestSelected = (interest: string) =>
  onboarding.state.draft.primary_interest === interest;

const isAccessibilityNeedSelected = (need: string) =>
  onboarding.state.draft.accessibility_need === need;

const selectLanguage = async (language: "zh" | "en") => {
  onboarding.updateDraft({ preferred_language: language });
  await app.setLocale(language);
};

const next = () => {
  if (!canProceed.value) return;
  onboarding.nextStep();
};

const back = () => {
  onboarding.previousStep();
};

const submit = async () => {
  if (!isPreferenceComplete(onboarding.state.draft)) return;
  const preference = buildPreferenceFromDraft(onboarding.state.draft);
  await app.setLocale(preference.preferred_language);
  onboarding.setGenerating();
  const result = await generateCommunityPlanForGuest(preference);

  if (result.status === "success" || result.status === "fallback") {
    onboarding.setPlan(result.plan as never, result.deliveryMode);
    uni.redirectTo({ url: "/pages/onboarding/plan" });
  } else if (result.errorKey) {
    onboarding.setGenerationError(result.errorKey, result.requestId);
  }
};

const useExample = async () => {
  onboarding.useExamplePreference();
  await app.setLocale(onboarding.state.draft.preferred_language);
};

// Simulated progressive loading steps for the generating state
let generatingTimer: ReturnType<typeof setInterval> | null = null;

watch(
  () => onboarding.state.step,
  (step) => {
    if (step === "generating") {
      generatingStepIndex.value = 0;
      generatingTimer = setInterval(() => {
        generatingStepIndex.value = Math.min(
          generatingStepIndex.value + 1,
          generatingSteps.value.length - 1
        );
      }, 600);
    } else if (generatingTimer) {
      clearInterval(generatingTimer);
      generatingTimer = null;
    }
  }
);

onMounted(() => {
  if (onboarding.state.step === "plan" && onboarding.state.plan) {
    uni.redirectTo({ url: "/pages/onboarding/plan" });
    return;
  }
  if (
    !onboarding.state.step.startsWith("preferences-") &&
    onboarding.state.step !== "generating"
  ) {
    uni.redirectTo({ url: "/pages/onboarding/welcome" });
  }
});

onUnmounted(() => {
  if (generatingTimer) {
    clearInterval(generatingTimer);
    generatingTimer = null;
  }
});
</script>

<template>
  <!-- #ifdef H5 -->
  <scroll-view scroll-y enable-flex class="page-scroll">
    <view class="page">
      <!-- Generating state -->
      <view v-if="onboarding.state.step === 'generating'" class="generating">
        <view class="generating-title">{{ copy.generating.title }}</view>
        <view class="generating-steps">
          <view
            v-for="(step, index) in generatingSteps"
            :key="step"
            class="generating-step"
            :class="{
              active: index <= generatingStepIndex,
              done: index < generatingStepIndex
            }"
          >
            <view class="step-indicator">
              <text v-if="index < generatingStepIndex">✓</text>
              <text v-else-if="index === generatingStepIndex">·</text>
            </view>
            <view class="step-label">{{ step }}</view>
          </view>
        </view>
      </view>

      <!-- Preference steps -->
      <view v-else class="preferences">
        <view class="header">
          <view class="step-indicator-text">
            {{
              interpolate(copy.stepIndicator, {
                current: stepNumber,
                total: 4
              })
            }}
          </view>
          <view class="step-title">{{ stepTitle }}</view>
        </view>

        <!-- Step 1: Language + Community -->
        <view
          v-if="onboarding.state.step === 'preferences-1'"
          class="step-content"
        >
          <view class="option-group">
            <view class="option-label">{{ copy.step1Title }}</view>
            <view class="option-row">
              <div
                class="option-chip"
                :class="{
                  selected: onboarding.state.draft.preferred_language === 'zh'
                }"
                role="radio"
                tabindex="0"
                :aria-checked="
                  onboarding.state.draft.preferred_language === 'zh'
                "
                @click="selectLanguage('zh')"
                @keyup.enter="selectLanguage('zh')"
                @keyup.space.prevent="selectLanguage('zh')"
              >
                {{ copy.languageZh }}
              </div>
              <div
                class="option-chip"
                :class="{
                  selected: onboarding.state.draft.preferred_language === 'en'
                }"
                role="radio"
                tabindex="0"
                :aria-checked="
                  onboarding.state.draft.preferred_language === 'en'
                "
                @click="selectLanguage('en')"
                @keyup.enter="selectLanguage('en')"
                @keyup.space.prevent="selectLanguage('en')"
              >
                {{ copy.languageEn }}
              </div>
            </view>
          </view>
          <view class="option-group">
            <view class="option-label">{{ copy.communityManualHint }}</view>
            <view class="community-display">{{ copy.communityDefault }}</view>
          </view>
        </view>

        <!-- Step 2: Primary interest -->
        <view
          v-if="onboarding.state.step === 'preferences-2'"
          class="step-content"
        >
          <view class="option-hint">{{ copy.step2Hint }}</view>
          <view class="chip-grid">
            <div
              v-for="interest in INTEREST_OPTIONS"
              :key="interest"
              class="option-chip"
              :class="{ selected: isInterestSelected(interest) }"
              role="radio"
              tabindex="0"
              :aria-checked="isInterestSelected(interest)"
              @click="selectInterest(interest)"
              @keyup.enter="selectInterest(interest)"
              @keyup.space.prevent="selectInterest(interest)"
            >
              {{ copy.primaryInterests[interest] }}
            </div>
          </view>
        </view>

        <!-- Step 3: Arrival context + Household type -->
        <view
          v-if="onboarding.state.step === 'preferences-3'"
          class="step-content"
        >
          <view class="option-group">
            <view class="option-label">{{ copy.step3Title }}</view>
            <view class="chip-grid">
              <div
                v-for="ctx in ARRIVAL_CONTEXT_OPTIONS"
                :key="ctx"
                class="option-chip"
                :class="{
                  selected: onboarding.state.draft.arrival_context === ctx
                }"
                role="radio"
                tabindex="0"
                :aria-checked="onboarding.state.draft.arrival_context === ctx"
                @click="onboarding.updateDraft({ arrival_context: ctx })"
                @keyup.enter="
                  onboarding.updateDraft({ arrival_context: ctx })
                "
                @keyup.space.prevent="
                  onboarding.updateDraft({ arrival_context: ctx })
                "
              >
                {{ copy.arrivalContexts[ctx] }}
              </div>
            </view>
          </view>
          <view class="option-group">
            <view class="option-label">{{ copy.householdTitle }}</view>
            <view class="chip-grid">
              <div
                v-for="ht in HOUSEHOLD_TYPE_OPTIONS"
                :key="ht"
                class="option-chip"
                :class="{
                  selected: onboarding.state.draft.household_type === ht
                }"
                role="radio"
                tabindex="0"
                :aria-checked="onboarding.state.draft.household_type === ht"
                @click="onboarding.updateDraft({ household_type: ht })"
                @keyup.enter="
                  onboarding.updateDraft({ household_type: ht })
                "
                @keyup.space.prevent="
                  onboarding.updateDraft({ household_type: ht })
                "
              >
                {{ copy.householdTypes[ht] }}
              </div>
            </view>
          </view>
        </view>

        <!-- Step 4: Accessibility or environment preference + submit -->
        <view
          v-if="onboarding.state.step === 'preferences-4'"
          class="step-content"
        >
          <view class="option-hint">{{ copy.step4Hint }}</view>
          <view class="chip-grid">
            <div
              v-for="need in ACCESSIBILITY_NEED_OPTIONS"
              :key="need"
              class="option-chip"
              :class="{ selected: isAccessibilityNeedSelected(need) }"
              role="radio"
              tabindex="0"
              :aria-checked="isAccessibilityNeedSelected(need)"
              @click="selectAccessibilityNeed(need)"
              @keyup.enter="selectAccessibilityNeed(need)"
              @keyup.space.prevent="selectAccessibilityNeed(need)"
            >
              {{ copy.accessibilityNeeds[need] }}
            </div>
          </view>
          <view v-if="generationErrorText" class="error-message">
            <view>{{ generationErrorText }}</view>
            <view v-if="generationErrorRequestId" class="error-request-id">
              {{ generationErrorRequestId }}
            </view>
          </view>
          <view class="example-row">
            <div
              class="example-button"
              role="button"
              tabindex="0"
              @click="useExample"
              @keyup.enter="useExample"
              @keyup.space.prevent="useExample"
            >
              {{ copy.useExample }}
            </div>
          </view>
        </view>

        <!-- Navigation buttons -->
        <view class="nav-buttons">
          <div
            class="nav-button back"
            role="button"
            tabindex="0"
            @click="back"
            @keyup.enter="back"
            @keyup.space.prevent="back"
          >
            {{ copy.back }}
          </div>
          <div
            v-if="stepNumber < 4"
            class="nav-button next"
            :class="{ disabled: !canProceed }"
            role="button"
            :tabindex="canProceed ? 0 : -1"
            :aria-disabled="!canProceed"
            @click="next"
            @keyup.enter="next"
            @keyup.space.prevent="next"
          >
            {{ copy.next }}
          </div>
          <div
            v-else
            class="nav-button submit"
            :class="{ disabled: !canProceed }"
            role="button"
            :tabindex="canProceed ? 0 : -1"
            :aria-disabled="!canProceed"
            @click="submit"
            @keyup.enter="submit"
            @keyup.space.prevent="submit"
          >
            {{ copy.submit }}
          </div>
        </view>
      </view>
    </view>
  </scroll-view>
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <view class="mp-only">
    <view class="mp-only-title">{{ copy.mpOnly.title }}</view>
    <view class="mp-only-description">{{ copy.mpOnly.description }}</view>
  </view>
  <!-- #endif -->
</template>

<style scoped>
.page-scroll {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  background: #f6f0e5;
}

.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  max-width: 750rpx;
  margin: 0 auto;
}

/* Generating state */
.generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 48rpx;
  padding: 96rpx 32rpx;
}

.generating-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #263331;
  font-family: "Fraunces", "Songti SC", serif;
}

.generating-steps {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
  width: 100%;
}

.generating-step {
  display: flex;
  align-items: center;
  gap: 24rpx;
  opacity: 0.4;
  transition: opacity 0.3s;
}

.generating-step.active {
  opacity: 1;
}

.step-indicator {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  border: 2rpx solid #0f766e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #0f766e;
}

.generating-step.done .step-indicator {
  background: #0f766e;
  color: #ffffff;
}

.step-label {
  font-size: 28rpx;
  color: #263331;
}

/* Preferences */
.preferences {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.step-indicator-text {
  font-size: 24rpx;
  color: #5c6b68;
  letter-spacing: 0.1em;
}

.step-title {
  font-size: 40rpx;
  font-weight: 600;
  line-height: 1.3;
  color: #263331;
  font-family: "Fraunces", "Songti SC", serif;
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.option-label {
  font-size: 28rpx;
  color: #5c6b68;
  font-weight: 500;
}

.option-hint {
  font-size: 26rpx;
  color: #8fa09d;
}

.community-display {
  padding: 24rpx;
  border-radius: 16rpx;
  background: #fbf8f1;
  border: 1rpx solid #e5ddd0;
  font-size: 30rpx;
  color: #263331;
  font-weight: 500;
}

.option-row {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-chip {
  padding: 20rpx 32rpx;
  border-radius: 16rpx;
  background: #fbf8f1;
  border: 1rpx solid #e5ddd0;
  font-size: 28rpx;
  color: #263331;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-chip.selected {
  background: #0f766e;
  border-color: #0f766e;
  color: #ffffff;
}

.option-chip:focus-visible {
  outline: 4rpx solid #d39a3a;
  outline-offset: 4rpx;
}

.error-message {
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  background: #fce8e0;
  color: #b91c1c;
  font-size: 26rpx;
}

.error-request-id {
  margin-top: 8rpx;
  font-size: 22rpx;
  opacity: 0.8;
}

.mp-only {
  min-height: 100vh;
  padding: 96rpx 40rpx;
  box-sizing: border-box;
  background: #f6f0e5;
}

.mp-only-title {
  font-size: 40rpx;
  font-weight: 600;
  color: #263331;
}

.mp-only-description {
  margin-top: 24rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #5c6b68;
}

.example-row {
  display: flex;
  justify-content: center;
}

.example-button {
  padding: 16rpx 32rpx;
  border-radius: 12rpx;
  background: #e8f4f2;
  color: #123b3a;
  font-size: 26rpx;
  font-weight: 500;
}

.example-button:focus-visible,
.nav-button:focus-visible {
  outline: 4rpx solid #d39a3a;
  outline-offset: 4rpx;
}

.nav-buttons {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.nav-button {
  flex: 1;
  padding: 28rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 30rpx;
  font-weight: 600;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-button.back {
  background: #fbf8f1;
  border: 1rpx solid #e5ddd0;
  color: #5c6b68;
}

.nav-button.next,
.nav-button.submit {
  background: #0f766e;
  color: #ffffff;
}

.nav-button.disabled {
  opacity: 0.4;
}
</style>
