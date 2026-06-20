import { softmax } from "@/lib/math";

/**
 * A fixed example sentence and three hand-designed attention "heads". Real
 * attention weights are computed from learned Q/K projections; here we script
 * the logits so each head shows a recognisable specialisation — but the
 * causal mask and the softmax that turn logits into weights are the real thing.
 */

export const ATT_TOKENS = [
  "The",
  "cat",
  "sat",
  "because",
  "it",
  "was",
  "tired",
  ".",
];

/** Small fake "value" vectors, one per token, for the weighted-sum-of-V step. */
export const VALUE_VECTORS: number[][] = ATT_TOKENS.map((_, i) => [
  Math.round(Math.sin(i * 1.7) * 100) / 100,
  Math.round(Math.cos(i * 0.9) * 100) / 100,
  Math.round(Math.sin(i * 2.3 + 1) * 100) / 100,
]);

export type Head = {
  id: string;
  name: string;
  blurb: string;
  /** Raw score (logit) for query i attending to key j (before masking). */
  logit: (i: number, j: number) => number;
};

// query index → { key index → extra logit } for the linguistic head
const LINGUISTIC: Record<number, Record<number, number>> = {
  2: { 1: 3.5 }, // "sat" ← "cat" (verb → subject)
  4: { 1: 4 }, // "it" ← "cat" (coreference)
  5: { 4: 2.5, 1: 1.5 }, // "was" ← "it"/"cat"
  6: { 1: 3, 4: 2 }, // "tired" ← "cat"/"it"
  7: { 6: 2 }, // "." ← "tired"
};

export const HEADS: Head[] = [
  {
    id: "previous",
    name: "Previous-token head",
    blurb:
      "Each token looks mostly at the token immediately before it — a head that tracks local order.",
    logit: (i, j) => (j === i - 1 ? 4 : j === i ? 1 : 0),
  },
  {
    id: "linguistic",
    name: "Subject / coreference head",
    blurb:
      "Verbs look back to their subject and the pronoun “it” looks back to “cat” — a head that has learned a grammatical relationship.",
    logit: (i, j) => (LINGUISTIC[i]?.[j] ?? 0) + (j === i ? 0.5 : 0),
  },
  {
    id: "broad",
    name: "Broad-context head",
    blurb:
      "Attention spread fairly evenly over everything seen so far — a head that mixes in general context.",
    logit: (i, j) => 0.6 - 0.12 * (i - j),
  },
];

/** Attention weight matrix for a head: causal-masked rows passed through softmax. */
export function attentionMatrix(head: Head): number[][] {
  const n = ATT_TOKENS.length;
  return Array.from({ length: n }, (_, i) => {
    const logits = Array.from({ length: n }, (_, j) =>
      j <= i ? head.logit(i, j) : -Infinity,
    );
    // softmax over the allowed (causal) keys only
    const allowed = logits.slice(0, i + 1);
    const probs = softmax(allowed);
    return logits.map((_, j) => (j <= i ? probs[j] : 0));
  });
}

/** Raw (pre-softmax) causal logits for one query row — for the step-by-step view. */
export function queryLogits(head: Head, i: number): number[] {
  return ATT_TOKENS.map((_, j) => (j <= i ? head.logit(i, j) : -Infinity));
}

/** Weighted sum of value vectors for query i under a weight row. */
export function weightedValue(weights: number[]): number[] {
  const out = [0, 0, 0];
  weights.forEach((w, j) => {
    for (let d = 0; d < 3; d++) out[d] += w * VALUE_VECTORS[j][d];
  });
  return out.map((v) => Math.round(v * 100) / 100);
}
