"use client";

import { useMemo, useState } from "react";
import { Dices, RotateCcw, Sparkles } from "lucide-react";
import { Figure } from "@/components/figure";
import { SliderControl } from "@/components/control-row";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { softmax } from "@/lib/math";
import { getCandidates, PROMPT } from "@/data/generation";

type Mode = "off" | "topk" | "topp";

type Ranked = { token: string; p: number; kept: boolean };

function rank(
  generated: string[],
  temperature: number,
  mode: Mode,
  k: number,
  p: number,
): Ranked[] {
  const cands = getCandidates(generated);
  const probs = softmax(
    cands.map((c) => c.logit),
    temperature,
  );
  const sorted = cands
    .map((c, i) => ({ token: c.token, p: probs[i] }))
    .sort((a, b) => b.p - a.p);

  let keptCount = sorted.length;
  if (mode === "topk") {
    keptCount = Math.min(k, sorted.length);
  } else if (mode === "topp") {
    let cum = 0;
    keptCount = 0;
    for (const s of sorted) {
      cum += s.p;
      keptCount++;
      if (cum >= p) break;
    }
  }
  return sorted.map((s, i) => ({ ...s, kept: i < keptCount }));
}

export function NextTokenPredictor() {
  const [generated, setGenerated] = useState<string[]>([]);
  const [temperature, setTemperature] = useState(0.8);
  const [mode, setMode] = useState<Mode>("off");
  const [k, setK] = useState(3);
  const [p, setP] = useState(0.9);
  const [lastPick, setLastPick] = useState<string | null>(null);

  const ranked = useMemo(
    () => rank(generated, temperature, mode, k, p),
    [generated, temperature, mode, k, p],
  );

  const sample = (greedy: boolean) => {
    const pool = ranked.filter((r) => r.kept);
    if (pool.length === 0) return;
    let chosen: string;
    if (greedy) {
      chosen = pool[0].token;
    } else {
      const total = pool.reduce((s, r) => s + r.p, 0);
      let t = Math.random() * total;
      chosen = pool[pool.length - 1].token;
      for (const r of pool) {
        t -= r.p;
        if (t <= 0) {
          chosen = r.token;
          break;
        }
      }
    }
    setLastPick(chosen);
    setGenerated((g) => (g.length >= 14 ? g : [...g, chosen]));
  };

  const reset = () => {
    setGenerated([]);
    setLastPick(null);
  };

  const maxP = ranked[0]?.p ?? 1;

  return (
    <Figure
      title="Next-token predictor"
      help="The model turns its context into a probability for every possible next token. Temperature reshapes that distribution; top-k / top-p trim its tail. Sample to pick one, append it, and predict again — that loop is text generation."
      caption="A scripted distribution, but the temperature and top-k / top-p maths are real. This sample-and-append loop is exactly how an LLM writes."
      graph={false}
    >
      <div className="space-y-5 p-4 sm:p-6">
        {/* running text */}
        <div className="border border-border bg-card p-3.5 font-mono text-sm leading-relaxed">
          <span className="text-muted-foreground">{PROMPT}</span>
          {generated.map((t, i) => (
            <span
              key={i}
              className={cn(
                i === generated.length - 1 &&
                  t === lastPick &&
                  "bg-signal/15 text-foreground",
              )}
            >
              {t}
            </span>
          ))}
          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-signal align-middle" />
        </div>

        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[1.3fr_1fr]">
          {/* distribution */}
          <div className="space-y-2">
            <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              P(next token)
            </h4>
            <div className="space-y-1.5">
              {ranked.map((r) => (
                <div
                  key={r.token}
                  className={cn(
                    "flex items-center gap-2 font-mono text-xs transition-opacity",
                    !r.kept && "opacity-35",
                  )}
                >
                  <span className="w-24 shrink-0 truncate text-right">
                    <span className="rounded bg-muted px-1 py-0.5">
                      {r.token === " " ? "␣" : r.token}
                    </span>
                  </span>
                  <div className="relative h-4 flex-1 bg-muted/60">
                    <div
                      className={cn(
                        "h-full",
                        r.kept ? "bg-signal" : "bg-muted-foreground",
                      )}
                      style={{ width: `${(r.p / maxP) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 shrink-0 tabular-nums text-muted-foreground">
                    {(r.p * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => sample(false)} className="gap-1.5">
                <Dices className="size-3.5" /> Sample
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => sample(true)}
                className="gap-1.5"
              >
                <Sparkles className="size-3.5" /> Greedy (argmax)
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={reset}
                disabled={generated.length === 0}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            </div>
          </div>

          {/* controls */}
          <div className="space-y-5">
            <SliderControl
              id="temp"
              label="temperature"
              value={temperature}
              onChange={setTemperature}
              min={0.1}
              max={2}
              step={0.05}
              format={(v) => v.toFixed(2)}
            />
            <p className="-mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
              {temperature <= 0.4
                ? "Low: the distribution is peaky — the model almost always takes the top token. Predictable, repetitive."
                : temperature >= 1.3
                  ? "High: the distribution flattens — unlikely tokens get a real chance. Creative, but prone to nonsense."
                  : "Moderate: a balance between sticking to likely tokens and taking risks."}
            </p>

            <div className="space-y-2">
              <span className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                truncation
              </span>
              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList variant="line">
                  <TabsTrigger value="off" className="px-2">
                    off
                  </TabsTrigger>
                  <TabsTrigger value="topk" className="px-2">
                    top-k
                  </TabsTrigger>
                  <TabsTrigger value="topp" className="px-2">
                    top-p
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {mode === "topk" && (
              <SliderControl
                id="k"
                label="k (keep top-k tokens)"
                value={k}
                onChange={(v) => setK(Math.round(v))}
                min={1}
                max={10}
                step={1}
                format={(v) => String(Math.round(v))}
              />
            )}
            {mode === "topp" && (
              <SliderControl
                id="p"
                label="p (nucleus mass)"
                value={p}
                onChange={setP}
                min={0.1}
                max={1}
                step={0.05}
                format={(v) => v.toFixed(2)}
              />
            )}
            {mode !== "off" && (
              <p className="-mt-2 text-xs leading-relaxed text-muted-foreground text-pretty">
                Greyed-out tokens are cut before sampling — the model will never
                pick them, no matter the temperature.
              </p>
            )}
          </div>
        </div>
      </div>
    </Figure>
  );
}
