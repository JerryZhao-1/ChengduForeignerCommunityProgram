import { z } from "zod";

import { EventRegistrationSchema, EventSchema, EventTicketSchema } from "./entities";

export const EVENT_CONTACT_NAME_PATTERN = /^[\p{L}\p{M}]+(?: [\p{L}\p{M}]+)*$/u;
export const EVENT_CONTACT_PHONE_PATTERN = /^\+\d{2} \d{4} \d{6}$/;

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
  cover_file_id: z.string().optional(),
  cover_cloud_path: z.string().optional(),
  cover_url: z.string().url().optional()
});

export const UpdateEventInputSchema = CreateEventInputSchema.partial();

export const ReviewEventInputSchema = z.object({
  review_status: z.enum(["approved", "rejected", "pending_review"]),
  publish_status: z.enum(["draft", "published", "offline"]).optional(),
  reason: z.string().optional()
});

export const CreateEventRegistrationInputSchema = z.object({
  contact_name: z.string().trim().min(1).regex(EVENT_CONTACT_NAME_PATTERN),
  contact_phone: z.string().trim().regex(EVENT_CONTACT_PHONE_PATTERN),
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
