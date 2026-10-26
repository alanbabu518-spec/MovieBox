import { useEffect, useState } from "react";

import Hero from "../shared/components/home/Hero";
import GenreTiles from "../shared/components/home/GenreTiles";
import CommunityBuzz from "../shared/components/home/Communitybuzz";
import MovieSection from "../shared/components/home/MovieSection";
import Navbar from "../shared/components/layout/Navbar";
import Footer from "../shared/components/layout/Footer";
import ProfileSetupModal from "../shared/components/auth/ProfileSetupModal";

import type { Movie } from "../shared/types/movie";

import {
  getPopularMovies,
  getTrendingMovies,
  getUpcomingMovies,
} from "../shared/services/movie.api";

function mapMovies(
  movies: Awaited<ReturnType<typeof getTrendingMovies>>["movies"],
): Movie[] {
  return movies
    .filter((movie) => movie.poster_path)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      releaseDate: movie.release_date || null,
      rating: movie.vote_average,
      voteCount: 0,
      popularity: 0,
      originalLanguage: "",
      genreIds: movie.genre_ids ?? [],
      genres: movie.genres ?? [],
    }));
}

function RailSkeleton() {
  return (
    <div aria-hidden="true" className="mb-10">
      <div className="skeleton mb-4 h-6 w-44 rounded-md" />

      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="skeleton aspect-2/3 w-[34vw] max-w-[190px] min-w-[116px] flex-none rounded-xl sm:w-[172px] lg:w-[188px]"
          />
        ))}
      </div>
    </div>
  );
}

function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      const [trendingResult, upcomingResult, popularResult] =
        await Promise.allSettled([
          getTrendingMovies(),
          getUpcomingMovies(),
          getPopularMovies(),
        ]);

      if (!mounted) {
        return;
      }

      setTrending(
        trendingResult.status === "fulfilled"
          ? mapMovies(trendingResult.value.movies)
          : [],
      );

      setUpcoming(
        upcomingResult.status === "fulfilled"
          ? mapMovies(upcomingResult.value.movies)
          : [],
      );

      setPopular(
        popularResult.status === "fulfilled"
          ? mapMovies(popularResult.value.movies)
          : [],
      );

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar overlay />

      <main>
        <Hero />

        <div className="mx-auto w-full max-w-[1400px] px-4 pb-6 pt-8 sm:px-6 lg:px-8">
          {loading ? (
            <>
              <RailSkeleton />
              <RailSkeleton />
            </>
          ) : (
            <>
              <MovieSection
                title="Trending Now"
                movies={trending}
                viewAllPath="/movies?category=trending"
              />

              <GenreTiles />

              <MovieSection
                title="Upcoming"
                movies={upcoming}
                viewAllPath="/movies?category=upcoming"
              />

              <MovieSection
                title="Popular Movies"
                movies={popular}
                viewAllPath="/movies?category=popular"
              />

              <CommunityBuzz />
            </>
          )}
        </div>
      </main>

      <Footer />

      <ProfileSetupModal />
    </div>
  );
}

export default Home;