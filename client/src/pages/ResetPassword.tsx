import { useState } from "react";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../shared/components/layout/AuthLayout";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("This password reset link is invalid.");
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Reset token:", token);
      console.log("New password:", password);

      setIsReset(true);
    } catch {
      setError("Unable to reset your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isReset) {
    return (
      <AuthLayout
        title="Password reset"
        description="Your MovieBox password has been successfully updated."
      >
        <div className="text-center">
          <div
            className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--primary) 14%, transparent)",
              color: "var(--primary)",
            }}
          >
            <Lock size={25} />
          </div>

          <h3
            className="font-display text-xl font-bold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Password updated
          </h3>

          <p
            className="mt-3 text-sm leading-6"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Your password has been changed successfully. You can now sign in
            with your new password.
          </p>

          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="mt-6 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              backgroundColor: "var(--primary)",
            }}
          >
            Continue to sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      description="Create a new password for your MovieBox account."
    >
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

      <form onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            New password
          </label>

          <div
            className="flex h-12 items-center rounded-xl border px-4"
            style={{
              backgroundColor: "var(--background)",
              borderColor: error ? "#ef4444" : "var(--border)",
            }}
          >
            <Lock
              size={18}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              placeholder="Enter new password"
              className="ml-3 w-full bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="ml-2"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="mt-5">
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Confirm password
          </label>

          <div
            className="flex h-12 items-center rounded-xl border px-4"
            style={{
              backgroundColor: "var(--background)",
              borderColor: error ? "#ef4444" : "var(--border)",
            }}
          >
            <Lock
              size={18}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setError("");
              }}
              placeholder="Confirm new password"
              className="ml-3 w-full bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              className="ml-2"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            backgroundColor: "var(--primary)",
          }}
        >
          {isLoading ? "Resetting password..." : "Reset password"}
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
    </AuthLayout>
  );
}
