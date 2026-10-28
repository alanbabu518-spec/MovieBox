import { AppError } from "../../shared/utils/appError.js";
import { nvidiaClient } from "./nvidia.client.js";

const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODELS = [
  "minimaxai/minimax-m3.1-flash",
  "nvidia/nemotron-3.5-bolt-e4b",
  "nvidia/nemotron-3.5-lightning-30b-a3b",
] as const;

const REQUEST_TIMEOUT_MS = 12_000;

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };
type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

const getNvidiaConfig = () => {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError(
      "NVIDIA AI is not configured. Set NVIDIA_API_KEY in the server environment.",
      503,
    );
  }

  const baseUrl = (
    process.env.NVIDIA_BASE_URL?.trim() || DEFAULT_NVIDIA_BASE_URL
  ).replace(/\/+$/, "");
  const primaryModel =
    process.env.NVIDIA_MODEL?.trim() || DEFAULT_NVIDIA_MODELS[0];
  const configuredFallbacks = process.env.NVIDIA_FALLBACK_MODELS?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  const models = [
    primaryModel,
    ...(configuredFallbacks?.length
      ? configuredFallbacks
      : DEFAULT_NVIDIA_MODELS.slice(1)),
  ].filter((model, index, all) => all.indexOf(model) === index);

  return { apiKey, baseUrl, models };
};

const createChatCompletion = async (
  messages: ChatMessage[],
  options: { temperature: number; maxTokens: number },
): Promise<string> => {
  const { models } = getNvidiaConfig();

  let lastErrorMessage = "No NVIDIA model returned a valid response.";
  let lastStatus = 503;

  for (const model of models) {
    try {
      const completion = await nvidiaClient.chat.completions.create(
        {
          model,
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: false,
        },
        {
          timeout: REQUEST_TIMEOUT_MS,
          maxRetries: 0,
        },
      );

      const content = completion.choices[0]?.message?.content?.trim();

      if (!content) {
        lastErrorMessage = `Model ${model} returned an empty response.`;
        lastStatus = 502;

        console.warn("MovieBox AI received an empty response:", { model });
        continue;
      }

      console.info("MovieBox AI model succeeded:", { model });

      return content;
    } catch (error: unknown) {
      if (error instanceof AppError) {
        throw error;
      }

      const apiError = error as {
        status?: number;
        message?: string;
        name?: string;
      };

      lastStatus = apiError.status ?? 502;
      lastErrorMessage = apiError.message ?? "Unknown NVIDIA API error";

      console.error("MovieBox NVIDIA request failed:", {
        model,
        status: lastStatus,
        errorName: apiError.name,
        message: lastErrorMessage,
      });

      // Credentials will not improve by switching models.
      if (lastStatus === 401 || lastStatus === 403) {
        throw new AppError(
          "NVIDIA rejected the API credentials. Check NVIDIA_API_KEY.",
          502,
        );
      }

      // Try the next model after a model or provider failure.
      continue;
    }
  }

  console.error("All MovieBox AI models failed:", {
    status: lastStatus,
    message: lastErrorMessage,
    models,
  });

  throw new AppError(
    "MovieBox AI is temporarily unavailable. Check server logs for the provider error.",
    503,
  );
};

export type MovieAIRequest = {
  movieTitle: string;
  overview: string;
  question: string;
};

export type MovieAIResponse = {
  answer: string;
};

export type AISearchRequest = {
  query: string;
};

export type AISearchIntent = {
  searchQuery: string;
  genre: string | null;
  language: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  sortBy: "popularity" | "rating" | "release_date" | null;
};

export type AIRecommendationRequest = {
  movies: Array<{
    tmdbId: number;
    title: string;
    overview: string | null;
    releaseDate: string | null;
  }>;
  favorites: Array<{
    tmdbId: number;
    title: string;
  }>;
  watchlist: Array<{
    tmdbId: number;
    title: string;
  }>;
};

export type AIRecommendation = {
  tmdbId: number;
  reason: string;
};

export type AIRecommendationResponse = {
  recommendations: AIRecommendation[];
};

