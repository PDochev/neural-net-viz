import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { GradientSandbox } from "@/components/interactives/gradient/gradient-sandbox";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("learning")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          A freshly-built network has random weights, so its outputs are
          nonsense. <strong>Training</strong> is the process of nudging those
          weights until the outputs become useful. To do that, we need two
          things: a way to measure how wrong the network is, and a way to figure
          out which direction to nudge each weight.
        </p>

        <h2>Loss: a number for &ldquo;how wrong&rdquo;</h2>
        <p>
          The first piece is the <strong>loss</strong> — a single number that&apos;s
          large when the network&apos;s predictions are far from the right answers
          and small when they&apos;re close. Training has one goal: make the loss
          small. So the whole problem becomes &ldquo;find the weights that
          minimise this number.&rdquo;
        </p>
        <p>
          Imagine, for a moment, a network with just <em>one</em> weight{" "}
          <code>w</code>. We could plot the loss for every value of{" "}
          <code>w</code> and literally see where it&apos;s lowest. That plot is
          the curve below.
        </p>

        <h2>Gradient descent: roll downhill</h2>
        <p>
          We can&apos;t see the whole landscape when there are millions of
          weights — but at our current spot we <em>can</em> measure the{" "}
          <strong>slope</strong>, and the slope tells us which way is downhill.
          The slope of the loss is called the <strong>gradient</strong>. The
          recipe — <strong>gradient descent</strong> — is almost insultingly
          simple: take a small step in the downhill direction, then measure
          again, and repeat.
        </p>
        <p>
          Drag the ball to drop it anywhere, then <strong>Step</strong> or{" "}
          <strong>Run</strong>. The dashed ghost shows where the next step lands;
          the tangent line is the gradient you&apos;re sliding down.
        </p>
      </Prose>

      <GradientSandbox />

      <Prose>
        <h2>The learning rate is a balancing act</h2>
        <p>
          The <strong>learning rate</strong> scales how big each step is. Too
          small and training crawls. Too large and the ball leaps clean over the
          valley and bounces up the other side — push the slider past{" "}
          <code>~0.8</code>, hit run, and watch the loss chart explode instead of
          settle. Picking a good learning rate is one of the everyday arts of
          training neural networks.
        </p>
        <p>
          Try dropping the ball on the left versus the right of the hill.
          Depending on where it starts it settles into different valleys — a{" "}
          <strong>local minimum</strong>. Real loss landscapes have countless
          such valleys; remarkably, in very high dimensions most of them turn out
          to be nearly as good as each other, which is part of why this simple
          method works at all.
        </p>

        <h2>Backpropagation: gradients for every weight at once</h2>
        <p>
          One weight is easy. A real network has millions, and we need the
          gradient of the loss with respect to <em>each</em> of them. Computing
          them one at a time would be hopeless. <strong>Backpropagation</strong>{" "}
          is the algorithm that gets all of them in a single efficient sweep{" "}
          <em>backward</em> through the network: it starts from the loss at the
          output and applies the chain rule from calculus layer by layer,
          handing each weight its share of the blame. Then gradient descent
          nudges every weight at once. That&apos;s one training step — repeated
          millions of times.
        </p>
      </Prose>

      <Aside>
        We&apos;re optimising one toy parameter on a hand-drawn curve. The real
        loss landscape lives in millions of dimensions and is never seen
        directly — but the loop is exactly the same:{" "}
        <strong>predict → measure loss → backprop gradients → step</strong>.
      </Aside>

      <Prose>
        <p>
          That&apos;s the engine of learning. From here on we shift from{" "}
          <em>how networks learn</em> to <em>how they handle language</em> —
          starting with the trick that turns words into something a network can
          actually do math on.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
