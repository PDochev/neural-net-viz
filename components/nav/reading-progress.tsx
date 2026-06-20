"use client";

import { motion, useScroll, useSpring } from "motion/react";

/**
 * Thin progress bar pinned to the top of the reading column that tracks how
 * far the reader has scrolled through the current chapter's scroll container.
 */
export function ReadingProgress({
  targetRef,
}: {
  targetRef?: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll(
    targetRef ? { container: targetRef } : undefined,
  );
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-signal"
    />
  );
}
