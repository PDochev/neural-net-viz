"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Figure } from "@/components/figure";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useEncoder } from "./use-tiktoken";
import { DEFAULT_TEXT, PRESETS, tokenize, type DisplayToken } from "./tokenize";

/** Debounce a rapidly-changing value (typing) by `ms`. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

// Fixed palette indexed by tokenId, so identical tokens share a colour and
// repeats are visually obvious. Solid pastel fill with a same-hue dark text
// colour, so chips stay opaque and readable in both light and dark themes.
const PALETTE_HUES = [20, 55, 95, 140, 175, 205, 245, 285, 320, 350];
const chipStyle = (id: number) => {
  const h = PALETTE_HUES[id % PALETTE_HUES.length];
  return {
    backgroundColor: `oklch(0.91 0.07 ${h})`,
    borderColor: `oklch(0.83 0.09 ${h})`,
    color: `oklch(0.32 0.07 ${h})`,
  };
};

/** Render decoded text with whitespace made visible. */
function TokenText({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((ch, i) => {
        if (ch === " ")
          return (
            <span key={i} className="opacity-30">
              ·
            </span>
          );
        if (ch === "\n")
          return (
            <span key={i} className="opacity-50">
              ↵
            </span>
          );
        if (ch === "\t")
          return (
            <span key={i} className="opacity-50">
              →
            </span>
          );
        return <span key={i}>{ch}</span>;
      })}
    </>
  );
}

function TokenChip({
  token,
  showId,
}: {
  token: DisplayToken;
  showId: boolean;
}) {
  const body = (
    <span
      className={cn(
        "inline-flex flex-col items-center gap-0.5 border px-1.5 py-1 align-top",
        token.partial && "border-dashed",
      )}
      style={chipStyle(token.id)}
    >
      <span className="font-mono text-sm leading-none">
        {token.partial ? (
          <span className="opacity-80">{token.hex}</span>
        ) : (
          <TokenText text={token.text} />
        )}
      </span>
      {showId && (
        <span className="font-mono text-[0.6rem] leading-none tabular-nums opacity-55">
          {token.id}
        </span>
      )}
    </span>
  );

  if (!token.partial) return body;

  // Byte-level fragment: explain why it's shown as hex rather than a glyph.
  return (
    <Tooltip>
      <TooltipTrigger asChild>{body}</TooltipTrigger>
      <TooltipContent className="max-w-xs text-pretty">
        Partial-character byte token. This token is one or more raw bytes of a
        multi-byte character (like an emoji or a CJK glyph) — the character is
        split across several tokens, so on its own it isn&apos;t valid text.
      </TooltipContent>
    </Tooltip>
  );
}

export function TokenizerDemo() {
  const enc = useEncoder();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [showId, setShowId] = useState(true);
  const debounced = useDebounced(text, 150);

  const tokens = useMemo(
    () => (enc ? tokenize(enc, debounced) : []),
    [enc, debounced],
  );

  const charCount = Array.from(text).length;

  return (
    <Figure
      title="Tokenizer · GPT-4o (o200k_base)"
      help="The real byte-pair tokenizer GPT-4o uses. Type anything: common words become whole tokens, rare ones fragment into subwords, and emoji or non-Latin characters break down to the raw bytes the model actually reads."
      caption="This is the actual BPE tokenizer (o200k_base) GPT-4o runs — not an illustration. Tokenization is not splitting on words: load the Emoji or 日本語 preset and watch single characters shatter into raw byte tokens."
      graph={false}
      toolbar={
        <div className="flex items-center gap-2">
          <Label
            htmlFor="show-ids"
            className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground"
          >
            ids
          </Label>
          <Switch id="show-ids" checked={showId} onCheckedChange={setShowId} />
        </div>
      }
    >
      <div className="space-y-4 p-4 sm:p-6">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          spellCheck={false}
          aria-label="Text to tokenize"
          className="resize-y bg-card font-mono text-sm leading-relaxed"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            try:
          </span>
          {PRESETS.map((ex) => (
            <Button
              key={ex.label}
              variant="outline"
              size="sm"
              onClick={() => setText(ex.text)}
              className="h-7 px-2 text-xs font-normal"
            >
              {ex.label}
            </Button>
          ))}
        </div>

        <div className="flex min-h-24 flex-wrap content-start gap-1.5 border border-border bg-graph-fine p-3">
          {!enc ? (
            <span className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> loading tokenizer…
            </span>
          ) : tokens.length === 0 ? (
            <span className="font-mono text-sm text-muted-foreground">
              (type something above)
            </span>
          ) : (
            tokens.map((t) => (
              <TokenChip key={t.key} token={t} showId={showId} />
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm">
          <span className="text-muted-foreground">
            tokens:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {enc ? tokens.length : "—"}
            </span>
          </span>
          <span className="text-muted-foreground">
            characters:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {charCount}
            </span>
          </span>
          <span className="text-muted-foreground">
            ratio:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {!enc || tokens.length === 0
                ? "—"
                : (charCount / tokens.length).toFixed(1)}{" "}
              chars/token
            </span>
          </span>
        </div>
      </div>
    </Figure>
  );
}
