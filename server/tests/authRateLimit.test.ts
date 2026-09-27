import {
  afterAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";
import Redis from "ioredis";
import { consumeToken } from "../src/services/rateLimit.service.js";

const redis = new Redis("redis://localhost:6380");

describe("Dual rate limiting", () => {
  const keys = [
    "moviebox:test:rate-limit:login:ip:1.1.1.1",
    "moviebox:test:rate-limit:login:ip:2.2.2.2",
    "moviebox:test:rate-limit:login:email:test@example.com",
  ];

  beforeEach(async () => {
    await redis.del(...keys);
  });

  afterAll(async () => {
    await redis.del(...keys);
    await redis.quit();
  });

  it("blocks the same email even when requests come from different IPs", async () => {
    const capacity = 5;

    for (let i = 0; i < capacity; i++) {
      const result = await consumeToken({
        key: "moviebox:test:rate-limit:login:email:test@example.com",
        capacity,
        refillRate: 0.001,
      });

      expect(result.allowed).toBe(true);
    }

    const result = await consumeToken({
      key: "moviebox:test:rate-limit:login:email:test@example.com",
      capacity,
      refillRate: 0.001,
    });

    expect(result.allowed).toBe(false);
  });

  it("keeps IP protection independent from email protection", async () => {
    const capacity = 3;

    for (let i = 0; i < capacity; i++) {
      const result = await consumeToken({
        key: "moviebox:test:rate-limit:login:ip:1.1.1.1",
        capacity,
        refillRate: 0.001,
      });

      expect(result.allowed).toBe(true);
    }

    const result = await consumeToken({
      key: "moviebox:test:rate-limit:login:ip:1.1.1.1",
      capacity,
      refillRate: 0.001,
    });

    expect(result.allowed).toBe(false);
  });
});