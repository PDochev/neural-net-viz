import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark: a small neural glyph + the title in the display face. */
export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group/brand flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <BrandGlyph className="size-7 shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[0.95rem] font-medium tracking-tight">
          How AI Works
        </span>
        <span className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
          an interactive explainer
        </span>
      </span>
    </Link>
  );
}

export function BrandGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* three-node "neuron firing" mark */}
      <path
        d="M7 9 L17 16 M7 23 L17 16 M17 16 L26 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="text-muted-foreground/50"
      />
      <circle cx="7" cy="9" r="2.5" className="fill-neg" />
      <circle cx="7" cy="23" r="2.5" className="fill-pos" />
      <circle
        cx="17"
        cy="16"
        r="3.5"
        className="fill-signal"
      />
      <circle cx="26" cy="16" r="2.5" className="fill-pos" />
    </svg>
  );
}
