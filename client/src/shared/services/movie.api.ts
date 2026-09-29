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
  overview: string;
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

interface MovieDetailsResponse {
  success: boolean;
  data: MovieDetails;
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
    movies: normalizeMovieList(
      data.movies,
    ),
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

  return response.data.data;
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