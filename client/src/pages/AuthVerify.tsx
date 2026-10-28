import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../shared/context/AuthContext";
import { verifyMagicLinkToken } from "../shared/services/auth.api";

export default function AuthVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  // The token is single-use. This guard stops React StrictMode (dev) or a
  // re-render from sending it twice, which would make the 2nd call fail.
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = searchParams.get("token");

    if (!token) {
      navigate("/signin", {
        replace: true,
        state: {
          authError:
            "The sign-in link is missing its token. Please request a new link.",
        },
      });
      return;
    }

    const verify = async () => {
      try {
        await verifyMagicLinkToken(token);
        await refreshUser();
        navigate("/", { replace: true });
      } catch {
        navigate("/signin", {
          replace: true,
          state: {
            authError:
              "This sign-in link is invalid or has expired. Please request a new one.",
          },
        });
      }
    };

    void verify();
  }, [navigate, refreshUser, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5">
      <div className="text-center">
        <div
          role="status"
          aria-label="Verifying your email"
          className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[var(--primary)]"
        />
        <h1 className="text-lg font-semibold text-white">Verifying your email</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Please wait while we securely sign you in.
        </p>
      </div>
    </main>
  );
}