import { useEffect, useState } from "react";

import Hero from "../shared/components/home/Hero";
import MovieSection from "../shared/components/home/MovieSection";
import Navbar from "../shared/components/layout/Navbar";
import ProfileSetupModal from "../shared/components/auth/ProfileSetupModal";

import type { Movie } from "../shared/types/movie";

import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "../shared/services/movie.api";

function mapMovies(
  movies: Awaited<
    ReturnType<typeof getTrendingMovies>
  >["movies"],
): Movie[] {
  return movies
    .filter((movie) => movie.poster_path)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate:
        movie.release_date || null,
      rating: movie.vote_average,
      voteCount: 0,
      popularity: 0,
      originalLanguage: "",
      genreIds: movie.genre_ids ?? [],
      genres: movie.genres ?? [],
    }));
}

function Home() {
  const [trendingMovies, setTrendingMovies] =
    useState<Movie[]>([]);

  const [upcomingMovies, setUpcomingMovies] =
    useState<Movie[]>([]);

  const [popularMovies, setPopularMovies] =
    useState<Movie[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadMovies = async () => {
      setLoading(true);

      const [
        trendingResult,
        upcomingResult,
        popularResult,
      ] = await Promise.allSettled([
        getTrendingMovies(),
        getUpcomingMovies(),
        getPopularMovies(),
      ]);

      if (!mounted) {
        return;
      }

      if (
        trendingResult.status ===
        "fulfilled"
      ) {
        setTrendingMovies(
          mapMovies(
            trendingResult.value.movies,
          ),
        );
      } else {
        setTrendingMovies([]);
      }

      if (
        upcomingResult.status ===
        "fulfilled"
      ) {
        setUpcomingMovies(
          mapMovies(
            upcomingResult.value.movies,
          ),
        );
      } else {
        setUpcomingMovies([]);
      }

      if (
        popularResult.status ===
        "fulfilled"
      ) {
        setPopularMovies(
          mapMovies(
            popularResult.value.movies,
          ),
        );
      } else {
        setPopularMovies([]);
      }

      setLoading(false);
    };

    loadMovies();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor:
          "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      <Navbar />

      <main>
        <Hero />

        <div className="mx-auto w-full max-w-363 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
          {!loading && (
            <>
              <MovieSection
                title="Trending Movies"
                movies={trendingMovies}
                viewAllPath="/movies?category=trending"
                category="trending"
              />

              <MovieSection
                title="Upcoming Movies"
                movies={upcomingMovies}
                viewAllPath="/movies?category=upcoming"
                category="upcoming"
              />

              <MovieSection
                title="Popular Movies"
                movies={popularMovies}
                viewAllPath="/movies?category=popular"
                category="popular"
              />
            </>
          )}
        </div>
      </main>

      <ProfileSetupModal />
    </div>
  );
}

export default Home;