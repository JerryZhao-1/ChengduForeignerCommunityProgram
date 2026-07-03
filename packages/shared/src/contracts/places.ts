import { z } from "zod";

import { defineContract } from "./define-contract";
import {
  CreatePlaceInputSchema,
  DeletePlaceResponseSchema,
  PlaceDetailSchema,
  PlaceAmapMediaSearchQuerySchema,
  PlaceAmapMediaSearchResponseSchema,
  PlaceListItemSchema,
  PlaceListQuerySchema,
  PlaceMapMarkerSchema,
  PlacePoiSearchQuerySchema,
  PlacePoiSearchResponseSchema,
  UpdatePlaceInputSchema
} from "../schemas/places";
import { PlaceSchema } from "../schemas/entities";

export const placeContracts = {
  list: defineContract({
    method: "GET",
    path: "/places",
    request: PlaceListQuerySchema,
    response: PlaceListItemSchema
  }),
  detail: defineContract({
    method: "GET",
    path: "/places/:id",
    response: PlaceDetailSchema
  }),
  mapMarkers: defineContract({
    method: "GET",
    path: "/places/map-markers",
    response: z.array(PlaceMapMarkerSchema)
  }),
  adminList: defineContract({
    method: "GET",
    path: "/admin/places",
    response: PlaceSchema
  }),
  adminPoiSearch: defineContract({
    method: "GET",
    path: "/admin/places/poi-search",
    request: PlacePoiSearchQuerySchema,
    response: PlacePoiSearchResponseSchema
  }),
  adminAmapMediaSearch: defineContract({
    method: "GET",
    path: "/admin/places/amap-media-search",
    request: PlaceAmapMediaSearchQuerySchema,
    response: PlaceAmapMediaSearchResponseSchema
  }),
  adminCreate: defineContract({
    method: "POST",
    path: "/admin/places",
    request: CreatePlaceInputSchema,
    response: PlaceSchema
  }),
  adminUpdate: defineContract({
    method: "PATCH",
    path: "/admin/places/:id",
    request: UpdatePlaceInputSchema,
    response: PlaceSchema
  }),
  adminDelete: defineContract({
    method: "DELETE",
    path: "/admin/places/:id",
    response: DeletePlaceResponseSchema
  })
};
