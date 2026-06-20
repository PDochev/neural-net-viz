import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { NextTokenPredictor } from "@/components/interactives/predictor/next-token-predictor";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("llm")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          Time to assemble the whole machine. A large language model does exactly
          one thing: given some text, it predicts the <strong>next token</strong>.
          Everything it appears to do — answer questions, write code, hold a
          conversation — is that single trick, run in a loop.
        </p>
        <p>Here is the full pipeline, end to end:</p>
        <ol>
          <li>
            <strong>Tokenize</strong> the input text into token ids.
          </li>
          <li>
            <strong>Embed</strong> each token into a vector.
          </li>
          <li>
            Run the vectors through the <strong>stack of transformer blocks</strong>.
          </li>
          <li>
            Turn the final vector into a <strong>probability for every token</strong>{" "}
            in the vocabulary.
          </li>
          <li>
            <strong>Sample</strong> one token from that distribution, append it,
            and go back to step 1.
          </li>
        </ol>
        <p>
          The widget below picks up at step 4: a probability for every candidate
          next token. Your job is step 5 — choosing one.
        </p>
      </Prose>

      <NextTokenPredictor />

      <Prose>
        <h2>Sampling is where the personality lives</h2>
        <p>
          The model hands us a distribution; how we <em>draw</em> from it shapes
          the output. Always taking the single most-likely token —{" "}
          <strong>greedy</strong> decoding — is accurate but flat and repetitive.
          Sampling adds variety, and <strong>temperature</strong> controls how
          much: crank it up and the bars level out, letting surprising tokens
          win; turn it down and the top token dominates. This is the same{" "}
          <code>temperature</code> knob you&apos;ll find in nearly every model
          API.
        </p>
        <p>
          <strong>Top-k</strong> and <strong>top-p</strong> are guardrails. They
          chop off the long tail of absurd options <em>before</em> sampling — keep
          only the <code>k</code> most likely tokens, or the smallest set whose
          probability adds up to <code>p</code> — so you can raise temperature for
          creativity without the model occasionally blurting out nonsense. Flip
          them on and watch tokens grey out.
        </p>

        <h2>Why &ldquo;just predict the next token&rdquo; is enough</h2>
        <p>
          It sounds too simple to produce intelligence. The depth comes from
          scale: to predict the next token well across all of human text, a model
          is forced to learn grammar, facts, reasoning patterns, and styles —
          because all of those help it guess better. Generation is then just this
          loop, one token at a time, each new token folded back into the context
          for the next prediction.
        </p>
      </Prose>

      <Aside>
        The probabilities here are scripted so the demo reads well. In a real
        model every distribution is the output of a full forward pass through
        billions of parameters — but the temperature, top-k, and top-p steps, and
        the sample-and-append loop, are exactly what you just used.
      </Aside>

      <Prose>
        <p>
          That&apos;s the complete mechanism, neuron to sentence. The last chapter
          steps back from the machinery to ask where this technology actually
          stands today — what it can do, how it&apos;s shaped after pre-training,
          and where it still falls down.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
