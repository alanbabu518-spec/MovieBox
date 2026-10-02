import api from "./api";

export interface AISearchMovie {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
}

export interface AISearchIntent {
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

export interface AIAssistantMovie {
  id: number;
  title: string;
  overview: string | null;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string | null;
}

export interface AIAssistantResponse {
  answer: string;
  movies?: AIAssistantMovie[];
}

export const searchWithAI = async (
  query: string,
) => {
  const response =
    await api.post<{
      success: boolean;
      data: AISearchResponse;
    }>("/ai/search", {
      query,
    });

  return response.data.data;
};

export const getAIRecommendations =
  async () => {
    const response =
      await api.get<{
        success: boolean;
        data: AIRecommendationsResponse;
      }>("/ai/recommendations");

    return response.data.data;
  };

export const askMovieAssistant = async (
  tmdbId: number,
  question: string,
) => {
  const response =
    await api.post<{
      success: boolean;
      data: AIAssistantResponse;
    }>(`/ai/${tmdbId}/ai`, {
      question,
    });

  return response.data.data;
};

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const chatWithMovieAI = async (
  message: string,
  conversation: AIChatMessage[] = [],
) => {
  const response =
    await api.post<{
      success: boolean;
      data: AIAssistantResponse;
    }>("/ai/chat", {
      message,
      conversation,
    });

  return response.data.data;
};