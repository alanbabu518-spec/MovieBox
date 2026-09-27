import "dotenv/config";

const port = Number(process.env.PORT);
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;
const redisUrl = process.env.REDIS_URL;
const clientUrl = process.env.CLIENT_URL;

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

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  jwtSecret,
  jwtExpiresIn,
  redisUrl,
  clientUrl,
  cookieName: "moviebox_access_token",
};
