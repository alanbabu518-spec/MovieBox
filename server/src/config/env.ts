import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const port = Number(process.env.PORT);

const jwtSecret = process.env.JWT_SECRET;

const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

const redisUrl = process.env.REDIS_URL;

const clientUrl = process.env.CLIENT_URL;

const googleClientId = process.env.GOOGLE_CLIENT_ID;

const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const googleCallbackUrl = process.env.GOOGLE_CALLBACK_URL;

const resendApiKey = process.env.RESEND_API_KEY;

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("Invalid PORT environment variable");
}

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

if (!jwtExpiresIn) {
  throw new Error("JWT_EXPIRES_IN is required");
}

if (!redisUrl) {
  throw new Error("REDIS_URL is required");
}

if (!clientUrl) {
  throw new Error("CLIENT_URL is required");
}

if (!googleClientId) {
  throw new Error("GOOGLE_CLIENT_ID is required");
}

if (!googleClientSecret) {
  throw new Error("GOOGLE_CLIENT_SECRET is required");
}

if (!googleCallbackUrl) {
  throw new Error("GOOGLE_CALLBACK_URL is required");
}

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is required");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  jwtSecret,
  jwtExpiresIn: jwtExpiresIn as SignOptions["expiresIn"],
  redisUrl,
  clientUrl,
  cookieName: "moviebox_access_token",
  googleClientId,
  googleClientSecret,
  googleCallbackUrl,
  resendApiKey,
};