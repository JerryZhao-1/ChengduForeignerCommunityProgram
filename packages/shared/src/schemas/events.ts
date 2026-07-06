import { z } from "zod";

import { EVENT_PUBLISH_STATUSES, EVENT_REVIEW_STATUSES } from "../enums";
import {
  EventRegistrationSchema,
  EventSchema,
  EventTicketSchema
} from "./entities";

export const EventListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  communityId: z.string().default("tongzilin"),
  keyword: z.string().trim().optional()
});

export const CreateEventInputSchema = EventSchema.pick({
  title_zh: true,
  title_en: true,
  summary_zh: true,
  summary_en: true,
  content_zh: true,
  content_en: true,
  address_text: true,
  location: true,
  start_time: true,
  end_time: true,
  signup_deadline: true,
  capacity: true
}).extend({
  place_id: z.string().optional(),
  cover_file_id: z.string().nullable().optional(),
  cover_cloud_path: z.string().nullable().optional(),
  cover_url: z.string().url().optional()
});

export const UpdateEventInputSchema = CreateEventInputSchema.partial();

export const ReviewEventInputSchema = z.object({
  review_status: z.enum(EVENT_REVIEW_STATUSES),
  publish_status: z.enum(EVENT_PUBLISH_STATUSES).optional(),
  reason: z.string().optional()
});

export const CreateEventRegistrationInputSchema = z.object({
  contact_name: z.string().min(1),
  contact_phone: z.string().min(6),
  attendee_count: z.number().int().min(1).max(10),
  source_channel: z.string().default("miniapp")
});

export const CheckinInputSchema = z.object({
  ticket_id: z.string(),
  note: z.string().optional()
});

export const EventWithRegistrationSchema = z.object({
  registration: EventRegistrationSchema,
  ticket: EventTicketSchema
});

export const EventAdminListItemSchema = EventSchema.extend({
  active_registration_count: z.number().int().min(0),
  confirmed_attendee_count: z.number().int().min(0),
  remaining_capacity: z.number().int().min(0),
  is_full: z.boolean()
});

export const EventAdminRegistrationRowSchema = EventRegistrationSchema.extend({
  ticket_code: z.string().nullable(),
  ticket_status: EventTicketSchema.shape.status.nullable(),
  ticket_used_at: z.string().nullable()
});
