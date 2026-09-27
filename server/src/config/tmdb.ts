import "dotenv/config";

const tmdbApiKey = process.env.TMDB_API_KEY;
const tmdbBaseUrl = process.env.TMDB_BASE_URL;

if (!tmdbApiKey) {
  throw new Error("TMDB_API_KEY is required");
}

if (!tmdbBaseUrl) {
  throw new Error("TMDB_BASE_URL is required");
}

export const tmdbConfig = {
  baseUrl: tmdbBaseUrl,
  apiKey: tmdbApiKey,
};