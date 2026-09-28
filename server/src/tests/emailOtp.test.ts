import { describe, expect, it } from "vitest";
import { generateEmailOTP } from "../shared/utils/emailOtp.js";

describe("generateEmailOTP", () => {
  it("generates a six digit OTP", () => {
    const result = generateEmailOTP();

    expect(result.code).toMatch(/^\d{6}$/);
  });

  it("generates an OTP hash", () => {
    const result = generateEmailOTP();

    expect(result.codeHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("does not expose the OTP inside the hash", () => {
    const result = generateEmailOTP();

    expect(result.codeHash).not.toBe(result.code);
  });

  it("generates different OTP values", () => {
    const first = generateEmailOTP();
    const second = generateEmailOTP();

    expect(first.code).not.toBe(second.code);
  });
});