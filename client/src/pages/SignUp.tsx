import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AuthLayout, {
  AppleLogo,
} from "../shared/components/layout/AuthLayout";
import { signUpSchema } from "../validators/auth.schema";

export default function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = signUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!result.success) {
      const nextErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);

        if (!nextErrors[field]) {
          nextErrors[field] = issue.message;
        }
      });

      setErrors(nextErrors);
      return;
    }

    setErrors({});

    console.log("Sign up data:", result.data);
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Join MovieBox and start building your movie collection."
    >
      <div className="space-y-2.5">
        <button
          type="button"
          className="flex h-9 w-full items-center justify-center gap-3 rounded-lg border text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:h-10 sm:text-sm"
          style={{
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            backgroundColor: "var(--card)",
          }}
        >
          <span className="text-sm font-bold">G</span>
          Continue with Google
        </button>

        <button
          type="button"
          className="flex h-9 w-full items-center justify-center gap-3 rounded-lg border text-xs font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5 sm:h-10 sm:text-sm"
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

      <div className="my-4 flex items-center gap-3">
        <div
          className="h-px flex-1"
          style={{
            backgroundColor: "var(--border)",
          }}
        />

        <span
          className="text-[10px] font-medium uppercase tracking-[0.18em]"
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
        className="space-y-2.5"
      >
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-xs font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Name
          </label>

          <div
            className="flex h-9 items-center gap-2.5 rounded-lg border px-3 transition-colors focus-within:border-[var(--primary)] sm:h-10"
            style={{
              backgroundColor: "var(--card)",
              borderColor: errors.name
                ? "var(--primary)"
                : "var(--border)",
            }}
          >
            <User
              size={15}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);

                setErrors((current) => ({
                  ...current,
                  name: "",
                }));
              }}
              placeholder="Enter your name"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none sm:text-sm"
              style={{
                color: "var(--text-primary)",
              }}
            />
          </div>

          {errors.name && (
            <p
              className="mt-1 text-[10px]"
              style={{
                color: "var(--primary)",
              }}
            >
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1 block text-xs font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Email
          </label>

          <div
            className="flex h-9 items-center gap-2.5 rounded-lg border px-3 transition-colors focus-within:border-[var(--primary)] sm:h-10"
            style={{
              backgroundColor: "var(--card)",
              borderColor: errors.email
                ? "var(--primary)"
                : "var(--border)",
            }}
          >
            <Mail
              size={15}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);

                setErrors((current) => ({
                  ...current,
                  email: "",
                }));
              }}
              placeholder="Enter your email"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none sm:text-sm"
              style={{
                color: "var(--text-primary)",
              }}
            />
          </div>

          {errors.email && (
            <p
              className="mt-1 text-[10px]"
              style={{
                color: "var(--primary)",
              }}
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="mb-1 block text-xs font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Password
          </label>

          <div
            className="flex h-9 items-center gap-2.5 rounded-lg border px-3 transition-colors focus-within:border-[var(--primary)] sm:h-10"
            style={{
              backgroundColor: "var(--card)",
              borderColor: errors.password
                ? "var(--primary)"
                : "var(--border)",
            }}
          >
            <Lock
              size={15}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="signup-password"
              type={
                showPassword ? "text" : "password"
              }
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);

                setErrors((current) => ({
                  ...current,
                  password: "",
                }));
              }}
              placeholder="Create a password"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none sm:text-sm"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (value) => !value
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {showPassword ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
            </button>
          </div>

          {errors.password && (
            <p
              className="mt-1 text-[10px]"
              style={{
                color: "var(--primary)",
              }}
            >
              {errors.password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block text-xs font-medium"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Confirm Password
          </label>

          <div
            className="flex h-9 items-center gap-2.5 rounded-lg border px-3 transition-colors focus-within:border-[var(--primary)] sm:h-10"
            style={{
              backgroundColor: "var(--card)",
              borderColor: errors.confirmPassword
                ? "var(--primary)"
                : "var(--border)",
            }}
          >
            <Lock
              size={15}
              style={{
                color: "var(--text-secondary)",
              }}
            />

            <input
              id="confirm-password"
              type={
                showConfirmPassword
                  ? "text"
                  : "password"
              }
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(
                  event.target.value
                );

                setErrors((current) => ({
                  ...current,
                  confirmPassword: "",
                }));
              }}
              placeholder="Confirm your password"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none sm:text-sm"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setShowConfirmPassword(
                  (value) => !value
                )
              }
              aria-label={
                showConfirmPassword
                  ? "Hide password"
                  : "Show password"
              }
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {showConfirmPassword ? (
                <EyeOff size={15} />
              ) : (
                <Eye size={15} />
              )}
            </button>
          </div>

          {errors.confirmPassword && (
            <p
              className="mt-1 text-[10px]"
              style={{
                color: "var(--primary)",
              }}
            >
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="mt-1 h-9 w-full rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] sm:h-10 sm:text-sm"
          style={{
            backgroundColor: "var(--primary)",
          }}
        >
          Create Account
        </button>
      </form>

      <p
        className="mt-4 text-center text-xs"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        Already have an account?{" "}
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