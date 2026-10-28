import Redis from "ioredis";
import { env } from "./env.js";

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 10) {
      console.error("Redis connection failed after 10 retries");
      return null;
    }

    return Math.min(times * 500, 5000);
  },
});

redis.on("connect", () => {
  console.log("Redis connected successfully");
});

redis.on("ready", () => {
  console.log("Redis is ready to accept commands");
});

redis.on("error", (error) => {
  console.error("Redis error:", error.message);
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});
