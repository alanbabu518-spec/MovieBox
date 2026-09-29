export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  releaseDate?: string;
  rating?: number;
  genre?: string;
  runtime?: number;
  overview?: string;
}
