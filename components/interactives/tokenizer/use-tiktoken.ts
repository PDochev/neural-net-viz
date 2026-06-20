"use client";

import { useEffect, useState } from "react";
import { Tiktoken } from "js-tiktoken/lite";

/**
 * Loads the real GPT byte-pair tokenizer once and caches it as a module
 * singleton. The ~4MB ranks JSON is dynamically imported so it's code-split out
 * of first paint; the small `Tiktoken` lite class is the only static import.
 *
 * Uses o200k_base — the encoding GPT-4o / o-series models use. To target
 * GPT-4 / 3.5 instead, swap the import for "js-tiktoken/ranks/cl100k_base".
 *
 * js-tiktoken has no `.free()` (that's the WASM `tiktoken` package), so there
 * is nothing to clean up.
 */
let encoderPromise: Promise<Tiktoken> | null = null;

export function loadEncoder(): Promise<Tiktoken> {
  if (!encoderPromise) {
    encoderPromise = import("js-tiktoken/ranks/o200k_base").then(
      (ranks) => new Tiktoken(ranks.default),
    );
  }
  return encoderPromise;
}

/** Returns the tokenizer once it has loaded, or null while loading. */
export function useEncoder(): Tiktoken | null {
  const [enc, setEnc] = useState<Tiktoken | null>(null);
  useEffect(() => {
    let alive = true;
    loadEncoder().then((e) => {
      if (alive) setEnc(e);
    });
    return () => {
      alive = false;
    };
  }, []);
  return enc;
}
