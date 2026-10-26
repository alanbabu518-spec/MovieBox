import { describe, expect, it } from "vitest";
import {
  emailAuthSchema,
  magicLinkSchema,
} from "../modules/auth/auth.validator.js";

describe("emailAuthSchema", () => {
  it("accepts a valid email and normalizes its case", () => {
    const result = emailAuthSchema.safeParse({
      email: "ALAN@example.com",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("alan@example.com");
    }
  });

  it("trims whitespace from email", () => {
    const result = emailAuthSchema.safeParse({
      email: "  ALAN@example.com  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.email).toBe("alan@example.com");
    }
  });

  it("rejects an invalid email", () => {
    expect(emailAuthSchema.safeParse({ email: "invalid-email" }).success).toBe(
      false,
    );
  });

  it("rejects a missing email", () => {
    expect(emailAuthSchema.safeParse({}).success).toBe(false);
  });
});

describe("magicLinkSchema", () => {
  it("accepts a valid token", () => {
    expect(
      magicLinkSchema.safeParse({ token: "valid-magic-token" }).success,
    ).toBe(true);
  });

  it("rejects an empty token", () => {
    expect(magicLinkSchema.safeParse({ token: "" }).success).toBe(false);
  });

  it("rejects a missing token", () => {
    expect(magicLinkSchema.safeParse({}).success).toBe(false);
  });
});
