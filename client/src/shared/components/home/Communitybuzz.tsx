import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import SectionHeader from "../ui/Sectionheader";

import api from "../../services/api";

import { useAuth } from "../../context/AuthContext";

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

interface CommunityReview {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  user: { id: string; name: string };
  movie: { tmdbId: number; title: string };
}

/* Falls back to the sample reviews below if the endpoint doesn't exist yet */
async function getRecentReviews(limit = 6): Promise<CommunityReview[]> {
  const response = await api.get("/movies/reviews/recent", {
    params: { limit },
  });

  const data = response.data?.data ?? response.data;

  return Array.isArray(data) ? data : [];
}

/* Shown only while the database has no reviews yet.
   Set to false (or delete SAMPLE_REVIEWS) once real reviews exist. */
const USE_SAMPLE_FALLBACK = true;

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3600 * 1000).toISOString();

const SAMPLE_REVIEWS: CommunityReview[] = [
  {
    id: "sample-1",
    rating: 5,
    createdAt: hoursAgo(50),
    user: { id: "u1", name: "Sarah Jenkins" },
    movie: { tmdbId: 693134, title: "Dune: Part Two" },
    content:
      "An absolute masterpiece. The cinematography and sound design are out of this world. Denis has done it again!",
  },
  {
    id: "sample-2",
    rating: 4.5,
    createdAt: hoursAgo(170),
    user: { id: "u2", name: "Marcus Thorne" },
    movie: { tmdbId: 872585, title: "Oppenheimer" },
    content:
      "Nolan's best work in years. The pacing was impeccable and Cillian Murphy gave the performance of a lifetime.",
  },
  {
    id: "sample-3",
    rating: 3.8,
    createdAt: hoursAgo(98),
    user: { id: "u3", name: "Elena Vance" },
    movie: { tmdbId: 414906, title: "The Batman" },
    content:
      "Genuinely gripping atmosphere and a great score. A bit slow in the second act, but definitely worth the watch.",
  },
  {
    id: "sample-4",
    rating: 4.7,
    createdAt: hoursAgo(260),
    user: { id: "u4", name: "Arjun Menon" },
    movie: { tmdbId: 157336, title: "Interstellar" },
    content:
      "Still gives me goosebumps. The docking scene with that organ score is one of the best moments in cinema.",
  },
  {
    id: "sample-5",
    rating: 4.2,
    createdAt: hoursAgo(310),
    user: { id: "u5", name: "Priya Nair" },
    movie: { tmdbId: 1022789, title: "Inside Out 2" },
    content:
      "Funny, warm and surprisingly emotional. Anxiety steals the whole movie. Perfect for the whole family.",
  },
  {
    id: "sample-6",
    rating: 4,
    createdAt: hoursAgo(400),
    user: { id: "u6", name: "Daniel Ross" },
    movie: { tmdbId: 533535, title: "Deadpool & Wolverine" },
    content:
      "Pure chaotic fun with great chemistry between the leads. Don't think too hard, just enjoy the ride.",
  },
];

function timeAgo(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, seconds] of UNITS) {
    if (Math.abs(diff) >= seconds) {
      return formatter.format(Math.round(diff / seconds), unit);
    }
  }

  return "just now";
}

export default function CommunityBuzz() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getRecentReviews(6)
      .then((data: CommunityReview[]) => mounted && setReviews(data))
      .catch(() => mounted && setReviews([]))
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const list =
    reviews.length > 0
      ? reviews
      : USE_SAMPLE_FALLBACK
        ? SAMPLE_REVIEWS
        : [];

  /* Nothing to show (or endpoint unavailable): drop the section quietly */
  if (!loading && list.length === 0) {
    return null;
  }

  const gate = (event: React.MouseEvent) => {
    if (authLoading) {
      event.preventDefault();
      return;
    }

    if (!user) {
      event.preventDefault();
      navigate("/signin");
    }
  };

  const cardClass =
    "w-[82vw] max-w-[380px] flex-none snap-start rounded-2xl border border-line bg-card p-4 sm:w-[340px] lg:w-auto lg:max-w-none";

  return (
    <section className="mb-10 sm:mb-14" aria-label="Community Buzz">
      <SectionHeader
        title="Community Buzz"
        action={
          <span className="hidden text-sm text-muted sm:inline">
            Real reviews from movie lovers like you
          </span>
        }
      />

      <ul
        role="list"
        className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0"
      >
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className={cardClass}>
                <div className="skeleton mb-3 h-10 w-40 rounded-lg" />
                <div className="skeleton mb-2 h-4 w-3/4 rounded" />
                <div className="skeleton h-16 w-full rounded" />
              </li>
            ))
          : list.map((review) => (
              <li key={review.id} className={cardClass}>
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand/15 text-sm font-bold text-brand"
                  >
                    {review.user.name.trim().charAt(0).toUpperCase() || "U"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {review.user.name}
                    </p>
                    <p className="text-xs text-muted">
                      {timeAgo(review.createdAt)}
                    </p>
                  </div>

                  <span className="flex items-center gap-1 text-sm font-bold">
                    <Star
                      size={14}
                      fill="currentColor"
                      strokeWidth={0}
                      className="text-gold"
                    />
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                <p className="mt-3 text-sm font-semibold">
                  About:{" "}
                  <Link
                    to={`/movie/${review.movie.tmdbId}`}
                    onClick={gate}
                    className="text-brand hover:underline"
                  >
                    {review.movie.title}
                  </Link>
                </p>

                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">
                  “{review.content}”
                </p>
              </li>
            ))}
      </ul>
    </section>
  );
}