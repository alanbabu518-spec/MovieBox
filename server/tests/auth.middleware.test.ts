import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

vi.mock("../src/config/env.js", () => ({
  env: {
    jwtSecret:
      "this-is-a-test-secret-with-more-than-32-characters",
    cookieName: "moviebox_access_token",
  },
}));

const { authenticate } = await import(
  "../src/middleware/auth.js"
);

describe("authenticate middleware", () => {
  const createRequest = (token?: string) => ({
    cookies: token
      ? {
          moviebox_access_token: token,
        }
      : {},
  });

  const createResponse = () => ({});

  const createNext = () => vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a request without a token", () => {
    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    authenticate(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe(
      "Authentication required"
    );
  });

  it("rejects an invalid token", () => {
    const req = createRequest("invalid-token");
    const res = createResponse();
    const next = createNext();

    authenticate(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe(
      "Invalid or expired authentication token"
    );
  });

  it("rejects an expired token", () => {
    const token = jwt.sign(
      { userId: "user-1" },
      "this-is-a-test-secret-with-more-than-32-characters",
      {
        expiresIn: -1,
        algorithm: "HS256",
      }
    );

    const req = createRequest(token);
    const res = createResponse();
    const next = createNext();

    authenticate(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe(
      "Invalid or expired authentication token"
    );
  });

  it("rejects a token signed with the wrong secret", () => {
    const token = jwt.sign(
      { userId: "user-1" },
      "attacker-secret",
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    const req = createRequest(token);
    const res = createResponse();
    const next = createNext();

    authenticate(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe(
      "Invalid or expired authentication token"
    );
  });

  it("rejects a token with an invalid payload", () => {
    const token = jwt.sign(
      { email: "alan@example.com" },
      "this-is-a-test-secret-with-more-than-32-characters",
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    const req = createRequest(token);
    const res = createResponse();
    const next = createNext();

    authenticate(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0].message).toBe(
      "Invalid authentication token"
    );
  });

  it("accepts a valid token", () => {
    const token = jwt.sign(
      { userId: "user-1" },
      "this-is-a-test-secret-with-more-than-32-characters",
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    const req = createRequest(token) as any;
    const res = createResponse();
    const next = createNext();

    authenticate(req, res as any, next);

    expect(req.userId).toBe("user-1");
    expect(next).toHaveBeenCalledWith();
  });
});