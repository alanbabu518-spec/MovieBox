import { Edit3, Heart, Star, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../shared/context/AuthContext";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen bg-(--background)] px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="h-64 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-(--background)] px-4">
        <div className="text-center">
          <h1
            className="font-display text-2xl font-bold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Sign in to view your profile
          </h1>

          <Link
            to="/signin"
            className="mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            style={{
              backgroundColor: "var(--primary)",
            }}
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const avatarId = user.avatar || "avatar-1";

  const avatarNumber = Number(
    avatarId.replace("avatar-", ""),
  );

  const avatarSrc =
    avatarId === "avatar-1" ||
    !Number.isInteger(avatarNumber) ||
    avatarNumber < 2 ||
    avatarNumber > 10
      ? null
      : `/avatars/avatar${avatarNumber - 1}.svg`;

  const avatarFallback =
    user.name.trim().charAt(0).toUpperCase() || "U";

  return (
    <main className="min-h-screen bg-(--background)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="h-32 sm:h-40"
            style={{
              backgroundColor: "var(--primary)",
            }}
          />

          <div className="px-5 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                <div
                  className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 sm:h-28 sm:w-28"
                  style={{
                    backgroundColor: "var(--primary)",
                    borderColor: "var(--background)",
                  }}
                >
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white sm:text-4xl">
                      {avatarFallback}
                    </span>
                  )}
                </div>

                <div className="pb-1">
                  <h1
                    className="font-display text-2xl font-bold sm:text-3xl"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    {user.name}
                  </h1>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Edit3 size={16} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Bookmark size={19} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Watchlist
                </p>

                <p
                  className="mt-0.5 text-xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  0
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Heart size={19} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Favorites
                </p>

                <p
                  className="mt-0.5 text-xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  0
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--primary) 12%, transparent)",
                  color: "var(--primary)",
                }}
              >
                <Star size={19} />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Ratings
                </p>

                <p
                  className="mt-0.5 text-xl font-bold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  0
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}