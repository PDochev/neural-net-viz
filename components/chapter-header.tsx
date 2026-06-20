import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { chapterNeighbours, type Chapter } from "@/lib/chapters";

/** The title block at the top of every chapter. */
export function ChapterHeader({ chapter }: { chapter: Chapter }) {
  return (
    <header className="prose-measure mb-12 border-b border-border pb-8">
      <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
        <span className="text-signal">
          Chapter {String(chapter.index).padStart(2, "0")}
        </span>
        <span aria-hidden className="h-px w-8 bg-border" />
        <span>{chapter.interactive}</span>
      </div>
      <h1 className="text-balance font-display text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
        {chapter.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
        {chapter.blurb}
      </p>
    </header>
  );
}

/** Previous / next chapter links at the foot of a chapter. */
export function ChapterPager({ chapter }: { chapter: Chapter }) {
  const { prev, next } = chapterNeighbours(chapter.slug);
  return (
    <nav
      aria-label="Chapter navigation"
      className="mt-20 grid gap-3 border-t border-border pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-signal/40 hover:bg-accent/40"
        >
          <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            <ArrowLeft className="size-3" /> Previous
          </span>
          <span className="font-medium">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/${next.slug}`}
          className="group flex flex-col items-end gap-1 rounded-lg border border-border bg-card px-4 py-3 text-right transition-colors hover:border-signal/40 hover:bg-accent/40 sm:col-start-2"
        >
          <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground">
            Next <ArrowRight className="size-3" />
          </span>
          <span className="font-medium">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}
