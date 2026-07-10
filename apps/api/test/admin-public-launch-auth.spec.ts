import { createServer } from "node:http";

import { describe, expect, it, vi } from "vitest";

import { createMockDataset, type User } from "@community-map/shared";

import { createApp } from "../src/app";
import { createAdminPasswordHash } from "../src/lib/admin-auth";
import type { ApiProvider } from "../src/providers/types";

const withAdminEnv = async <T>(
  userId: string | undefined,
  callback: (baseUrl: string) => Promise<T>
) => {
  const previous = {
    username: process.env.API_ADMIN_USERNAME,
    password: process.env.API_ADMIN_PASSWORD_SCRYPT,
    secret: process.env.API_ADMIN_SESSION_SECRET,
    userId: process.env.API_ADMIN_USER_ID,
    providerMode: process.env.CLOUDBASE_PROVIDER_MODE,
    allowMock: process.env.API_ALLOW_MOCK_ACTOR_HEADER
  };

  process.env.API_ADMIN_USERNAME = "launch-admin";
  process.env.API_ADMIN_PASSWORD_SCRYPT = await createAdminPasswordHash(
    "public launch password"
  );
  process.env.API_ADMIN_SESSION_SECRET = "public-launch-test-session-secret";
  if (userId) {
    process.env.API_ADMIN_USER_ID = userId;
  } else {
    delete process.env.API_ADMIN_USER_ID;
  }
  process.env.CLOUDBASE_PROVIDER_MODE = "live";
  delete process.env.API_ALLOW_MOCK_ACTOR_HEADER;

  const app = createApp("mock");
  const server = createServer(app.callback());
  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to start test server.");
  }

  try {
    return await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    if (previous.username === undefined) {
      delete process.env.API_ADMIN_USERNAME;
    } else {
      process.env.API_ADMIN_USERNAME = previous.username;
    }
    if (previous.password === undefined) {
      delete process.env.API_ADMIN_PASSWORD_SCRYPT;
    } else {
      process.env.API_ADMIN_PASSWORD_SCRYPT = previous.password;
    }
    if (previous.secret === undefined) {
      delete process.env.API_ADMIN_SESSION_SECRET;
    } else {
      process.env.API_ADMIN_SESSION_SECRET = previous.secret;
    }
    if (previous.userId === undefined) {
      delete process.env.API_ADMIN_USER_ID;
    } else {
      process.env.API_ADMIN_USER_ID = previous.userId;
    }
    if (previous.providerMode === undefined) {
      delete process.env.CLOUDBASE_PROVIDER_MODE;
    } else {
      process.env.CLOUDBASE_PROVIDER_MODE = previous.providerMode;
    }
    if (previous.allowMock === undefined) {
      delete process.env.API_ALLOW_MOCK_ACTOR_HEADER;
    } else {
      process.env.API_ALLOW_MOCK_ACTOR_HEADER = previous.allowMock;
    }
  }
};

const withLiveCloudbaseProvider = async <T>(
  users: User[],
  adminUserId: string,
  callback: (
    provider: ApiProvider,
    setUser: ReturnType<typeof vi.fn>
  ) => Promise<T>
) => {
  const previous = {
    username: process.env.API_ADMIN_USERNAME,
    password: process.env.API_ADMIN_PASSWORD_SCRYPT,
    secret: process.env.API_ADMIN_SESSION_SECRET,
    userId: process.env.API_ADMIN_USER_ID,
    providerMode: process.env.CLOUDBASE_PROVIDER_MODE,
    envId: process.env.CLOUDBASE_ENV_ID
  };
  const setUser = vi.fn(async () => ({ updated: 1 }));
  const usersCollection = {
    limit: vi.fn(() => ({
      get: vi.fn(async () => ({ data: users }))
    })),
    doc: vi.fn(() => ({ set: setUser }))
  };
  const emptyCollection = {
    limit: vi.fn(() => ({
      get: vi.fn(async () => ({ data: [] }))
    })),
    doc: vi.fn(() => ({ set: vi.fn() }))
  };
  const collection = vi.fn((name: string) =>
    name === "users" ? usersCollection : emptyCollection
  );

  try {
    process.env.API_ADMIN_USERNAME = "launch-admin";
    process.env.API_ADMIN_PASSWORD_SCRYPT = await createAdminPasswordHash(
      "public launch password"
    );
    process.env.API_ADMIN_SESSION_SECRET = "public-launch-test-session-secret";
    process.env.API_ADMIN_USER_ID = adminUserId;
    process.env.CLOUDBASE_PROVIDER_MODE = "live";
    process.env.CLOUDBASE_ENV_ID = "public-launch-test-env";

    vi.resetModules();
    vi.doMock("@cloudbase/node-sdk", () => ({
      default: {
        init: () => ({
          database: () => ({ collection }),
          getTempFileURL: vi.fn()
        })
      }
    }));

    const { createCloudbaseProvider } =
      await import("../src/providers/cloudbase");
    return await callback(createCloudbaseProvider(), setUser);
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      const envKey =
        key === "username"
          ? "API_ADMIN_USERNAME"
          : key === "password"
            ? "API_ADMIN_PASSWORD_SCRYPT"
            : key === "secret"
              ? "API_ADMIN_SESSION_SECRET"
              : key === "userId"
                ? "API_ADMIN_USER_ID"
                : key === "providerMode"
                  ? "CLOUDBASE_PROVIDER_MODE"
                  : "CLOUDBASE_ENV_ID";
      if (value === undefined) {
        delete process.env[envKey];
      } else {
        process.env[envKey] = value;
      }
    }
    vi.doUnmock("@cloudbase/node-sdk");
    vi.resetModules();
  }
};

