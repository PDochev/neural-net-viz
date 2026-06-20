import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { NetworkPlayground } from "@/components/interactives/network/network-playground";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("networks")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          One neuron bends a single line. To model anything interesting we need
          many of them — and the trick is how we connect them. We arrange neurons
          into <strong>layers</strong>, and feed the outputs of one layer in as
          the inputs of the next.
        </p>
        <p>
          The network below has three <strong>layers</strong>: three input
          values on the left, a <strong>hidden layer</strong> of four neurons in
          the middle, and two <strong>outputs</strong> on the right. Every neuron
          in a layer is connected to every neuron in the next — each connection
          carrying its own weight. That&apos;s a lot of small multiplications,
          but nothing you haven&apos;t already seen.
        </p>
      </Prose>

      <NetworkPlayground />

      <Prose>
        <h2>Reading the picture</h2>
        <p>
          Each <strong>edge</strong> is a weight. Its colour shows the sign —
          red pushes the next neuron up, blue pulls it down — and its thickness
          shows the magnitude. An edge fades when little signal flows through it:
          set an input near zero and watch its connections go quiet, because
          anything multiplied by roughly zero contributes roughly nothing.
        </p>
        <p>
          Each <strong>node</strong> is filled by its current activation, using
          the same red/blue scale. Click any node to open its computation on the
          right: it&apos;s exactly the weighted-sum-plus-bias-then-squash from the
          last chapter, just with the previous layer&apos;s outputs as its
          inputs. Press <strong>Run pass</strong> to watch the signal sweep
          left-to-right, one layer at a time — that sweep is the{" "}
          <strong>forward pass</strong>.
        </p>

        <h2>Why a hidden layer earns its keep</h2>
        <p>
          The hidden layer is where representations form. Each hidden neuron
          learns to respond to a different combination of the inputs — one might
          fire for &ldquo;input&nbsp;1 high <em>and</em> input&nbsp;2 low&rdquo;
          — and the output layer then combines <em>those</em> detections. Stack
          enough of these and a network can carve the input space into shapes far
          more intricate than any single neuron&apos;s one bend. This is the
          informal idea behind why neural networks are such flexible function
          approximators.
        </p>
      </Prose>

      <Aside>
        Real networks have many more layers and far wider ones, and the outputs
        usually feed into a final step that turns them into a decision or a
        probability. The mechanics are identical — only the numbers get bigger.
        Here every weight is fixed so you can study the flow; in the next chapter
        we let the network <strong>change its own weights</strong>.
      </Aside>

      <Prose>
        <h2>Where do the weights come from?</h2>
        <p>
          So far we&apos;ve set inputs by hand and left the weights frozen. But a
          network with random weights is useless — it maps inputs to noise. The
          entire magic trick of deep learning is <strong>learning</strong> the
          weights: nudging all of them, over and over, until the outputs become
          useful. That process — loss, gradients, and backpropagation — is next.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
