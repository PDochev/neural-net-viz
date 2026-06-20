"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Play, RotateCcw } from "lucide-react";
import { Figure } from "@/components/figure";
import { SliderControl } from "@/components/control-row";
import { Button } from "@/components/ui/button";
import { clamp, remap, signColor, signedColor } from "@/lib/math";
import {
  ARCH,
  INPUT_RANGE,
  MAX_WEIGHT,
  WEIGHTS,
  breakdown,
  forward,
  initialInputs,
  type NodeId,
} from "./model";
import { NodeDetail } from "./node-detail";

const W = 480;
const H = 300;
const COL_X = [70, 240, 410];
const TOP = 40;
const BOT = H - 40;

const nodePos = (layer: number, index: number, count: number) => ({
  x: COL_X[layer],
  y: TOP + ((index + 0.5) * (BOT - TOP)) / count,
});

/** Normalised magnitude of a node's value, for fading inactive edges. */
const signalMag = (layer: number, value: number) =>
  clamp(Math.abs(value) / (layer === 0 ? 2 : 1), 0, 1);

const PULSE_DUR = 0.5;

export function NetworkPlayground() {
  const [inputs, setInputs] = useState<number[]>(initialInputs);
  const [selected, setSelected] = useState<NodeId>({ layer: 1, index: 0 });
  const [runId, setRunId] = useState(0);
  const reduceMotion = useReducedMotion();

  const pass = useMemo(() => forward(inputs), [inputs]);
  const detail = useMemo(() => breakdown(pass, selected), [pass, selected]);

  const setInput = (i: number, v: number) =>
    setInputs((prev) => prev.map((x, j) => (j === i ? v : x)));

  const isSelected = (l: number, i: number) =>
    selected.layer === l && selected.index === i;

  const isDefault = inputs.every((v, i) => v === initialInputs[i]);

  return (
    <Figure
      title="Forward-pass visualizer"
      help="A fixed 3→4→2 network. Move the inputs and watch the signal propagate: edge colour is the weight's sign, thickness its strength, and a faded edge means little signal is flowing through it. Click any node to see exactly how its value is computed."
      caption="Each layer feeds the next: every node is a neuron from the previous chapter, and a network is just many of them composed left to right."
      toolbar={
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRunId((n) => n + 1)}
          className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
        >
          <Play className="size-3" /> Run pass
        </Button>
      }
    >
      <div className="grid gap-x-8 gap-y-6 p-4 sm:p-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="A 3-input, 4-hidden, 2-output neural network showing the current forward pass."
          >
            {/* column labels */}
            {["inputs", "hidden layer", "outputs"].map((label, l) => (
              <text
                key={label}
                x={COL_X[l]}
                y={20}
                textAnchor="middle"
                className="fill-muted-foreground font-mono text-[9px] uppercase tracking-[0.14em]"
              >
                {label}
              </text>
            ))}

            {/* edges */}
            {WEIGHTS.map((layerW, l) =>
              layerW.map((targetW, j) =>
                targetW.map((w, i) => {
                  const a = nodePos(l, i, ARCH[l]);
                  const b = nodePos(l + 1, j, ARCH[l + 1]);
                  const targetSel = isSelected(l + 1, j);
                  const dimmed = selected.layer === l + 1 && !targetSel;
                  const baseOpacity = remap(
                    signalMag(l, pass.activations[l][i]),
                    0,
                    1,
                    0.16,
                    0.92,
                  );
                  return (
                    <line
                      key={`${l}-${j}-${i}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke={signColor(w)}
                      strokeWidth={
                        remap(Math.abs(w), 0, MAX_WEIGHT, 0.75, 4.5) +
                        (targetSel ? 1 : 0)
                      }
                      strokeOpacity={
                        dimmed ? 0.08 : targetSel ? 1 : baseOpacity
                      }
                      strokeLinecap="round"
                    />
                  );
                }),
              ),
            )}

            {/* travelling signal pulses (one shot per run) */}
            {!reduceMotion && (
              <g key={runId}>
                {WEIGHTS.map((layerW, l) =>
                  layerW.map((targetW, j) =>
                    targetW.map((_, i) => {
                      const a = nodePos(l, i, ARCH[l]);
                      const b = nodePos(l + 1, j, ARCH[l + 1]);
                      const mag = signalMag(l, pass.activations[l][i]);
                      if (mag < 0.05) return null;
                      return (
                        <motion.circle
                          key={`p-${l}-${j}-${i}`}
                          r={2.6}
                          className="fill-signal"
                          initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                          animate={{
                            cx: [a.x, b.x],
                            cy: [a.y, b.y],
                            opacity: [0, 0.9 * mag, 0],
                          }}
                          transition={{
                            duration: PULSE_DUR,
                            delay: l * PULSE_DUR,
                            ease: "easeInOut",
                          }}
                        />
                      );
                    }),
                  ),
                )}
              </g>
            )}

            {/* nodes */}
            {ARCH.map((count, l) =>
              Array.from({ length: count }).map((_, i) => {
                const p = nodePos(l, i, count);
                const value = pass.activations[l][i];
                const sel = isSelected(l, i);
                const max = l === 0 ? 2 : 1;
                return (
                  <g
                    key={`n-${l}-${i}`}
                    className="cursor-pointer"
                    onClick={() => setSelected({ layer: l, index: i })}
                    role="button"
                    aria-label={`Layer ${l} node ${i + 1}, value ${value.toFixed(
                      2,
                    )}`}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={sel ? 19 : 17}
                      fill={signedColor(value, max)}
                      className={sel ? "stroke-signal" : "stroke-border"}
                      strokeWidth={sel ? 2.5 : 1}
                    />
                    <text
                      x={p.x}
                      y={p.y + 3.5}
                      textAnchor="middle"
                      className="pointer-events-none fill-foreground font-mono text-[10px] font-medium tabular-nums"
                    >
                      {value.toFixed(2)}
                    </text>
                  </g>
                );
              }),
            )}
          </svg>
        </div>

        {/* controls + detail */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Inputs
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setInputs(initialInputs)}
              disabled={isDefault}
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            >
              <RotateCcw className="size-3" /> Reset
            </Button>
          </div>

          <div className="space-y-4">
            {inputs.map((v, i) => (
              <SliderControl
                key={i}
                id={`net-x${i}`}
                label={
                  <>
                    input <span className="font-mono">x{i + 1}</span>
                  </>
                }
                value={v}
                onChange={(nv) => setInput(i, nv)}
                min={INPUT_RANGE.min}
                max={INPUT_RANGE.max}
                step={INPUT_RANGE.step}
                format={(n) => n.toFixed(1)}
                tone="signed"
              />
            ))}
          </div>

          <div className="border border-border bg-muted/90 p-3.5">
            <NodeDetail
              layer={selected.layer}
              index={selected.index}
              data={detail}
            />
          </div>
        </div>
      </div>
    </Figure>
  );
}
