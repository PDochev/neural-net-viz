"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { Figure } from "@/components/figure";
import { SliderControl } from "@/components/control-row";
import { Button } from "@/components/ui/button";
import { useAnimationFrame } from "@/lib/hooks/use-animation-frame";
import { gradient, loss, step, INITIAL_LR, INITIAL_W, LR_RANGE } from "./model";
import { LossCurve } from "./loss-curve";
import { LossHistory } from "./loss-history";

const STEP_INTERVAL = 0.07; // seconds between descent steps when running
const MAX_STEPS = 300;

export function GradientSandbox() {
  const [w, setW] = useState(INITIAL_W);
  const [lr, setLr] = useState(INITIAL_LR);
  const [running, setRunning] = useState(false);
  const [history, setHistory] = useState<number[]>([loss(INITIAL_W)]);

  const wRef = useRef(w);
  const lrRef = useRef(lr);
  const acc = useRef(0);
  useEffect(() => {
    lrRef.current = lr;
  }, [lr]);

  const stepOnce = useCallback(() => {
    const nw = step(wRef.current, lrRef.current);
    wRef.current = nw;
    setW(nw);
    setHistory((h) => {
      const next = [...h, loss(nw)];
      if (next.length >= MAX_STEPS) setRunning(false);
      return next;
    });
    if (!Number.isFinite(nw) || Math.abs(nw) > 1e6) setRunning(false);
    else if (Math.abs(gradient(nw)) < 1e-3) setRunning(false);
  }, []);

  useAnimationFrame((dt) => {
    acc.current += dt;
    while (acc.current >= STEP_INTERVAL) {
      acc.current -= STEP_INTERVAL;
      stepOnce();
    }
  }, running);

  const pick = useCallback((v: number) => {
    setRunning(false);
    wRef.current = v;
    setW(v);
    setHistory([loss(v)]);
  }, []);

  const reset = () => pick(INITIAL_W);

  const g = gradient(w);
  const converged = Math.abs(g) < 1e-3;

  return (
    <Figure
      title="Gradient-descent sandbox"
      help="The curve is the loss — how wrong the model is — for one parameter w. Gradient descent repeatedly steps w downhill by the slope (the gradient) times the learning rate. Drag the ball to a new start, step by hand, or hit run. Crank the learning rate to make it overshoot and diverge."
      caption="Learning is this, scaled up to millions of parameters at once: measure the slope of the loss, take a small step downhill, repeat."
    >
      <div className="space-y-5 p-4 sm:p-6">
        <div className="border border-border bg-card p-2">
          <LossCurve w={w} learningRate={lr} onPick={pick} />
        </div>

        <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRunning((r) => !r)}
                className="gap-1.5"
              >
                {running ? (
                  <>
                    <Pause className="size-3.5" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" /> Run
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={stepOnce}
                disabled={running}
                className="gap-1.5"
              >
                <StepForward className="size-3.5" /> Step
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="size-3.5" /> Reset
              </Button>
            </div>

            <SliderControl
              id="lr"
              label="learning rate"
              value={lr}
              onChange={setLr}
              min={LR_RANGE.min}
              max={LR_RANGE.max}
              step={LR_RANGE.step}
              format={(v) => v.toFixed(2)}
            />

            <dl className="grid grid-cols-3 gap-2 font-mono text-sm">
              {[
                { k: "w", v: w.toFixed(3) },
                { k: "loss", v: loss(w).toFixed(3) },
                { k: "gradient", v: g.toFixed(3) },
              ].map((item) => (
                <div
                  key={item.k}
                  className="border border-border bg-muted/30 px-2.5 py-1.5"
                >
                  <dt className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                    {item.k}
                  </dt>
                  <dd className="tabular-nums">{item.v}</dd>
                </div>
              ))}
            </dl>

            <p className="text-xs leading-relaxed text-muted-foreground text-pretty">
              {converged
                ? "The gradient is ~0 — the ball has settled in a minimum. Notice it may be the left or right valley depending on where you started: that's a local minimum."
                : lr > 0.7
                  ? "At this learning rate the steps overshoot the valley. Hit run and watch the loss bounce — or explode."
                  : "Each step moves w against the gradient. The steeper the slope, the bigger the step."}
            </p>
          </div>

          <LossHistory history={history} />
        </div>
      </div>
    </Figure>
  );
}
