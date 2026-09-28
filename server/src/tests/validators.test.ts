import { describe, expect, it } from "vitest";
import {
  loginSchema,
  registerSchema,
  resendEmailOTPSchema,
  verifyEmailOTPSchema,
} from "../modules/auth/auth.validator";

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Alan",
      email: "ALAN@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("alan@example.com");
    }
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Alan",
      email: "invalid-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "Alan",
      email: "alan@example.com",
      password: "123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "alan@example.com",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "ALAN@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("alan@example.com");
    }
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "alan@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("verifyEmailOTPSchema", () => {
  it("accepts a six digit OTP", () => {
    const result = verifyEmailOTPSchema.safeParse({
      email: "alan@example.com",
      otp: "123456",
    });

    expect(result.success).toBe(true);
  });

  it("rejects OTP with fewer than six digits", () => {
    const result = verifyEmailOTPSchema.safeParse({
      email: "alan@example.com",
      otp: "12345",
    });

    expect(result.success).toBe(false);
  });

  it("rejects OTP containing letters", () => {
    const result = verifyEmailOTPSchema.safeParse({
      email: "alan@example.com",
      otp: "12AB56",
    });

    expect(result.success).toBe(false);
  });
});

describe("resendEmailOTPSchema", () => {
  it("accepts a valid email", () => {
    const result = resendEmailOTPSchema.safeParse({
      email: "ALAN@example.com",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("alan@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = resendEmailOTPSchema.safeParse({
      email: "invalid",
    });

    expect(result.success).toBe(false);
  });
});