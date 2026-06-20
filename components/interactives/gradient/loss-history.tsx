import { scaleLinear } from "d3-scale";
import { line as d3line, curveMonotoneX } from "d3-shape";

const W = 300;
const H = 120;
const PAD = { l: 8, r: 8, t: 10, b: 16 };

/** Live line chart of loss at each descent step. */
export function LossHistory({ history }: { history: number[] }) {
  const max = Math.max(1, ...history);
  const min = Math.min(...history, 0);
  const n = Math.max(history.length - 1, 1);

  const sx = scaleLinear().domain([0, n]).range([PAD.l, W - PAD.r]);
  const sy = scaleLinear().domain([min, max]).range([H - PAD.b, PAD.t]);

  const path =
    d3line<number>()
      .x((_, i) => sx(i))
      .y((l) => sy(l))
      .curve(curveMonotoneX)(history) ?? "";

  const last = history[history.length - 1];
  const diverging = history.length > 2 && last > history[0] * 1.05;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Loss vs. step
        </h4>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          step {history.length - 1} · loss{" "}
          <span className={diverging ? "text-pos" : "text-foreground"}>
            {last.toFixed(2)}
          </span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full border border-border bg-card"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Loss curve over ${history.length} steps, currently ${last.toFixed(
          2,
        )}.`}
      >
        {history.length > 1 && (
          <path
            d={path}
            fill="none"
            className={diverging ? "stroke-pos" : "stroke-signal"}
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        )}
        {history.length > 0 && (
          <circle
            cx={sx(history.length - 1)}
            cy={sy(last)}
            r={2.5}
            className={diverging ? "fill-pos" : "fill-signal"}
          />
        )}
      </svg>
    </div>
  );
}
