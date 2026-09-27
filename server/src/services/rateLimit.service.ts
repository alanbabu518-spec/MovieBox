import { redis } from "../config/redis.js";

const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "tokens", "timestamp")

local tokens = tonumber(data[1])
local timestamp = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  timestamp = now
end

local elapsed = math.max(0, now - timestamp)

tokens = math.min(
  capacity,
  tokens + (elapsed * refillRate)
)

local allowed = 0
local retryAfter = 0

if tokens >= requested then
  tokens = tokens - requested
  allowed = 1
else
  local missing = requested - tokens
  retryAfter = math.ceil(missing / refillRate)
end

redis.call(
  "HSET",
  key,
  "tokens",
  tokens,
  "timestamp",
  now
)

local ttl = math.ceil(capacity / refillRate)

redis.call(
  "EXPIRE",
  key,
  ttl
)

return { allowed, tokens, retryAfter }
`;

type TokenBucketResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

export const consumeToken = async ({
  key,
  capacity,
  refillRate,
  tokens = 1,
}: {
  key: string;
  capacity: number;
  refillRate: number;
  tokens?: number;
}): Promise<TokenBucketResult> => {
  const now = Date.now() / 1000;

  const result = (await redis.eval(
    TOKEN_BUCKET_SCRIPT,
    1,
    key,
    capacity,
    refillRate,
    now,
    tokens
  )) as [number, number, number];

  return {
    allowed: result[0] === 1,
    remaining: Math.floor(result[1]),
    retryAfter: result[2],
  };
};