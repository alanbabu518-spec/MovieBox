import { useEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  Clapperboard,
  Edit3,
  Heart,
  ShieldAlert,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../shared/context/AuthContext";
import { deleteAccount, updateProfile } from "../shared/services/auth.api";
import { useLibraryStore } from "../store/library.store";

/**
 * Motion: opacity + transform only, driven by CSS (stays smooth while the
 * page is busy). Reduced-motion users get a cross-fade instead.
 */
const PAGE_CSS = `
@keyframes pf-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes pf-rise {
  from { opacity: 0; transform: translate3d(0, 10px, 0) }
  to   { opacity: 1; transform: none }
}
@keyframes pf-sheet {
  from { transform: translate3d(0, 100%, 0) }
  to   { transform: none }
}
@keyframes pf-pop {
  from { opacity: 0; transform: scale(0.96) }
  to   { opacity: 1; transform: none }
}
@keyframes pf-avatar {
  from { opacity: 0; transform: scale(0.88) }
  to   { opacity: 1; transform: none }
}
.pf-fade   { animation: pf-fade 200ms ease-out both }
.pf-rise   { animation: pf-rise 420ms cubic-bezier(0.22, 1, 0.36, 1) both }
.pf-avatar { animation: pf-avatar 520ms cubic-bezier(0.22, 1, 0.36, 1) 120ms both }
.pf-sheet  { animation: pf-sheet 340ms cubic-bezier(0.22, 1, 0.36, 1) both }
@media (min-width: 640px) {
  .pf-sheet { animation: pf-pop 240ms cubic-bezier(0.22, 1, 0.36, 1) both }
}
@media (prefers-reduced-motion: reduce) {
  .pf-rise, .pf-sheet, .pf-avatar { animation: pf-fade 200ms ease-out both }
}
@media (prefers-reduced-transparency: reduce) {
  .pf-glass {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
    background: rgba(0, 0, 0, 0.85) !important;
  }
}
`;

/** Static film grain (tiny SVG tile, rasterised once, never animated). */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.55'/%3E%3C/svg%3E\")";

/** Film-strip sprocket ticks along the banner's top edge. */
const SPROCKETS =
  "repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 10px, transparent 10px 26px)";

/**
 * Shared interactive-control behaviour (mobile-native):
 * touch-manipulation (no tap delay), no selection / tap highlight / callout,
 * explicit transition properties, visible keyboard focus.
 */
const CONTROL =
  "touch-manipulation select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] transition-[transform,background-color,opacity,border-color] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

const PRESS = `${CONTROL} active:scale-[0.97]`;
const PRESS_SURFACE = `${CONTROL} active:scale-[0.985]`;

export default function Profile() {
  const { user, loading, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const favoritesCount = useLibraryStore((state) => state.favorites.size);
  const watchlistCount = useLibraryStore((state) => state.watchlist.size);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const editInputRef = useRef<HTMLInputElement>(null);
  const deleteInputRef = useRef<HTMLInputElement>(null);
  const deleteDialogRef = useRef<HTMLDivElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);

  const handleEditProfile = async (event: FormEvent<HTMLFormElement>) => {
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

      await updateProfile(nextName, user.avatar || "avatar-1");
      await refreshUser();

      setIsEditing(false);
      setProfileMessage("Your profile has been updated.");
    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      setProfileError("Unable to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = () => {
    setDeleteConfirmation("");
    setDeleteError("");
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;

    setIsDeleteDialogOpen(false);
    setDeleteConfirmation("");
    setDeleteError("");
  };

  // Focus the name field when the editor opens.
  useEffect(() => {
    if (!isEditing) return;
    editInputRef.current?.focus();
    editInputRef.current?.select();
  }, [isEditing]);

  // Dialog lifecycle: focus input, lock background scroll, restore focus.
  useEffect(() => {
    if (!isDeleteDialogOpen) return;

    const trigger = deleteTriggerRef.current;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    deleteInputRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isDeleteDialogOpen]);

  // Dialog keyboard: Escape closes, Tab stays inside the dialog.
  useEffect(() => {
    if (!isDeleteDialogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) {
        closeDeleteDialog();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = deleteDialogRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), input:not([disabled])",
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // closeDeleteDialog only depends on `deleting`, which is in the deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleteDialogOpen, deleting]);

  const handleDeleteAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (deleteConfirmation !== "DELETE") {
      setDeleteError('Type "DELETE" exactly to confirm.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      // The backend must permanently delete the authenticated account.
      await deleteAccount();

      // Clear the local authentication state after server success.
      await logout();

      setIsDeleteDialogOpen(false);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      console.error("Failed to delete account:", error);
      setDeleteError(
        "We couldn't delete your account. Please try again. Your account has not been confirmed as deleted.",
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Loading                                                           */
  /* ---------------------------------------------------------------- */
  if (loading) {
    return (
      <main className="min-h-dvh bg-[var(--background)] px-4 py-10 sm:px-6">
        <div
          className="mx-auto max-w-5xl animate-pulse space-y-5"
          aria-busy="true"
          aria-label="Loading profile"
        >
          <div className="h-80 rounded-3xl bg-black/5 dark:bg-white/5" />
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="h-40 rounded-2xl bg-black/5 dark:bg-white/5" />
            <div className="h-40 rounded-2xl bg-black/5 dark:bg-white/5" />
            <div className="h-40 rounded-2xl bg-black/5 dark:bg-white/5" />
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Signed out                                                        */
  /* ---------------------------------------------------------------- */
  if (!user) {
    return (
      <main className="flex min-h-[70svh] items-center justify-center bg-[var(--background)] px-4 py-16">
        <style>{PAGE_CSS}</style>

        <section className="pf-rise max-w-md text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--primary) 12%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Clapperboard size={28} aria-hidden="true" />
          </div>

          <h1
            className="mt-6 font-display text-2xl font-bold leading-tight tracking-[-0.02em] sm:text-3xl"
            style={{ color: "var(--text-primary)" }}
          >
            Your movie space awaits
          </h1>

          <p
            className="mt-3 text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to manage your profile, keep your watchlist, and save your
            favourite movies.
          </p>

          <Link
            to="/signin"
            className={`${PRESS} mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white`}
            style={{ backgroundColor: "var(--primary)" }}
          >
            Sign in to MovieBox
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Derived values                                                    */
  /* ---------------------------------------------------------------- */
  const avatarId = user.avatar || "avatar-1";
  const avatarNumber = Number(avatarId.replace("avatar-", ""));

  const avatarSrc =
    avatarId === "avatar-1" ||
    !Number.isInteger(avatarNumber) ||
    avatarNumber < 2 ||
    avatarNumber > 10
      ? null
      : `/avatars/avatar${avatarNumber - 1}.svg`;

  const showAvatarImage = Boolean(avatarSrc) && !avatarFailed;
  const avatarFallback = user.name.trim().charAt(0).toUpperCase() || "U";

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en", {
        month: "long",
        year: "numeric",
      })
    : null;

  /* ---------------------------------------------------------------- */
  /* Page                                                              */
  /* ---------------------------------------------------------------- */
  return (
    <main className="min-h-dvh bg-[var(--background)] px-4 pb-20 pt-8 sm:px-6 sm:pt-10 lg:px-8">
      <style>{PAGE_CSS}</style>

      <div className="mx-auto max-w-5xl">
        {/* Page heading */}
        <header className="pf-rise mb-7">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--primary)" }}
          >
            Your space
          </p>

          <h1
            className="mt-2 font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] sm:text-4xl"
            style={{ color: "var(--text-primary)" }}
          >
            Profile &amp; settings
          </h1>

          <p
            className="mt-2 max-w-xl text-sm leading-6"
            style={{ color: "var(--text-secondary)" }}
          >
            Manage your identity and the movies you want to discover.
          </p>
        </header>

        {/* ============================================================
            PROFILE CARD

            Geometry (single source of truth):
              --avatar  = avatar size (5.5rem phone / 7rem sm+)
            The avatar's vertical centre sits EXACTLY on the banner's
            bottom edge (-mt = --avatar / 2). Banner content, avatar and
            identity text all share one left edge (px-5 / sm:px-8).
           ============================================================ */}
        <section
          aria-label="Your MovieBox profile"
          className="pf-rise overflow-hidden rounded-3xl border [--avatar:5.5rem] sm:[--avatar:7rem]"
          style={{
            backgroundColor: "var(--card)",
            borderColor: "var(--border)",
            animationDelay: "60ms",
          }}
        >
          {/* ---------------- Banner ---------------- */}
          <div
            className="relative isolate h-48 overflow-hidden sm:h-60"
            style={{
              background: `
                radial-gradient(
                  ellipse 70% 120% at 85% -10%,
                  color-mix(in srgb, var(--primary) 62%, transparent),
                  transparent 60%
                ),
                radial-gradient(
                  ellipse 60% 90% at -5% 115%,
                  color-mix(in srgb, var(--primary) 30%, transparent),
                  transparent 60%
                ),
                linear-gradient(115deg, #0c0c10 0%, #17171d 50%, #0f0f13 100%)
              `,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              {/* Film grain */}
              <div
                className="absolute inset-0 opacity-[0.09] mix-blend-soft-light"
                style={{ backgroundImage: GRAIN }}
              />

              {/* Diagonal light streak */}
              <div
                className="absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    "linear-gradient(118deg, transparent 0%, rgba(255,255,255,0.16) 46%, transparent 47%)",
                }}
              />

              {/* Film-strip sprocket ticks */}
              <div
                className="absolute inset-x-0 top-0 h-[7px] opacity-70"
                style={{ backgroundImage: SPROCKETS }}
              />

              {/* Oversized watermark, clipped by the banner */}
              <Clapperboard
                className="absolute -bottom-10 right-[-1.5rem] rotate-[10deg] text-white opacity-[0.06] sm:-bottom-14 sm:right-6"
                size={240}
                strokeWidth={1.25}
              />

              {/* Vignette keeps text legible and blends into the card */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

              {/* Bottom hairline */}
              <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            </div>

            <div className="relative px-5 pt-8 sm:px-8 sm:pt-10">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Personal collection
                </p>

                {/* Live counts as glass chips (static blur, 12px) */}
                <div
                  className="hidden items-center gap-2 sm:flex"
                  aria-hidden="true"
                >
                  <span className="pf-glass inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold tabular-nums text-white/85 backdrop-blur-md">
                    <Bookmark size={13} />
                    {watchlistCount}
                  </span>
                  <span className="pf-glass inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-xs font-semibold tabular-nums text-white/85 backdrop-blur-md">
                    <Heart size={13} />
                    {favoritesCount}
                  </span>
                </div>
              </div>

              <p className="mt-3 max-w-xs font-display text-2xl font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:max-w-sm sm:text-[2rem]">
                Every great story
                <br />
                starts with discovery.
              </p>
            </div>
          </div>

          {/* ---------------- Identity ---------------- */}
          <div className="px-5 pb-6 sm:px-8 sm:pb-8">
            {/* 2 columns on phones (avatar | action, then info below);
                3 columns from sm (avatar | info | action) */}
            <div className="grid grid-cols-[auto_1fr] items-start gap-x-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-x-6">
              {/* Avatar: card-coloured cutout, thin neutral border, image edge to edge.
                  Centred on the banner's bottom edge. */}
              <div
                className="pf-avatar relative col-start-1 row-start-1 -mt-[calc(var(--avatar)/2)] h-[var(--avatar)] w-[var(--avatar)] shrink-0 rounded-[2rem] p-1"
                style={{
                  backgroundColor: "var(--card)",
                  boxShadow: "0 18px 40px -14px rgba(0,0,0,0.6)",
                }}
              >
                <div
                  className="flex h-full w-full items-center justify-center overflow-hidden rounded-[1.75rem] border"
                  style={{
                    borderColor: "var(--border)",
                    // No fill when an image is shown. Only the letter
                    // fallback gets a neutral tint.
                    backgroundColor: showAvatarImage
                      ? "transparent"
                      : "color-mix(in srgb, var(--text-primary) 10%, var(--card))",
                  }}
                >
                  {showAvatarImage ? (
                    <img
                      src={avatarSrc!}
                      alt={`${user.name}'s avatar`}
                      width={112}
                      height={112}
                      decoding="async"
                      draggable={false}
                      onError={() => setAvatarFailed(true)}
                      className="block h-full w-full select-none object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="select-none font-display text-3xl font-bold leading-none sm:text-5xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {avatarFallback}
                    </span>
                  )}
                </div>
              </div>

              {/* Edit action: top-aligned with the name */}
              <button
                type="button"
                onClick={() => {
                  setEditName(user.name);
                  setProfileError("");
                  setProfileMessage("");
                  setIsEditing((value) => !value);
                }}
                aria-expanded={isEditing}
                aria-controls="profile-edit-form"
                className={`${PRESS} col-start-2 row-start-1 mt-3 inline-flex min-h-11 items-center justify-center gap-2 justify-self-end rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-black/5 sm:col-start-3 sm:mt-4 dark:hover:bg-white/5`}
                style={{
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <Edit3 size={16} aria-hidden="true" />
                {isEditing ? "Close editor" : "Edit profile"}
              </button>

              {/* Name block: top sits 1rem under the banner edge */}
              <div className="col-span-2 row-start-2 mt-5 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:mt-4">
                <h2
                  className="font-display text-2xl font-bold leading-[1.1] tracking-[-0.02em] [overflow-wrap:anywhere] sm:text-3xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {user.name}
                </h2>

                <p
                  className="mt-1.5 text-sm [overflow-wrap:anywhere]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {user.email}
                </p>

                {memberSince && (
                  <p
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium"
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <CalendarDays size={13} aria-hidden="true" />
                    Member since {memberSince}
                  </p>
                )}
              </div>
            </div>

            {isEditing && (
              <form
                id="profile-edit-form"
                onSubmit={handleEditProfile}
                className="pf-rise mt-6 max-w-md space-y-4 border-t pt-6"
                style={{ borderColor: "var(--border)" }}
                noValidate
              >
                <div>
                  <label
                    htmlFor="profile-edit-name"
                    className="mb-2 block text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Display name
                  </label>

                  {/* text-base = 16px, so iOS Safari never zooms on focus */}
                  <input
                    ref={editInputRef}
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
                    autoCapitalize="words"
                    autoCorrect="off"
                    enterKeyHint="done"
                    required
                    className="min-h-12 w-full rounded-xl border bg-transparent px-3.5 text-base outline-none transition-colors focus:border-[var(--primary)]"
                    style={{
                      borderColor: profileError ? "#ef4444" : "var(--border)",
                      color: "var(--text-primary)",
                    }}
                    aria-invalid={Boolean(profileError)}
                    aria-describedby={
                      profileError ? "profile-edit-error" : "profile-edit-hint"
                    }
                  />

                  <p
                    id="profile-edit-hint"
                    className="mt-2 text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Use between 2 and 30 characters.
                  </p>
                </div>

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
                    className={`${PRESS} inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none`}
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {saving ? "Saving changes..." : "Save changes"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileError("");
                    }}
                    disabled={saving}
                    className={`${PRESS} min-h-11 flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-black/5 disabled:opacity-60 sm:flex-none dark:hover:bg-white/5`}
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

            {/* Live region stays mounted so screen readers announce changes */}
            <div role="status" aria-live="polite">
              {profileMessage && (
                <p
                  className="pf-rise mt-4 flex items-center gap-2 text-sm"
                  style={{ color: "var(--primary)" }}
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {profileMessage}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Activity */}
        <section className="pf-rise mt-10" style={{ animationDelay: "120ms" }}>
          <div className="mb-4">
            <h2
              className="font-display text-xl font-bold tracking-[-0.01em]"
              style={{ color: "var(--text-primary)" }}
            >
              Your movie activity
            </h2>

            <p
              className="mt-1 text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              Your saved movies, all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ActivityCard
              icon={<Bookmark size={19} aria-hidden="true" />}
              label="Watchlist"
              count={watchlistCount}
              href="/watchlist"
              linkLabel="View watchlist"
            />

            <ActivityCard
              icon={<Heart size={19} aria-hidden="true" />}
              label="Favourites"
              count={favoritesCount}
              href="/favorites"
              linkLabel="View favourites"
            />

            <ActivityCard
              icon={<Star size={19} aria-hidden="true" />}
              label="Ratings"
              count={0}
              description="Personal ratings aren't available yet."
            />
          </div>
        </section>

        {/* Danger zone */}
        <section
          aria-labelledby="danger-zone-heading"
          className="pf-rise mt-12 overflow-hidden rounded-2xl border"
          style={{
            borderColor: "color-mix(in srgb, #dc2626 40%, var(--border))",
            backgroundColor: "var(--card)",
            animationDelay: "180ms",
          }}
        >
          <div
            className="flex items-start gap-3 border-b px-5 py-5 sm:px-6"
            style={{
              borderColor: "color-mix(in srgb, #dc2626 20%, var(--border))",
              backgroundColor: "color-mix(in srgb, #dc2626 5%, var(--card))",
            }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <ShieldAlert size={20} aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h2
                id="danger-zone-heading"
                className="font-display text-lg font-bold leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Danger zone
              </h2>

              <p
                className="mt-1 text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                Permanent account actions. Please review the consequences before
                continuing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="max-w-xl">
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Delete your account permanently
              </h3>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                This action cannot be undone. You may lose your profile, saved
                movie collections, and other account-associated information,
                subject to the service's retention policy.
              </p>
            </div>

            <button
              ref={deleteTriggerRef}
              type="button"
              onClick={openDeleteDialog}
              className={`${PRESS} inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10 sm:w-auto`}
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete account
            </button>
          </div>
        </section>
      </div>

      {/* Deletion confirmation: bottom sheet on phones, centred dialog from sm up */}
      {isDeleteDialogOpen && (
        <div
          className="pf-fade pf-glass fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto overscroll-contain bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteDialog();
            }
          }}
        >
          <div
            ref={deleteDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            aria-describedby="delete-dialog-description"
            className="pf-sheet w-full max-w-md overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-2xl"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
              paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                  <AlertTriangle size={24} aria-hidden="true" />
                </div>

                <button
                  type="button"
                  onClick={closeDeleteDialog}
                  disabled={deleting}
                  aria-label="Close deletion confirmation"
                  className={`${PRESS} -mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-xl hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/5`}
                  style={{ color: "var(--text-secondary)" }}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              <h2
                id="delete-dialog-title"
                className="mt-5 font-display text-xl font-bold leading-tight tracking-[-0.01em]"
                style={{ color: "var(--text-primary)" }}
              >
                Permanently delete your account?
              </h2>

              <p
                id="delete-dialog-description"
                className="mt-3 text-sm leading-6"
                style={{ color: "var(--text-secondary)" }}
              >
                You're about to permanently delete your MovieBox account. This
                action cannot be undone. Your profile and associated data may be
                deleted according to the service's data deletion policy.
              </p>

              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-500">
                  Before you continue
                </p>

                <p className="mt-1 text-sm leading-5 text-red-500/90">
                  Make sure you no longer need this account or its saved
                  collections.
                </p>
              </div>

              <form onSubmit={handleDeleteAccount} className="mt-5" noValidate>
                <label
                  htmlFor="delete-account-confirmation"
                  className="mb-2 block text-sm font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  Type <span className="font-bold text-red-500">DELETE</span> to
                  confirm
                </label>

                {/* text-base = 16px, so iOS Safari never zooms on focus */}
                <input
                  ref={deleteInputRef}
                  id="delete-account-confirmation"
                  name="confirmation"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                  value={deleteConfirmation}
                  onChange={(event) => {
                    setDeleteConfirmation(event.target.value);
                    setDeleteError("");
                  }}
                  placeholder="Type DELETE here"
                  disabled={deleting}
                  className="min-h-12 w-full rounded-xl border bg-transparent px-3.5 text-base outline-none transition-colors focus:border-red-500 disabled:opacity-60"
                  style={{
                    borderColor: deleteError ? "#ef4444" : "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  aria-invalid={Boolean(deleteError)}
                  aria-describedby={
                    deleteError ? "delete-account-error" : undefined
                  }
                />

                {deleteError && (
                  <p
                    id="delete-account-error"
                    role="alert"
                    className="mt-2 text-sm text-red-500"
                  >
                    {deleteError}
                  </p>
                )}

                {/* Safe action first, destructive action last */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDeleteDialog}
                    disabled={deleting}
                    className={`${PRESS} min-h-12 rounded-xl border px-4 py-2.5 text-sm font-semibold hover:bg-black/5 disabled:opacity-50 sm:min-h-11 dark:hover:bg-white/5`}
                    style={{
                      borderColor: "var(--border)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Keep my account
                  </button>

                  <button
                    type="submit"
                    disabled={deleting || deleteConfirmation !== "DELETE"}
                    className={`${PRESS} inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-11`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    {deleting ? "Deleting account..." : "Delete permanently"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

/* ------------------------------------------------------------------ */
/* Activity card                                                       */
/* Same anatomy on every card (icon / count / label / footer) so the   */
/* three always align. Cards with a destination are one big tap target.*/
/* ------------------------------------------------------------------ */
interface ActivityCardProps {
  icon: ReactNode;
  label: string;
  count: number;
  href?: string;
  linkLabel?: string;
  description?: string;
}

function ActivityCard({
  icon,
  label,
  count,
  href,
  linkLabel,
  description,
}: ActivityCardProps) {
  const surface = "flex min-h-40 flex-col rounded-2xl border p-5";
  const surfaceStyle = {
    backgroundColor: "var(--card)",
    borderColor: "var(--border)",
  };

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary) 12%, transparent)",
            color: "var(--primary)",
          }}
        >
          {icon}
        </div>

        {href && (
          <ArrowRight
            size={16}
            aria-hidden="true"
            style={{ color: "var(--text-secondary)" }}
          />
        )}
      </div>

      <div className="mt-5">
        <p
          className="text-3xl font-bold leading-none tracking-[-0.02em] tabular-nums"
          style={{ color: "var(--text-primary)" }}
        >
          {count}
        </p>

        <p
          className="mt-2 text-sm font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          {label}
        </p>
      </div>

      <p
        className="mt-auto pt-3 text-xs leading-5"
        style={{
          color: href ? "var(--primary)" : "var(--text-secondary)",
          fontWeight: href ? 600 : 400,
        }}
      >
        {href ? linkLabel : description}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        to={href}
        className={`${PRESS_SURFACE} ${surface} hover:bg-black/[0.03] dark:hover:bg-white/[0.04]`}
        style={surfaceStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <article className={surface} style={surfaceStyle}>
      {content}
    </article>
  );
}
