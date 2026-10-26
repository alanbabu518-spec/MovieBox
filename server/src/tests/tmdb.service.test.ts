import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  getCachedJson: vi.fn(),
  setCachedJson: vi.fn(),
}));

vi.mock("../config/tmdb.js", () => ({
  tmdbConfig: {
    baseUrl: "https://api.example.com",
    apiKey: "test-api-key",
  },
}));

vi.mock("../config/cache.js", () => ({
  cacheConfig: {
    trendingMoviesTtl: 1800,
  },
}));

vi.mock("../shared/utils/cache.js", () => ({
  getCachedJson: mocks.getCachedJson,
  setCachedJson: mocks.setCachedJson,
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      get: mocks.get,
    })),
    isAxiosError: (error: unknown) =>
      typeof error === "object" && error !== null && "isAxiosError" in error,
  },
}));

vi.mock("axios-retry", () => {
  const axiosRetry = Object.assign(vi.fn(), {
    exponentialDelay: vi.fn(() => 1000),
    isNetworkError: vi.fn(() => false),
  });

  return {
    default: axiosRetry,
  };
});

import {
  getLatestMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "../integrations/tmdb/tmdb.service.js";

const sampleMovie = {
  id: 123,
  title: "Test Movie",
  overview: "A movie for testing.",
  poster_path: "/poster.jpg",
  backdrop_path: "/backdrop.jpg",
  release_date: "2026-01-15",
  vote_average: 8.2,
  vote_count: 100,
  popularity: 150,
  genre_ids: [28],
  original_language: "en",
  adult: false,
  video: false,
  original_title: "Test Movie",
};

const movieListResponse = {
  page: 1,
  total_pages: 1,
  total_results: 1,
  results: [sampleMovie],
};

const genreListResponse = {
  genres: [{ id: 28, name: "Action" }],
};

function mockMovieAndGenreRequests() {
  mocks.get
    .mockResolvedValueOnce({
      data: movieListResponse,
    })
    .mockResolvedValueOnce({
      data: genreListResponse,
    });
}

function mockAxiosError(
  status: number | undefined,
  message: string,
  code?: string,
) {
  const error: Record<string, unknown> = {
    isAxiosError: true,
    message,
  };

  if (status !== undefined) {
    error.response = {
      status,
      data: {
        status_message: message,
      },
      headers: {},
    };
  }

  if (code) {
    error.code = code;
  }

  return error;
}

describe("TMDB service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.getCachedJson.mockResolvedValue(null);
    mocks.setCachedJson.mockResolvedValue(undefined);
  });

  describe("getTrendingMovies", () => {
    it("returns normalized trending movies from TMDB", async () => {
      mockMovieAndGenreRequests();

      const result = await getTrendingMovies();

      expect(result).toMatchObject({
        page: 1,
        totalPages: 1,
      });

      expect(result.movies).toHaveLength(1);
      expect(result.movies[0]).toMatchObject({
        id: 123,
        title: "Test Movie",
        overview: "A movie for testing.",
      });

      expect(mocks.get).toHaveBeenNthCalledWith(
        1,
        "/trending/movie/week",
        expect.anything(),
      );

      expect(mocks.get).toHaveBeenNthCalledWith(
        2,
        "/genre/movie/list",
        expect.anything(),
      );

      expect(mocks.setCachedJson).toHaveBeenCalled();
    });

    it("handles missing release dates and image paths", async () => {
      const movieWithoutOptionalFields = {
        ...sampleMovie,
        release_date: "",
        poster_path: null,
        backdrop_path: null,
        genre_ids: [],
      };

      mocks.get
        .mockResolvedValueOnce({
          data: {
            ...movieListResponse,
            results: [movieWithoutOptionalFields],
          },
        })
        .mockResolvedValueOnce({
          data: {
            genres: [],
          },
        });

      const result = await getTrendingMovies();

      expect(result.movies).toHaveLength(1);

      expect(result.movies[0]).toMatchObject({
        id: 123,
        title: "Test Movie",
        posterPath: null,
        backdropPath: null,
        releaseDate: null,
        genreIds: [],
        genres: [],
      });
    });

    it("returns cached trending movies without making a request", async () => {
      const cachedMovies = {
        page: 1,
        totalPages: 1,
        totalResults: 1,
        movies: [
          {
            id: 456,
            title: "Cached Movie",
          },
        ],
      };

      mocks.getCachedJson.mockResolvedValueOnce(cachedMovies);

      const result = await getTrendingMovies();

      expect(result).toEqual(cachedMovies);
      expect(mocks.get).not.toHaveBeenCalled();
      expect(mocks.setCachedJson).not.toHaveBeenCalled();
    });

    it("fetches movies and caches the result on a cache miss", async () => {
      mockMovieAndGenreRequests();

      await getTrendingMovies();

      expect(mocks.getCachedJson).toHaveBeenCalled();
      expect(mocks.get).toHaveBeenCalled();
      expect(mocks.setCachedJson).toHaveBeenCalled();
    });
  });

  describe("getLatestMovies", () => {
    it("returns normalized latest movies", async () => {
      mockMovieAndGenreRequests();

      const result = await getLatestMovies();

      expect(result).toMatchObject({
        page: 1,
        totalPages: 1,
      });

      expect(result.movies).toHaveLength(1);
      expect(result.movies[0]).toMatchObject({
        id: 123,
        title: "Test Movie",
      });

      expect(mocks.get).toHaveBeenNthCalledWith(
        1,
        "/movie/now_playing",
        expect.anything(),
      );
    });
  });

  describe("getUpcomingMovies", () => {
    it("returns normalized upcoming movies", async () => {
      mockMovieAndGenreRequests();

      const result = await getUpcomingMovies();

      expect(result).toMatchObject({
        page: 1,
        totalPages: 1,
      });

      expect(result.movies).toHaveLength(1);
      expect(result.movies[0]).toMatchObject({
        id: 123,
        title: "Test Movie",
      });

      expect(mocks.get).toHaveBeenNthCalledWith(
        1,
        "/movie/upcoming",
        expect.anything(),
      );
    });
  });

  describe("TMDB error handling", () => {
    it("handles TMDB authentication errors", async () => {
      mocks.get.mockRejectedValueOnce(mockAxiosError(401, "Unauthorized"));

      await expect(getTrendingMovies()).rejects.toMatchObject({
        message: "TMDB authentication failed",
      });
    });

    it("handles TMDB rate-limit errors", async () => {
      mocks.get.mockRejectedValueOnce(mockAxiosError(429, "Too many requests"));

      await expect(getTrendingMovies()).rejects.toMatchObject({
        statusCode: 503,
      });
    });

    it("handles request timeouts", async () => {
      mocks.get.mockRejectedValueOnce(
        mockAxiosError(
          undefined,
          "timeout of 30000ms exceeded",
          "ECONNABORTED",
        ),
      );

      await expect(getTrendingMovies()).rejects.toMatchObject({
        statusCode: 504,
        message: "Movie service request timed out",
      });
    });

    it("handles unexpected TMDB errors", async () => {
      mocks.get.mockRejectedValueOnce(
        mockAxiosError(500, "Internal Server Error"),
      );

      await expect(getTrendingMovies()).rejects.toMatchObject({
        statusCode: 503,
      });
    });
  });
});
