import crypto from "crypto";

import { redis } from "../../config/redis.js";

const MAGIC_LINK_TTL = 10 * 60;

const getMagicLinkKey = (token: string) =>
  `moviebox:magic-link:${token}`;

export const createMagicLinkToken = async (email: string) => {
  const token = crypto.randomBytes(32).toString("hex");

  await redis.set(
    getMagicLinkKey(token),
    JSON.stringify({
      email: email.toLowerCase(),
    }),
    "EX",
    MAGIC_LINK_TTL,
  );

  return token;
};

export const consumeMagicLinkToken = async (token: string) => {
  const key = getMagicLinkKey(token);

  const data = await redis.get(key);

  if (!data) {
    return null;
  }

  await redis.del(key);

  return JSON.parse(data) as {
    email: string;
  };
};