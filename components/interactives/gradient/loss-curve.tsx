"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { scaleLinear } from "d3-scale";
import { line as d3line, curveNatural } from "d3-shape";
import { clamp } from "@/lib/math";
import { DOMAIN, gradient, loss, lossExtent, step } from "./model";

const PAD = { l: 38, r: 16, t: 16, b: 28 };
const EXTENT = lossExtent();
const Y_MIN = EXTENT.min - 0.3;
const Y_MAX = EXTENT.max + 0.3;

const css = (el: Element, name: string) =>
  getComputedStyle(el).getPropertyValue(name).trim() || "#888";

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

// pre-sampled domain values for the (smoothed) curve
const SAMPLES = Array.from(
  { length: 61 },
  (_, i) => DOMAIN.min + ((DOMAIN.max - DOMAIN.min) * i) / 60,
);

/**
 * Canvas plot of the loss landscape with a draggable ball at the current
 * parameter w, its tangent (the gradient), and a ghost showing where the next
 * gradient step would land. Axes are scaled/ticked with d3-scale and the curve
 * is drawn with a d3-shape natural spline.
 */
export function LossCurve({
  w,
  learningRate,
  onPick,
}: {
  w: number;
  learningRate: number;
  onPick: (w: number) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 600, h: 260 });
  const dragging = useRef(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const cr = entry.contentRect;
      setSize({ w: Math.round(cr.width), h: Math.round(cr.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sx = useMemo(
    () => scaleLinear().domain([DOMAIN.min, DOMAIN.max]).range([PAD.l, size.w - PAD.r]),
    [size.w],
  );
  const sy = useMemo(
    () => scaleLinear().domain([Y_MIN, Y_MAX]).range([size.h - PAD.b, PAD.t]),
    [size.h],
  );

  // Draw whenever geometry, position, or theme changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);

    const cFg = css(canvas, "--foreground");
    const cMuted = css(canvas, "--muted-foreground");
    const cBorder = css(canvas, "--border");
    const cSignal = css(canvas, "--signal");
    const cPos = css(canvas, "--pos");
    const cNeg = css(canvas, "--neg");

    ctx.font = "9px ui-monospace, monospace";

    // gridlines + tick labels
    ctx.strokeStyle = cBorder;
    ctx.fillStyle = cMuted;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.textAlign = "center";
    for (const t of sx.ticks(7)) {
      ctx.beginPath();
      ctx.moveTo(sx(t), PAD.t);
      ctx.lineTo(sx(t), size.h - PAD.b);
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillText(fmt(t), sx(t), size.h - PAD.b + 14);
      ctx.globalAlpha = 0.5;
    }
    ctx.textAlign = "right";
    for (const t of sy.ticks(5)) {
      ctx.beginPath();
      ctx.moveTo(PAD.l, sy(t));
      ctx.lineTo(size.w - PAD.r, sy(t));
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillText(fmt(t), PAD.l - 5, sy(t) + 3);
      ctx.globalAlpha = 0.5;
    }
    ctx.globalAlpha = 1;

    // loss curve (smoothed natural spline)
    ctx.strokeStyle = cFg;
    ctx.globalAlpha = 0.78;
    ctx.lineWidth = 2;
    ctx.beginPath();
    d3line<number>()
      .x((d) => sx(d))
      .y((d) => sy(loss(d)))
      .curve(curveNatural)
      .context(ctx)(SAMPLES);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // tangent line (the gradient) through the ball
    const g = gradient(w);
    const bx = sx(w);
    const by = sy(loss(w));
    const dw = 0.5;
    ctx.strokeStyle = g >= 0 ? cPos : cNeg;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx(w - dw), sy(loss(w) - g * dw));
    ctx.lineTo(sx(w + dw), sy(loss(w) + g * dw));
    ctx.stroke();

    // ghost: where the next step lands
    const w2 = clamp(step(w, learningRate), DOMAIN.min, DOMAIN.max);
    const gx = sx(w2);
    const gy = sy(loss(w2));
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = cMuted;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(gx, gy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = cMuted;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(gx, gy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // the ball
    ctx.fillStyle = cSignal;
    ctx.beginPath();
    ctx.arc(bx, by, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(canvas, "--background");
    ctx.lineWidth = 2;
    ctx.stroke();

    // axis names
    ctx.fillStyle = cMuted;
    ctx.textAlign = "center";
    ctx.fillText("w", size.w - PAD.r - 4, size.h - PAD.b + 14);
    ctx.textAlign = "start";
    ctx.fillText("loss", PAD.l - 32, PAD.t + 6);
  }, [size, w, learningRate, sx, sy, resolvedTheme]);

  const pick = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const wv = clamp(sx.invert(x), DOMAIN.min, DOMAIN.max);
      onPick(wv);
    },
    [onPick, sx],
  );

  return (
    <div ref={wrapRef} className="h-[260px] w-full touch-none">
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h }}
        className="cursor-ew-resize"
        aria-label="Loss landscape. Drag the ball to choose a starting point."
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          pick(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && pick(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
      />
    </div>
  );
}
