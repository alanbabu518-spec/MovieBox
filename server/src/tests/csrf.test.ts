import { describe, expect, it, vi } from "vitest";

import { csrfProtection } from "../middleware/csrf.js";
import { env } from "../config/env.js";

describe("CSRF protection", () => {
  const createRequest = (
    method: string,
    options: {
      origin?: string;
      fetchSite?: string;
    } = {},
  ) => {
    const headers: Record<string, string> = {};

    if (options.origin !== undefined) {
      headers.origin = options.origin;
    }

    if (options.fetchSite !== undefined) {
      headers["sec-fetch-site"] = options.fetchSite;
    }

    return {
      method,
      headers,
      get(name: string) {
        return headers[name.toLowerCase()];
      },
    } as any;
  };

  const createResponse = () => ({}) as any;

  it("allows unsafe requests from the configured frontend origin", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("POST", { origin: env.clientUrl }),
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects requests from an untrusted origin", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("POST", {
        origin: "https://malicious.example.com",
      }),
      createResponse(),
      next,
    );

    const error = next.mock.calls[0]?.[0];

    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe("Invalid request origin");
  });

  it("rejects unsafe requests without an Origin header", () => {
    const next = vi.fn();

    csrfProtection(createRequest("POST"), createResponse(), next);

    const error = next.mock.calls[0]?.[0];

    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
  });

  it("rejects cross-site requests from the configured origin", () => {
    const next = vi.fn();

    csrfProtection(
      createRequest("POST", {
        origin: env.clientUrl,
        fetchSite: "cross-site",
      }),
      createResponse(),
      next,
    );

    const error = next.mock.calls[0]?.[0];

    expect(error).toBeDefined();
    expect(error.statusCode).toBe(403);
  });

  it.each(["GET", "HEAD", "OPTIONS"])(
    "allows safe HTTP method %s without an Origin header",
    (method) => {
      const next = vi.fn();

      csrfProtection(createRequest(method), createResponse(), next);

      expect(next).toHaveBeenCalledOnce();
      expect(next).toHaveBeenCalledWith();
    },
  );

  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "rejects %s requests from untrusted origins",
    (method) => {
      const next = vi.fn();

      csrfProtection(
        createRequest(method, {
          origin: "https://malicious.example.com",
        }),
        createResponse(),
        next,
      );

      const error = next.mock.calls[0]?.[0];

      expect(error).toBeDefined();
      expect(error.statusCode).toBe(403);
    },
  );
});
