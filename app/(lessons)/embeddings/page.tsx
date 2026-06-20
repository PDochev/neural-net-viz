import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { EmbeddingExplorer } from "@/components/interactives/embeddings/embedding-explorer";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("embeddings")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          Networks only do arithmetic — they multiply and add numbers. So before
          a model can read a word, that word has to <em>become</em> numbers. Not
          one number, but a whole list of them: a <strong>vector</strong>. A
          word&apos;s vector is called its <strong>embedding</strong>.
        </p>
        <p>
          The clever part is <em>which</em> numbers. Embeddings are arranged so
          that a word&apos;s position encodes its meaning — words used in similar
          ways end up close together, pointing in similar directions. Meaning
          becomes geometry, and geometry is something a network can compute with.
        </p>
      </Prose>

      <EmbeddingExplorer />

      <Prose>
        <h2>Closeness is measured by angle</h2>
        <p>
          To ask &ldquo;how related are two words?&rdquo; we compare the{" "}
          <em>direction</em> of their vectors, not their length. The standard
          tool is <strong>cosine similarity</strong>: the cosine of the angle
          between them. Point the same way and it&apos;s <code>1</code>; sit at
          right angles and it&apos;s <code>0</code>. Click <code>cat</code> and{" "}
          <code>dog</code> above, then <code>cat</code> and <code>pizza</code>,
          and watch the number drop.
        </p>

        <h2>Meaning you can add and subtract</h2>
        <p>
          Here is the result that made embeddings famous. Because related
          concepts line up along consistent directions, you can do{" "}
          <em>arithmetic</em> with them. The step from{" "}
          <code>man</code> to <code>woman</code> is a small vector — call it the
          &ldquo;gender&rdquo; direction. Add that same vector to{" "}
          <code>king</code> and you land almost exactly on{" "}
          <code>queen</code>:
        </p>
        <p className="font-mono text-foreground">king − man + woman ≈ queen</p>
        <p>
          Nobody programmed that in. It falls out of arranging words by how
          they&apos;re used. Try the dropdowns above — the blue arrow is the same
          vector, picked up from one word and dropped onto another, snapping to
          whatever word lands nearest.
        </p>
      </Prose>

      <Aside>
        Our space is two hand-placed dimensions so the geometry is visible. Real
        embeddings have hundreds or thousands of dimensions, learned from
        billions of words — which is why they capture far subtler relationships
        than our toy can. The <em>idea</em>, though, is exactly this.
      </Aside>

      <Prose>
        <h2>From words to a sequence</h2>
        <p>
          One detail we&apos;ve glossed over: models don&apos;t actually embed
          whole words. They embed <strong>tokens</strong> — the chunks text gets
          chopped into before anything else happens. That chopping step is small
          but consequential, and it&apos;s next.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
