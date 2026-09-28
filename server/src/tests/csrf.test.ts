import { describe, expect, it, vi } from "vitest";
import { csrfProtection } from "../middleware/csrf.js";
import { env } from "../config/env.js";

describe("CSRF protection", () => {
  const createRequest = (
    method: string,
    origin?: string,
  ) =>
    ({
      method,
      headers: origin ? { origin } : {},
    }) as any;

  const createResponse = () => ({}) as any;

  it("allows requests from the configured frontend origin", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("POST", env.clientUrl),
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(next).not.toHaveBeenCalledWith(
      expect.any(Error),
    );
  });

  it("blocks requests from an untrusted origin", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("POST", "https://malicious.example.com"),
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledOnce();

    const error = next.mock.calls[0]?.[0];

    expect(error).toBeDefined();

    if (!error) {
      return;
    }

    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Invalid request origin");
  });

  it("allows requests without an Origin header", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("POST"),
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("does not check Origin for GET requests", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("GET", "https://malicious.example.com"),
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("checks all unsafe HTTP methods", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      const next = vi.fn();

      csrfProtection(
        createRequest(method, "https://malicious.example.com"),
        createResponse(),
        next,
      );

      const error = next.mock.calls[0]?.[0];

      expect(error).toBeDefined();

      if (!error) {
        continue;
      }

      expect(error.statusCode).toBe(403);
    }
  });
});