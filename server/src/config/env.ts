import "dotenv/config";

const port = Number(process.env.PORT);
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("Invalid PORT environment variable");
}

if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters");
}

if (!jwtExpiresIn) {
  throw new Error("JWT_EXPIRES_IN is required");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  jwtSecret,
  jwtExpiresIn,
};