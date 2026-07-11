import { defineContract } from "./define-contract";
import {
  AdminLoginRequestSchema,
  AuthPreferencesSchema,
  LoginRequestSchema,
  UpdateAuthPreferencesInputSchema,
  WechatMiniappSessionRequestSchema
} from "../schemas/auth";
import { AuthSessionSchema } from "../schemas/entities";

export const authContracts = {
  login: defineContract({
    method: "POST",
    path: "/auth/login",
    request: LoginRequestSchema,
    response: AuthSessionSchema
  }),
  adminLogin: defineContract({
    method: "POST",
    path: "/auth/admin/login",
    request: AdminLoginRequestSchema,
    response: AuthSessionSchema
  }),
  me: defineContract({
    method: "GET",
    path: "/auth/me",
    response: AuthSessionSchema
  }),
  preferences: defineContract({
    method: "GET",
    path: "/auth/preferences",
    response: AuthPreferencesSchema
  }),
  updatePreferences: defineContract({
    method: "PATCH",
    path: "/auth/preferences",
    request: UpdateAuthPreferencesInputSchema,
    response: AuthPreferencesSchema
  }),
  wechatMiniappSession: defineContract({
    method: "POST",
    path: "/auth/wechat-miniapp/session",
    request: WechatMiniappSessionRequestSchema,
    response: AuthSessionSchema
  })
};
