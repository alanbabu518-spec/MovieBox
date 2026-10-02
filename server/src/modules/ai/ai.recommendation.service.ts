import { prisma } from "../../config/database.js";

import {
  discoverMovies,
  getPopularMovies,
} from "../../integrations/tmdb/tmdb.service.js";

import { getMovieDetails } from "../movies/movieDetails.service.js";

import {
  generateRecommendations,
  type AIRecommendationResponse,
} from "./ai.service.js";

const MAX_RECOMMENDATIONS = 15;

type RecommendationMovie = {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
};

const getUserMovies = async (userId: string) => {
  const [favorites, watchlist] =
    await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        select: {
          movie: {
            select: {
              tmdbId: true,
              title: true,
            },
          },
        },
      }),

      prisma.watchlist.findMany({
        where: { userId },
        select: {
          movie: {
            select: {
              tmdbId: true,
              title: true,
            },
          },
        },
      }),
    ]);

  return {
    favorites: favorites.map(
      (item) => item.movie,
    ),
    watchlist: watchlist.map(
      (item) => item.movie,
    ),
  };
};

const getPreferenceGenres = async (
  movies: Array<{
    tmdbId: number;
    title: string;
  }>,
) => {
  const genreIds = new Set<number>();

  for (const movie of movies.slice(0, 5)) {
    try {
      const details =
        await getMovieDetails(
          movie.tmdbId,
        );

      for (const genre of details.genres ?? []) {
        if (typeof genre.id === "number") {
          genreIds.add(genre.id);
        }
      }
    } catch {
      continue;
    }
  }

  return Array.from(genreIds);
};

const getCandidateMovies = async (
  genreIds: number[],
): Promise<RecommendationMovie[]> => {
  if (genreIds.length === 0) {
    const popular =
      await getPopularMovies({
        page: 1,
      });

    return popular.movies as RecommendationMovie[];
  }

  const result =
    await discoverMovies({
      genre: genreIds.join(","),
      page: 1,
    });

  return result.movies as RecommendationMovie[];
};

export const getAIRecommendations =
  async (
    userId: string,
  ): Promise<
    AIRecommendationResponse & {
      personalized: boolean;
    }
  > => {
    const {
      favorites,
      watchlist,
    } = await getUserMovies(userId);

    const hasPreferences =
      favorites.length > 0 ||
      watchlist.length > 0;

    if (!hasPreferences) {
      const popular =
        await getPopularMovies({
          page: 1,
        });

      const recommendations =
        (popular.movies as RecommendationMovie[])
          .slice(
            0,
            MAX_RECOMMENDATIONS,
          )
          .map(
            (
              movie: RecommendationMovie,
            ) => ({
              tmdbId: movie.id,
              title: movie.title,
              overview:
                movie.overview ?? null,
              posterPath:
                movie.posterPath,
              backdropPath:
                movie.backdropPath,
              releaseDate:
                movie.releaseDate ?? null,
              reason:
                "Popular movie recommended for discovery.",
            }),
          );

      return {
        personalized: false,
        recommendations,
      };
    }

    const preferenceMovies = [
      ...favorites,
      ...watchlist,
    ];

    const genreIds =
      await getPreferenceGenres(
        preferenceMovies,
      );

    const candidates =
      await getCandidateMovies(
        genreIds,
      );

    const excludedIds =
      new Set([
        ...favorites.map(
          (movie) => movie.tmdbId,
        ),
        ...watchlist.map(
          (movie) => movie.tmdbId,
        ),
      ]);

    const filteredCandidates =
      candidates
        .filter(
          (movie: RecommendationMovie) =>
            !excludedIds.has(movie.id),
        )
        .slice(0, 40);

    if (
      filteredCandidates.length === 0
    ) {
      return {
        personalized: true,
        recommendations: [],
      };
    }

    const aiResult =
      await generateRecommendations({
        favorites,
        watchlist,
        movies:
          filteredCandidates.map(
            (
              movie: RecommendationMovie,
            ) => ({
              tmdbId: movie.id,
              title: movie.title,
              overview:
                movie.overview ?? null,
              releaseDate:
                movie.releaseDate ?? null,
            }),
          ),
      });

    const candidateMap =
      new Map<number, RecommendationMovie>(
        filteredCandidates.map(
          (
            movie: RecommendationMovie,
          ) => [
            movie.id,
            movie,
          ],
        ),
      );

    const recommendations =
      aiResult.recommendations
        .map((recommendation) => {
          const movie =
            candidateMap.get(
              recommendation.tmdbId,
            );

          if (!movie) {
            return null;
          }

          return {
            tmdbId: movie.id,
            title: movie.title,
            overview:
              movie.overview ?? null,
            posterPath:
              movie.posterPath,
            backdropPath:
              movie.backdropPath,
            releaseDate:
              movie.releaseDate ?? null,
            reason:
              recommendation.reason,
          };
        })
        .filter(
          (
            movie,
          ): movie is NonNullable<
            typeof movie
          > => movie !== null,
        )
        .slice(
          0,
          MAX_RECOMMENDATIONS,
        );

    return {
      personalized: true,
      recommendations,
    };
  };