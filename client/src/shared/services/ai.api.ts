import api from "./api";

/* One movie shape for search and chat. voteAverage is optional so this
   compiles before the backend starts sending it. */
export interface AIMovie {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  voteAverage?: number | null;
}

export type AISearchMovie = AIMovie;
export type AIAssistantMovie = AIMovie;

export interface AISearchIntent {
  searchQuery: string;
  genre: string | null;
  language: string | null;
  yearFrom: number | null;
  yearTo: number | null;
  sortBy: "popularity" | "rating" | "release_date" | null;
}

export interface AISearchResponse {
  intent: AISearchIntent;
  movies: AISearchMovie[];
}

export interface AIRecommendation {
  tmdbId: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
  reason: string;
}

export interface AIRecommendationsResponse {
  personalized: boolean;
  recommendations: AIRecommendation[];
}

export interface AIAssistantResponse {
  answer: string;
  movies?: AIAssistantMovie[];
}

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

const unwrap = <T>(body: ApiEnvelope<T>): T => {
  if (!body.success || body.data === undefined) {
    throw new Error("The AI service returned an unexpected response.");
  }

  return body.data;
};

export const searchWithAI = async (query: string, signal?: AbortSignal) => {
  const response = await api.post<ApiEnvelope<AISearchResponse>>(
    "/ai/search",
    { query },
    { signal },
  );

  return unwrap(response.data);
};

export const getAIRecommendations = async (signal?: AbortSignal) => {
  const response = await api.get<ApiEnvelope<AIRecommendationsResponse>>(
    "/ai/recommendations",
    { signal },
  );

  return unwrap(response.data);
};

export const askMovieAssistant = async (
  tmdbId: number,
  question: string,
  signal?: AbortSignal,
) => {
  const response = await api.post<ApiEnvelope<AIAssistantResponse>>(
    `/ai/${tmdbId}/ai`,
    { question },
    { signal },
  );

  return unwrap(response.data);
};

export const chatWithMovieAI = async (
  message: string,
  conversation: AIChatMessage[] = [],
  signal?: AbortSignal,
) => {
  const response = await api.post<ApiEnvelope<AIAssistantResponse>>(
    "/ai/chat",
    { message, conversation },
    { signal },
  );

  return unwrap(response.data);
};
