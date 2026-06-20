/**
 * A scripted next-token distribution for the generation demo. A real model
 * computes these logits from the whole context with a forward pass; here they
 * are hand-authored per "last token" so the demo stays coherent for a few
 * steps. The temperature / top-k / top-p maths applied on top is real.
 */

export const PROMPT = "The cat sat on the";

export type Candidate = { token: string; logit: number };

const DISTRIBUTIONS: Record<string, Candidate[]> = {
  the: [
    { token: " mat", logit: 3.0 },
    { token: " floor", logit: 2.3 },
    { token: " rug", logit: 1.9 },
    { token: " carpet", logit: 1.5 },
    { token: " sofa", logit: 1.3 },
    { token: " couch", logit: 1.1 },
    { token: " grass", logit: 0.9 },
    { token: " table", logit: 0.7 },
    { token: " windowsill", logit: 0.5 },
    { token: " roof", logit: 0.3 },
  ],
  mat: [
    { token: ".", logit: 2.8 },
    { token: " and", logit: 1.2 },
    { token: " while", logit: 0.7 },
    { token: " by", logit: 0.5 },
    { token: " near", logit: 0.4 },
    { token: " quietly", logit: 0.3 },
  ],
  and: [
    { token: " the", logit: 2.4 },
    { token: " then", logit: 1.4 },
    { token: " she", logit: 0.9 },
    { token: " soon", logit: 0.7 },
    { token: " licked", logit: 0.6 },
    { token: " fell", logit: 0.5 },
  ],
  ".": [
    { token: " The", logit: 2.0 },
    { token: " It", logit: 1.5 },
    { token: " Then", logit: 1.1 },
    { token: " She", logit: 0.8 },
    { token: " A", logit: 0.6 },
  ],
  fell: [
    { token: " asleep", logit: 3.1 },
    { token: " over", logit: 1.4 },
    { token: " off", logit: 1.0 },
    { token: " down", logit: 0.8 },
    { token: " quiet", logit: 0.4 },
  ],
};

const FALLBACK: Candidate[] = [
  { token: ".", logit: 1.8 },
  { token: " and", logit: 1.3 },
  { token: " the", logit: 1.0 },
  { token: " a", logit: 0.8 },
  { token: " it", logit: 0.7 },
  { token: " then", logit: 0.5 },
];

/** Look up the next-token candidates given the generated tokens so far. */
export function getCandidates(generated: string[]): Candidate[] {
  const last = generated[generated.length - 1] ?? "the";
  const key = last.trim().toLowerCase().replace(/[^a-z.]/g, "");
  return DISTRIBUTIONS[key] ?? FALLBACK;
}
