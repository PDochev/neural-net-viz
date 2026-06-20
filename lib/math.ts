/**
 * Small, dependency-free numeric helpers shared by every visualization.
 * Kept deliberately readable — these are illustrative, not optimized BLAS.
 */

export type Vec = readonly number[];

export const clamp = (x: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, x));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/** Map x from [inMin,inMax] to [outMin,outMax] (no clamping). */
export const remap = (
  x: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number => outMin + ((x - inMin) * (outMax - outMin)) / (inMax - inMin);

export const round = (x: number, dp = 2): number => {
  const f = 10 ** dp;
  return Math.round(x * f) / f;
};

// ── Linear algebra ──────────────────────────────────────────────

export function dot(a: Vec, b: Vec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export const add = (a: Vec, b: Vec): number[] => a.map((v, i) => v + b[i]);
export const sub = (a: Vec, b: Vec): number[] => a.map((v, i) => v - b[i]);
export const scale = (a: Vec, k: number): number[] => a.map((v) => v * k);

export const magnitude = (a: Vec): number => Math.sqrt(dot(a, a));

/** Cosine similarity in [-1, 1]; 0 for a zero vector. */
export function cosineSimilarity(a: Vec, b: Vec): number {
  const denom = magnitude(a) * magnitude(b);
  return denom === 0 ? 0 : clamp(dot(a, b) / denom, -1, 1);
}

export function euclidean(a: Vec, b: Vec): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += (a[i] - b[i]) ** 2;
  return Math.sqrt(s);
}

// ── Activations ─────────────────────────────────────────────────

export const relu = (x: number): number => Math.max(0, x);
export const sigmoid = (x: number): number => 1 / (1 + Math.exp(-x));
export const tanh = (x: number): number => Math.tanh(x);

export type Activation = "relu" | "sigmoid" | "tanh" | "linear";

export const activations: Record<Activation, (x: number) => number> = {
  relu,
  sigmoid,
  tanh,
  linear: (x) => x,
};

export const activationLabel: Record<Activation, string> = {
  relu: "ReLU",
  sigmoid: "σ (sigmoid)",
  tanh: "tanh",
  linear: "linear",
};

// ── Probability ─────────────────────────────────────────────────

/**
 * Numerically stable softmax with an optional temperature.
 * temperature → 0 makes the distribution peaky (greedy);
 * temperature → ∞ makes it flat (uniform).
 */
export function softmax(logits: Vec, temperature = 1): number[] {
  const t = Math.max(temperature, 1e-6);
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

// ── Color mapping for the signed-value signal system ────────────

/**
 * Returns a CSS color for a signed value using the shared signal palette.
 * Positive → amber (`--pos`), negative → cool blue (`--neg`). `t` controls
 * opacity by magnitude relative to `max`.
 */
export function signedColor(value: number, max = 1): string {
  const t = clamp(Math.abs(value) / max, 0, 1);
  const pct = round((0.14 + t * 0.86) * 100, 1);
  const base = value >= 0 ? "var(--pos)" : "var(--neg)";
  return `color-mix(in oklab, ${base} ${pct}%, transparent)`;
}

/** Just the hue (full strength) for the sign of a value. */
export const signColor = (value: number): string =>
  value >= 0 ? "var(--pos)" : "var(--neg)";
