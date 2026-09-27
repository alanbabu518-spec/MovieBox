import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  eval: vi.fn(),
}));

vi.mock("../src/config/redis.js", () => ({
  redis: {
    eval: mocks.eval,
  },
}));

const { consumeToken } = await import(
  "../src/services/rateLimit.service.js"
);

describe("consumeToken", () => {
  beforeEach(() => {
    mocks.eval.mockReset();
  });

  it("allows a request when a token is available", async () => {
    mocks.eval.mockResolvedValue([1, 4, 0]);

    const result = await consumeToken({
      key: "moviebox:rate-limit:login:127.0.0.1",
      capacity: 5,
      refillRate: 1 / 30,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.retryAfter).toBe(0);
  });

  it("rejects a request when no token is available", async () => {
    mocks.eval.mockResolvedValue([0, 0, 30]);

    const result = await consumeToken({
      key: "moviebox:rate-limit:login:127.0.0.1",
      capacity: 5,
      refillRate: 1 / 30,
    });

    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfter).toBe(30);
  });

  it("returns the remaining token count", async () => {
    mocks.eval.mockResolvedValue([1, 2, 0]);

    const result = await consumeToken({
      key: "moviebox:rate-limit:test",
      capacity: 3,
      refillRate: 1,
    });

    expect(result.remaining).toBe(2);
  });

  it("calculates the retry time", async () => {
    mocks.eval.mockResolvedValue([0, 0, 45]);

    const result = await consumeToken({
      key: "moviebox:rate-limit:test",
      capacity: 5,
      refillRate: 1 / 45,
    });

    expect(result.allowed).toBe(false);
    expect(result.retryAfter).toBe(45);
  });

  it("calls Redis with the Lua script", async () => {
    mocks.eval.mockResolvedValue([1, 4, 0]);

    await consumeToken({
      key: "moviebox:rate-limit:test",
      capacity: 5,
      refillRate: 1 / 30,
    });

    expect(mocks.eval).toHaveBeenCalledTimes(1);

    const args = mocks.eval.mock.calls[0];

    expect(args[1]).toBe(1);
    expect(args[2]).toBe(
      "moviebox:rate-limit:test"
    );
    expect(args[3]).toBe(5);
    expect(args[4]).toBe(1 / 30);
    expect(typeof args[5]).toBe("number");
    expect(args[6]).toBe(1);
  });

  it("supports consuming multiple tokens", async () => {
    mocks.eval.mockResolvedValue([1, 2, 0]);

    const result = await consumeToken({
      key: "moviebox:rate-limit:test",
      capacity: 5,
      refillRate: 1,
      tokens: 3,
    });

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);

    const args = mocks.eval.mock.calls[0];

    expect(args[6]).toBe(3);
  });

  it("propagates Redis errors", async () => {
    mocks.eval.mockRejectedValue(
      new Error("Redis unavailable")
    );

    await expect(
      consumeToken({
        key: "moviebox:rate-limit:test",
        capacity: 5,
        refillRate: 1,
      })
    ).rejects.toThrow("Redis unavailable");
  });
});