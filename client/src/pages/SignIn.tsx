import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AuthLayout, { AppleLogo } from "../shared/components/layout/AuthLayout";
import { signInSchema } from "../validators/auth.schema";

export default function SignIn() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");

    const result = signInSchema.safeParse({
      email,
      password,
    });

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") {
          setEmailError(issue.message);
        }

        if (issue.path[0] === "password") {
          setPasswordError(issue.message);
        }
      });

      return;
    }

    console.log("Sign in data:", result.data);
  };

  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your MovieBox account."
    >
      <div className="space-y-3">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            backgroundColor: "var(--card)",
          }}
        >
          <span className="text-base font-bold">G</span>
          Continue with Google
        </button>

        <button
          type="button"
          className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            backgroundColor: "var(--card)",
          }}
        >
          <AppleLogo />
          Continue with Apple
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

      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="flex h-11 items-center gap-3 rounded-lg border px-3 transition-colors focus-within:border-[var(--primary)]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: emailError ? "var(--primary)" : "var(--border)",
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
              }}
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
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

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-sm font-medium"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Password
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-medium"
              style={{ color: "var(--primary)" }}
            >
              Forgot password?
            </button>
          </div>

          <div
            className="flex h-11 items-center gap-3 rounded-lg border px-3 transition-colors focus-within:border-[var(--primary)]"
            style={{
              backgroundColor: "var(--card)",
              borderColor: passwordError ? "var(--primary)" : "var(--border)",
            }}
          >
            <Lock
              size={17}
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
                setPasswordError("");
              }}
              placeholder="Enter your password"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {passwordError && (
            <p
              className="mt-2 text-xs"
              style={{
                color: "var(--primary)",
              }}
            >
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            backgroundColor: "var(--primary)",
          }}
        >
          Sign In
        </button>
      </form>

      <p
        className="mt-7 text-center text-sm"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        Don't have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="font-semibold"
          style={{
            color: "var(--primary)",
          }}
        >
          Sign up
        </button>
      </p>
    </AuthLayout>
  );
}
