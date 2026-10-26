import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "../../lib/cn";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Bottom sheet for phones. Drag the grabber down to dismiss.
 * - drag writes straight to ref.style (no re-render per pointermove)
 * - only transform/opacity are animated
 * - scroll is contained, safe-area padded, height uses dvh
 */
export default function Sheet({
  open,
  onClose,
  title,
  children,
  footer,
}: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ startY: 0, dy: 0, active: false });

  useEffect(() => {
    if (!open) {
      return;
    }

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const setOffset = (value: number, animate: boolean) => {
    const panel = panelRef.current;

    if (!panel) {
      return;
    }

    panel.style.transition = animate
      ? "transform 320ms cubic-bezier(0.16, 1, 0.3, 1)"
      : "none";
    panel.style.transform = value ? `translateY(${value}px)` : "";
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { startY: event.clientY, dy: 0, active: true };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) {
      return;
    }

    drag.current.dy = Math.max(0, event.clientY - drag.current.startY);
    setOffset(drag.current.dy, false);
  };

  const onPointerUp = () => {
    if (!drag.current.active) {
      return;
    }

    const { dy } = drag.current;
    drag.current.active = false;

    setOffset(0, true);

    if (dy > 110) {
      onClose();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[70] md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
      inert={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/70 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl border-t border-line bg-surface transition-transform duration-300 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="flex cursor-grab touch-none flex-col items-center pt-2.5"
        >
          <span className="h-1 w-10 rounded-full bg-white/25" />

          <div className="flex w-full items-center justify-between px-5 pb-3 pt-3">
            <h2 className="font-display text-lg font-bold">{title}</h2>

            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              onPointerDown={(event) => event.stopPropagation()}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-muted active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto overscroll-contain px-5 pb-4">
          {children}
        </div>

        {footer && (
          <div className="border-t border-line px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}