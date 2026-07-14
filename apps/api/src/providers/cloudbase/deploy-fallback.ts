import {
  createCompetitionDemoEngineInput,
  generateCommunityPlan,
  type Announcement,
  type AuthSession,
  type User
} from "@community-map/shared";

import { apiError } from "../../lib/errors";
import type { ApiProvider } from "../types";

const page = <TItem>(items: TItem[] = []) => ({
  items,
  page: 1,
  pageSize: 20,
  total: items.length
});

const users: Record<string, User> = {
  user_001: {
    _id: "user_001",
    openid: "openid_001",
    unionid: "unionid_001",
    nickname: "Jerry",
    avatar_url: "https://static.cloudbase.net/cloudbase-logo.svg",
    preferred_language: "zh",
    role_flags: ["user", "community_admin", "system_admin"],
    status: "active"
  },
  user_002: {
    _id: "user_002",
    openid: "openid_002",
    unionid: "unionid_002",
    nickname: "Emma",
    avatar_url: "https://static.cloudbase.net/cloudbase-logo.svg",
    preferred_language: "en",
    role_flags: ["user"],
    status: "active"
  }
};

const session = (user: User): AuthSession => ({
  user,
  token: `deploy-fallback-${user._id}`
});

const unsupported = async (): Promise<never> => {
  throw apiError(
    "NOT_IMPLEMENTED",
    "Fallback provider path is unavailable.",
    501
  );
};

export const createMockProvider = (): ApiProvider => ({
  auth: {
    async resolveActor(userId = "user_001") {
      const user = users[userId];
      if (!user) {
        throw apiError("UNAUTHORIZED", "Invalid actor.", 401);
      }
      return user;
    },
    async login(input) {
      return session(await this.resolveActor(input.mock_user_id));
    },
    async adminLogin() {
      return session(await this.resolveActor("user_001"));
    },
    async me(userId) {
      return session(await this.resolveActor(userId));
    },
    async preferences(userId) {
      const user = await this.resolveActor(userId);
      return { preferred_language: user.preferred_language };
    },
    async updatePreferences(userId, preferredLanguage) {
      const user = await this.resolveActor(userId);
      user.preferred_language = preferredLanguage;
      return { preferred_language: user.preferred_language };
    },
    async wechatMiniappSession(input) {
      return session(
        await this.resolveActor(input.identity?.openid ?? "user_001")
      );
    }
  },
  events: {
    list: async () => page(),
    listAdmin: async () => page(),
    detail: async () => null,
    listRegistrationsForAdmin: async () => [],
    createRegistration: unsupported,
    listMyRegistrations: async () => [],
    getTicketByRegistration: async () => null,
    create: unsupported,
    update: unsupported,
    delete: unsupported,
    uploadCoverFile: unsupported,
    review: unsupported,
    checkin: unsupported
  },
  posts: {
    list: async () => page(),
    listAdmin: async () => page(),
    listMine: async () => page(),
    listLiked: async () => page(),
    listFavorited: async () => page(),
    meGovernance: unsupported,
    detail: async () => null,
    updateOps: unsupported,
    listPublicTags: async () => page(),
    createTag: unsupported,
    listTags: async () => page(),
    upsertTag: unsupported,
    interaction: unsupported,
    setLike: unsupported,
    setFavorite: unsupported,
    recordShare: unsupported,
    profile: async () => null,
    setProfileFollow: unsupported,
    listProfileFollowers: async () => null,
    listProfileFollowing: async () => null,
    listComments: async () => page(),
    listAdminComments: async () => page(),
    listMyComments: async () => page(),
    detailMyComment: async () => null,
    create: unsupported,
    createComment: unsupported,
    report: unsupported,
    reportComment: unsupported,
    moderate: unsupported,
    permanentlyDelete: unsupported,
    moderateComment: unsupported,
    listRelatedByPlace: async () => page(),
    listRelatedByEvent: async () => page(),
    listReportCases: async () => page(),
    listMyReportCases: async () => page(),
    detailMyReportCase: async () => null,
    detailReportCase: async () => null,
    resolveReportCase: unsupported,
    listGovernanceUsers: async () => page(),
    detailGovernanceUser: unsupported,
    enforceUser: unsupported,
    listAuditRecords: async () => page(),
    analytics: unsupported
  },
  places: {
    list: async () => page(),
    mapMarkers: async () => [],
    detail: async () => null,
    listAdmin: async () => page(),
    create: unsupported,
    update: unsupported,
    delete: unsupported,
    uploadGalleryFile: unsupported
  },
  communityPlan: {
    async generate(input) {
      return generateCommunityPlan(createCompetitionDemoEngineInput(input));
    }
  },
  announcements: {
    list: async () => page<Announcement>(),
    detail: async () => null
  },
  notifications: {
    list: async () => [],
    markRead: async () => null
  },
  files: {
    createUploadRequest: unsupported,
    complete: unsupported,
    privateUrl: unsupported,
    uploadPostMedia: unsupported,
    uploadReportEvidence: unsupported
  }
});
