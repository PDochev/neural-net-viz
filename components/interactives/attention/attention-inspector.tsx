"use client";

import { useMemo, useState } from "react";
import { Figure } from "@/components/figure";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ATT_TOKENS,
  HEADS,
  attentionMatrix,
  queryLogits,
  weightedValue,
} from "@/data/attention";

const N = ATT_TOKENS.length;

export function AttentionInspector() {
  const [headId, setHeadId] = useState(HEADS[1].id);
  const [query, setQuery] = useState(4); // "it"
  const [showSteps, setShowSteps] = useState(false);

  const head = HEADS.find((h) => h.id === headId)!;
  const matrix = useMemo(() => attentionMatrix(head), [head]);
  const weights = matrix[query];
  const logits = useMemo(() => queryLogits(head, query), [head, query]);
  const output = useMemo(() => weightedValue(weights), [weights]);

  // token layout for the arc diagram
  const VW = 720;
  const VH = 150;
  const slot = VW / N;
  const tx = (i: number) => slot * (i + 0.5);
  const baseY = 118;

  return (
    <Figure
      title="Attention inspector"
      help="Pick a head (a tab) and a query token. The arcs and the highlighted heatmap row show how much that token attends to each earlier token. Different heads specialise in different relationships."
      caption="Attention lets every token gather information from the others. Each head learns its own pattern of who-looks-at-whom; a real model runs dozens in parallel."
      graph={false}
      toolbar={
        <Tabs value={headId} onValueChange={setHeadId}>
          <TabsList variant="line" aria-label="Attention head">
            {HEADS.map((h) => (
              <TabsTrigger key={h.id} value={h.id} className="px-2">
                {h.name.replace(/ head$/, "")}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
    >
      <div className="space-y-5 p-4 sm:p-6">
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          {head.blurb}
        </p>

        {/* arc diagram */}
        <div className="border border-border bg-graph-fine">
          <svg
            viewBox={`0 0 ${VW} ${VH}`}
            className="h-auto w-full"
            role="img"
            aria-label={`Attention from "${ATT_TOKENS[query]}" to earlier tokens.`}
          >
            {/* arcs from query to each attended key */}
            {weights.map((w, j) => {
              if (w < 0.04 || j > query) return null;
              const x1 = tx(query);
              const x2 = tx(j);
              const lift = 30 + Math.abs(query - j) * 12;
              const mid = (x1 + x2) / 2;
              return (
                <path
                  key={j}
                  d={`M ${x1} ${baseY - 14} Q ${mid} ${baseY - 14 - lift} ${x2} ${baseY - 14}`}
                  fill="none"
                  className="stroke-signal"
                  strokeWidth={0.5 + w * 5}
                  strokeOpacity={Math.max(0.12, w)}
                  strokeLinecap="round"
                />
              );
            })}

            {/* tokens */}
            {ATT_TOKENS.map((tok, i) => {
              const active = i === query;
              const attended = i <= query && weights[i] >= 0.04;
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onMouseEnter={() => setQuery(i)}
                  onClick={() => setQuery(i)}
                  role="button"
                  aria-label={`Use ${tok} as the query token`}
                >
                  <rect
                    x={tx(i) - slot / 2 + 4}
                    y={baseY}
                    width={slot - 8}
                    height={26}
                    className={cn(
                      active
                        ? "fill-signal/15 stroke-signal"
                        : attended
                          ? "fill-muted stroke-border"
                          : "fill-card stroke-border",
                    )}
                    strokeWidth={active ? 2 : 1}
                  />
                  <text
                    x={tx(i)}
                    y={baseY + 17}
                    textAnchor="middle"
                    className={cn(
                      "font-mono text-[12px]",
                      active
                        ? "fill-foreground font-medium"
                        : "fill-foreground/80",
                    )}
                  >
                    {tok}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            query:{" "}
            <span className="font-mono text-foreground">
              {ATT_TOKENS[query]}
            </span>{" "}
            <span className="text-muted-foreground/70">
              — hover any token to change it
            </span>
          </p>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="show-steps"
              className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground"
            >
              show Q·K → softmax → V
            </Label>
            <Switch
              id="show-steps"
              checked={showSteps}
              onCheckedChange={setShowSteps}
            />
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[auto_1fr]">
          {/* heatmap */}
          <Heatmap
            matrix={matrix}
            query={query}
            onPick={setQuery}
          />

          {/* steps / weights */}
          <div className="space-y-3">
            {showSteps ? (
              <StepView
                query={query}
                logits={logits}
                weights={weights}
                output={output}
              />
            ) : (
              <div className="space-y-2">
                <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Attention weights · {ATT_TOKENS[query]}
                </h4>
                {weights.map((w, j) =>
                  j <= query ? (
                    <WeightBar key={j} label={ATT_TOKENS[j]} value={w} />
                  ) : null,
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Figure>
  );
}

function Heatmap({
  matrix,
  query,
  onPick,
}: {
  matrix: number[][];
  query: number;
  onPick: (i: number) => void;
}) {
  const cell = 26;
  const pad = 52;
  const size = pad + N * cell + 6;
  return (
    <div>
      <h4 className="mb-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Weight matrix
      </h4>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="h-auto w-full max-w-[300px]"
        role="img"
        aria-label="Attention weight heatmap; rows are queries, columns are keys."
      >
        {/* column (key) labels */}
        {ATT_TOKENS.map((t, j) => (
          <text
            key={`c${j}`}
            x={pad + j * cell + cell / 2}
            y={pad - 6}
            textAnchor="start"
            transform={`rotate(-45 ${pad + j * cell + cell / 2} ${pad - 6})`}
            className="fill-muted-foreground font-mono text-[8px]"
          >
            {t}
          </text>
        ))}
        {/* rows */}
        {matrix.map((row, i) => (
          <g key={i} onClick={() => onPick(i)} className="cursor-pointer">
            <text
              x={pad - 6}
              y={pad + i * cell + cell / 2 + 3}
              textAnchor="end"
              className={cn(
                "font-mono text-[8px]",
                i === query
                  ? "fill-foreground font-medium"
                  : "fill-muted-foreground",
              )}
            >
              {ATT_TOKENS[i]}
            </text>
            {row.map((w, j) => (
              <rect
                key={j}
                x={pad + j * cell}
                y={pad + i * cell}
                width={cell - 2}
                height={cell - 2}
                fill="var(--signal)"
                fillOpacity={j <= i ? Math.max(0.04, w) : 0}
                className={cn(
                  "stroke-border",
                  i === query && "stroke-signal",
                )}
                strokeWidth={i === query ? 1.2 : 0.5}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

function WeightBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="w-16 shrink-0 truncate text-right text-muted-foreground">
        {label}
      </span>
      <div className="h-3.5 flex-1 bg-muted">
        <div
          className="h-full bg-signal"
          style={{ width: `${Math.max(1, value * 100)}%` }}
        />
      </div>
      <span className="w-10 shrink-0 tabular-nums text-foreground">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

function StepView({
  query,
  logits,
  weights,
  output,
}: {
  query: number;
  logits: number[];
  weights: number[];
  output: number[];
}) {
  const visible = logits.map((l, j) => ({ j, l, w: weights[j] })).filter(
    (r) => r.j <= query,
  );
  return (
    <div className="space-y-3 font-mono text-xs">
      <div>
        <p className="mb-1.5 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          1. scores = Q·K (how well query matches each key)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {visible.map(({ j, l }) => (
            <span
              key={j}
              className="border border-border bg-muted/40 px-1.5 py-0.5 tabular-nums"
            >
              {ATT_TOKENS[j]}: {l.toFixed(1)}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          2. softmax → weights (sum to 1)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {visible.map(({ j, w }) => (
            <span
              key={j}
              className="border border-signal/40 bg-signal/10 px-1.5 py-0.5 tabular-nums"
            >
              {ATT_TOKENS[j]}: {w.toFixed(2)}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          3. output = Σ weightⱼ · valueⱼ
        </p>
        <span className="border border-border bg-muted/40 px-2 py-1 tabular-nums">
          [{output.map((v) => v.toFixed(2)).join(", ")}]
        </span>
      </div>
    </div>
  );
}
