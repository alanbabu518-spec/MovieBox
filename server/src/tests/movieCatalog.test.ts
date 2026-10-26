import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  redisSet: vi.fn(),
  redisEval: vi.fn(),
  movieFindMany: vi.fn(),
  movieCreateMany: vi.fn(),
  movieUpdate: vi.fn(),
  movieExecuteRaw: vi.fn(),
  addMovieTitles: vi.fn(),
  discoverMovies: vi.fn(),
}));

vi.mock("../config/database.js", () => ({
  prisma: {
    movie: {
      findMany: mocks.movieFindMany,
      createMany: mocks.movieCreateMany,
      update: mocks.movieUpdate,
    },
    $executeRaw: mocks.movieExecuteRaw,
  },
}));

vi.mock("../config/redis.js", () => ({
  redis: {
    set: mocks.redisSet,
    eval: mocks.redisEval,
  },
}));

vi.mock("../modules/movies/autocomplete.service.js", () => ({
  addMovieTitles: mocks.addMovieTitles,
}));

vi.mock("../integrations/tmdb/tmdb.service.js", () => ({
  discoverMovies: mocks.discoverMovies,
}));

import { ingestMovieCatalog } from "../modules/movies/movieCatalog.service.js";

describe("ingestMovieCatalog", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.redisSet.mockResolvedValue("OK");
    mocks.redisEval.mockResolvedValue(1);

    mocks.movieFindMany.mockResolvedValue([]);
    mocks.movieCreateMany.mockResolvedValue({ count: 3 });
    mocks.movieUpdate.mockResolvedValue({});
    mocks.movieExecuteRaw.mockResolvedValue(1);

    mocks.addMovieTitles.mockResolvedValue(undefined);

    mocks.discoverMovies.mockResolvedValue({
      movies: [
        {
          id: 101,
          title: "Movie A",
          posterPath: "/a.jpg",
          backdropPath: "/a-bg.jpg",
          releaseDate: "2025-01-01",
        },
        {
          id: 102,
          title: "Movie B",
          posterPath: "/b.jpg",
          backdropPath: "/b-bg.jpg",
          releaseDate: "2025-02-01",
        },
        {
          id: 103,
          title: "Movie A",
          posterPath: "/a2.jpg",
          backdropPath: "/a2-bg.jpg",
          releaseDate: "2025-03-01",
        },
      ],
    });
  });

  it("ingests movies and deduplicates autocomplete titles", async () => {
    const result = await ingestMovieCatalog(1);

    expect(mocks.redisSet).toHaveBeenCalledOnce();
    expect(mocks.discoverMovies).toHaveBeenCalledWith({ page: 1 });
    expect(mocks.movieFindMany).toHaveBeenCalledOnce();
    expect(mocks.movieCreateMany).toHaveBeenCalledOnce();

    expect(mocks.movieCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ tmdbId: 101, title: "Movie A" }),
        expect.objectContaining({ tmdbId: 102, title: "Movie B" }),
        expect.objectContaining({ tmdbId: 103, title: "Movie A" }),
      ]),
      skipDuplicates: true,
    });

    expect(mocks.movieUpdate).not.toHaveBeenCalled();
    expect(mocks.movieExecuteRaw).not.toHaveBeenCalled();

    expect(mocks.addMovieTitles).toHaveBeenCalledWith([
      "Movie A",
      "Movie B",
    ]);

    expect(result).toEqual({
      pages: 1,
      totalMovies: 3,
      uniqueTitles: 2,
    });

    expect(mocks.redisEval).toHaveBeenCalledOnce();
  });

  it("rejects ingestion when another process holds the lock", async () => {
    mocks.redisSet.mockResolvedValue(null);

    await expect(ingestMovieCatalog(1)).rejects.toThrow(
      "Catalog ingestion is already running",
    );

    expect(mocks.discoverMovies).not.toHaveBeenCalled();
    expect(mocks.movieFindMany).not.toHaveBeenCalled();
    expect(mocks.movieCreateMany).not.toHaveBeenCalled();
    expect(mocks.movieExecuteRaw).not.toHaveBeenCalled();
    expect(mocks.redisEval).not.toHaveBeenCalled();
  });

  it("releases the lock when ingestion fails", async () => {
    mocks.discoverMovies.mockRejectedValue(
      new Error("TMDB request failed"),
    );

    await expect(ingestMovieCatalog(1)).rejects.toThrow(
      "TMDB request failed",
    );

    expect(mocks.redisEval).toHaveBeenCalledOnce();
    expect(mocks.addMovieTitles).not.toHaveBeenCalled();
  });

  it("rejects invalid page counts", async () => {
    await expect(ingestMovieCatalog(0)).rejects.toThrow(
      "Pages must be an integer between 1 and 500",
    );

    await expect(ingestMovieCatalog(501)).rejects.toThrow(
      "Pages must be an integer between 1 and 500",
    );

    expect(mocks.redisSet).not.toHaveBeenCalled();
  });

  it("stops when Redis is unavailable", async () => {
    mocks.redisSet.mockRejectedValue(new Error("Redis unavailable"));

    await expect(ingestMovieCatalog(1)).rejects.toThrow(
      "Redis unavailable",
    );

    expect(mocks.discoverMovies).not.toHaveBeenCalled();
    expect(mocks.movieFindMany).not.toHaveBeenCalled();
    expect(mocks.movieCreateMany).not.toHaveBeenCalled();
    expect(mocks.movieExecuteRaw).not.toHaveBeenCalled();
  });

  it("updates existing movies in bulk instead of inserting them again", async () => {
    mocks.movieFindMany.mockResolvedValue([{ tmdbId: 101 }]);

    await ingestMovieCatalog(1);

    expect(mocks.movieCreateMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ tmdbId: 102 }),
        expect.objectContaining({ tmdbId: 103 }),
      ]),
      skipDuplicates: true,
    });

    // Existing movies are updated through a single raw SQL bulk operation.
    expect(mocks.movieExecuteRaw).toHaveBeenCalledOnce();
    expect(mocks.movieUpdate).not.toHaveBeenCalled();
  });
});
