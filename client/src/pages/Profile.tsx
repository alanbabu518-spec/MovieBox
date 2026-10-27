import { useState } from "react";
import type { FormEvent } from "react";
import { Bookmark, Edit3, Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../shared/context/AuthContext";
import { updateProfile } from "../shared/services/auth.api";
import { useLibraryStore } from "../store/library.store";

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();

  const favoritesCount = useLibraryStore(
    (state) => state.favorites.size,
  );

  const watchlistCount = useLibraryStore(
    (state) => state.watchlist.size,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");

  const handleEditProfile = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const nextName = editName.trim();

    if (nextName.length < 2 || nextName.length > 30) {
      setProfileError("Name must be between 2 and 30 characters.");
      return;
    }

    if (!user) {
      setProfileError("Please sign in to update your profile.");
      return;
    }

    try {
      setSaving(true);
      setProfileError("");
      setProfileMessage("");

      await updateProfile(
        nextName,
        user.avatar || "avatar-1",
      );

      await refreshUser();

      setIsEditing(false);
      setProfileMessage("Profile updated successfully.");
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      setProfileError(
        "Unable to update your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-4 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="h-64 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <div className="text-center">
          <h1
            className="font-display text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Sign in to view your profile
          </h1>

          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Your movie collections and profile will be available after sign-in.
          </p>

          <Link
            to="/signin"
            className="mt-5 inline-flex rounded-lg px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--primary)" }}
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
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <section
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
          }}
        >
          <div
            className="h-32 sm:h-40"
            style={{ backgroundColor: "var(--primary)" }}
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
                      alt={`${user.name}'s avatar`}
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
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.name}
                  </h1>

                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditName(user.name);
                  setProfileError("");
                  setProfileMessage("");
                  setIsEditing((value) => !value);
                }}
                className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Edit3 size={16} aria-hidden="true" />
                {isEditing ? "Close editor" : "Edit Profile"}
              </button>
            </div>

            {isEditing && (
              <form
                onSubmit={handleEditProfile}
                className="mt-6 max-w-xl space-y-3"
              >
                <label
                  htmlFor="profile-edit-name"
                  className="block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Display name
                </label>

                <input
                  id="profile-edit-name"
                  name="name"
                  type="text"
                  value={editName}
                  onChange={(event) => {
                    setEditName(event.target.value);
                    setProfileError("");
                    setProfileMessage("");
                  }}
                  maxLength={30}
                  minLength={2}
                  autoComplete="name"
                  required
                  className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus:border-[var(--primary)]"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  aria-invalid={Boolean(profileError)}
                  aria-describedby={
                    profileError ? "profile-edit-error" : undefined
                  }
                />

                {profileError && (
                  <p
                    id="profile-edit-error"
                    role="alert"
                    className="text-sm text-red-500"
                  >
                    {profileError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileError("");
                    }}
                    disabled={saving}
                    className="rounded-lg border px-4 py-2 text-sm disabled:opacity-60"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {profileMessage && (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-sm"
                style={{ color: "var(--primary)" }}
              >
                {profileMessage}
              </p>
            )}
          </div>
        </section>

        <section
          aria-label="Your movie activity"
          className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
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
                <Bookmark size={19} aria-hidden="true" />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Watchlist
                </p>

                <p
                  className="mt-0.5 text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {watchlistCount}
                </p>
              </div>
            </div>

            <Link
              to="/watchlist"
              className="mt-4 inline-block text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View watchlist
            </Link>
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
                <Heart size={19} aria-hidden="true" />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Favorites
                </p>

                <p
                  className="mt-0.5 text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {favoritesCount}
                </p>
              </div>
            </div>

            <Link
              to="/favorites"
              className="mt-4 inline-block text-xs font-medium hover:underline"
              style={{ color: "var(--primary)" }}
            >
              View favorites
            </Link>
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
                <Star size={19} aria-hidden="true" />
              </div>

              <div>
                <p
                  className="text-xs"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Ratings
                </p>

                <p
                  className="mt-0.5 text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  0
                </p>
              </div>
            </div>

            <p
              className="mt-4 text-xs"
              style={{ color: "var(--text-secondary)" }}
            >
              Personal ratings are not available yet.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}