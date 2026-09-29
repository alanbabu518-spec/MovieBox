import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthVerify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/signin", { replace: true });
      return;
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL;

    window.location.href =
      `${apiUrl}/auth/verify?token=${encodeURIComponent(token)}`;
  }, [navigate, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5">
      <div className="text-center">
        <div
          className="mx-auto mb-5 h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-(--primary)]"
        />

        <h1 className="text-lg font-semibold text-white">
          Verifying your email
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Please wait while we securely sign you in.
        </p>
      </div>
    </main>
  );
}