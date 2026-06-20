import Link from "next/link";
import { cn } from "@/lib/utils";

// Causal attention-weight pattern (lower-triangular), echoing the site's
// attention heatmap. Last cell is the blue accent.
const ATTENTION = [
  [0.85, 0.1, 0.1, 0.1],
  [0.45, 0.8, 0.1, 0.1],
  [0.3, 0.5, 0.85, 0.1],
  [0.22, 0.32, 0.55, 1],
];

/** Wordmark: a small attention-matrix glyph + the title in the display face. */
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
    <svg viewBox="0 0 32 32" aria-hidden className={className}>
      {ATTENTION.flatMap((row, r) =>
        row.map((opacity, c) => {
          const accent = r === 3 && c === 3;
          return (
            <rect
              key={`${r}-${c}`}
              x={4 + c * 7}
              y={4 + r * 7}
              width={6}
              height={6}
              className={accent ? "fill-signal" : "fill-foreground"}
              fillOpacity={accent ? 1 : opacity}
            />
          );
        }),
      )}
    </svg>
  );
}
