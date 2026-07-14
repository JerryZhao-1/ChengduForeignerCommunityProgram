import { defineContract } from "./define-contract";
import {
  CommunityPlanSchema,
  NewResidentPreferenceSchema
} from "../schemas/community-plans";

export const communityPlanContracts = {
  generate: defineContract({
    method: "POST",
    path: "/community-plan/generate",
    request: NewResidentPreferenceSchema,
    response: CommunityPlanSchema
  })
};
