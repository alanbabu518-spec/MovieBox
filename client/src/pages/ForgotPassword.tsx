import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../shared/components/layout/AuthLayout";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      console.log("Password reset requested for:", email);

      setIsSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email and we'll send you a secure password reset link."
    >
      {!isSent ? (
        <>
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="mb-6 flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={16} />
            Back to sign in
          </button>

          <div
            className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--primary) 14%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Mail size={23} />
          </div>

          <form onSubmit={handleSubmit}>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Email address
            </label>

            <div
              className="flex h-12 items-center rounded-xl border px-4"
              style={{
                backgroundColor: "var(--background)",
                borderColor: error
                  ? "#ef4444"
                  : "var(--border)",
              }}
            >
              <Mail
                size={18}
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
                  setError("");
                }}
                placeholder="you@example.com"
                className="ml-3 w-full bg-transparent text-sm outline-none"
                style={{
                  color: "var(--text-primary)",
                }}
              />
            </div>

            {error && (
              <p className="mt-2 text-xs text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: "var(--primary)",
              }}
            >
              {isLoading
                ? "Sending..."
                : "Send reset link"}
            </button>
          </form>

          <p
            className="mt-6 text-center text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="font-semibold"
              style={{
                color: "var(--primary)",
              }}
            >
              Sign in
            </button>
          </p>
        </>
      ) : (
        <div className="text-center">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--primary) 14%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Mail size={25} />
          </div>

          <h3
            className="font-display text-xl font-bold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Check your email
          </h3>

          <p
            className="mt-3 text-sm leading-6"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            If an account exists for{" "}
            <span
              className="font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {email}
            </span>
            , we've sent a password reset link.
          </p>

          <button
            type="button"
            onClick={() => {
              setIsSent(false);
              setError("");
            }}
            className="mt-6 text-sm font-semibold"
            style={{
              color: "var(--primary)",
            }}
          >
            Try another email
          </button>

          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="mt-4 flex w-full items-center justify-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <ArrowLeft size={15} />
            Back to sign in
          </button>
        </div>
      )}
    </AuthLayout>
  );
}