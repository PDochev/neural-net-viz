"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Figure } from "@/components/figure";
import { SliderControl } from "@/components/control-row";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Activation, activationLabel } from "@/lib/math";
import {
  computeNeuron,
  initialState,
  RANGE,
  type NeuronInput,
  type NeuronState,
} from "./model";
import { NeuronDiagram } from "./neuron-diagram";
import { ActivationPlot } from "./activation-plot";
import { NeuronEquation } from "./neuron-equation";

const ACTIVATIONS: Activation[] = ["relu", "sigmoid", "tanh", "linear"];

export function NeuronPlayground() {
  const [state, setState] = useState<NeuronState>(initialState);
  const result = useMemo(() => computeNeuron(state), [state]);

  const setInput = (i: number, patch: Partial<NeuronInput>) =>
    setState((s) => ({
      ...s,
      inputs: s.inputs.map((inp, j) => (j === i ? { ...inp, ...patch } : inp)),
    }));

  const isDefault =
    JSON.stringify(state) === JSON.stringify(initialState);

  return (
    <Figure
      title="Neuron playground"
      help="Drag the inputs (xᵢ) and their weights (wᵢ), nudge the bias, and switch the activation. Everything downstream — the diagram, the equation, and the curve — recomputes instantly."
      caption="A single neuron: multiply each input by its weight, add them up with a bias to get z, then squash z through an activation to get the output y."
      toolbar={
        <Tabs
          value={state.activation}
          onValueChange={(v) =>
            setState((s) => ({ ...s, activation: v as Activation }))
          }
        >
          <TabsList variant="line" aria-label="Activation function">
            {ACTIVATIONS.map((a) => (
              <TabsTrigger key={a} value={a} className="px-2">
                {activationLabel[a].replace(/\s*\(.*\)/, "")}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <div className="space-y-6 p-4 sm:p-6">
        {/* schematic */}
        <div className="mx-auto max-w-xl">
          <NeuronDiagram state={state} result={result} />
        </div>

        {/* live equation */}
        <NeuronEquation state={state} result={result} />

        {/* controls + curve */}
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Inputs & weights
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setState(initialState)}
                disabled={isDefault}
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
              >
                <RotateCcw className="size-3" /> Reset
              </Button>
            </div>

            {state.inputs.map((input, i) => (
              <div
                key={input.label}
                className="grid grid-cols-2 gap-x-4 gap-y-3 border-l-2 border-border pl-3"
              >
                <SliderControl
                  id={`x${i}`}
                  label={
                    <>
                      input <span className="font-mono">{input.label}</span>
                    </>
                  }
                  value={input.value}
                  onChange={(v) => setInput(i, { value: v })}
                  min={RANGE.value.min}
                  max={RANGE.value.max}
                  step={RANGE.value.step}
                  format={(v) => v.toFixed(1)}
                />
                <SliderControl
                  id={`w${i}`}
                  label={
                    <>
                      weight{" "}
                      <span className="font-mono">{input.weightLabel}</span>
                    </>
                  }
                  value={input.weight}
                  onChange={(v) => setInput(i, { weight: v })}
                  min={RANGE.weight.min}
                  max={RANGE.weight.max}
                  step={RANGE.weight.step}
                  format={(v) => v.toFixed(1)}
                  tone="signed"
                />
              </div>
            ))}

            <SliderControl
              id="bias"
              label="bias b"
              value={state.bias}
              onChange={(v) => setState((s) => ({ ...s, bias: v }))}
              min={RANGE.bias.min}
              max={RANGE.bias.max}
              step={RANGE.bias.step}
              format={(v) => v.toFixed(1)}
              tone="signed"
            />
          </div>

          {/* activation curve */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {activationLabel[state.activation]}
              </h4>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                f({result.z.toFixed(2)}) ={" "}
                <span className="text-foreground">
                  {result.output.toFixed(3)}
                </span>
              </span>
            </div>
            <div className="border border-border bg-card p-2">
              <ActivationPlot
                activation={state.activation}
                z={result.z}
                output={result.output}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              The dot is the neuron&apos;s operating point: its input{" "}
              <span className="font-mono">z = {result.z.toFixed(2)}</span> read
              off the horizontal axis, its output{" "}
              <span className="font-mono">{result.output.toFixed(3)}</span> off
              the vertical.
            </p>
          </div>
        </div>
      </div>
    </Figure>
  );
}
