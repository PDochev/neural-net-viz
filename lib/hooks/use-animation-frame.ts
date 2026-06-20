"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `callback` on every animation frame while `active` is true.
 * `callback` receives (deltaSeconds, elapsedSeconds). Pauses automatically
 * for users who prefer reduced motion is the caller's responsibility — this
 * hook just drives the loop.
 */
export function useAnimationFrame(
  callback: (deltaSeconds: number, elapsedSeconds: number) => void,
  active = true,
): void {
  const cbRef = useRef(callback);
  // Keep the latest callback without re-subscribing the rAF loop.
  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let start: number | null = null;
    let prev: number | null = null;

    const tick = (now: number) => {
      if (start === null) start = now;
      if (prev === null) prev = now;
      const delta = (now - prev) / 1000;
      const elapsed = (now - start) / 1000;
      prev = now;
      cbRef.current(delta, elapsed);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}

/** True when the user has requested reduced motion. SSR-safe (defaults false). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
