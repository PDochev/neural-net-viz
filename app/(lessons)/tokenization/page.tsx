import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { TokenizerDemo } from "@/components/interactives/tokenizer/tokenizer-demo";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("tokenization")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          A language model never sees letters or words the way you do. Its very
          first step is to chop incoming text into <strong>tokens</strong> — a
          fixed vocabulary of chunks — and replace each one with an integer id.
          Those ids are what get looked up in the embedding table from the last
          chapter.
        </p>
        <p>
          A token is usually a common word, a word-piece, a single punctuation
          mark, or a space. Type into the box and watch the text break apart.
        </p>
      </Prose>

      <TokenizerDemo />

      <Prose>
        <h2>Why pieces, not words?</h2>
        <p>
          Why not just give every word its own id? Because language has too many
          words — names, typos, new slang, code, other languages. A fixed
          word-list would constantly hit words it had never seen. Splitting into{" "}
          <strong>subword pieces</strong> is the compromise: a few thousand
          common words get their own token, while anything rare is built up from
          smaller, reusable fragments. Notice how{" "}
          <code>the</code> stays whole but a monster like{" "}
          <code>antidisestablishmentarianism</code> shatters into chunks — yet
          nothing is ever truly out-of-vocabulary.
        </p>

        <h2>Tokens are why models &ldquo;think&rdquo; in a strange unit</h2>
        <p>
          This chopping has real consequences. A model&apos;s context limit is
          measured in tokens, not words. Its pricing is per token. It can be
          oddly bad at character-level tasks — counting the letters in a word, or
          spelling backwards — because it sees <code>strawberry</code> as a
          couple of opaque chunks, not a sequence of letters. The{" "}
          <span className="font-mono">chars/token</span> ratio above is roughly
          how much text each token packs.
        </p>
      </Prose>

      <Aside>
        Our splitter is hand-written and approximate. Real tokenizers use{" "}
        <strong>byte-pair encoding</strong>: they start from raw bytes and
        repeatedly merge the most frequent adjacent pair, learning a vocabulary
        from the training data itself. Same idea, far more refined — and the ids
        here are invented, not GPT&apos;s.
      </Aside>

      <Prose>
        <p>
          So now we have a sequence of token vectors. The remaining question is
          the deep one: how does a model let those tokens <em>interact</em>, so
          that the meaning of each depends on the others around it? That&apos;s{" "}
          <strong>attention</strong> — the idea that made transformers.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
