import { sigmoid, tanh } from "@/lib/math";

/**
 * A tiny fixed 3 → 4 → 2 network with hand-picked weights. Hidden layer uses
 * tanh, output layer uses sigmoid. Inputs are user-controlled; everything else
 * is deterministic so the picture is stable and reproducible.
 */

export const ARCH = [3, 4, 2] as const;

export const INPUT_RANGE = { min: -2, max: 2, step: 0.1 } as const;

// weights[l][j][i] = weight from source i (layer l) to target j (layer l+1)
const W1 = [
  [0.9, -1.2, 0.4],
  [-0.7, 0.5, 1.1],
  [1.3, 0.8, -0.6],
  [-0.4, -1.0, 0.9],
];
const B1 = [0.2, -0.3, 0.1, 0.4];

const W2 = [
  [1.0, -0.8, 0.6, 0.5],
  [-0.6, 1.1, -0.9, 0.7],
];
const B2 = [0.1, -0.2];

export const WEIGHTS = [W1, W2];
export const BIASES = [B1, B2];

/** Largest |weight| in the net — used to normalise edge thickness. */
export const MAX_WEIGHT = Math.max(
  ...WEIGHTS.flat(2).map(Math.abs),
);

export type NodeId = { layer: number; index: number };

export type ForwardPass = {
  /** activations[l] holds the values of every node in layer l (l=0 is inputs). */
  activations: number[][];
  /** preActivations[l] for l ≥ 1 holds z before the activation function. */
  preActivations: number[][];
};

export const layerActivation = (layer: number) =>
  layer === ARCH.length - 1 ? sigmoid : tanh;

export const layerActivationLabel = (layer: number) =>
  layer === ARCH.length - 1 ? "sigmoid" : "tanh";

/** Run the network forward, recording every node's value and pre-activation. */
export function forward(inputs: number[]): ForwardPass {
  const activations: number[][] = [inputs.slice()];
  const preActivations: number[][] = [inputs.slice()];

  for (let l = 1; l < ARCH.length; l++) {
    const W = WEIGHTS[l - 1];
    const B = BIASES[l - 1];
    const prev = activations[l - 1];
    const f = layerActivation(l);
    const pre: number[] = [];
    const act: number[] = [];
    for (let j = 0; j < ARCH[l]; j++) {
      let z = B[j];
      for (let i = 0; i < prev.length; i++) z += W[j][i] * prev[i];
      pre.push(z);
      act.push(f(z));
    }
    preActivations.push(pre);
    activations.push(act);
  }

  return { activations, preActivations };
}

/** The incoming contributions to one node, for the click-to-inspect panel. */
export type NodeBreakdown = {
  isInput: boolean;
  terms: { from: number; weight: number; sourceValue: number; product: number }[];
  bias: number;
  preActivation: number;
  output: number;
  activationLabel: string;
};

export function breakdown(pass: ForwardPass, node: NodeId): NodeBreakdown {
  if (node.layer === 0) {
    return {
      isInput: true,
      terms: [],
      bias: 0,
      preActivation: pass.activations[0][node.index],
      output: pass.activations[0][node.index],
      activationLabel: "input",
    };
  }
  const W = WEIGHTS[node.layer - 1][node.index];
  const bias = BIASES[node.layer - 1][node.index];
  const prev = pass.activations[node.layer - 1];
  const terms = prev.map((sourceValue, from) => ({
    from,
    weight: W[from],
    sourceValue,
    product: W[from] * sourceValue,
  }));
  return {
    isInput: false,
    terms,
    bias,
    preActivation: pass.preActivations[node.layer][node.index],
    output: pass.activations[node.layer][node.index],
    activationLabel: layerActivationLabel(node.layer),
  };
}

export const initialInputs = [1, -0.5, 1.2];
