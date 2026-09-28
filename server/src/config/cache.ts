import "dotenv/config";

const trendingMoviesCacheTtl = Number(
  process.env.TRENDING_MOVIES_CACHE_TTL,
);

if (
  !Number.isInteger(trendingMoviesCacheTtl) ||
  trendingMoviesCacheTtl <= 0
) {
  throw new Error(
    "TRENDING_MOVIES_CACHE_TTL must be a positive integer",
  );
}

export const cacheConfig = {
  trendingMoviesTtl: trendingMoviesCacheTtl,
};