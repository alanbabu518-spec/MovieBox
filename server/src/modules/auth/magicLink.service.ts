import crypto from "node:crypto";

import { redis } from "../../config/redis.js";

const MAGIC_LINK_TTL_SECONDS = 10 * 60;
const MAGIC_LINK_TOKEN_PATTERN = /^[a-f0-9]{64}$/;

const getMagicLinkKey = (token: string): string =>
  `moviebox:magic-link:${token}`;

export const createMagicLinkToken = async (email: string): Promise<string> => {
  const normalizedEmail = email.trim().toLowerCase();
  const token = crypto.randomBytes(32).toString("hex");

  await redis.set(
    getMagicLinkKey(token),
    JSON.stringify({ email: normalizedEmail }),
    "EX",
    MAGIC_LINK_TTL_SECONDS,
    "NX",
  );

  return token;
};

export const consumeMagicLinkToken = async (
  token: string,
): Promise<{ email: string } | null> => {
  // Reject malformed tokens before querying Redis.
  if (!MAGIC_LINK_TOKEN_PATTERN.test(token)) {
    return null;
  }

  // GETDEL atomically retrieves and deletes the token.
  // A concurrent verification request cannot consume it again.
  const data = (await redis.call("GETDEL", getMagicLinkKey(token))) as
    | string
    | null;

  if (!data) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(data);

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("email" in parsed) ||
      typeof parsed.email !== "string"
    ) {
      return null;
    }

    const email = parsed.email.trim().toLowerCase();

    if (!email || email.length > 254) {
      return null;
    }

    return { email };
  } catch {
    return null;
  }
};
