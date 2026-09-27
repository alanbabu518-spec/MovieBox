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

describe("Token Bucket concurrency", () => {
  const testKey =
    "moviebox:test:rate-limit:concurrency";

  beforeEach(async () => {
    await redis.del(testKey);
  });

  afterAll(async () => {
    await redis.del(testKey);
    await redis.quit();
  });

  it("allows exactly the available number of tokens under concurrency", async () => {
    const results = await Promise.all(
      Array.from({ length: 100 }, () =>
        consumeToken({
          key: testKey,
          capacity: 10,
          refillRate: 0.001,
        })
      )
    );

    const allowed = results.filter(
      (result) => result.allowed
    ).length;

    const rejected = results.filter(
      (result) => !result.allowed
    ).length;

    expect(allowed).toBe(10);
    expect(rejected).toBe(90);
  });
});