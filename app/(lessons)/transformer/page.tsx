import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { TransformerBlock } from "@/components/interactives/transformer/transformer-block";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("transformer")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          We now have all the parts: embeddings to turn tokens into vectors,
          attention to let those vectors share information, and feed-forward
          neurons to process them. The <strong>transformer</strong> is the
          specific way these parts are wired into a repeatable{" "}
          <strong>block</strong> — and then that block is stacked, over and over.
        </p>
        <p>
          Click through the diagram below. Every block does the same four things
          in the same order, wrapped in two pieces of connective tissue that turn
          out to be essential.
        </p>
      </Prose>

      <TransformerBlock />

      <Prose>
        <h2>The two helpers: residuals and normalization</h2>
        <p>
          Notice the dashed <strong>residual connections</strong> looping around
          attention and the feed-forward layer. Instead of replacing its input,
          each sub-layer&apos;s output is <em>added</em> to it. This means a
          sub-layer only has to learn a small <em>correction</em>, and — crucially
          — it gives gradients a clean path straight back through the network.
          Without residuals, stacking dozens of layers simply wouldn&apos;t
          train.
        </p>
        <p>
          The <strong>normalization</strong> after each add keeps the numbers in
          a sane range as they flow through layer after layer, so nothing
          explodes or vanishes. Together, &ldquo;add &amp; norm&rdquo; is what
          makes depth possible.
        </p>

        <h2>Attention mixes, feed-forward thinks</h2>
        <p>
          It&apos;s worth seeing the division of labour. <strong>Attention</strong>{" "}
          is the only step where tokens talk to each other — it moves information{" "}
          <em>between</em> positions. The <strong>feed-forward</strong> network
          then works on each position on its own, transforming what was gathered.
          Mix, then think; mix, then think. Stacked dozens of times, that rhythm
          is enough to model language astonishingly well.
        </p>
      </Prose>

      <Aside>
        Details vary between real models — where exactly normalization sits, the
        flavour of positional encoding, the activation in the feed-forward layer
        — but every modern large language model is, at heart, a tall stack of the
        block you just explored.
      </Aside>

      <Prose>
        <p>
          A stack of these blocks is the engine. In the final mechanics chapter
          we wrap the whole thing end-to-end: text in one side, a probability for
          every possible next token out the other — and a loop that turns those
          probabilities back into text.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
