import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../shared/types/auth.js";
import { AppError } from "../../shared/utils/appError.js";

import {
  askMovieAI,
  chatWithMovieAI,
  extractAISearchIntent,
} from "./ai.service.js";

import {
  discoverMovies,
  searchMovies,
} from "../../integrations/tmdb/tmdb.service.js";

import { getMovieDetails } from "../movies/movieDetails.service.js";
import { getAIRecommendations } from "./ai.recommendation.service.js";

type Movie = Awaited<
  ReturnType<typeof searchMovies>
>["movies"][number];

const genreMap: Record<string, string> = {
  action: "28",
  adventure: "12",
  animation: "16",
  comedy: "35",
  crime: "80",
  documentary: "99",
  drama: "18",
  family: "10751",
  fantasy: "14",
  history: "36",
  horror: "27",
  music: "10402",
  mystery: "9648",
  romance: "10749",
  "science fiction": "878",
  "sci-fi": "878",
  thriller: "53",
  war: "10752",
  western: "37",
};

const languageMap: Record<string, string> = {
  english: "en",
  hindi: "hi",
  tamil: "ta",
  telugu: "te",
  malayalam: "ml",
  kannada: "kn",
  korean: "ko",
  japanese: "ja",
  spanish: "es",
  french: "fr",
  german: "de",
  chinese: "zh",
};

const normalizeGenre = (
  genre: string | null,
) => {
  if (!genre) {
    return undefined;
  }

  return (
    genreMap[genre.trim().toLowerCase()] ??
    undefined
  );
};

const normalizeLanguage = (
  language: string | null,
) => {
  if (!language) {
    return undefined;
  }

  return (
    languageMap[
      language.trim().toLowerCase()
    ] ?? undefined
  );
};

const buildMovieFilters = (
  intent: Awaited<
    ReturnType<typeof extractAISearchIntent>
  >,
) => {
  const filters: {
    genre?: string;
    language?: string;
    year?: string;
    page?: number;
  } = {
    page: 1,
  };

  const genre = normalizeGenre(
    intent.genre,
  );

  const language = normalizeLanguage(
    intent.language,
  );

  if (genre) {
    filters.genre = genre;
  }

  if (language) {
    filters.language = language;
  }

  if (intent.yearFrom !== null) {
    filters.year = String(
      intent.yearFrom,
    );
  }

  return filters;
};

export const askMovieAssistant = async (
  req: Request,
  res: Response,
) => {
  const userId =
    (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401,
    );
  }

  const tmdbId = Number(req.params.tmdbId);

  if (
    !Number.isInteger(tmdbId) ||
    tmdbId <= 0
  ) {
    throw new AppError(
      "Invalid movie ID",
      400,
    );
  }

  const question =
    typeof req.body?.question === "string"
      ? req.body.question.trim()
      : "";

  if (!question) {
    throw new AppError(
      "Question is required",
      400,
    );
  }

  const movie =
    await getMovieDetails(tmdbId);

  const response = await askMovieAI({
    movieTitle: movie.title,
    overview: movie.overview,
    question,
  });

  res.status(200).json({
    success: true,
    data: response,
  });
};

export const searchWithAI = async (
  req: Request,
  res: Response,
) => {
  const userId =
    (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError(
      "Authentication required",
      401,
    );
  }

  const query =
    typeof req.body?.query === "string"
      ? req.body.query.trim()
      : "";

  if (!query) {
    throw new AppError(
      "Search query is required",
      400,
    );
  }

  const intent =
    await extractAISearchIntent({
      query,
    });

  const hasFilters =
    intent.genre !== null ||
    intent.language !== null ||
    intent.yearFrom !== null ||
    intent.yearTo !== null ||
    intent.sortBy !== null;

  if (!hasFilters) {
    const movies =
      await searchMovies(
        intent.searchQuery,
        1,
      );

    return res.status(200).json({
      success: true,
      data: {
        intent,
        movies,
      },
    });
  }

  const filters =
    buildMovieFilters(intent);

  const movies =
    await discoverMovies(filters);

  return res.status(200).json({
    success: true,
    data: {
      intent,
      movies,
    },
  });
};

export const getAIRecommendationResults =
  async (
    req: Request,
    res: Response,
  ) => {
    const userId =
      (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError(
        "Authentication required",
        401,
      );
    }

    const recommendations =
      await getAIRecommendations(
        userId,
      );

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  };

export const chatWithMovieAssistant =
  async (
    req: Request,
    res: Response,
  ) => {
    const userId =
      (req as AuthenticatedRequest).userId;

    if (!userId) {
      throw new AppError(
        "Authentication required",
        401,
      );
    }

    const message =
      typeof req.body?.message ===
      "string"
        ? req.body.message.trim()
        : "";

    if (!message) {
      throw new AppError(
        "Message is required",
        400,
      );
    }

    const conversation =
      Array.isArray(
        req.body?.conversation,
      )
        ? req.body.conversation
            .filter(
              (item: unknown) =>
                typeof item ===
                  "object" &&
                item !== null &&
                "role" in item &&
                "content" in item,
            )
            .slice(-10)
        : [];

    const intent =
      await extractAISearchIntent({
        query: message,
      });

    const hasSearchIntent =
      intent.searchQuery.trim() !==
        message.trim() ||
      intent.genre !== null ||
      intent.language !== null ||
      intent.yearFrom !== null ||
      intent.yearTo !== null ||
      intent.sortBy !== null;

    if (!hasSearchIntent) {
      const response =
        await chatWithMovieAI({
          message,
          conversation,
        });

      return res.status(200).json({
        success: true,
        data: {
          answer: response.answer,
          movies: [],
        },
      });
    }

    let movies: Movie[];

    const hasFilters =
      intent.genre !== null ||
      intent.language !== null ||
      intent.yearFrom !== null ||
      intent.yearTo !== null;

    if (hasFilters) {
      const filters =
        buildMovieFilters(intent);

      const result =
        await discoverMovies(filters);

      movies =
        result.movies.slice(0, 10);
    } else {
      const result =
        await searchMovies(
          intent.searchQuery,
          1,
        );

      movies =
        result.movies.slice(0, 10);
    }

    const movieContext = movies.map(
      (movie: Movie) => ({
        title: movie.title,
        overview: movie.overview,
        releaseDate:
          movie.releaseDate,
      }),
    );

    const response =
      await chatWithMovieAI({
        message: `
User request:
${message}

Real MovieBox movies found from TMDB:
${JSON.stringify(movieContext)}

Only discuss movies from the list above.
Do not create or invent additional movie titles.
Keep the response concise.
`,
        conversation,
      });

    return res.status(200).json({
      success: true,
      data: {
        answer: response.answer,
        movies,
      },
    });
  };