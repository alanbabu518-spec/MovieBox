import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import {
  getReviews,
  type Review,
} from "../../services/movie.api";

interface MovieReviewsProps {
  tmdbId: string;
}

export default function MovieReviews({
  tmdbId,
}: MovieReviewsProps) {
  const [reviews, setReviews] = useState<
    Review[]
  >([]);
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);

        const data = await getReviews(tmdbId);

        setReviews(data);
      } catch (error) {
        console.error(
          "Failed to load reviews:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [tmdbId]);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 lg:px-8">
      <div className="mb-7">
        <p
          className="mb-2 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{
            color: "var(--primary)",
          }}
        >
          MovieBox
        </p>

        <h2
          className="font-display text-2xl font-bold sm:text-3xl"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Reviews
        </h2>
      </div>

      {loading ? (
        <div
          className="h-24 animate-pulse rounded-lg"
          style={{
            backgroundColor: "var(--card)",
          }}
        />
      ) : reviews.length === 0 ? (
        <p
          className="text-sm"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          No reviews yet. Be the first to
          review this movie.
        </p>
      ) : (
        <div className="max-w-3xl divide-y">
          {reviews.slice(0, 5).map((review) => (
            <article
              key={review.id}
              className="py-6 first:pt-0"
              style={{
                borderColor: "var(--border)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color:
                        "var(--text-primary)",
                    }}
                  >
                    {review.user.name}
                  </p>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color:
                        "var(--text-secondary)",
                    }}
                  >
                    {new Date(
                      review.createdAt,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Star
                    size={14}
                    fill="currentColor"
                    style={{
                      color: "var(--primary)",
                    }}
                  />

                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        "var(--text-primary)",
                    }}
                  >
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <p
                className="mt-4 text-sm leading-7"
                style={{
                  color:
                    "var(--text-secondary)",
                }}
              >
                {review.content}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}