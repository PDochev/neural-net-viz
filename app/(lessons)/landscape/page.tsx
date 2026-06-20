import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { TrainingPipeline } from "@/components/interactives/landscape/training-pipeline";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("landscape")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          You&apos;ve now seen the whole machine: a neuron, stacked into layers,
          trained by gradient descent, fed tokens turned into vectors, wired
          together with attention into transformer blocks, predicting one token
          at a time. Everything in today&apos;s headlines is built from those
          parts. This last chapter is a short, honest tour of what surrounds
          them — the parts that change fastest.
        </p>

        <h2>Scale is the surprise</h2>
        <p>
          The single biggest lesson of the last few years is almost
          anticlimactic: <strong>make it bigger</strong>. More parameters, more
          data, more compute — and capabilities improve smoothly and
          predictably, following what are known as <strong>scaling laws</strong>.
          Abilities that looked out of reach often just... appear, once a model
          is large enough. Much of the field&apos;s recent progress is the same
          architecture you just learned, scaled up and trained for longer.
        </p>

        <h2>From a raw model to an assistant</h2>
        <p>
          A freshly pre-trained model is not the friendly assistant you chat
          with. Getting there takes extra stages — and that pipeline is where a
          lot of a model&apos;s &ldquo;personality&rdquo; and safety behaviour
          actually comes from.
        </p>
      </Prose>

      <TrainingPipeline />

      <Prose>
        <h2>Context windows</h2>
        <p>
          A model can only attend to so many tokens at once — its{" "}
          <strong>context window</strong>. Everything it &ldquo;knows&rdquo; in a
          conversation has to fit there; it has no memory between calls beyond
          what you give it. Windows have grown enormously, which is why models
          can now read whole documents or codebases at once — but attention&apos;s
          cost grows with length, so it&apos;s never free, and things in the
          middle of a long context can still get lost.
        </p>

        <h2>Beyond text</h2>
        <p>
          The same transformer machinery works on more than words. Chop an image
          into patches, or audio into snippets, embed them as tokens, and a model
          can attend across text, pictures, and sound together. That&apos;s{" "}
          <strong>multimodality</strong>: one architecture, many kinds of token.
        </p>

        <h2>Agents</h2>
        <p>
          Wrap a model in a loop, give it tools it can call — search, code
          execution, other software — and let it decide its own next action, and
          you get an <strong>agent</strong>. The model still just predicts tokens;
          some of those tokens are now interpreted as commands. It&apos;s a
          powerful pattern and an unreliable one, since a single bad step can
          derail the whole chain.
        </p>

        <h2>Where it still falls down</h2>
        <p>
          Be clear-eyed about the limits. Models <strong>hallucinate</strong> —
          they generate fluent, confident text that is simply false, because they
          optimise for plausible continuations, not truth. They can be
          inconsistent, sensitive to how a question is phrased, and confidently
          wrong about their own reasoning. They reflect <strong>biases</strong>{" "}
          in their training data and their preference tuning. And nothing in the
          mechanism guarantees a correct answer — only a likely-sounding one.
          Understanding the machinery is the best defence: when you remember it&apos;s
          a next-token predictor, its failures stop being surprising.
        </p>
      </Prose>

      <Aside label="A note on timing">
        This chapter ages faster than the rest. The neuron, backprop, attention,
        and the transformer block are stable foundations — but specific models,
        context sizes, and training recipes move quickly. Treat the{" "}
        <em>mechanics</em> as durable and the <em>landscape</em> as a snapshot.
      </Aside>

      <Prose>
        <h2>That&apos;s the whole machine</h2>
        <p>
          From a single neuron computing a weighted sum, to a system that writes
          essays and code — and not a single step required magic, only a great
          many simple steps composed at scale. You now know what&apos;s actually
          happening inside. Scroll back to any chapter and play with the parts
          again; the intuition deepens every time the numbers move.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
