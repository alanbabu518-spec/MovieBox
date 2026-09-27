import "dotenv/config";

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error("Invalid PORT environment variable");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
};