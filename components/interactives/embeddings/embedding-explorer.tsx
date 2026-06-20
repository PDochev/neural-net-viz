"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { Figure } from "@/components/figure";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { clamp, cosineSimilarity, remap } from "@/lib/math";
import {
  CATEGORY_LABEL,
  embeddings,
  nearestWord,
  WORLD,
  wordMap,
  type WordCategory,
} from "@/data/embeddings";

const W = 560;
const H = 380;
const PAD = 40;

const CLUSTER_ANCHOR: Record<WordCategory, { x: number; y: number }> = {
  animal: { x: 4.4, y: 0.2 },
  person: { x: 6.6, y: 4.3 },
  country: { x: 5.7, y: 7.6 },
  food: { x: 0.5, y: 7.4 },
};

const px = (x: number) => remap(x, WORLD.min, WORLD.max, PAD, W - PAD);
const py = (y: number) => remap(y, WORLD.min, WORLD.max, H - PAD, PAD);

export function EmbeddingExplorer() {
  const [selected, setSelected] = useState<string[]>(["king", "queen"]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [ana, setAna] = useState({ a: "king", b: "man", c: "woman" });
  const [view, setView] = useState({ tx: 0, ty: 0, s: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const pan = useRef<{ x: number; y: number } | null>(null);

  const analogy = useMemo(() => {
    const A = wordMap.get(ana.a)!;
    const B = wordMap.get(ana.b)!;
    const C = wordMap.get(ana.c)!;
    const rx = A.x - B.x + C.x;
    const ry = A.y - B.y + C.y;
    return { rx, ry, result: nearestWord(rx, ry, [ana.a, ana.b, ana.c]) };
  }, [ana]);

  const cosine =
    selected.length === 2
      ? cosineSimilarity(
          [wordMap.get(selected[0])!.x, wordMap.get(selected[0])!.y],
          [wordMap.get(selected[1])!.x, wordMap.get(selected[1])!.y],
        )
      : null;

  const toggle = (word: string) =>
    setSelected((s) =>
      s.includes(word)
        ? s.filter((w) => w !== word)
        : s.length < 2
          ? [...s, word]
          : [s[1], word],
    );

  // zoom around a pixel point
  const zoomAround = useCallback((factor: number, cx: number, cy: number) => {
    setView((v) => {
      const s = clamp(v.s * factor, 0.6, 4);
      const k = s / v.s;
      return { s, tx: cx - k * (cx - v.tx), ty: cy - k * (cy - v.ty) };
    });
  }, []);

  // non-passive wheel zoom
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = ((e.clientX - rect.left) / rect.width) * W;
      const cy = ((e.clientY - rect.top) / rect.height) * H;
      zoomAround(e.deltaY < 0 ? 1.12 : 0.89, cx, cy);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAround]);

  const resetView = () => setView({ tx: 0, ty: 0, s: 1 });

  const transform = `translate(${view.tx} ${view.ty}) scale(${view.s})`;
  const aP = wordMap.get(ana.a)!;
  const bP = wordMap.get(ana.b)!;
  const cP = wordMap.get(ana.c)!;
  const anaWords = new Set([ana.a, ana.b, ana.c, analogy.result.word]);

  return (
    <Figure
      title="Embedding space explorer"
      help="Each word is a point. Words used in similar ways sit in similar directions from the origin. Click two words to measure their cosine similarity; drag to pan, scroll or use +/− to zoom."
      caption="A flattened, hand-placed 2-D stand-in for a real embedding space — enough to feel how meaning becomes geometry. Real embeddings use hundreds of dimensions."
      toolbar={
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom out"
            className="size-7"
            onClick={() => zoomAround(0.85, W / 2, H / 2)}
          >
            <Minus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Zoom in"
            className="size-7"
            onClick={() => zoomAround(1.18, W / 2, H / 2)}
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Reset view"
            className="size-7"
            onClick={resetView}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      }
    >
      <div className="grid gap-x-6 gap-y-5 p-4 sm:p-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden border border-border bg-card">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full cursor-grab touch-none select-none active:cursor-grabbing"
            role="img"
            aria-label="Scatter plot of words positioned by meaning."
            onPointerDown={(e) => {
              pan.current = { x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!pan.current) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const dx = ((e.clientX - pan.current.x) / rect.width) * W;
              const dy = ((e.clientY - pan.current.y) / rect.height) * H;
              pan.current = { x: e.clientX, y: e.clientY };
              setView((v) => ({ ...v, tx: v.tx + dx, ty: v.ty + dy }));
            }}
            onPointerUp={() => (pan.current = null)}
          >
            <defs>
              <marker
                id="emb-arrow"
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

            <g transform={transform}>
              {/* origin axes */}
              <line
                x1={px(0)}
                y1={py(0)}
                x2={px(WORLD.max)}
                y2={py(0)}
                className="stroke-border"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={px(0)}
                y1={py(0)}
                x2={px(0)}
                y2={py(WORLD.max)}
                className="stroke-border"
                vectorEffect="non-scaling-stroke"
              />

              {/* cluster labels */}
              {(Object.keys(CLUSTER_ANCHOR) as WordCategory[]).map((cat) => (
                <text
                  key={cat}
                  x={px(CLUSTER_ANCHOR[cat].x)}
                  y={py(CLUSTER_ANCHOR[cat].y)}
                  textAnchor="middle"
                  className="fill-muted-foreground/60 font-mono text-[9px] uppercase tracking-[0.14em]"
                >
                  {CATEGORY_LABEL[cat]}
                </text>
              ))}

              {/* cosine: lines from origin to the two selected words */}
              {selected.map((w) => {
                const p = wordMap.get(w)!;
                return (
                  <line
                    key={`o-${w}`}
                    x1={px(0)}
                    y1={py(0)}
                    x2={px(p.x)}
                    y2={py(p.y)}
                    className="stroke-signal/50"
                    strokeDasharray="3 3"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {selected.length === 2 && (
                <line
                  x1={px(wordMap.get(selected[0])!.x)}
                  y1={py(wordMap.get(selected[0])!.y)}
                  x2={px(wordMap.get(selected[1])!.x)}
                  y2={py(wordMap.get(selected[1])!.y)}
                  className="stroke-signal"
                  vectorEffect="non-scaling-stroke"
                />
              )}

              {/* analogy parallelogram: v = a − b, applied at c */}
              <line
                x1={px(bP.x)}
                y1={py(bP.y)}
                x2={px(aP.x)}
                y2={py(aP.y)}
                className="stroke-muted-foreground/60"
                strokeDasharray="4 3"
                markerEnd="url(#emb-arrow)"
                vectorEffect="non-scaling-stroke"
              />
              <motion.line
                key={`${ana.a}-${ana.b}-${ana.c}`}
                x1={px(cP.x)}
                y1={py(cP.y)}
                x2={px(analogy.rx)}
                y2={py(analogy.ry)}
                className="stroke-signal"
                markerEnd="url(#emb-arrow)"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />

              {/* points */}
              {embeddings.map((wv) => {
                const isSel = selected.includes(wv.word);
                const isHover = hovered === wv.word;
                const inAna = anaWords.has(wv.word);
                const r = isSel || isHover ? 4.5 : 3;
                const mag = Math.hypot(wv.x, wv.y);
                return (
                  <HoverCard key={wv.word} openDelay={100} closeDelay={80}>
                    <HoverCardTrigger asChild>
                      <g
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => toggle(wv.word)}
                        onMouseEnter={() => setHovered(wv.word)}
                        onMouseLeave={() => setHovered(null)}
                        className="cursor-pointer"
                      >
                        <circle
                          cx={px(wv.x)}
                          cy={py(wv.y)}
                          r={r}
                          className={
                            isSel
                              ? "fill-signal"
                              : inAna
                                ? "fill-foreground"
                                : "fill-muted-foreground"
                          }
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          x={px(wv.x) + 6}
                          y={py(wv.y) + 3}
                          className={
                            isSel || isHover || inAna
                              ? "fill-foreground text-[10px] font-medium"
                              : "fill-muted-foreground text-[9px]"
                          }
                          style={{ fontSize: 10 / Math.max(view.s, 1) + "px" }}
                        >
                          {wv.word}
                        </text>
                      </g>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="w-44 p-3">
                      <p className="mb-1.5 font-mono text-sm font-medium">
                        {wv.word}
                      </p>
                      <dl className="space-y-1 font-mono text-[0.7rem] text-muted-foreground">
                        <div className="flex justify-between">
                          <dt>category</dt>
                          <dd className="text-foreground">
                            {CATEGORY_LABEL[wv.category]}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>vector</dt>
                          <dd className="tabular-nums text-foreground">
                            ({wv.x.toFixed(1)}, {wv.y.toFixed(1)})
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt>magnitude</dt>
                          <dd className="tabular-nums text-foreground">
                            {mag.toFixed(2)}
                          </dd>
                        </div>
                      </dl>
                    </HoverCardContent>
                  </HoverCard>
                );
              })}
            </g>
          </svg>
        </div>

        {/* side panel */}
        <div className="space-y-6">
          {/* cosine */}
          <div className="space-y-2">
            <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Cosine similarity
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Click two words on the plot. Cosine similarity is the cosine of
              the angle between their vectors:{" "}
              <code className="font-mono">1</code> = same direction,{" "}
              <code className="font-mono">0</code> = unrelated.
            </p>
            <div className="flex items-center gap-2 font-mono text-sm">
              <span className="border border-border bg-muted/90 px-2 py-1">
                {selected[0] ?? "—"}
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="border border-border bg-muted/90 px-2 py-1">
                {selected[1] ?? "—"}
              </span>
              <span className="ml-auto">
                {cosine === null ? (
                  <span className="text-muted-foreground">pick 2</span>
                ) : (
                  <span className="border border-signal/40 bg-signal/10 px-2 py-1 font-medium tabular-nums">
                    {cosine.toFixed(3)}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* analogy */}
          <div className="space-y-2.5 border-t border-border pt-5">
            <h4 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Word analogy
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Vectors carry meaning you can do arithmetic with. Subtract{" "}
              <span className="font-mono">man</span>, add{" "}
              <span className="font-mono">woman</span>:
            </p>
            <div className="flex flex-wrap items-center gap-1.5 font-mono text-sm">
              <AnalogySelect
                aria-label="First analogy word"
                value={ana.a}
                onChange={(v) => setAna((s) => ({ ...s, a: v }))}
              />
              <span className="text-muted-foreground">−</span>
              <AnalogySelect
                aria-label="Word to subtract"
                value={ana.b}
                onChange={(v) => setAna((s) => ({ ...s, b: v }))}
              />
              <span className="text-muted-foreground">+</span>
              <AnalogySelect
                aria-label="Word to add"
                value={ana.c}
                onChange={(v) => setAna((s) => ({ ...s, c: v }))}
              />
              <span className="text-muted-foreground">≈</span>
              <span className="border border-signal/40 bg-signal/10 px-2 py-1 font-medium">
                {analogy.result.word}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              The blue arrow is that gender vector applied to{" "}
              <span className="font-mono">{ana.c}</span>; it lands nearest to{" "}
              <span className="font-mono text-foreground">
                {analogy.result.word}
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </Figure>
  );
}

const BY_CATEGORY = (["person", "animal", "country", "food"] as const).map(
  (cat) => ({
    cat,
    words: embeddings.filter((w) => w.category === cat).map((w) => w.word),
  }),
);

function AnalogySelect({
  value,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  "aria-label"?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="h-8 w-[8.5rem] font-mono text-sm bg-muted/90"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {BY_CATEGORY.map(({ cat, words }) => (
          <SelectGroup key={cat}>
            <SelectLabel className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[cat]}
            </SelectLabel>
            {words.map((w) => (
              <SelectItem key={w} value={w} className="font-mono">
                {w}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
