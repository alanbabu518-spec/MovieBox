import { AppError } from "../../shared/utils/appError.js";

const DEFAULT_NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_NVIDIA_MODELS = [
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "meta/llama-3.3-70b-instruct",
] as const;
const REQUEST_TIMEOUT_MS = 30_000;

type ChatRole = "system" | "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };
type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string | null } }>;
  error?: { message?: string };
};

const getNvidiaConfig = () => {
  const apiKey = process.env.NVIDIA_API_KEY?.trim();
  if (!apiKey) {
    throw new AppError("NVIDIA AI is not configured. Set NVIDIA_API_KEY in the server environment.", 503);
  }

  const baseUrl = (process.env.NVIDIA_BASE_URL?.trim() || DEFAULT_NVIDIA_BASE_URL).replace(/\/+$/, "");
  const primaryModel = process.env.NVIDIA_MODEL?.trim() || DEFAULT_NVIDIA_MODELS[0];
  const configuredFallbacks = process.env.NVIDIA_FALLBACK_MODELS
    ?.split(",")
    .map((model) => model.trim())
    .filter(Boolean);
  const models = [
    primaryModel,
    ...(configuredFallbacks?.length ? configuredFallbacks : DEFAULT_NVIDIA_MODELS.slice(1)),
  ].filter((model, index, all) => all.indexOf(model) === index);

  return { apiKey, baseUrl, models };
};

const createChatCompletion = async (
  messages: ChatMessage[],
  options: { temperature: number; maxTokens: number },
): Promise<string> => {
  const { apiKey, baseUrl, models } = getNvidiaConfig();
  let lastError: unknown;

  for (const model of models) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: false,
        }),
        signal: controller.signal,
      });

      const payload = (await response.json().catch(() => ({}))) as ChatCompletionResponse;

      if (!response.ok) {
        console.warn("NVIDIA model request failed", { model, status: response.status });
        if (response.status === 401 || response.status === 403) {
          throw new AppError("NVIDIA rejected the API credentials. Check NVIDIA_API_KEY.", 502);
        }
        if (response.status !== 429 && response.status >= 400 && response.status < 500) {
          throw new AppError("NVIDIA rejected the AI request. Please check the request configuration.", 502);
        }
        lastError = new AppError(`NVIDIA model ${model} is temporarily unavailable.`, response.status === 429 ? 429 : 502);
        continue;
      }

      const content = payload.choices?.[0]?.message?.content?.trim();
      if (!content) {
        lastError = new AppError(`NVIDIA model ${model} returned an empty response.`, 502);
        continue;
      }

      console.info("MovieBox AI model succeeded", { model });
      return content;
    } catch (error) {
      if (error instanceof AppError) throw error;
      lastError = new AppError(
        controller.signal.aborted
          ? `NVIDIA model ${model} timed out.`
          : `Could not connect to NVIDIA model ${model}.`,
        controller.signal.aborted ? 504 : 502,
      );
      console.warn("NVIDIA model failed; trying fallback", { model });
    } finally {
      clearTimeout(timeout);
    }
  }

  console.error("All configured NVIDIA models failed.", lastError);
  throw new AppError("All configured NVIDIA AI models are currently unavailable. Please try again shortly.", 503);
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
  sortBy:
    | "popularity"
    | "rating"
    | "release_date"
    | null;
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
  const content = await createChatCompletion([
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
      ], { temperature: 0.5, maxTokens: 350 });

  return { answer: content || "Unable to generate an answer." };
};

export const extractAISearchIntent = async (
  request: AISearchRequest,
): Promise<AISearchIntent> => {
  const content = await createChatCompletion([
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
      ], { temperature: 0, maxTokens: 300 });


  try {
    const intent =
      extractJson<AISearchIntent>(content);

    return {
      searchQuery:
        intent.searchQuery || request.query,
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

  const content = await createChatCompletion([
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
      ], { temperature: 0.3, maxTokens: 1500 });


  try {
    const result =
      extractJson<AIRecommendationResponse>(
        content,
      );

    const candidateIds = new Set(
      request.movies.map(
        (movie) => movie.tmdbId,
      ),
    );

    const excludedIds = new Set([
      ...request.favorites.map(
        (movie) => movie.tmdbId,
      ),
      ...request.watchlist.map(
        (movie) => movie.tmdbId,
      ),
    ]);

    const recommendations =
      result.recommendations
        .filter((recommendation) =>
          candidateIds.has(
            recommendation.tmdbId,
          ),
        )
        .filter(
          (recommendation) =>
            !excludedIds.has(
              recommendation.tmdbId,
            ),
        )
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
        "You are MovieBox AI, the movie assistant inside the MovieBox application. Keep every response concise, natural, and easy to scan. Never use Markdown tables. Never create large lists. Avoid long introductions and unnecessary explanations. Prefer short paragraphs or simple bullet points. When mentioning multiple movies, use a maximum of 5 movies unless the user explicitly asks for more. For each movie, mention the title followed by one short sentence. Do not invent movie titles, ratings, release dates, cast, directors, or other specific facts. Only provide specific movie facts when supported by the information available to you. If you do not know something, say that you do not have enough information. Do not pretend to have searched MovieBox or TMDB. If the user asks for recommendations, keep the response short and useful. End with one short follow-up question only when helpful.",
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
    maxTokens: 350,
  });

  const answer = content.trim();

  if (!answer) {
    throw new AppError(
      "AI could not generate a response",
      500,
    );
  }

  return {
    answer,
  };
};