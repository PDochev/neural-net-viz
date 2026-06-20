import { cn } from "@/lib/utils";
import { activationLabel } from "@/lib/math";
import type { NeuronState, NeuronResult } from "./model";

const signClass = (v: number) => (v >= 0 ? "text-pos" : "text-neg");

/**
 * The neuron's computation written out three ways: symbolically, with the
 * current numbers substituted in, and reduced to the final output. Updates live
 * as the controls move.
 */
export function NeuronEquation({
  state,
  result,
}: {
  state: NeuronState;
  result: NeuronResult;
}) {
  return (
    <div className="space-y-2.5 overflow-x-auto border border-border bg-muted/30 p-4 font-mono text-sm">
      {/* symbolic */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted-foreground">
        <span className="text-foreground">z</span>
        <span>=</span>
        {state.inputs.map((input, i) => (
          <span key={input.label} className="whitespace-nowrap">
            {i > 0 && <span className="mr-1.5">+</span>}
            {input.weightLabel}·{input.label}
          </span>
        ))}
        <span>+</span>
        <span>b</span>
      </div>

      {/* substituted with live numbers */}
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="text-muted-foreground">=</span>
        {state.inputs.map((input, i) => (
          <span key={input.label} className="whitespace-nowrap">
            {i > 0 && <span className="mr-1.5 text-muted-foreground">+</span>}
            <span className={cn("tabular-nums", signClass(result.terms[i]))}>
              ({input.weight.toFixed(1)}·{input.value.toFixed(1)})
            </span>
          </span>
        ))}
        <span className="text-muted-foreground">+</span>
        <span className={cn("tabular-nums", signClass(state.bias))}>
          {state.bias.toFixed(1)}
        </span>
      </div>

      {/* reduced */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border/60 pt-2.5">
        <span className="text-muted-foreground">z =</span>
        <span className="tabular-nums font-medium text-foreground">
          {result.z.toFixed(2)}
        </span>
        <span className="ml-2 text-muted-foreground">
          y = {activationLabel[state.activation]}(z) =
        </span>
        <span className="border border-signal/40 bg-signal/10 px-1.5 py-0.5 tabular-nums font-medium text-foreground">
          {result.output.toFixed(3)}
        </span>
      </div>
    </div>
  );
}
