import type { Metadata } from "next";
import { ChapterHeader, ChapterPager } from "@/components/chapter-header";
import { Prose, Aside } from "@/components/prose";
import { NeuronPlayground } from "@/components/interactives/neuron/neuron-playground";
import { chapterBySlug } from "@/lib/chapters";

const chapter = chapterBySlug("neuron")!;

export const metadata: Metadata = { title: chapter.title };

export default function Page() {
  return (
    <article>
      <ChapterHeader chapter={chapter} />

      <Prose>
        <p>
          Every system in this course - the image classifiers, the chatbots, the
          models that write code - is built from millions of copies of one tiny,
          almost embarrassingly simple part. If you understand this one piece,
          you understand the atom that everything else is made of.
        </p>
        <p>
          That part is the <strong>artificial neuron</strong>. Despite the
          biological name, it isn&apos;t mysterious. A neuron takes a few
          numbers in, and produces a single number out. All the intelligence in
          a network comes from wiring millions of these together and tuning them
          - not from any one neuron being clever.
        </p>

        <h2>A neuron is just weighted addition</h2>
        <p>
          Give a neuron some inputs - call them <code>x₁, x₂, x₃</code>. Each
          input has a matching <strong>weight</strong> <code>w₁, w₂, w₃</code>,
          a number that says how much that input matters. The neuron multiplies
          each input by its weight, adds the results together, and adds one more
          number called the <strong>bias</strong> <code>b</code>:
        </p>
        <p>
          That running total is called <code>z</code>. Then the neuron passes{" "}
          <code>z</code> through an <strong>activation function</strong> to
          produce its final output <code>y</code>. That&apos;s the whole thing.
          Play with it below - every slider feeds straight into the same little
          calculation.
        </p>
      </Prose>

      <NeuronPlayground />

      <Prose>
        <h2>Weights are knobs; the bias is a thumb on the scale</h2>
        <p>
          Watch what each control does. A <strong>large positive weight</strong>{" "}
          makes its input strongly push the sum up; a{" "}
          <strong>negative weight</strong> makes the same input push it down
          (you&apos;ll see the connecting edge switch colour as you cross zero).
          A weight near zero means &ldquo;ignore this input.&rdquo; Learning,
          which we&apos;ll get to in a later chapter, is nothing more than
          finding good values for these weights.
        </p>
        <p>
          The <strong>bias</strong> shifts the whole sum up or down regardless
          of the inputs. It sets how easily the neuron &ldquo;fires&rdquo; -
          think of it as the neuron&apos;s eagerness, or the threshold it has to
          clear before it produces a meaningful output.
        </p>

        <h2>Why squash it? The activation function</h2>
        <p>
          If a neuron only did weighted addition, it could only ever draw{" "}
          <em>straight lines</em> - and so could a whole stack of them, because
          adding linear things together just gives you another linear thing. The
          activation function bends that straight line, and bending is what lets
          networks model curves, corners, and the messy boundaries that real
          problems demand. Switch between the three in the playground:
        </p>
        <ul>
          <li>
            <strong>ReLU</strong> — &ldquo;pass positives through, zero out
            negatives.&rdquo; Brutally simple, and the workhorse inside most
            modern networks.
          </li>
          <li>
            <strong>Sigmoid</strong> - squashes any number into the range{" "}
            <code>0…1</code>, so the output reads like a probability or a soft
            switch.
          </li>
          <li>
            <strong>tanh</strong> - like sigmoid but centered on zero, ranging{" "}
            <code>−1…1</code>, so it can represent &ldquo;against&rdquo; as well
            as &ldquo;for.&rdquo;
          </li>
        </ul>
        <p>
          Notice the dot on the curve: as you change the weights and inputs, you
          move <code>z</code> left and right along the horizontal axis, and the
          curve decides what comes out the top. Crank a weight high enough and a
          sigmoid neuron saturates - pinned near 1, barely responding. That
          saturation will matter a lot when we talk about learning.
        </p>
      </Prose>

      <Aside>
        This is a faithful picture of the math, but a real network neuron has
        dozens to thousands of inputs, and its weights aren&apos;t set by hand -
        they&apos;re <strong>learned</strong> from data. We&apos;re using three
        inputs and sliders so the moving parts stay visible.
      </Aside>

      <Prose>
        <h2>One neuron isn&apos;t enough</h2>
        <p>
          A single neuron draws exactly one bent boundary through its inputs -
          useful, but limited. The leap comes from arranging many neurons into{" "}
          <strong>layers</strong>, feeding the outputs of one layer into the
          next so that simple bends compose into intricate shapes. That&apos;s
          the next chapter: stacking neurons, and pushing a signal all the way
          through.
        </p>
      </Prose>

      <ChapterPager chapter={chapter} />
    </article>
  );
}
