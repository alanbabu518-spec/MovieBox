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
      isAxiosError: actual.default.isAxiosError,
    },
  };
});

const { getTrendingMovies } =
  await import("../src/services/tmdb.service.js");

describe("TMDB service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns trending movies from TMDB", async () => {
    const response = {
      page: 1,
      results: [
        {
          id: 1,
          title: "Test Movie",
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

    expect(result).toEqual(response);
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