const login = async (baseUrl: string) => {
  const response = await fetch(`${baseUrl}/auth/admin/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: "launch-admin",
      password: "public launch password"
    })
  });

  const body = await response.json();
  expect(response.status).toBe(200);
  expect(body.data.token).toEqual(expect.any(String));
  return body.data.token as string;
};

describe("admin public launch authentication", () => {
  it("accepts a valid local Bearer admin session and rejects mock-header-only calls in live mode", async () => {
    await withAdminEnv("user_001", async (baseUrl) => {
      const noAuth = await fetch(`${baseUrl}/admin/events`);
      expect(noAuth.status).toBe(401);

      const mockOnly = await fetch(`${baseUrl}/admin/events`, {
        headers: { "x-mock-user-id": "user_001" }
      });
      expect(mockOnly.status).toBe(401);

      const token = await login(baseUrl);
      const bearer = await fetch(`${baseUrl}/admin/events`, {
        headers: { authorization: `Bearer ${token}` }
      });
      expect(bearer.status).toBe(200);

      const invalidBearer = await fetch(`${baseUrl}/admin/events`, {
        headers: { authorization: "Bearer invalid.token.value" }
      });
      expect(invalidBearer.status).toBe(401);
    });
  });

  it("rejects a durable non-admin Bearer user on protected Admin routes", async () => {
    await withAdminEnv("user_002", async (baseUrl) => {
      const token = await login(baseUrl);
      const response = await fetch(`${baseUrl}/admin/events`, {
        headers: { authorization: `Bearer ${token}` }
      });

      expect(response.status).toBe(403);
    });
  });

  it("keeps the documented mock-provider Admin default usable", async () => {
    await withAdminEnv(undefined, async (baseUrl) => {
      const token = await login(baseUrl);
      const response = await fetch(`${baseUrl}/admin/events`, {
        headers: { authorization: `Bearer ${token}` }
      });

      expect(response.status).toBe(200);
    });
  });

  it("requires an existing active durable Admin role in CloudBase live mode", async () => {
    const dataset = createMockDataset();
    const admin = dataset.users.find((user) => user._id === "user_001");
    const nonAdmin = dataset.users.find((user) => user._id === "user_002");
    expect(admin).toBeDefined();
    expect(nonAdmin).toBeDefined();
    if (!admin || !nonAdmin) {
      throw new Error("Required auth fixtures are missing.");
    }

    await withLiveCloudbaseProvider(
      [admin, nonAdmin],
      admin._id,
      async (provider, setUser) => {
        const session = await provider.auth.adminLogin({
          username: "launch-admin",
          password: "public launch password"
        });

        expect(session.user._id).toBe(admin._id);
        expect(session.user.role_flags).toContain("community_admin");
        expect(setUser).not.toHaveBeenCalled();
      }
    );

    await withLiveCloudbaseProvider(
      [admin, nonAdmin],
      nonAdmin._id,
      async (provider) => {
        await expect(
          provider.auth.adminLogin({
            username: "launch-admin",
            password: "public launch password"
          })
        ).rejects.toMatchObject({ status: 403 });
      }
    );

    await withLiveCloudbaseProvider(
      [admin, nonAdmin],
      "missing_admin",
      async (provider) => {
        await expect(
          provider.auth.adminLogin({
            username: "launch-admin",
            password: "public launch password"
          })
        ).rejects.toMatchObject({ status: 403 });
      }
    );
  });
});
