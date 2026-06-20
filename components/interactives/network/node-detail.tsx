import { cn } from "@/lib/utils";
import type { NodeBreakdown } from "./model";

const signClass = (v: number) => (v >= 0 ? "text-pos" : "text-neg");

const LAYER_NAME = ["input", "hidden", "output"];

/** Shows the incoming computation for the currently selected node. */
export function NodeDetail({
  layer,
  index,
  data,
}: {
  layer: number;
  index: number;
  data: NodeBreakdown;
}) {
  const nodeLabel = `${LAYER_NAME[layer]} node ${index + 1}`;

  if (data.isInput) {
    return (
      <div className="space-y-1.5 font-mono text-sm">
        <p className="font-sans text-xs text-muted-foreground">
          {nodeLabel} — you set this directly.
        </p>
        <p>
          value ={" "}
          <span className={cn("tabular-nums", signClass(data.output))}>
            {data.output.toFixed(2)}
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 overflow-x-auto font-mono text-sm">
      <p className="font-sans text-xs text-muted-foreground">
        {nodeLabel} — sums its weighted inputs, adds a bias, applies{" "}
        {data.activationLabel}.
      </p>
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span className="text-muted-foreground">z =</span>
        {data.terms.map((t, i) => (
          <span key={t.from} className="whitespace-nowrap">
            {i > 0 && <span className="mr-1.5 text-muted-foreground">+</span>}
            <span className={cn("tabular-nums", signClass(t.product))}>
              ({t.weight.toFixed(2)}·{t.sourceValue.toFixed(2)})
            </span>
          </span>
        ))}
        <span className="text-muted-foreground">+</span>
        <span className={cn("tabular-nums", signClass(data.bias))}>
          {data.bias.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 border-t border-border/60 pt-2">
        <span className="text-muted-foreground">z =</span>
        <span className="font-medium tabular-nums">
          {data.preActivation.toFixed(2)}
        </span>
        <span className="ml-2 text-muted-foreground">
          {data.activationLabel}(z) =
        </span>
        <span className="border border-signal/40 bg-signal/10 px-1.5 py-0.5 font-medium tabular-nums">
          {data.output.toFixed(3)}
        </span>
      </div>
    </div>
  );
}
