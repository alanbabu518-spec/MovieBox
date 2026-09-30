import { useState } from "react";
import { Check } from "lucide-react";

import { useAuth } from "../../../shared/context/AuthContext";
import { updateProfile } from "../../../shared/services/auth.api";

const avatars = [
  {
    id: "avatar-1",
    src: null,
  },
  {
    id: "avatar-2",
    src: "/avatars/avatar1.svg",
  },
  {
    id: "avatar-3",
    src: "/avatars/avatar2.svg",
  },
  {
    id: "avatar-4",
    src: "/avatars/avatar3.svg",
  },
  {
    id: "avatar-5",
    src: "/avatars/avatar4.svg",
  },
  {
    id: "avatar-6",
    src: "/avatars/avatar5.svg",
  },
  {
    id: "avatar-7",
    src: "/avatars/avatar6.svg",
  },
  {
    id: "avatar-8",
    src: "/avatars/avatar7.svg",
  },
  {
    id: "avatar-9",
    src: "/avatars/avatar8.svg",
  },
  {
    id: "avatar-10",
    src: "/avatars/avatar9.svg",
  },
];

export default function ProfileSetupModal() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(
    user?.name ?? "",
  );

  const [avatar, setAvatar] = useState(
    user?.avatar ?? "avatar-1",
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!user || user.profileCompleted) {
    return null;
  }

  const defaultLetter =
    name.trim().charAt(0).toUpperCase() ||
    user.name.charAt(0).toUpperCase();

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError(
        "Username must be at least 2 characters.",
      );
      return;
    }

    if (trimmedName.length > 30) {
      setError(
        "Username must be at most 30 characters.",
      );
      return;
    }

    try {
      setLoading(true);

      await updateProfile(
        trimmedName,
        avatar,
      );

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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{
        backgroundColor:
          "rgba(0, 0, 0, 0.75)",
      }}
    >
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
            style={{
              color: "var(--text-primary)",
            }}
          >
            Complete your profile
          </h2>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Choose your MovieBox name and avatar.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="profile-name"
              className="mb-2 block text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Username
            </label>

            <input
              id="profile-name"
              type="text"
              value={name}
              maxLength={30}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              className="h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none transition-colors focus:border-[var(--primary)]"
              style={{
                color: "var(--text-primary)",
                borderColor: "var(--border)",
              }}
              autoFocus
            />
          </div>

          <div className="mb-6">
            <p
              className="mb-4 text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Choose your avatar
            </p>

            <div
              className="grid grid-cols-5 gap-4"
              style={{
                justifyContent: "center",
              }}
            >
              {avatars.map((item) => {
                const selected =
                  avatar === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setAvatar(item.id)
                    }
                    aria-label={
                      item.src
                        ? `Choose ${item.id}`
                        : "Choose default avatar"
                    }
                    className="relative mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-2 transition-all hover:scale-105"
                    style={{
                      borderColor: selected
                        ? "var(--primary)"
                        : "var(--border)",
                      backgroundColor:
                        item.src
                          ? "transparent"
                          : "var(--primary)",
                    }}
                  >
                    {item.src ? (
                      <img
                        src={item.src}
                        alt={item.id}
                        width="56"
                        height="56"
                        className="block h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white">
                        {defaultLetter}
                      </span>
                    )}

                    {selected && (
                      <span
                        className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full text-white"
                        style={{
                          backgroundColor:
                            "var(--primary)",
                        }}
                      >
                        <Check
                          size={12}
                          strokeWidth={3}
                        />
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
              style={{
                color: "var(--primary)",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor:
                "var(--primary)",
            }}
          >
            {loading
              ? "Saving..."
              : "Continue to MovieBox"}
          </button>
        </form>
      </div>
    </div>
  );
}