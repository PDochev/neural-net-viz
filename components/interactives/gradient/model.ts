/**
 * A 1-D loss landscape with two minima and a hill between them — enough to
 * show convergence, local minima, and (with a big learning rate) divergence.
 * w is the single "parameter" the reader is optimising.
 */

export const DOMAIN = { min: -3.6, max: 3.6 } as const;

/** Loss as a function of the parameter w. */
export function loss(w: number): number {
  return 0.15 * w ** 4 - 1.2 * w ** 2 + 0.25 * w + 2.4;
}

/** Analytic derivative dL/dw — the gradient. */
export function gradient(w: number): number {
  return 0.6 * w ** 3 - 2.4 * w + 0.25;
}

/** One gradient-descent step: walk downhill, scaled by the learning rate. */
export function step(w: number, learningRate: number): number {
  return w - learningRate * gradient(w);
}

export const LR_RANGE = { min: 0.01, max: 1.2, step: 0.01 } as const;
export const INITIAL_W = -3.2;
export const INITIAL_LR = 0.1;

/** Loss range across the visible domain, for scaling the plot. */
export function lossExtent(): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i <= 200; i++) {
    const w = DOMAIN.min + ((DOMAIN.max - DOMAIN.min) * i) / 200;
    const l = loss(w);
    if (l < min) min = l;
    if (l > max) max = l;
  }
  return { min, max };
}
