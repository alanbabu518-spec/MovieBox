import { useState } from "react";
import { Mail } from "lucide-react";

import AuthLayout from "../shared/components/layout/AuthLayout";
import { requestMagicLink } from "../shared/services/auth.api";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setEmailError("");
    setServerError("");
    setMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError("Please enter your email address.");
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail,
      )
    ) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const result = await requestMagicLink(
        trimmedEmail,
      );

      setMessage(result);
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        "Unable to send the sign-in link. Please try again.";

      setServerError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome to MovieBox"
      description="Continue to discover and manage your movies."
    >
      <div className="space-y-3">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            backgroundColor: "var(--card)",
          }}
        >
          <span className="text-base font-bold">
            G
          </span>

          Continue with Google
        </button>
      </div>

      <div className="my-7 flex items-center gap-4">
        <div
          className="h-px flex-1"
          style={{
            backgroundColor: "var(--border)",
          }}
        />

        <span
          className="text-[11px] font-medium uppercase tracking-[0.2em]"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Or
        </span>

        <div
          className="h-px flex-1"
          style={{
            backgroundColor: "var(--border)",
          }}
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Email
          </label>

          <div
            className="flex h-11 items-center gap-3 rounded-lg border px-3 transition-colors"
            style={{
              backgroundColor: "var(--card)",
              borderColor: emailError
                ? "var(--primary)"
                : "var(--border)",
            }}
          >
            <Mail
              size={17}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
                setServerError("");
                setMessage("");
              }}
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
              autoComplete="email"
            />
          </div>

          {emailError && (
            <p
              className="mt-2 text-xs"
              style={{
                color: "var(--primary)",
              }}
            >
              {emailError}
            </p>
          )}
        </div>

        {message && (
          <div
            className="rounded-lg border px-4 py-3 text-sm leading-5"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--text-secondary)",
            }}
          >
            {message}
          </div>
        )}

        {serverError && (
          <p
            className="text-center text-sm"
            style={{
              color: "var(--primary)",
            }}
          >
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary)",
          }}
        >
          {loading
            ? "Sending..."
            : "Continue with Email"}
        </button>
      </form>

      <p
        className="mt-7 text-center text-xs leading-5"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        We'll send a secure sign-in link to your email.
        No password required.
      </p>
    </AuthLayout>
  );
}