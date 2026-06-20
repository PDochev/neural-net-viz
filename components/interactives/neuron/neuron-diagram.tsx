import { clamp, remap, signedColor, activationLabel } from "@/lib/math";
import type { NeuronState, NeuronResult } from "./model";

const W = 460;
const H = 240;

const INPUT_X = 56;
const SUM = { x: 220, y: 120, r: 28 };
const OUT = { x: 404, y: 120, r: 26 };
const ROWS = [54, 120, 186];

/** Stroke width encodes |weight|; colour encodes its sign. */
const edgeWidth = (w: number) => remap(clamp(Math.abs(w), 0, 2), 0, 2, 1, 7);

/**
 * Schematic of one neuron: inputs flow along weighted edges into a summation
 * node, then through the activation to the output. Edge colour/thickness shows
 * each weight's sign and magnitude; node fills encode their current values.
 */
export function NeuronDiagram({
  state,
  result,
}: {
  state: NeuronState;
  result: NeuronResult;
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Schematic of a single neuron: three weighted inputs are summed with a bias and passed through an activation function to produce one output."
    >
      {/* edges: input → sum */}
      {state.inputs.map((input, i) => (
        <g key={input.label}>
          <line
            x1={INPUT_X + 20}
            y1={ROWS[i]}
            x2={SUM.x - SUM.r}
            y2={SUM.y}
            stroke={signedColor(input.weight, 2)}
            strokeWidth={edgeWidth(input.weight)}
            strokeLinecap="round"
          />
          {/* weight label on the edge */}
          <text
            x={remap(0.42, 0, 1, INPUT_X + 20, SUM.x - SUM.r)}
            y={remap(0.42, 0, 1, ROWS[i], SUM.y) - 6}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[10px]"
          >
            {input.weightLabel}={input.weight.toFixed(1)}
          </text>
        </g>
      ))}

      {/* edge: sum → output (the activation) */}
      <line
        x1={SUM.x + SUM.r}
        y1={SUM.y}
        x2={OUT.x - OUT.r}
        y2={OUT.y}
        className="stroke-signal"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={(SUM.x + SUM.r + OUT.x - OUT.r) / 2}
        y={SUM.y - 12}
        textAnchor="middle"
        className="fill-foreground font-mono text-[10px]"
      >
        {activationLabel[state.activation]}
      </text>

      {/* input nodes */}
      {state.inputs.map((input, i) => (
        <g key={input.label}>
          <circle
            cx={INPUT_X}
            cy={ROWS[i]}
            r={20}
            fill={signedColor(input.value, 2)}
            className="stroke-border"
            strokeWidth={1}
          />
          <text
            x={INPUT_X}
            y={ROWS[i] - 1}
            textAnchor="middle"
            className="fill-foreground font-mono text-[11px] font-medium"
          >
            {input.label}
          </text>
          <text
            x={INPUT_X}
            y={ROWS[i] + 11}
            textAnchor="middle"
            className="fill-foreground/70 font-mono text-[9px]"
          >
            {input.value.toFixed(1)}
          </text>
        </g>
      ))}

      {/* summation node */}
      <circle
        cx={SUM.x}
        cy={SUM.y}
        r={SUM.r}
        fill={signedColor(result.z, 4)}
        className="stroke-border"
        strokeWidth={1.5}
      />
      <text
        x={SUM.x}
        y={SUM.y - 4}
        textAnchor="middle"
        className="fill-foreground font-mono text-base font-medium"
      >
        Σ
      </text>
      <text
        x={SUM.x}
        y={SUM.y + 12}
        textAnchor="middle"
        className="fill-foreground/70 font-mono text-[9px]"
      >
        z={result.z.toFixed(2)}
      </text>
      {/* bias label */}
      <text
        x={SUM.x}
        y={SUM.y + SUM.r + 16}
        textAnchor="middle"
        className="fill-muted-foreground font-mono text-[10px]"
      >
        bias b={state.bias.toFixed(1)}
      </text>

      {/* output node */}
      <circle
        cx={OUT.x}
        cy={OUT.y}
        r={OUT.r}
        fill={signedColor(result.output, 1)}
        className="stroke-signal"
        strokeWidth={1.5}
      />
      <text
        x={OUT.x}
        y={OUT.y - 3}
        textAnchor="middle"
        className="fill-foreground font-mono text-[11px] font-medium"
      >
        y
      </text>
      <text
        x={OUT.x}
        y={OUT.y + 12}
        textAnchor="middle"
        className="fill-foreground/80 font-mono text-[10px]"
      >
        {result.output.toFixed(2)}
      </text>
    </svg>
  );
}
