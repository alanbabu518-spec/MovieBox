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

type Movie = Awaited<ReturnType<typeof searchMovies>>["movies"][number];

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

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

const normalizeGenre = (genre: string | null) => {
  if (!genre) {
    return undefined;
  }

  return genreMap[genre.trim().toLowerCase()] ?? undefined;
};

const normalizeLanguage = (language: string | null) => {
  if (!language) {
    return undefined;
  }

  return languageMap[language.trim().toLowerCase()] ?? undefined;
};

const buildMovieFilters = (
  intent: Awaited<ReturnType<typeof extractAISearchIntent>>,
) => {
  const filters: {
    genre?: string;
    language?: string;
    year?: string;
    page?: number;
  } = {
    page: 1,
  };

  const genre = normalizeGenre(intent.genre);
  const language = normalizeLanguage(intent.language);

  if (genre) {
    filters.genre = genre;
  }

  if (language) {
    filters.language = language;
  }

  if (intent.yearFrom !== null) {
    filters.year = String(intent.yearFrom);
  }

  return filters;
};

export const askMovieAssistant = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const tmdbId = Number(req.params.tmdbId);

  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    throw new AppError("Invalid movie ID", 400);
  }

  const question =
    typeof req.body?.question === "string" ? req.body.question.trim() : "";

  if (!question) {
    throw new AppError("Question is required", 400);
  }

  const movie = await getMovieDetails(tmdbId);

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

export const searchWithAI = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const query =
    typeof req.body?.query === "string" ? req.body.query.trim() : "";

  if (!query) {
    throw new AppError("Search query is required", 400);
  }

  const intent = await extractAISearchIntent({ query });

  const hasFilters =
    intent.genre !== null ||
    intent.language !== null ||
    intent.yearFrom !== null ||
    intent.yearTo !== null ||
    intent.sortBy !== null;

  if (!hasFilters) {
    const movies = await searchMovies(intent.searchQuery, 1);

    return res.status(200).json({
      success: true,
      data: {
        intent,
        movies,
      },
    });
  }

  const filters = buildMovieFilters(intent);
  const movies = await discoverMovies(filters);

  return res.status(200).json({
    success: true,
    data: {
      intent,
      movies,
    },
  });
};

export const getAIRecommendationResults = async (
  req: Request,
  res: Response,
) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const recommendations = await getAIRecommendations(userId);

  res.status(200).json({
    success: true,
    data: recommendations,
  });
};

const isMovieDiscoveryRequest = (message: string): boolean => {
  // Use TMDB retrieval only for discovery requests. Ordinary movie questions
  // go directly to chat, avoiding an unnecessary intent-extraction call.
  return /\b(recommend|recommendations|suggest|find me|show me|discover|search for|looking for|movies like|similar to|best|top|watch next|what should i watch|movies about|films about|\d{4} movies|in the \w+ genre|\w+ movies|\w+ films)\b/i.test(
    message,
  );
};

const isConversationMessage = (
  value: unknown,
): value is ConversationMessage => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as {
    role?: unknown;
    content?: unknown;
  };

  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
};

export const chatWithMovieAssistant = async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    throw new AppError("Authentication required", 401);
  }

  const message =
    typeof req.body?.message === "string" ? req.body.message.trim() : "";

  if (!message) {
    throw new AppError("Message is required", 400);
  }

  if (message.length > 2000) {
    throw new AppError("Message must be 2000 characters or fewer", 400);
  }

  // Validate unknown request-body data before accessing message properties.
  // The explicit predicate gives TypeScript a safe ConversationMessage[] type.
  const rawConversation: unknown[] = Array.isArray(req.body?.conversation)
    ? req.body.conversation
    : [];

  const conversation: ConversationMessage[] = rawConversation
    .filter(isConversationMessage)
    .slice(-10)
    .map(
      (item: ConversationMessage): ConversationMessage => ({
        role: item.role,
        content: item.content.slice(0, 4000),
      }),
    );

  // General questions (plot, endings, cast, directors, genres, film history,
  // awards, comparisons) go straight to the chat model.
  if (!isMovieDiscoveryRequest(message)) {
    const response = await chatWithMovieAI({ message, conversation });

    return res.status(200).json({
      success: true,
      data: { answer: response.answer, movies: [] },
    });
  }

  let intent: Awaited<ReturnType<typeof extractAISearchIntent>>;

  try {
    intent = await extractAISearchIntent({ query: message });
  } catch {
    console.warn("MovieBox AI intent extraction failed; using chat fallback.");

    const response = await chatWithMovieAI({ message, conversation });

    return res.status(200).json({
      success: true,
      data: { answer: response.answer, movies: [] },
    });
  }

  let movies: Movie[] = [];

  const hasFilters =
    intent.genre !== null ||
    intent.language !== null ||
    intent.yearFrom !== null ||
    intent.yearTo !== null;

  try {
    if (hasFilters) {
      const result = await discoverMovies(buildMovieFilters(intent));
      movies = result.movies.slice(0, 10);
    } else {
      const query = intent.searchQuery.trim() || message;
      const result = await searchMovies(query, 1);
      movies = result.movies.slice(0, 10);
    }
  } catch {
    console.warn(
      "MovieBox AI could not retrieve TMDB results; using chat fallback.",
    );

    const response = await chatWithMovieAI({ message, conversation });

    return res.status(200).json({
      success: true,
      data: { answer: response.answer, movies: [] },
    });
  }

  const movieContext = movies.map((movie: Movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    releaseDate: movie.releaseDate,
    rating: movie.rating,
    genres: movie.genres,
  }));

  const response = await chatWithMovieAI({
    message: [
      `User request: ${message}`,
      "",
      "Verified MovieBox/TMDB results (use these exact titles and facts for the movie cards):",
      JSON.stringify(movieContext),
      "",
      "Answer the user's request naturally. If results are present, briefly explain why they fit.",
      "Do not claim a movie is in the results if it is not listed. Do not invent ratings, dates, cast, or credits.",
      "If no results were found, say so honestly and still offer a useful next step.",
    ].join("\n"),
    conversation,
  });

  return res.status(200).json({
    success: true,
    data: { answer: response.answer, movies },
  });
};
