import { defineContract } from "./define-contract";
import {
  CreateEventInputSchema,
  DeleteEventResponseSchema,
  CreateEventRegistrationInputSchema,
  EventAdminListItemSchema,
  EventAdminRegistrationRowSchema,
  EventListQuerySchema,
  EventWithRegistrationSchema,
  ReviewEventInputSchema,
  UpdateEventInputSchema,
  CheckinInputSchema
} from "../schemas/events";
import {
  EventRegistrationSchema,
  EventSchema,
  EventTicketSchema
} from "../schemas/entities";

export const eventContracts = {
  list: defineContract({
    method: "GET",
    path: "/events",
    request: EventListQuerySchema,
    response: EventSchema
  }),
  detail: defineContract({
    method: "GET",
    path: "/events/:id",
    response: EventSchema
  }),
  createRegistration: defineContract({
    method: "POST",
    path: "/events/:id/registrations",
    request: CreateEventRegistrationInputSchema,
    response: EventWithRegistrationSchema
  }),
  myRegistrations: defineContract({
    method: "GET",
    path: "/events/me/registrations",
    response: EventRegistrationSchema
  }),
  ticket: defineContract({
    method: "GET",
    path: "/events/registrations/:id/ticket",
    response: EventTicketSchema
  }),
  adminList: defineContract({
    method: "GET",
    path: "/admin/events",
    response: EventAdminListItemSchema
  }),
  adminCreate: defineContract({
    method: "POST",
    path: "/admin/events",
    request: CreateEventInputSchema,
    response: EventSchema
  }),
  adminUpdate: defineContract({
    method: "PATCH",
    path: "/admin/events/:id",
    request: UpdateEventInputSchema,
    response: EventSchema
  }),
  adminDelete: defineContract({
    method: "DELETE",
    path: "/admin/events/:id",
    response: DeleteEventResponseSchema
  }),
  adminReview: defineContract({
    method: "POST",
    path: "/admin/events/:id/review",
    request: ReviewEventInputSchema,
    response: EventSchema
  }),
  adminRegistrations: defineContract({
    method: "GET",
    path: "/admin/events/:id/registrations",
    response: EventAdminRegistrationRowSchema
  }),
  adminCheckin: defineContract({
    method: "POST",
    path: "/admin/events/:id/checkin",
    request: CheckinInputSchema,
    response: EventTicketSchema
  })
};
