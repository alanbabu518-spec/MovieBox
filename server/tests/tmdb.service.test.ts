import { beforeEach, describe, expect, it, vi } from "vitest";

const tmdbClientMock = {
  get: vi.fn(),
};

const redisMock = {
  get: vi.fn(),
  set: vi.fn(),
};

vi.mock("../src/config/tmdb.js", () => ({
  tmdbConfig: {
    baseUrl: "https://api.example.com",
    apiKey: "test-api-key",
  },
}));

vi.mock("../src/config/redis.js", () => ({
  redis: redisMock,
}));

vi.mock("../src/config/cache.js", () => ({
  cacheConfig: {
    trendingMoviesTtl: 1800,
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
        typeof error === "object" && error !== null && "isAxiosError" in error,
    },
  };
});

const { getTrendingMovies, getLatestMovies, getUpcomingMovies } =
  await import("../src/services/tmdb.service.js");

describe("TMDB service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    tmdbClientMock.get.mockReset();
    redisMock.get.mockReset();
    redisMock.set.mockReset();
  });

  it("returns normalized trending movies from TMDB", async () => {
    redisMock.get.mockResolvedValue(null);

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

    redisMock.set.mockResolvedValue("OK");

    const result = await getTrendingMovies();

    expect(tmdbClientMock.get).toHaveBeenCalledWith("/trending/movie/week");

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
    redisMock.get.mockResolvedValue(null);

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

    redisMock.set.mockResolvedValue("OK");

    const result = await getTrendingMovies();

    expect(result.movies[0].releaseDate).toBeNull();
    expect(result.movies[0].posterPath).toBeNull();
    expect(result.movies[0].backdropPath).toBeNull();
  });

  it("returns cached movies without calling TMDB", async () => {
    const cachedMovies = {
      page: 1,
      totalPages: 5,
      totalResults: 100,
      movies: [
        {
          id: 1,
          title: "Cached Movie",
          overview: "Cached overview",
          posterPath: "/poster.jpg",
          backdropPath: "/backdrop.jpg",
          releaseDate: "2026-01-01",
          rating: 8,
          voteCount: 500,
          popularity: 200,
          originalLanguage: "en",
        },
      ],
    };

    redisMock.get.mockResolvedValue(JSON.stringify(cachedMovies));

    const result = await getTrendingMovies();

    expect(redisMock.get).toHaveBeenCalledWith(
      "moviebox:cache:movies:trending",
    );

    expect(tmdbClientMock.get).not.toHaveBeenCalled();

    expect(redisMock.set).not.toHaveBeenCalled();

    expect(result).toEqual(cachedMovies);
  });

  it("fetches from TMDB and caches the result on a cache miss", async () => {
    redisMock.get.mockResolvedValue(null);
    redisMock.set.mockResolvedValue("OK");

    tmdbClientMock.get.mockResolvedValue({
      data: {
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
      },
    });

    const result = await getTrendingMovies();

    expect(redisMock.get).toHaveBeenCalledWith(
      "moviebox:cache:movies:trending",
    );

    expect(tmdbClientMock.get).toHaveBeenCalledWith("/trending/movie/week");

    expect(redisMock.set).toHaveBeenCalledWith(
      "moviebox:cache:movies:trending",
      JSON.stringify(result),
      "EX",
      1800,
    );

    expect(result.movies).toHaveLength(1);
  });

  it("converts TMDB authentication errors to AppError", async () => {
    redisMock.get.mockResolvedValue(null);

    const error = {
      response: {
        status: 401,
      },
      isAxiosError: true,
    };

    tmdbClientMock.get.mockRejectedValue(error);

    await expect(getTrendingMovies()).rejects.toMatchObject({
      message: "TMDB authentication failed",
      statusCode: 502,
    });
  });

  it("converts TMDB rate limit errors to AppError", async () => {
    redisMock.get.mockResolvedValue(null);

    const error = {
      response: {
        status: 429,
      },
      isAxiosError: true,
    };

    tmdbClientMock.get.mockRejectedValue(error);

    await expect(getTrendingMovies()).rejects.toMatchObject({
      message: "TMDB rate limit exceeded",
      statusCode: 503,
    });
  });

  it("converts TMDB timeout errors to AppError", async () => {
    redisMock.get.mockResolvedValue(null);

    const error = {
      code: "ECONNABORTED",
      isAxiosError: true,
    };

    tmdbClientMock.get.mockRejectedValue(error);

    await expect(getTrendingMovies()).rejects.toMatchObject({
      message: "TMDB request timed out",
      statusCode: 504,
    });
  });

  it("converts unexpected TMDB errors to AppError", async () => {
    redisMock.get.mockResolvedValue(null);

    tmdbClientMock.get.mockRejectedValue(new Error("Network failure"));

    await expect(getTrendingMovies()).rejects.toMatchObject({
      message: "Failed to fetch movies from TMDB",
      statusCode: 502,
    });
  });
  it("returns normalized latest movies from TMDB", async () => {
    redisMock.get.mockResolvedValue(null);

    tmdbClientMock.get.mockResolvedValue({
      data: {
        page: 1,
        total_pages: 5,
        total_results: 50,
        results: [
          {
            id: 10,
            title: "Latest Movie",
            overview: "Latest movie overview",
            poster_path: "/latest.jpg",
            backdrop_path: "/latest-backdrop.jpg",
            release_date: "2026-09-20",
            vote_average: 8,
            vote_count: 500,
            popularity: 200,
            original_language: "en",
          },
        ],
      },
    });

    const result = await getLatestMovies();

    expect(tmdbClientMock.get).toHaveBeenCalledWith("/movie/now_playing");

    expect(result).toEqual({
      page: 1,
      totalPages: 5,
      totalResults: 50,
      movies: [
        {
          id: 10,
          title: "Latest Movie",
          overview: "Latest movie overview",
          posterPath: "/latest.jpg",
          backdropPath: "/latest-backdrop.jpg",
          releaseDate: "2026-09-20",
          rating: 8,
          voteCount: 500,
          popularity: 200,
          originalLanguage: "en",
        },
      ],
    });
  });
  it("returns normalized upcoming movies from TMDB", async () => {
    redisMock.get.mockResolvedValue(null);

    tmdbClientMock.get.mockResolvedValue({
      data: {
        page: 1,
        total_pages: 3,
        total_results: 30,
        results: [
          {
            id: 20,
            title: "Upcoming Movie",
            overview: "Upcoming movie overview",
            poster_path: "/upcoming.jpg",
            backdrop_path: "/upcoming-backdrop.jpg",
            release_date: "2026-12-25",
            vote_average: 7.5,
            vote_count: 300,
            popularity: 150,
            original_language: "en",
          },
        ],
      },
    });

    const result = await getUpcomingMovies();

    expect(tmdbClientMock.get).toHaveBeenCalledWith("/movie/upcoming");

    expect(result).toEqual({
      page: 1,
      totalPages: 3,
      totalResults: 30,
      movies: [
        {
          id: 20,
          title: "Upcoming Movie",
          overview: "Upcoming movie overview",
          posterPath: "/upcoming.jpg",
          backdropPath: "/upcoming-backdrop.jpg",
          releaseDate: "2026-12-25",
          rating: 7.5,
          voteCount: 300,
          popularity: 150,
          originalLanguage: "en",
        },
      ],
    });
  });
});
