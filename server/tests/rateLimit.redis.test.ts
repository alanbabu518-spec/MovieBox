import {
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
} from "vitest";
import Redis from "ioredis";
import { consumeToken } from "../src/services/rateLimit.service";

const redis = new Redis("redis://localhost:6380");

describe("Token Bucket Redis integration", () => {
  const testKey =
    "moviebox:test:rate-limit:integration";

  beforeEach(async () => {
    await redis.del(testKey);
  });

  afterAll(async () => {
    await redis.del(testKey);
    await redis.quit();
  });

  it("starts with a full bucket", async () => {
    const result = await consumeToken({
      key: testKey,
      capacity: 5,
      refillRate: 0.001,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("consumes available tokens", async () => {
    const first = await consumeToken({
      key: testKey,
      capacity: 5,
      refillRate: 0.001,
    });

    const second = await consumeToken({
      key: testKey,
      capacity: 5,
      refillRate: 0.001,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBeLessThanOrEqual(3);
  });

  it("rejects requests when the bucket is empty", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await consumeToken({
        key: testKey,
        capacity: 5,
        refillRate: 0.001,
      });

      expect(result.allowed).toBe(true);
    }

    const result = await consumeToken({
      key: testKey,
      capacity: 5,
      refillRate: 0.001,
    });

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBeGreaterThan(0);
  });

  it("stores bucket state in Redis", async () => {
    await consumeToken({
      key: testKey,
      capacity: 5,
      refillRate: 0.001,
    });

    const exists = await redis.exists(testKey);

    expect(exists).toBe(1);
  });

  it("sets an expiration on the bucket", async () => {
    await consumeToken({
      key: testKey,
      capacity: 5,
      refillRate: 0.001,
    });

    const ttl = await redis.ttl(testKey);

    expect(ttl).toBeGreaterThan(0);
  });
});