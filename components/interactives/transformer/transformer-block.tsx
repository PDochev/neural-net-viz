"use client";

import { useState } from "react";
import { Figure } from "@/components/figure";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type StageId =
  | "input"
  | "attention"
  | "addnorm1"
  | "ffn"
  | "addnorm2"
  | "output";

type Stage = {
  id: StageId;
  label: string;
  sub?: string;
  detail: React.ReactNode;
};

const STAGES: Stage[] = [
  {
    id: "input",
    label: "Token + positional embeddings",
    sub: "one vector per token",
    detail:
      "The block receives a vector for every token. Because attention itself is order-blind, a positional signal is added first so the model knows which token came where.",
  },
  {
    id: "attention",
    label: "Multi-head self-attention",
    sub: "tokens exchange information",
    detail:
      "The mechanism from the last chapter, run as several heads in parallel. This is the only place tokens look at each other — each position pulls in a weighted blend of the others.",
  },
  {
    id: "addnorm1",
    label: "Add & Normalize",
    sub: "residual + layer norm",
    detail:
      "The attention output is added back to its input (the residual connection), then normalized. The add means attention only has to learn a small adjustment, which keeps very deep stacks trainable.",
  },
  {
    id: "ffn",
    label: "Feed-forward network",
    sub: "per-token processing",
    detail:
      "A small two-layer network applied to each position independently — no mixing between tokens here. It expands each vector, applies an activation, and projects back, giving the block room to transform what attention gathered.",
  },
  {
    id: "addnorm2",
    label: "Add & Normalize",
    sub: "residual + layer norm",
    detail:
      "Another residual add and normalization, exactly like the first. Every sub-layer in a transformer is wrapped this way.",
  },
  {
    id: "output",
    label: "Output → next block",
    sub: "same shape as the input",
    detail:
      "The block outputs one vector per token, the same shape it received — so blocks stack. A real model chains dozens of identical blocks, each refining the representation further.",
  },
];

// geometry
const W = 300;
const BOX_H = 46;
const GAP = 26;
const BOX_X = 78;
const BOX_W = 168;
const yOf = (i: number) => 12 + i * (BOX_H + GAP);
const H = yOf(STAGES.length - 1) + BOX_H + 12;

const RESIDUALS = [
  { from: 0, to: 2 }, // input bypasses attention into add&norm 1
  { from: 2, to: 4 }, // after add&norm 1 bypasses ffn into add&norm 2
];

export function TransformerBlock() {
  const [selected, setSelected] = useState<StageId>("attention");

  const isAddNorm = (id: StageId) => id === "addnorm1" || id === "addnorm2";

  return (
    <Figure
      title="Transformer block"
      help="One transformer block, the unit that gets stacked dozens of times. Click any stage — in the diagram or the list — to see what it does. The curved arrows on the left are residual connections."
      caption="Attention + feed-forward, each wrapped in “add & normalize.” Stack many of these and you have the core of a modern language model."
      graph={false}
    >
      <div className="grid gap-x-8 gap-y-6 p-4 sm:p-6 lg:grid-cols-[300px_1fr]">
        {/* diagram */}
        <div className="mx-auto w-full max-w-[300px] border border-border bg-graph-fine">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Schematic of one transformer block."
          >
            {/* main flow arrows */}
            {STAGES.map((_, i) =>
              i < STAGES.length - 1 ? (
                <line
                  key={`f${i}`}
                  x1={BOX_X + BOX_W / 2}
                  y1={yOf(i) + BOX_H}
                  x2={BOX_X + BOX_W / 2}
                  y2={yOf(i + 1)}
                  className="stroke-muted-foreground"
                  strokeWidth={1.5}
                  markerEnd="url(#tb-arrow)"
                />
              ) : null,
            )}

            {/* residual connections */}
            {RESIDUALS.map((r, k) => {
              const y1 = yOf(r.from) + BOX_H / 2;
              const y2 = yOf(r.to) + BOX_H / 2;
              const xOut = BOX_X - 6;
              const xL = 30;
              const active =
                selected === STAGES[r.to].id || selected === STAGES[r.from].id;
              return (
                <path
                  key={k}
                  d={`M ${xOut} ${y1} L ${xL} ${y1} L ${xL} ${y2} L ${xOut} ${y2}`}
                  fill="none"
                  className={active ? "stroke-signal" : "stroke-border"}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  markerEnd="url(#tb-arrow-accent)"
                />
              );
            })}
            <text
              x={20}
              y={H / 2}
              textAnchor="middle"
              transform={`rotate(-90 20 ${H / 2})`}
              className="fill-muted-foreground font-mono text-[8px] uppercase tracking-[0.14em]"
            >
              residual
            </text>

            {/* boxes */}
            {STAGES.map((s, i) => {
              const sel = selected === s.id;
              return (
                <g
                  key={s.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(s.id)}
                  role="button"
                  aria-label={s.label}
                >
                  <rect
                    x={BOX_X}
                    y={yOf(i)}
                    width={BOX_W}
                    height={BOX_H}
                    className={cn(
                      sel
                        ? "fill-signal/15 stroke-signal"
                        : isAddNorm(s.id)
                          ? "fill-muted stroke-border"
                          : "fill-card stroke-border",
                    )}
                    strokeWidth={sel ? 2 : 1}
                  />
                  <text
                    x={BOX_X + BOX_W / 2}
                    y={yOf(i) + (s.sub ? BOX_H / 2 - 3 : BOX_H / 2 + 3)}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-medium"
                  >
                    {s.label.length > 26 ? s.label.slice(0, 24) + "…" : s.label}
                  </text>
                  {s.sub && (
                    <text
                      x={BOX_X + BOX_W / 2}
                      y={yOf(i) + BOX_H / 2 + 11}
                      textAnchor="middle"
                      className="fill-muted-foreground font-mono text-[8px]"
                    >
                      {s.sub}
                    </text>
                  )}
                </g>
              );
            })}

            <defs>
              <marker
                id="tb-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" className="fill-muted-foreground" />
              </marker>
              <marker
                id="tb-arrow-accent"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" className="fill-signal" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* explanations */}
        <Accordion
          type="single"
          collapsible
          value={selected}
          onValueChange={(v) => v && setSelected(v as StageId)}
          className="gap-0"
        >
          {STAGES.map((s) => (
            <AccordionItem
              key={s.id}
              value={s.id}
              className="border-b border-border"
            >
              <AccordionTrigger className="py-3 text-left text-sm hover:no-underline">
                <span className="flex items-baseline gap-2">
                  <span className="font-medium">{s.label}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground text-pretty">
                {s.detail}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Figure>
  );
}