export interface MovieAIChatRequest {
  message: string;
  conversation?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

const extractJson = <T>(content: string): T => {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
};

export const askMovieAI = async (
  request: MovieAIRequest,
): Promise<MovieAIResponse> => {
  const content = await createChatCompletion(
    [
      {
        role: "system",
        content:
          "You are MovieBox AI, the movie assistant inside the MovieBox application. Keep every response concise, natural, and easy to scan. Never use Markdown tables. Avoid long introductions. Prefer short paragraphs or simple bullet points. When discussing multiple movies, mention the title followed by one short sentence. Do not invent movie titles, ratings, release dates, cast, directors, or other specific facts. Only provide specific movie facts when they are supported by the context provided to you. If the user asks for movie recommendations, give a short list and briefly explain the type of movie they may enjoy. End with a short follow-up question only when it is useful.",
      },
      {
        role: "user",
        content: `
Movie title:
${request.movieTitle}

Movie overview:
${request.overview}

User question:
${request.question}
`,
      },
    ],
    { temperature: 0.5, maxTokens: 350 },
  );

  return { answer: content || "Unable to generate an answer." };
};

export const extractAISearchIntent = async (
  request: AISearchRequest,
): Promise<AISearchIntent> => {
  const content = await createChatCompletion(
    [
      {
        role: "system",
        content: `
You are the MovieBox AI search intent engine.

Convert the user's natural-language movie search into structured JSON.

Rules:
- Do not recommend movies.
- Do not invent movie titles.
- Extract only information explicitly implied by the request.
- searchQuery should contain the main movie/person/topic search text.
- genre should be a simple genre such as action, comedy, drama, horror, romance, thriller, sci-fi, animation, or null.
- language should use a common language name such as English, Malayalam, Hindi, Tamil, Telugu, Korean, or null.
- yearFrom and yearTo must be numbers or null.
- sortBy must be popularity, rating, release_date, or null.

Return only valid JSON.
`,
      },
      {
        role: "user",
        content: request.query,
      },
    ],
    { temperature: 0, maxTokens: 300 },
  );

  try {
    const intent = extractJson<AISearchIntent>(content);

    return {
      searchQuery: intent.searchQuery || request.query,
      genre: intent.genre ?? null,
      language: intent.language ?? null,
      yearFrom: intent.yearFrom ?? null,
      yearTo: intent.yearTo ?? null,
      sortBy: intent.sortBy ?? null,
    };
  } catch {
    return {
      searchQuery: request.query,
      genre: null,
      language: null,
      yearFrom: null,
      yearTo: null,
      sortBy: null,
    };
  }
};

export const generateRecommendations = async (
  request: AIRecommendationRequest,
): Promise<AIRecommendationResponse> => {
  if (request.movies.length === 0) {
    return {
      recommendations: [],
    };
  }

  const content = await createChatCompletion(
    [
      {
        role: "system",
        content: `
You are MovieBox AI's recommendation engine.

Recommend movies only from the candidate movie list provided by MovieBox.

Use the user's favorites and watchlist as preference signals.

Rules:
- Never invent a movie.
- Every recommended tmdbId must exist in the candidate list.
- Return at most 15 recommendations.
- Do not recommend a movie already in favorites or watchlist.
- Give a short reason for every recommendation.
- Return only valid JSON.

Expected format:
{
  "recommendations": [
    {
      "tmdbId": 123,
      "reason": "Short explanation"
    }
  ]
}
`,
      },
      {
        role: "user",
        content: JSON.stringify({
          favorites: request.favorites,
          watchlist: request.watchlist,
          candidates: request.movies,
        }),
      },
    ],
    { temperature: 0.3, maxTokens: 1500 },
  );

  try {
    const result = extractJson<AIRecommendationResponse>(content);

    const candidateIds = new Set(request.movies.map((movie) => movie.tmdbId));

    const excludedIds = new Set([
      ...request.favorites.map((movie) => movie.tmdbId),
      ...request.watchlist.map((movie) => movie.tmdbId),
    ]);

    const recommendations = result.recommendations
      .filter((recommendation) => candidateIds.has(recommendation.tmdbId))
      .filter((recommendation) => !excludedIds.has(recommendation.tmdbId))
      .slice(0, 15);

    return {
      recommendations,
    };
  } catch {
    return {
      recommendations: [],
    };
  }
};

export const chatWithMovieAI = async ({
  message,
  conversation = [],
}: MovieAIChatRequest): Promise<MovieAIResponse> => {
  const messages = [
    {
      role: "system" as const,
      content:
        "You are MovieBox AI, a knowledgeable, friendly assistant focused on movies and cinema. You can answer movie-related questions about plots, themes, endings, genres, directors, actors, franchises, comparisons, filmmaking, and recommendations. Keep answers concise, natural, and easy to scan. Never use Markdown tables. Prefer short paragraphs or simple bullets. When mentioning multiple movies, list at most 5 unless the user asks for more. Use your general knowledge to answer common film questions, but be transparent when a detail is uncertain or may be outdated. Never fabricate exact ratings, release dates, cast credits, awards, streaming availability, or claims that you searched MovieBox/TMDB. When verified MovieBox/TMDB results are included in the user's message, prioritize those results for titles and metadata. If no verified context is supplied and you are unsure of a specific fact, say so briefly rather than guessing. For recommendations, explain in one short phrase why each title fits. Stay focused on the user's actual question and do not refuse ordinary movie questions merely because no database context was supplied. End with a follow-up question only when it is genuinely useful.",
    },
    ...conversation.slice(-10).map((item) => ({
      role: item.role,
      content: item.content,
    })),
    {
      role: "user" as const,
      content: message,
    },
  ];

  const content = await createChatCompletion(messages, {
    temperature: 0.5,
    maxTokens: 800,
  });

  const answer = content.trim();

  if (!answer) {
    throw new AppError("AI could not generate a response", 500);
  }

  return {
    answer,
  };
};
