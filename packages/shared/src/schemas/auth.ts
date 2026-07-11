import { z } from "zod";

import { LocaleSchema } from "./common";

export const LoginRequestSchema = z.object({
  code: z.string().optional(),
  mock_user_id: z.string().optional(),
  preferred_language: LocaleSchema.optional()
});

export const AdminLoginRequestSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

export const WechatMiniappSessionRequestSchema = z.object({
  preferred_language: LocaleSchema.optional()
});

export const AuthPreferencesSchema = z.object({
  preferred_language: LocaleSchema
});

export const UpdateAuthPreferencesInputSchema = AuthPreferencesSchema;
