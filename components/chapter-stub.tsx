import { notFound } from "next/navigation";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Figure } from "@/components/figure";
import { Prose } from "@/components/prose";
import { chapterBySlug } from "@/lib/chapters";

/**
 * Temporary chapter body used during scaffolding. Each chapter replaces this
 * with real prose + interactives, but the header/pager framing stays.
 */
export function ChapterStub({ slug }: { slug: string }) {
  const chapter = chapterBySlug(slug);
  if (!chapter) notFound();

  return (
    <article>
      <ChapterHeader chapter={chapter} />
      <Prose>
        <p>
          This chapter is under construction. It will explain{" "}
          <strong>{chapter.title.toLowerCase()}</strong> and center on an
          interactive <strong>{chapter.interactive}</strong> you can manipulate
          directly.
        </p>
      </Prose>
      <Figure
        title={chapter.interactive}
        caption="Interactive coming soon — this figure is a placeholder."
        help="Each chapter is built around a hands-on visualization. This one isn't wired up yet."
      >
        <div className="flex aspect-[16/9] items-center justify-center">
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {chapter.interactive}
          </span>
        </div>
      </Figure>
      <ChapterPager chapter={chapter} />
    </article>
  );
}
