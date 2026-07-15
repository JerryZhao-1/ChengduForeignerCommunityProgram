import {
  COMMUNITY_PLAN_CATALOG_VERSION,
  CommunityPlanCatalogBundleSchema
} from "../schemas/community-plans";
import {
  filterEventCandidates,
  filterPlaceCandidates,
  projectEvent,
  projectPlace
} from "../community-plan/engine";
import { COMMUNITY_PLAN_FEEDBACK_CATALOG } from "../community-plan/narration";
import { createMockDataset } from "./data";

export const COMMUNITY_PLAN_DEMO_EVENT_ID = "event_001";
export const COMPETITION_CATALOG_NOW = "2027-04-02T09:00:00+08:00";

const dataset = createMockDataset();

const curatedBundle = {
  catalog_version: COMMUNITY_PLAN_CATALOG_VERSION,
  feedback_catalog: COMMUNITY_PLAN_FEEDBACK_CATALOG,
  curated_event_id: COMMUNITY_PLAN_DEMO_EVENT_ID,
  places: filterPlaceCandidates(
    dataset.places
      .filter(
        (place) =>
          place.community_id === "tongzilin" && place.status === "published"
      )
      .map(projectPlace)
  ),
  events: filterEventCandidates(
    dataset.events
      .filter(
        (event) =>
          event.community_id === "tongzilin" &&
          event.review_status === "approved" &&
          event.publish_status === "published"
      )
      .map(projectEvent),
    COMPETITION_CATALOG_NOW
  )
};

export const communityPlanCatalogBundle =
  CommunityPlanCatalogBundleSchema.parse(curatedBundle);
