import { describe, expect, it } from "vitest";
import { normalizeTMDBMovie } from "../src/utils/movieNormalizer.js";

describe("movie normalizer", () => {
  it("normalizes a TMDB movie", () => {
    const movie = normalizeTMDBMovie({
      id: 101,
      title: "Test Movie",
      overview: "A test movie",
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      release_date: "2026-01-15",
      vote_average: 8.4,
      vote_count: 1200,
      popularity: 350,
      original_language: "en",
    });

    expect(movie).toEqual({
      id: 101,
      title: "Test Movie",
      overview: "A test movie",
      posterPath: "/poster.jpg",
      backdropPath: "/backdrop.jpg",
      releaseDate: "2026-01-15",
      rating: 8.4,
      voteCount: 1200,
      popularity: 350,
      originalLanguage: "en",
    });
  });

  it("converts an empty release date to null", () => {
    const movie = normalizeTMDBMovie({
      id: 101,
      title: "Test Movie",
      overview: "A test movie",
      poster_path: null,
      backdrop_path: null,
      release_date: "",
      vote_average: 7,
      vote_count: 100,
      popularity: 50,
      original_language: "en",
    });

    expect(movie.releaseDate).toBeNull();
    expect(movie.posterPath).toBeNull();
    expect(movie.backdropPath).toBeNull();
  });
});