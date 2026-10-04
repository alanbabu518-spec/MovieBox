export type TMDBGenre = {
  id: number;
  name: string;
};

export type TMDBMovie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  original_language: string;
  genre_ids?: number[];
};

export type TMDBMovieListResponse = {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
};

export type TMDBGenreListResponse = {
  genres: TMDBGenre[];
};

export type TMDBMovieDetails = TMDBMovie & {
  genres: TMDBGenre[];
  runtime: number | null;
  status: string;
  tagline: string | null;
};

export type TMDBCredits = {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
};

export type TMDBVideo = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
};

export type TMDBVideosResponse = {
  results: TMDBVideo[];
};

export type TMDBImagesResponse = {
  backdrops: {
    file_path: string;
    width: number;
    height: number;
  }[];
  posters: {
    file_path: string;
    width: number;
    height: number;
  }[];
};

export type TMDBSimilarMoviesResponse = {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
};

export type TMDBWatchProvider = {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
};

export type TMDBWatchProviderCountry = {
  link: string;
  flatrate?: TMDBWatchProvider[];
  rent?: TMDBWatchProvider[];
  buy?: TMDBWatchProvider[];
};

export type TMDBWatchProvidersResponse = {
  id: number;
  results: Record<string, TMDBWatchProviderCountry>;
};