import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Long-form reading column with editorial typography defaults. Wrap prose
 * blocks (paragraphs, headings, lists) so spacing and measure stay consistent.
 */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "prose-measure space-y-5 text-[1.0625rem] leading-[1.75] text-foreground/85",
        "[&_h2]:mt-14 [&_h2]:scroll-mt-24 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground",
        "[&_h3]:mt-10 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-foreground",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        "[&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:decoration-signal/50 [&_a]:underline-offset-4 hover:[&_a]:decoration-signal",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** A pull-aside note for caveats and "this is a simplification" honesty boxes. */
export function Aside({
  children,
  label = "Note",
}: {
  children: ReactNode;
  label?: string;
}) {
  return (
    <aside className="prose-measure my-8 rounded-lg border border-border bg-muted/30 px-5 py-4 text-[0.95rem] leading-relaxed text-muted-foreground">
      <span className="mb-1 block font-mono text-[0.65rem] font-medium uppercase tracking-[0.18em] text-signal">
        {label}
      </span>
      <div className="text-pretty [&_strong]:font-semibold [&_strong]:text-foreground/90">
        {children}
      </div>
    </aside>
  );
}
