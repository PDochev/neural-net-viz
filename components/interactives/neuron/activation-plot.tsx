import { scaleLinear } from "d3-scale";
import { activations, clamp, type Activation } from "@/lib/math";

type ActivationPlotProps = {
  activation: Activation;
  /** Pre-activation value (x position of the marker). */
  z: number;
  /** Output value f(z) (y position of the marker). */
  output: number;
};

const W = 440;
const H = 280;
const PAD = { t: 18, r: 18, b: 30, l: 40 };

/** y-domain for each activation, given the current x-bound. */
function yDomain(activation: Activation, bound: number): [number, number] {
  switch (activation) {
    case "sigmoid":
      return [0, 1];
    case "tanh":
      return [-1, 1];
    case "relu":
      return [-0.1 * bound, bound];
    case "linear":
      return [-bound, bound];
  }
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/**
 * The activation curve f over an adaptive domain, with the neuron's current
 * (z, f(z)) operating point marked and dropped onto both axes. Axes are scaled
 * and ticked with d3-scale; the curve is sampled linearly so sharp activations
 * (ReLU's corner) stay faithful.
 */
export function ActivationPlot({ activation, z, output }: ActivationPlotProps) {
  const f = activations[activation];
  const bound = Math.max(6, Math.ceil(Math.abs(z) + 1));
  const xMin = -bound;
  const xMax = bound;
  const [yMin, yMax] = yDomain(activation, bound);

  const sx = scaleLinear().domain([xMin, xMax]).range([PAD.l, W - PAD.r]);
  const sy = scaleLinear().domain([yMin, yMax]).range([H - PAD.b, PAD.t]);

  const xTicks = sx.ticks(7);
  const yTicks = sy.ticks(5);

  // Sample the curve, clamping y into the visible band.
  const N = 160;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    const y = clamp(f(x), yMin, yMax);
    pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`);
  }

  const mx = sx(z);
  const my = sy(clamp(output, yMin, yMax));
  const zeroY = yMin <= 0 && yMax >= 0 ? sy(0) : H - PAD.b;
  const zeroX = xMin <= 0 && xMax >= 0 ? sx(0) : PAD.l;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Plot of the ${activation} activation function. Current input ${z.toFixed(
        2,
      )} maps to output ${output.toFixed(2)}.`}
    >
      {/* gridlines */}
      {xTicks.map((t) => (
        <line
          key={`gx${t}`}
          x1={sx(t)}
          x2={sx(t)}
          y1={PAD.t}
          y2={H - PAD.b}
          className="stroke-border/40"
          strokeWidth={1}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`gy${t}`}
          x1={PAD.l}
          x2={W - PAD.r}
          y1={sy(t)}
          y2={sy(t)}
          className="stroke-border/40"
          strokeWidth={1}
        />
      ))}

      {/* zero axes */}
      <line
        x1={PAD.l}
        x2={W - PAD.r}
        y1={zeroY}
        y2={zeroY}
        className="stroke-border"
        strokeWidth={1.25}
      />
      <line
        x1={zeroX}
        x2={zeroX}
        y1={PAD.t}
        y2={H - PAD.b}
        className="stroke-border"
        strokeWidth={1.25}
      />

      {/* tick labels */}
      {xTicks.map((t) =>
        t === 0 ? null : (
          <text
            key={`tx${t}`}
            x={sx(t)}
            y={H - PAD.b + 14}
            textAnchor="middle"
            className="fill-muted-foreground/80 font-mono text-[9px]"
          >
            {fmt(t)}
          </text>
        ),
      )}
      {yTicks.map((t) =>
        t === 0 ? null : (
          <text
            key={`ty${t}`}
            x={PAD.l - 6}
            y={sy(t) + 3}
            textAnchor="end"
            className="fill-muted-foreground/80 font-mono text-[9px]"
          >
            {fmt(t)}
          </text>
        ),
      )}

      {/* curve */}
      <path
        d={pts.join(" ")}
        fill="none"
        className="stroke-foreground/70"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* guide lines from the operating point to both axes */}
      <line
        x1={mx}
        x2={mx}
        y1={my}
        y2={zeroY}
        className="stroke-signal/50"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line
        x1={mx}
        x2={zeroX}
        y1={my}
        y2={my}
        className="stroke-signal/50"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* operating point */}
      <circle cx={mx} cy={my} r={9} className="fill-signal/20" />
      <circle cx={mx} cy={my} r={5} className="fill-signal" />

      {/* axis names */}
      <text
        x={W - PAD.r}
        y={zeroY - 6}
        textAnchor="end"
        className="fill-muted-foreground font-mono text-[10px]"
      >
        z
      </text>
      <text
        x={zeroX + 4}
        y={PAD.t + 8}
        className="fill-muted-foreground font-mono text-[10px]"
      >
        f(z)
      </text>
    </svg>
  );
}
