import { activations, type Activation } from "@/lib/math";

export type NeuronInput = {
  /** Display label, e.g. "x₁". */
  label: string;
  value: number;
  weight: number;
  /** Weight label, e.g. "w₁". */
  weightLabel: string;
};

export type NeuronState = {
  inputs: NeuronInput[];
  bias: number;
  activation: Activation;
};

export type NeuronResult = {
  /** wᵢ · xᵢ for each input. */
  terms: number[];
  /** Σ wᵢxᵢ (before the bias is added). */
  weightedSum: number;
  /** The pre-activation value z = Σ wᵢxᵢ + b. */
  z: number;
  /** The neuron's output a = f(z). */
  output: number;
};

/** The entire forward computation of one neuron — the heart of the chapter. */
export function computeNeuron(state: NeuronState): NeuronResult {
  const terms = state.inputs.map((i) => i.value * i.weight);
  const weightedSum = terms.reduce((acc, t) => acc + t, 0);
  const z = weightedSum + state.bias;
  const output = activations[state.activation](z);
  return { terms, weightedSum, z, output };
}

/** Range each control is allowed to span. */
export const RANGE = {
  value: { min: -2, max: 2, step: 0.1 },
  weight: { min: -2, max: 2, step: 0.1 },
  bias: { min: -3, max: 3, step: 0.1 },
} as const;

/** A deliberately interesting starting point (output near the curve's elbow). */
export const initialState: NeuronState = {
  inputs: [
    { label: "x₁", weightLabel: "w₁", value: 1, weight: 1.2 },
    { label: "x₂", weightLabel: "w₂", value: 0.5, weight: -0.8 },
    { label: "x₃", weightLabel: "w₃", value: -1, weight: 0.5 },
  ],
  bias: 0.2,
  activation: "tanh",
};
