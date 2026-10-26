import type { ReactNode } from "react";

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  action,
  className = "mb-4",
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <h2 className="flex items-center gap-3 font-display text-lg font-bold tracking-tight sm:text-2xl">
        <span
          aria-hidden="true"
          className="h-5 w-1 rounded-full bg-brand sm:h-6"
        />
        {title}
      </h2>

      {action}
    </div>
  );
}