import { beforeEach, describe, expect, it, vi } from "vitest";

const redisMock = {
  set: vi.fn(),
  get: vi.fn(),
  del: vi.fn(),
  ttl: vi.fn(),
};

vi.mock("../src/config/redis.js", () => ({
  redis: redisMock,
}));

const {
  createPendingRegistration,
  getPendingRegistration,
  incrementOTPAttempts,
  deletePendingRegistration,
  verifyPendingOTP,
} = await import("../src/services/pendingRegistration.service.js");

describe("pendingRegistration service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stores pending registration with a 10 minute TTL", async () => {
    redisMock.set.mockResolvedValue("OK");

    await createPendingRegistration({
      name: "Alan",
      email: "alan@example.com",
      passwordHash: "hashed-password",
      otp: "123456",
    });

    expect(redisMock.set).toHaveBeenCalledTimes(1);

    const [key, value, expiration, ttl] = redisMock.set.mock.calls[0];

    expect(key).toBe(
      "moviebox:pending-registration:alan@example.com"
    );

    const data = JSON.parse(value);

    expect(data.name).toBe("Alan");
    expect(data.email).toBe("alan@example.com");
    expect(data.passwordHash).toBe("hashed-password");
    expect(data.otpHash).not.toBe("123456");
    expect(data.otpHash).toMatch(/^[a-f0-9]{64}$/);
    expect(data.attempts).toBe(0);

    expect(expiration).toBe("EX");
    expect(ttl).toBe(600);
  });

  it("retrieves pending registration", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "hashed-password",
        otpHash: "hash",
        attempts: 0,
      })
    );

    const result = await getPendingRegistration(
      "alan@example.com"
    );

    expect(result.email).toBe("alan@example.com");
    expect(result.name).toBe("Alan");
    expect(result.attempts).toBe(0);
  });

  it("rejects when registration does not exist", async () => {
    redisMock.get.mockResolvedValue(null);

    await expect(
      getPendingRegistration("alan@example.com")
    ).rejects.toThrow(
      "OTP expired or registration not found"
    );
  });

  it("increments OTP attempts", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "hashed-password",
        otpHash: "hash",
        attempts: 1,
      })
    );

    redisMock.ttl.mockResolvedValue(500);
    redisMock.set.mockResolvedValue("OK");

    await incrementOTPAttempts("alan@example.com");

    expect(redisMock.set).toHaveBeenCalledTimes(1);

    const [, value, expiration, ttl] =
      redisMock.set.mock.calls[0];

    const data = JSON.parse(value);

    expect(data.attempts).toBe(2);
    expect(expiration).toBe("EX");
    expect(ttl).toBe(500);
  });

  it("rejects an incorrect OTP", async () => {
    const crypto = await import("node:crypto");

    const correctHash = crypto
      .createHash("sha256")
      .update("123456")
      .digest("hex");

    redisMock.get
      .mockResolvedValueOnce(
        JSON.stringify({
          name: "Alan",
          email: "alan@example.com",
          passwordHash: "hashed-password",
          otpHash: correctHash,
          attempts: 0,
        })
      )
      .mockResolvedValueOnce(
        JSON.stringify({
          name: "Alan",
          email: "alan@example.com",
          passwordHash: "hashed-password",
          otpHash: correctHash,
          attempts: 0,
        })
      );

    redisMock.ttl.mockResolvedValue(500);
    redisMock.set.mockResolvedValue("OK");

    await expect(
      verifyPendingOTP("alan@example.com", "999999")
    ).rejects.toThrow("Invalid OTP");

    expect(redisMock.set).toHaveBeenCalled();
  });

  it("accepts the correct OTP", async () => {
    const crypto = await import("node:crypto");

    const correctHash = crypto
      .createHash("sha256")
      .update("123456")
      .digest("hex");

    redisMock.get.mockResolvedValue(
      JSON.stringify({
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "hashed-password",
        otpHash: correctHash,
        attempts: 0,
      })
    );

    const result = await verifyPendingOTP(
      "alan@example.com",
      "123456"
    );

    expect(result.email).toBe("alan@example.com");
    expect(result.attempts).toBe(0);
  });

  it("blocks verification after five failed attempts", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify({
        name: "Alan",
        email: "alan@example.com",
        passwordHash: "hashed-password",
        otpHash: "some-hash",
        attempts: 5,
      })
    );

    await expect(
      verifyPendingOTP("alan@example.com", "123456")
    ).rejects.toThrow("Too many OTP attempts");
  });

  it("deletes pending registration", async () => {
    redisMock.del.mockResolvedValue(1);

    await deletePendingRegistration("alan@example.com");

    expect(redisMock.del).toHaveBeenCalledWith(
      "moviebox:pending-registration:alan@example.com"
    );
  });
});