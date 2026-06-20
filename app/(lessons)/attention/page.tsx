import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { AttentionInspector } from "@/components/interactives/attention/attention-inspector";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("attention")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          A word&apos;s meaning depends on its company.{" "}
          <code>it</code> means nothing on its own; in &ldquo;the cat sat
          because <em>it</em> was tired,&rdquo; <code>it</code> means the cat.
          For a model to understand language, each token has to be able to look
          at the others and pull in what&apos;s relevant. That mechanism is{" "}
          <strong>attention</strong>, and it&apos;s the idea the whole
          transformer is built around.
        </p>
        <p>
          Here&apos;s the core move. For every token, attention asks: &ldquo;of
          all the tokens I&apos;m allowed to look at, how much should I focus on
          each one?&rdquo; It produces a set of weights — one per other token,
          all adding to 1 — and then builds a new representation of the token by
          taking a <em>weighted blend</em> of information from the rest.
        </p>
      </Prose>

      <AttentionInspector />

      <Prose>
        <h2>Query, key, value</h2>
        <p>
          The weights aren&apos;t arbitrary. Each token produces three vectors: a{" "}
          <strong>query</strong> (&ldquo;what am I looking for?&rdquo;), a{" "}
          <strong>key</strong> (&ldquo;what do I offer?&rdquo;), and a{" "}
          <strong>value</strong> (&ldquo;what I&apos;ll actually contribute&rdquo;).
          To decide how much token A attends to token B, we compare A&apos;s
          query with B&apos;s key — a dot product, the same similarity measure
          from the embeddings chapter. Flip on{" "}
          <span className="font-mono">show Q·K → softmax → V</span> above to watch
          those raw scores become weights and then a blended output.
        </p>
        <p>
          Two details worth noticing in the inspector. First, the{" "}
          <strong>softmax</strong> turns the raw match scores into a clean
          probability distribution that sums to 1. Second, every token can only
          attend to itself and the tokens <em>before</em> it — the empty upper
          triangle of the heatmap. That <strong>causal mask</strong> is what
          makes the model predict left-to-right without peeking at the future.
        </p>

        <h2>Many heads, many relationships</h2>
        <p>
          One pattern of attention isn&apos;t enough — grammar, reference, and
          topic are different relationships. So a transformer runs many attention{" "}
          <strong>heads</strong> in parallel, each free to specialise. Switch
          between the tabs: one head just tracks the previous token, another
          links the pronoun back to its noun. Real models have dozens of heads
          per layer, and dozens of layers, composing these simple patterns into
          a rich understanding of the sentence.
        </p>
      </Prose>

      <Aside>
        The weights here are hand-scripted so each head shows a clean,
        recognisable job. In a trained model nobody assigns these roles — they{" "}
        <strong>emerge</strong> from learning the Q/K/V projections. The causal
        mask and the softmax, though, are exactly as shown.
      </Aside>

      <Prose>
        <p>
          Attention is the engine. Next we bolt it into the full repeating block
          — attention, a feed-forward layer, and the connections that hold a deep
          stack together — to make a <strong>transformer</strong>.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
