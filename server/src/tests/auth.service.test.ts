import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  sendMagicLinkEmail: vi.fn(),
  createMagicLinkToken: vi.fn(),
  consumeMagicLinkToken: vi.fn(),
  sign: vi.fn(),
}));

vi.mock("../config/database.js", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  },
}));

vi.mock("../config/env.js", () => ({
  env: {
    jwtSecret: "test-secret",
    jwtExpiresIn: "1h",
  },
}));

vi.mock("../email/email.service.js", () => ({
  sendMagicLinkEmail: mocks.sendMagicLinkEmail,
}));

vi.mock("../modules/auth/magicLink.service.js", () => ({
  createMagicLinkToken: mocks.createMagicLinkToken,
  consumeMagicLinkToken: mocks.consumeMagicLinkToken,
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: mocks.sign,
  },
}));

import {
  createAuthToken,
  requestMagicLink,
  verifyMagicLink,
} from "../modules/auth/auth.service.js";

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.findUnique.mockResolvedValue(null);
    mocks.create.mockResolvedValue({
      id: "user-1",
      name: "alan",
      email: "alan@example.com",
      emailVerified: true,
      avatar: null,
      profileCompleted: false,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });

    mocks.createMagicLinkToken.mockResolvedValue("magic-token");
    mocks.consumeMagicLinkToken.mockResolvedValue({
      email: "alan@example.com",
    });

    mocks.sendMagicLinkEmail.mockResolvedValue(undefined);
    mocks.sign.mockReturnValue("jwt-token");
  });

  describe("requestMagicLink", () => {
    it("normalizes the email and sends a magic link", async () => {
      const result = await requestMagicLink("  ALAN@EXAMPLE.COM  ");

      expect(mocks.findUnique).toHaveBeenCalledWith({
        where: { email: "alan@example.com" },
      });

      expect(mocks.createMagicLinkToken).toHaveBeenCalledWith(
        "alan@example.com",
      );

      expect(mocks.sendMagicLinkEmail).toHaveBeenCalledWith({
        email: "alan@example.com",
        name: "alan",
        token: "magic-token",
      });

      expect(result.message).toBe(
        "If the email is valid, a sign-in link has been sent.",
      );
    });

    it("uses the existing user's name when available", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alan",
        email: "alan@example.com",
      });

      await requestMagicLink("alan@example.com");

      expect(mocks.sendMagicLinkEmail).toHaveBeenCalledWith({
        email: "alan@example.com",
        name: "Alan",
        token: "magic-token",
      });
    });
  });

  describe("createAuthToken", () => {
    it("creates a JWT for the user", () => {
      const token = createAuthToken("user-1");

      expect(mocks.sign).toHaveBeenCalledWith(
        { userId: "user-1" },
        "test-secret",
        {
          algorithm: "HS256",
          expiresIn: "1h",
        },
      );

      expect(token).toBe("jwt-token");
    });
  });

  describe("verifyMagicLink", () => {
    it("rejects an invalid or expired magic link", async () => {
      mocks.consumeMagicLinkToken.mockResolvedValue(null);

      await expect(verifyMagicLink("invalid-token")).rejects.toThrow(
        "This sign-in link is invalid or has expired.",
      );

      expect(mocks.create).not.toHaveBeenCalled();
    });

    it("creates a user after successful verification", async () => {
      const result = await verifyMagicLink("magic-token");

      expect(mocks.create).toHaveBeenCalledWith({
        data: {
          name: "alan",
          email: "alan@example.com",
          authProvider: "email",
          emailVerified: true,
          profileCompleted: false,
        },
      });

      expect(result.user.email).toBe("alan@example.com");
      expect(result.token).toBe("jwt-token");
    });

    it("does not create another user when the email already exists", async () => {
      mocks.findUnique.mockResolvedValue({
        id: "existing-user",
        name: "Alan",
        email: "alan@example.com",
        emailVerified: true,
        avatar: null,
        profileCompleted: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      });

      const result = await verifyMagicLink("magic-token");

      expect(mocks.create).not.toHaveBeenCalled();
      expect(result.user.id).toBe("existing-user");
      expect(result.token).toBe("jwt-token");
    });
  });
});
