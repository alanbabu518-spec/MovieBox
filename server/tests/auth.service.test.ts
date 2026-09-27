import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../src/utils/appError.js";

const prismaMock = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const pendingRegistrationMock = {
  createPendingRegistration: vi.fn(),
  deletePendingRegistration: vi.fn(),
  getPendingRegistration: vi.fn(),
  verifyPendingOTP: vi.fn(),
};

const emailMock = {
  sendVerificationEmail: vi.fn(),
};

vi.mock("../src/config/database.js", () => ({
  prisma: prismaMock,
}));

vi.mock("../src/services/pendingRegistration.service.js", () => ({
  createPendingRegistration: pendingRegistrationMock.createPendingRegistration,
  deletePendingRegistration: pendingRegistrationMock.deletePendingRegistration,
  getPendingRegistration: pendingRegistrationMock.getPendingRegistration,
  verifyPendingOTP: pendingRegistrationMock.verifyPendingOTP,
}));

vi.mock("../src/services/email.service.js", () => ({
  sendVerificationEmail: emailMock.sendVerificationEmail,
}));

const { registerUser, verifyEmailOTP, loginUser } =
  await import("../src/services/auth.service.js");

describe("auth service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.user.findUnique.mockReset();
    prismaMock.user.create.mockReset();

    pendingRegistrationMock.createPendingRegistration.mockReset();
    pendingRegistrationMock.deletePendingRegistration.mockReset();
    pendingRegistrationMock.getPendingRegistration.mockReset();
    pendingRegistrationMock.verifyPendingOTP.mockReset();

    emailMock.sendVerificationEmail.mockReset();
  });

  describe("registerUser", () => {
    it("creates a pending registration instead of a database user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      pendingRegistrationMock.getPendingRegistration.mockRejectedValue(
        new AppError("OTP expired or registration not found", 400),
      );

      pendingRegistrationMock.createPendingRegistration.mockResolvedValue(
        undefined,
      );

      emailMock.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await registerUser({
        name: "Alan",
        email: "alan@example.com",
        password: "password123",
      });

      expect(result.email).toBe("alan@example.com");

      expect(
        pendingRegistrationMock.createPendingRegistration,
      ).toHaveBeenCalledTimes(1);

      expect(emailMock.sendVerificationEmail).toHaveBeenCalledTimes(1);

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("rejects an already registered email", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        email: "alan@example.com",
      });

      await expect(
        registerUser({
          name: "Alan",
          email: "alan@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Email already registered");

      expect(
        pendingRegistrationMock.createPendingRegistration,
      ).not.toHaveBeenCalled();
    });

    it("rejects when an OTP is already pending", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      pendingRegistrationMock.getPendingRegistration.mockResolvedValue({
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "hashed-password",
        otpHash: "hash",
        attempts: 0,
      });

      await expect(
        registerUser({
          name: "Alan",
          email: "alan@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(
        "A verification OTP was already sent. Please use resend OTP.",
      );

      expect(
        pendingRegistrationMock.createPendingRegistration,
      ).not.toHaveBeenCalled();
    });

    it("does not store the raw password", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      pendingRegistrationMock.getPendingRegistration.mockRejectedValue(
        new AppError("OTP expired or registration not found", 400),
      );

      pendingRegistrationMock.createPendingRegistration.mockResolvedValue(
        undefined,
      );

      emailMock.sendVerificationEmail.mockResolvedValue(undefined);

      await registerUser({
        name: "Alan",
        email: "alan@example.com",
        password: "password123",
      });

      const registration =
        pendingRegistrationMock.createPendingRegistration.mock.calls[0][0];

      expect(registration.passwordHash).not.toBe("password123");
      expect(registration.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    it("propagates Redis failures during registration", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      pendingRegistrationMock.getPendingRegistration.mockRejectedValue(
        new Error("Redis unavailable"),
      );

      await expect(
        registerUser({
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Redis unavailable");

      expect(
        pendingRegistrationMock.createPendingRegistration,
      ).not.toHaveBeenCalled();

      expect(emailMock.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe("verifyEmailOTP", () => {
    it("creates the database user only after successful OTP verification", async () => {
      pendingRegistrationMock.verifyPendingOTP.mockResolvedValue({
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "$2b$12$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuu",
        otpHash: "hash",
        attempts: 0,
      });

      prismaMock.user.create.mockResolvedValue({
        id: "user-1",
        name: "Alan",
        email: "alan@example.com",
        emailVerified: true,
        createdAt: new Date(),
      });

      const result = await verifyEmailOTP({
        email: "alan@example.com",
        otp: "123456",
      });

      expect(pendingRegistrationMock.verifyPendingOTP).toHaveBeenCalledWith(
        "alan@example.com",
        "123456",
      );

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: "Alan",
          email: "alan@example.com",
          passwordHash: "$2b$12$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuu",
          emailVerified: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          createdAt: true,
        },
      });

      expect(
        pendingRegistrationMock.deletePendingRegistration,
      ).toHaveBeenCalledWith("alan@example.com");

      expect(result.user.emailVerified).toBe(true);
    });

    it("does not create a user when OTP verification fails", async () => {
      pendingRegistrationMock.verifyPendingOTP.mockRejectedValue(
        new Error("Invalid OTP"),
      );

      await expect(
        verifyEmailOTP({
          email: "alan@example.com",
          otp: "999999",
        }),
      ).rejects.toThrow("Invalid OTP");

      expect(prismaMock.user.create).not.toHaveBeenCalled();

      expect(
        pendingRegistrationMock.deletePendingRegistration,
      ).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    it("rejects a non-existent user", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        loginUser({
          email: "unknown@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("rejects an incorrect password", async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "$2b$12$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuu",
        emailVerified: true,
      });

      await expect(
        loginUser({
          email: "alan@example.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("rejects an unverified user", async () => {
      const bcrypt = await import("bcryptjs");

      const passwordHash = await bcrypt.hash("password123", 12);

      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alan",
        email: "alan@example.com",
        passwordHash,
        emailVerified: false,
      });

      await expect(
        loginUser({
          email: "alan@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Please verify your email before logging in");
    });

    it("logs in a user with the correct password", async () => {
      const bcrypt = await import("bcryptjs");

      const passwordHash = await bcrypt.hash("password123", 12);

      prismaMock.user.findUnique.mockResolvedValue({
        id: "user-1",
        name: "Alan",
        email: "alan@example.com",
        passwordHash,
        emailVerified: true,
        createdAt: new Date(),
      });

      const result = await loginUser({
        email: "alan@example.com",
        password: "password123",
      });

      expect(result.user.id).toBe("user-1");
      expect(result.user.email).toBe("alan@example.com");
      expect(result.token).toBeTypeOf("string");
    });
  });
});
