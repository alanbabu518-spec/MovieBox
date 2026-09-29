import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../shared/components/layout/AuthLayout";

const OTP_LENGTH = 6;
const RESEND_TIME = 60;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    (location.state as { email?: string } | null)?.email ||
    "your email address";

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_TIME);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "");

    if (!digits) {
      return;
    }

    const newOtp = [...otp];

    if (digits.length > 1) {
      const pastedDigits = digits.slice(0, OTP_LENGTH);

      pastedDigits.split("").forEach((digit, offset) => {
        if (index + offset < OTP_LENGTH) {
          newOtp[index + offset] = digit;
        }
      });

      setOtp(newOtp);
      setError("");

      const nextIndex = Math.min(
        index + pastedDigits.length,
        OTP_LENGTH - 1
      );

      inputRefs.current[nextIndex]?.focus();

      return;
    }

    newOtp[index] = digits;
    setOtp(newOtp);
    setError("");

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();

        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === "ArrowRight" &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) {
      return;
    }

    const newOtp = Array(OTP_LENGTH).fill("");

    pasted.split("").forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    setError("");

    const focusIndex = Math.min(
      pasted.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );

      console.log("OTP:", otpValue);

      navigate("/signin");
    } catch {
      setError("Invalid or expired OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) {
      return;
    }

    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    setResendTimer(RESEND_TIME);

    inputRefs.current[0]?.focus();

    console.log("Resend OTP");
  };

  const handleBack = () => {
    navigate("/signup");
  };

  return (
    <AuthLayout
      title="Verify your email"
      description="Enter the 6-digit verification code we sent to your email address."
    >
      <button
        type="button"
        onClick={handleBack}
        className="mb-6 flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="mb-7">
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--primary) 14%, transparent)",
            color: "var(--primary)",
          }}
        >
          <Mail size={23} />
        </div>

        <p
          className="text-sm leading-6"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          We sent a verification code to
        </p>

        <p
          className="mt-1 truncate text-sm font-semibold"
          style={{
            color: "var(--text-primary)",
          }}
        >
          {email}
        </p>
      </div>

      <form onSubmit={handleVerify}>
        <label
          className="mb-2 block text-sm font-medium"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Verification code
        </label>

        <div className="flex gap-2 sm:gap-3">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              autoComplete={
                index === 0 ? "one-time-code" : "off"
              }
              maxLength={1}
              value={digit}
              onChange={(event) =>
                handleChange(index, event.target.value)
              }
              onKeyDown={(event) =>
                handleKeyDown(index, event)
              }
              onPaste={handlePaste}
              className="h-12 w-full rounded-xl border text-center text-lg font-semibold outline-none transition-all focus:ring-2"
              style={{
                backgroundColor: "var(--background)",
                borderColor: error
                  ? "#ef4444"
                  : "var(--border)",
                color: "var(--text-primary)",
                caretColor: "var(--primary)",
              }}
            />
          ))}
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
          {isLoading ? "Verifying..." : "Verify email"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p
          className="text-sm"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Didn't receive the code?
        </p>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0}
          className="mt-2 text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            color: "var(--primary)",
          }}
        >
          {resendTimer > 0
            ? `Resend code in ${resendTimer}s`
            : "Resend code"}
        </button>
      </div>

      <div className="mt-5 text-center">
        <button
          type="button"
          onClick={handleBack}
          className="text-xs transition-opacity hover:opacity-70"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Wrong email? Change it
        </button>
      </div>
    </AuthLayout>
  );
}