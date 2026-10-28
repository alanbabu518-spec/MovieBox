"use client";

import { useEffect, useId, useMemo, useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

export type AvatarColor =
  | "blue"
  | "orange"
  | "red"
  | "green"
  | "purple"
  | "yellow"
  | "cyan"
  | "pink"
  | "indigo"
  | "lime"
  | "turquoise"
  | "violet";
export type AvatarSize = "sm" | "md" | "lg";
export type AvatarShape = "circle" | "square" | "squircle";
export type AvatarStatus = "idle" | "thinking" | "speaking";

export interface AvatarProps {
  color?: AvatarColor;
  size?: AvatarSize;
  shape?: AvatarShape;
  status?: AvatarStatus;
  /** Eyes blink. Turn off for old messages in a long list. */
  blinking?: boolean;
  /** Eyes follow the cursor (fine-pointer devices only). */
  lookAt?: boolean;
  /** Pop-in spring on mount. */
  entrance?: boolean;
  className?: string;
}

const make = (
  [a, b, c, d]: [string, string, string, string],
  rgb: string,
  iris: string,
) => ({
  gradient: `radial-gradient(circle at 50% 45%, ${a} 0%, ${b} 40%, ${c} 68%, ${d} 100%)`,
  glow: `0 0 4px 0 rgba(${rgb},.35), 0 0 16px 6px rgba(${rgb},.18)`,
  iris: `linear-gradient(135deg, #fff 0%, ${iris} 100%)`,
});

const PRESETS: Record<AvatarColor, ReturnType<typeof make>> = {
  blue: make(
    ["#0d4d9a", "#3d7dd8", "#6fb3ff", "#e0eeff"],
    "20,102,216",
    "#d4ecff",
  ),
  orange: make(
    ["#a63e10", "#e27a2a", "#ffb46a", "#ffe8cc"],
    "232,100,0",
    "#ffd9b8",
  ),
  red: make(
    ["#a60033", "#e74668", "#ff8aaa", "#ffd6e8"],
    "223,24,92",
    "#ffcde4",
  ),
  green: make(
    ["#0d6632", "#2a9d5f", "#6dd187", "#d1fadd"],
    "12,168,82",
    "#c5f5d8",
  ),
  purple: make(
    ["#4a0080", "#8b3fd1", "#c896ff", "#e8d4ff"],
    "110,46,224",
    "#e0c9ff",
  ),
  yellow: make(
    ["#8a5500", "#d4a000", "#ffc93a", "#fff5cc"],
    "214,142,0",
    "#fff0a8",
  ),
  cyan: make(
    ["#003d66", "#0a8fb5", "#5dd4ff", "#cdf5ff"],
    "10,143,181",
    "#d0f0ff",
  ),
  pink: make(
    ["#7a0055", "#d63384", "#ff6bb3", "#ffe5f5"],
    "214,51,132",
    "#ffd6ed",
  ),
  indigo: make(
    ["#2d157a", "#4f46e5", "#8b7eff", "#ddd6ff"],
    "79,70,229",
    "#e0d9ff",
  ),
  lime: make(
    ["#4a5910", "#84cc16", "#bef264", "#ecfccf"],
    "132,204,22",
    "#f7fee8",
  ),
  turquoise: make(
    ["#1a5555", "#0d9488", "#2dd4bf", "#ccfbf1"],
    "13,148,136",
    "#c0fdf5",
  ),
  violet: make(
    ["#4a2a7a", "#a855f7", "#d8b4fe", "#f3e8ff"],
    "168,85,247",
    "#ede9fe",
  ),
};

const SIZE: Record<
  AvatarSize,
  { orb: string; eye: string; gap: string; y: string; look: number }
> = {
  sm: {
    orb: "h-8 w-8",
    eye: "w-1 h-1.5",
    gap: "gap-1.5",
    y: "-translate-y-0.5",
    look: 1,
  },
  md: {
    orb: "h-12 w-12",
    eye: "w-1.5 h-2.5",
    gap: "gap-2.5",
    y: "-translate-y-0.5",
    look: 2,
  },
  lg: {
    orb: "h-16 w-16",
    eye: "w-2 h-3",
    gap: "gap-3.5",
    y: "-translate-y-1",
    look: 3,
  },
};

const RADIUS: Record<AvatarShape, string> = {
  circle: "rounded-full",
  square: "rounded-[0%]",
  squircle: "rounded-[40%]",
};

const SHINE =
  "radial-gradient(ellipse at 30% 24%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.1) 50%, transparent 70%)";
const SHADE =
  "radial-gradient(circle at 62% 68%, rgba(0,0,0,.18) 0%, transparent 55%)";

// One tiny tiled noise image: rasterised once and cached by the browser,
// instead of two live feTurbulence filters per avatar.
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function Eye({
  blinking,
  delayMs,
  iris,
  sizeClass,
}: {
  blinking: boolean;
  delayMs: number;
  iris: string;
  sizeClass: string;
}) {
  return (
    <div
      className={`rounded-full ${sizeClass} ${blinking ? "av-blink" : ""}`}
      style={{
        background: iris,
        ...(blinking ? { animationDelay: `${delayMs}ms` } : {}),
      }}
    />
  );
}

export default function AiAvatar({
  color = "red",
  size = "md",
  shape = "circle",
  status = "idle",
  blinking = true,
  lookAt = true,
  entrance = true,
  className = "",
}: AvatarProps) {
  const uid = useId();
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const preset = PRESETS[color] ?? PRESETS.red;
  const dims = SIZE[size] ?? SIZE.md;

  // Desync blinking between avatars so a list doesn't blink in unison.
  const blinkOffset = useMemo(() => {
    let h = 0;
    for (const ch of uid) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return -(h % 3600);
  }, [uid]);

  // Eye look-at: motion values + springs write straight to style.transform,
  // so the pointer never triggers a React re-render.
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const sx = useSpring(lx, { stiffness: 300, damping: 30, mass: 0.6 });
  const sy = useSpring(ly, { stiffness: 300, damping: 30, mass: 0.6 });

  useEffect(() => {
    lx.set(0);
    ly.set(0);
    const el = ref.current;
    if (
      !lookAt ||
      reduce ||
      status !== "idle" ||
      !el ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const k = Math.min(dist, 160) / 160; // ease in as the cursor nears
        lx.set((dx / dist) * dims.look * k);
        ly.set((dy / dist) * dims.look * k);
      });
    };
    const onLeave = () => {
      lx.set(0);
      ly.set(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [lookAt, reduce, status, dims.look, lx, ly]);

  const radius = RADIUS[shape];

  return (
    <motion.div
      ref={ref}
      role="img"
      aria-label="AI Avatar"
      initial={entrance && !reduce ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={reduce ? undefined : { scale: 1.06 }}
      whileTap={{ scale: reduce ? 0.97 : 0.9 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
      className={[
        "relative inline-flex shrink-0 cursor-pointer select-none touch-manipulation [-webkit-tap-highlight-color:transparent]",
        dims.orb,
        className,
      ].join(" ")}
    >
      {/* Glow: static box-shadow on its own layer, only opacity animates */}
      <span
        aria-hidden="true"
        data-state={status}
        className={`av-glow pointer-events-none absolute inset-0 ${radius}`}
        style={{ boxShadow: preset.glow }}
      />

      {/* Orb */}
      <span
        className={`relative flex h-full w-full items-center justify-center overflow-hidden ${radius}`}
        style={{ background: preset.gradient }}
      >
        {size !== "sm" && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
            style={{ backgroundImage: NOISE }}
          />
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: SHINE }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: SHADE }}
        />

        {/* Eyes: outer = look-at, inner = thinking / speaking motion */}
        <motion.div
          className={`relative z-10 ${dims.y}`}
          style={{ x: sx, y: sy }}
        >
          <div
            data-state={status}
            className={`av-eyes flex items-center ${dims.gap}`}
          >
            <Eye
              blinking={blinking}
              delayMs={blinkOffset}
              iris={preset.iris}
              sizeClass={dims.eye}
            />
            <Eye
              blinking={blinking}
              delayMs={blinkOffset + 60}
              iris={preset.iris}
              sizeClass={dims.eye}
            />
          </div>
        </motion.div>
      </span>
    </motion.div>
  );
}
