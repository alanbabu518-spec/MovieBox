import api from "./api";

export interface TMDBVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official?: boolean;
}

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  popularity?: number;
  original_language?: string;
  overview: string;
  genre_ids?: number[];
  genres?: string[];
  videos?: TMDBVideo[];
}

interface NormalizedMovie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  rating: number;
  voteCount: number;
  popularity: number;
  originalLanguage: string;
  genreIds?: number[];
  genres?: string[];
}

interface MovieListData {
  page: number;
  totalPages: number;
  totalResults: number;
  movies: NormalizedMovie[];
}

interface MovieApiResponse {
  success: boolean;
  data: MovieListData;
}

export interface MovieListResult {
  movies: TMDBMovie[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface MovieCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface MovieGenre {
  id: number;
  name: string;
}

export interface MovieVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MovieDetails {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime: number | null;
  genres: MovieGenre[];
  credits: {
    cast: MovieCast[];
    crew: MovieCrew[];
  };
  videos: {
    results: MovieVideo[];
  };
  similar: {
    results: TMDBMovie[];
  };
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
}

export interface WatchProviderCountry {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProviders {
  id: number;
  results: Record<string, WatchProviderCountry>;
}

export interface RecommendationMovie {
  id: number;
  title: string;
  tmdbId: number;
  posterPath: string | null;
  backdropPath: string | null;
}

export interface Review {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export interface RatingStats {
  average: number;
  total: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  userRating: number | null;
}

export interface CreateReviewInput {
  content: string;
  rating: number;
}

interface MovieDetailsResponse {
  success: boolean;
  data: MovieDetails;
}

interface WatchProvidersResponse {
  success: boolean;
  data: WatchProviders;
}

interface RecommendationsResponse {
  success: boolean;
  data: RecommendationMovie[];
}

export interface MovieFilterParams {
  genre?: string;
  language?: string;
  year?: string;
  minRating?: string;
  page?: number;
}

function normalizeMovie(
  movie: NormalizedMovie,
): TMDBMovie {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.posterPath,
    backdrop_path: movie.backdropPath,
    release_date: movie.releaseDate,
    vote_average: movie.rating,
    overview: movie.overview,
    genre_ids: movie.genreIds ?? [],
    genres: movie.genres ?? [],
  };
}

function normalizeMovieList(
  movies: NormalizedMovie[],
): TMDBMovie[] {
  return movies.map(normalizeMovie);
}

function normalizeMovieResult(
  data: MovieListData,
): MovieListResult {
  return {
    movies: normalizeMovieList(data.movies),
    page: data.page,
    totalPages: data.totalPages,
    totalResults: data.totalResults,
  };
}

function buildFilterParams(
  params: MovieFilterParams = {},
) {
  return {
    ...(params.genre
      ? { genre: params.genre }
      : {}),
    ...(params.language
      ? { language: params.language }
      : {}),
    ...(params.year
      ? { year: params.year }
      : {}),
    ...(params.minRating
      ? {
          minRating: params.minRating,
        }
      : {}),
    ...(params.page
      ? { page: params.page }
      : {}),
  };
}

function normalizeMovieDetails(
  movie: MovieDetails,
): MovieDetails {
  const credits = movie.credits ?? {
    cast: [],
    crew: [],
  };

  const videos = movie.videos ?? {
    results: [],
  };

  const similar = movie.similar ?? {
    results: [],
  };

  return {
    ...movie,
    genres: Array.isArray(movie.genres)
      ? movie.genres
      : [],
    credits: {
      cast: Array.isArray(credits.cast)
        ? credits.cast
        : [],
      crew: Array.isArray(credits.crew)
        ? credits.crew
        : [],
    },
    videos: {
      results: Array.isArray(videos.results)
        ? videos.results
        : [],
    },
    similar: {
      results: Array.isArray(similar.results)
        ? similar.results
        : [],
    },
  };
}

export async function getTrendingMovies(
  params: MovieFilterParams = {},
): Promise<MovieListResult> {
  const response =
    await api.get<MovieApiResponse>(
      "/movies/trending",
      {
        params: buildFilterParams(params),
      },
    );

  return normalizeMovieResult(
    response.data.data,
  );
}

export type MovieIndustry =
  | "hollywood"
  | "bollywood"
  | "kollywood"
  | "tollywood"
  | "mollywood"
  | "kdrama";

export async function getIndustryTrendingMovies(
  industry: MovieIndustry,
): Promise<TMDBMovie[]> {
  const response =
    await api.get<MovieListData>(
      `/movies/trending/${industry}`,
    );

  return normalizeMovieList(
    response.data.movies,
  );
}

export async function getPopularMovies(
  params: MovieFilterParams = {},
): Promise<MovieListResult> {
  const response =
    await api.get<MovieApiResponse>(
      "/movies/popular",
      {
        params: buildFilterParams(params),
      },
    );

  return normalizeMovieResult(
    response.data.data,
  );
}

export async function getUpcomingMovies(
  params: MovieFilterParams = {},
): Promise<MovieListResult> {
  const response =
    await api.get<MovieApiResponse>(
      "/movies/upcoming",
      {
        params: buildFilterParams(params),
      },
    );

  return normalizeMovieResult(
    response.data.data,
  );
}

export async function getMovieDetails(
  id: string,
): Promise<MovieDetails> {
  const response =
    await api.get<MovieDetailsResponse>(
      `/movies/${id}`,
    );

  return normalizeMovieDetails(
    response.data.data,
  );
}

export async function getWatchProviders(
  tmdbId: string,
): Promise<WatchProviders> {
  const response =
    await api.get<WatchProvidersResponse>(
      `/movies/${tmdbId}/watch/providers`,
    );

  return response.data.data;
}

export async function getRecommendations(): Promise<
  RecommendationMovie[]
> {
  const response =
    await api.get<RecommendationsResponse>(
      "/movies/recommendations",
    );

  return response.data.data;
}

export async function getReviews(
  tmdbId: string,
): Promise<Review[]> {
  const response = await api.get(
    `/movies/${tmdbId}/reviews`,
  );

  const data =
    response.data?.data ?? response.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.reviews)) {
    return data.reviews;
  }

  return [];
}

export async function createReview(
  tmdbId: string,
  data: CreateReviewInput,
): Promise<Review> {
  const response = await api.post(
    `/movies/${tmdbId}/reviews`,
    data,
  );

  return response.data?.data ?? response.data;
}

export async function getRatingStats(
  tmdbId: string,
): Promise<RatingStats> {
  const response = await api.get(
    `/movies/${tmdbId}/rating`,
  );

  const data =
    response.data?.data ?? response.data;

  return {
    average: Number(data?.average ?? 0),
    total: Number(data?.total ?? 0),
    distribution: data?.distribution ?? {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    userRating:
      data?.userRating == null
        ? null
        : Number(data.userRating),
  };
}

export async function rateMovie(
  tmdbId: string,
  value: number,
): Promise<RatingStats> {
  const response = await api.post(
    `/movies/${tmdbId}/rating`,
    {
      rating: value,
    },
  );

  const data =
    response.data?.data ?? response.data;

  return {
    average: Number(data?.average ?? 0),
    total: Number(data?.total ?? 0),
    distribution: data?.distribution ?? {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
    userRating:
      data?.userRating == null
        ? value
        : Number(data.userRating),
  };
}

export async function searchMovies(
  query: string,
  page: number = 1,
): Promise<MovieListResult> {
  const response =
    await api.get<MovieApiResponse>(
      "/movies/search",
      {
        params: {
          query,
          page,
        },
      },
    );

  return normalizeMovieResult(
    response.data.data,
  );
}

export async function discoverMovies(
  params: MovieFilterParams = {},
): Promise<MovieListResult> {
  const response =
    await api.get<MovieApiResponse>(
      "/movies/discover",
      {
        params: buildFilterParams(params),
      },
    );

  return normalizeMovieResult(
    response.data.data,
  );
}