import { redis } from "../../config/redis.js";

/**
 * Read a cached JSON value from Redis.
 *
 * Returns null when:
 * - The cache key does not exist.
 * - Redis is unavailable or the read fails.
 * - The cached value contains invalid JSON.
 *
 * The caller can then fetch fresh data from the original source.
 */
export async function getCachedJson<T>(
  key: string,
): Promise<T | null> {
  try {
    const cached = await redis.get(key);

    if (cached === null) {
      return null;
    }

    return JSON.parse(cached) as T;
  } catch (error: unknown) {
    console.error("Cache read failed", {
      key,
      message:
        error instanceof Error
          ? error.message
          : "Unknown cache error",
    });

    return null;
  }
}

/**
 * Write a JSON value to Redis with a TTL.
 *
 * Cache write failures are logged but do not throw,
 * allowing the application to return data even if caching fails.
 */
export async function setCachedJson<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  if (
    !Number.isSafeInteger(ttlSeconds) ||
    ttlSeconds <= 0
  ) {
    console.error("Cache write skipped: invalid TTL", {
      key,
      ttlSeconds,
    });

    return;
  }

  try {
    const serializedValue = JSON.stringify(value);

    if (serializedValue === undefined) {
      console.error("Cache write skipped: value is not serializable", {
        key,
      });

      return;
    }

    await redis.set(
      key,
      serializedValue,
      "EX",
      ttlSeconds,
    );
  } catch (error: unknown) {
    console.error("Cache write failed", {
      key,
      message:
        error instanceof Error
          ? error.message
          : "Unknown cache error",
    });
  }
}
