import { beforeEach, describe, expect, it, vi } from "vitest";

const tmdbClientMock = {
  get: vi.fn(),
};

vi.mock("../src/config/tmdb.js", () => ({
  tmdbConfig: {
    baseUrl: "https://api.example.com",
    apiKey: "test-api-key",
  },
}));

vi.mock("axios", async () => {
  const actual = await vi.importActual<typeof import("axios")>("axios");

  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => tmdbClientMock),
      isAxiosError: (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "isAxiosError" in error,
    },
  };
});

const { getTrendingMovies } =
  await import("../src/services/tmdb.service.js");

describe("TMDB service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns normalized trending movies from TMDB", async () => {
    const response = {
      page: 1,
      total_pages: 10,
      total_results: 200,
      results: [
        {
          id: 1,
          title: "Test Movie",
          overview: "Test overview",
          poster_path: "/poster.jpg",
          backdrop_path: "/backdrop.jpg",
          release_date: "2026-01-01",
          vote_average: 8.5,
          vote_count: 1000,
          popularity: 500,
          original_language: "en",
        },
      ],
    };

    tmdbClientMock.get.mockResolvedValue({
      data: response,
    });

    const result = await getTrendingMovies();

    expect(tmdbClientMock.get).toHaveBeenCalledWith(
      "/trending/movie/week",
    );

    expect(result).toEqual({
      page: 1,
      totalPages: 10,
      totalResults: 200,
      movies: [
        {
          id: 1,
          title: "Test Movie",
          overview: "Test overview",
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          releaseDate: "2026-01-01",
          rating: 8.5,
          voteCount: 1000,
          popularity: 500,
          originalLanguage: "en",
        },
      ],
    });
  });

  it("handles missing release dates", async () => {
    tmdbClientMock.get.mockResolvedValue({
      data: {
        page: 1,
        total_pages: 1,
        total_results: 1,
        results: [
          {
            id: 1,
            title: "Test Movie",
            overview: "Test overview",
            poster_path: null,
            backdrop_path: null,
            release_date: "",
            vote_average: 7,
            vote_count: 100,
            popularity: 50,
            original_language: "en",
          },
        ],
      },
    });

    const result = await getTrendingMovies();

    expect(result.movies[0].releaseDate).toBeNull();
    expect(result.movies[0].posterPath).toBeNull();
    expect(result.movies[0].backdropPath).toBeNull();
  });

  it("converts TMDB authentication errors to AppError", async () => {
    const error = {
      response: {
        status: 401,
      },
      isAxiosError: true,
    };

    tmdbClientMock.get.mockRejectedValue(error);

    await expect(
      getTrendingMovies(),
    ).rejects.toMatchObject({
      message: "TMDB authentication failed",
      statusCode: 502,
    });
  });

  it("converts TMDB rate limit errors to AppError", async () => {
    const error = {
      response: {
        status: 429,
      },
      isAxiosError: true,
    };

    tmdbClientMock.get.mockRejectedValue(error);

    await expect(
      getTrendingMovies(),
    ).rejects.toMatchObject({
      message: "TMDB rate limit exceeded",
      statusCode: 503,
    });
  });

  it("converts TMDB timeout errors to AppError", async () => {
    const error = {
      code: "ECONNABORTED",
      isAxiosError: true,
    };

    tmdbClientMock.get.mockRejectedValue(error);

    await expect(
      getTrendingMovies(),
    ).rejects.toMatchObject({
      message: "TMDB request timed out",
      statusCode: 504,
    });
  });

  it("converts unexpected TMDB errors to AppError", async () => {
    tmdbClientMock.get.mockRejectedValue(
      new Error("Network failure"),
    );

    await expect(
      getTrendingMovies(),
    ).rejects.toMatchObject({
      message: "Failed to fetch movies from TMDB",
      statusCode: 502,
    });
  });
});