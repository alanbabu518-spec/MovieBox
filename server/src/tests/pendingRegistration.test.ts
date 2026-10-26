import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const { redisMock } = vi.hoisted(() => ({
  redisMock: {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
    ttl: vi.fn(),
  },
}));

vi.mock("../config/redis.js", () => ({
  redis: redisMock,
}));

import {
  createPendingRegistration,
  getPendingRegistration,
  incrementOTPAttempts,
  deletePendingRegistration,
  verifyPendingOTP,
} from "../modules/auth/pendingRegistration.service.js";

import { createHash } from "node:crypto";

const registrationKey =
  "moviebox:pending-registration:alan@example.com";

function createRegistration(overrides: Record<string, unknown> = {}) {
  return {
    name: "Alan",
    email: "alan@example.com",
    passwordHash: "hashed-password",
    otpHash: createHash("sha256")
      .update("123456")
      .digest("hex"),
    attempts: 0,
    ...overrides,
  };
}

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

    const args = redisMock.set.mock.calls[0];

    expect(args).toBeDefined();

    if (!args) {
      throw new Error("Redis SET was not called");
    }

    const [key, value, expiration, ttl] = args;

    expect(key).toBe(registrationKey);

    const data = JSON.parse(value as string);

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
      JSON.stringify(createRegistration()),
    );

    const result =
      await getPendingRegistration("alan@example.com");

    expect(result.email).toBe("alan@example.com");
    expect(result.name).toBe("Alan");
    expect(result.attempts).toBe(0);
  });

  it("rejects when registration does not exist", async () => {
    redisMock.get.mockResolvedValue(null);

    await expect(
      getPendingRegistration("alan@example.com"),
    ).rejects.toThrow(
      "OTP expired or registration not found",
    );
  });

  it("increments OTP attempts", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify(createRegistration({ attempts: 1 })),
    );

    redisMock.ttl.mockResolvedValue(500);
    redisMock.set.mockResolvedValue("OK");

    await incrementOTPAttempts("alan@example.com");

    expect(redisMock.set).toHaveBeenCalledTimes(1);

    const args = redisMock.set.mock.calls[0];

    expect(args).toBeDefined();

    if (!args) {
      throw new Error("Redis SET was not called");
    }

    const [, value, expiration, ttl] = args;
    const data = JSON.parse(value as string);

    expect(data.attempts).toBe(2);
    expect(expiration).toBe("EX");
    expect(ttl).toBe(500);
  });

  it("rejects an incorrect OTP", async () => {
    const registration = createRegistration();

    redisMock.get.mockResolvedValue(
      JSON.stringify(registration),
    );

    redisMock.ttl.mockResolvedValue(500);
    redisMock.set.mockResolvedValue("OK");

    await expect(
      verifyPendingOTP("alan@example.com", "999999"),
    ).rejects.toThrow("Invalid OTP");

    expect(redisMock.set).toHaveBeenCalled();

    const args = redisMock.set.mock.calls[0];

    expect(args).toBeDefined();

    if (!args) {
      throw new Error("Redis SET was not called");
    }

    const data = JSON.parse(args[1] as string);

    expect(data.attempts).toBe(1);
  });

  it("accepts the correct OTP", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify(createRegistration()),
    );

    const result = await verifyPendingOTP(
      "alan@example.com",
      "123456",
    );

    expect(result.email).toBe("alan@example.com");
    expect(result.attempts).toBe(0);
  });

  it("blocks verification after five failed attempts", async () => {
    redisMock.get.mockResolvedValue(
      JSON.stringify(createRegistration({ attempts: 5 })),
    );

    await expect(
      verifyPendingOTP("alan@example.com", "123456"),
    ).rejects.toThrow("Too many OTP attempts");
  });

  it("deletes pending registration", async () => {
    redisMock.del.mockResolvedValue(1);

    await deletePendingRegistration("alan@example.com");

    expect(redisMock.del).toHaveBeenCalledWith(
      registrationKey,
    );
  });
});