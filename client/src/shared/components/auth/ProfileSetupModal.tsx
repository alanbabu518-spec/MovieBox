import { useState } from "react";
import { Check } from "lucide-react";

import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../../shared/services/auth.api";

const avatars = Array.from(
  { length: 10 },
  (_, index) => `avatar-${index + 1}`,
);

export default function ProfileSetupModal() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name ?? "");
  const [avatar, setAvatar] = useState(
    user?.avatar ?? "avatar-1",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.profileCompleted) {
    return null;
  }

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }

    if (trimmedName.length > 30) {
      setError("Username must be at most 30 characters.");
      return;
    }

    try {
      setLoading(true);

      await updateProfile(trimmedName, avatar);
      await refreshUser();
    } catch (error: any) {
      setError(
        error?.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <div className="mb-6 text-center">
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Complete your profile
          </h2>

          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Choose your MovieBox name and avatar.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Username
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              maxLength={30}
              className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none transition-colors focus:border-(--primary)]"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
              autoFocus
            />
          </div>

          <div className="mb-6">
            <p
              className="mb-3 text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              Choose your avatar
            </p>

            <div className="grid grid-cols-5 gap-3">
              {avatars.map((avatarId) => {
                const selected = avatar === avatarId;

                return (
                  <button
                    key={avatarId}
                    type="button"
                    onClick={() => setAvatar(avatarId)}
                    className="relative aspect-square overflow-hidden rounded-full border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: selected
                        ? "var(--primary)"
                        : "var(--border)",
                    }}
                  >
                    <img
                      src={`/avatars/${avatarId}.svg`}
                      alt={avatarId}
                      className="h-full w-full object-cover"
                    />

                    {selected && (
                      <span
                        className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full text-white"
                        style={{
                          backgroundColor: "var(--primary)",
                        }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <p
              className="mb-4 text-center text-sm"
              style={{ color: "var(--primary)" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? "Saving..." : "Continue to MovieBox"}
          </button>
        </form>
      </div>
    </div>
  );
}