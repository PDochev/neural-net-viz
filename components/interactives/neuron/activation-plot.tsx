import { activations, clamp, remap, type Activation } from "@/lib/math";

type ActivationPlotProps = {
  activation: Activation;
  /** Pre-activation value (x position of the marker). */
  z: number;
  /** Output value f(z) (y position of the marker). */
  output: number;
};

const W = 440;
const H = 280;
const PAD = { t: 18, r: 18, b: 28, l: 38 };

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

/**
 * The activation curve f over an adaptive domain, with the neuron's current
 * (z, f(z)) operating point marked and dropped onto both axes.
 */
export function ActivationPlot({ activation, z, output }: ActivationPlotProps) {
  const f = activations[activation];
  const bound = Math.max(6, Math.ceil(Math.abs(z) + 1));
  const xMin = -bound;
  const xMax = bound;
  const [yMin, yMax] = yDomain(activation, bound);

  const sx = (x: number) => remap(x, xMin, xMax, PAD.l, W - PAD.r);
  const sy = (y: number) => remap(y, yMin, yMax, H - PAD.b, PAD.t);

  // Sample the curve, clamping y into the visible band.
  const N = 140;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    const y = clamp(f(x), yMin, yMax);
    pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`);
  }

  const mx = sx(z);
  const my = sy(clamp(output, yMin, yMax));
  const zeroY = yMin <= 0 && yMax >= 0 ? sy(0) : null;
  const zeroX = xMin <= 0 && xMax >= 0 ? sx(0) : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Plot of the ${activation} activation function. Current input ${z.toFixed(
        2,
      )} maps to output ${output.toFixed(2)}.`}
    >
      {/* axes */}
      {zeroY !== null && (
        <line
          x1={PAD.l}
          x2={W - PAD.r}
          y1={zeroY}
          y2={zeroY}
          className="stroke-border"
          strokeWidth={1}
        />
      )}
      {zeroX !== null && (
        <line
          x1={zeroX}
          x2={zeroX}
          y1={PAD.t}
          y2={H - PAD.b}
          className="stroke-border"
          strokeWidth={1}
        />
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
        y2={zeroY ?? H - PAD.b}
        className="stroke-signal/50"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <line
        x1={mx}
        x2={zeroX ?? PAD.l}
        y1={my}
        y2={my}
        className="stroke-signal/50"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {/* operating point */}
      <circle cx={mx} cy={my} r={5} className="fill-signal" />
      <circle
        cx={mx}
        cy={my}
        r={9}
        className="fill-signal/20"
      />

      {/* axis end labels */}
      <text
        x={W - PAD.r}
        y={(zeroY ?? H - PAD.b) - 6}
        textAnchor="end"
        className="fill-muted-foreground font-mono text-[10px]"
      >
        z
      </text>
      <text
        x={xMin < 0 ? sx(xMin) + 2 : PAD.l}
        y={PAD.t + 8}
        className="fill-muted-foreground font-mono text-[10px]"
      >
        f(z)
      </text>

      {/* domain ticks */}
      <text
        x={PAD.l}
        y={H - PAD.b + 16}
        textAnchor="middle"
        className="fill-muted-foreground/70 font-mono text-[9px]"
      >
        {xMin}
      </text>
      <text
        x={W - PAD.r}
        y={H - PAD.b + 16}
        textAnchor="middle"
        className="fill-muted-foreground/70 font-mono text-[9px]"
      >
        {xMax}
      </text>
      <text
        x={PAD.l - 6}
        y={sy(yMax) + 3}
        textAnchor="end"
        className="fill-muted-foreground/70 font-mono text-[9px]"
      >
        {yMax % 1 === 0 ? yMax : yMax.toFixed(1)}
      </text>
      <text
        x={PAD.l - 6}
        y={sy(yMin) + 3}
        textAnchor="end"
        className="fill-muted-foreground/70 font-mono text-[9px]"
      >
        {yMin % 1 === 0 ? yMin : yMin.toFixed(1)}
      </text>
    </svg>
  );
}
