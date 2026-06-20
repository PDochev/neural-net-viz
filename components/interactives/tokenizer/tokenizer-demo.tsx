"use client";

import { useMemo, useState } from "react";
import { Figure } from "@/components/figure";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { tokenize, TOKENIZER_EXAMPLES, type Token } from "./model";

// Neutral chip shades (+ one accent tint) cycled by token id so repeated
// tokens share a colour.
const SHADES = [
  "bg-muted",
  "bg-accent",
  "bg-secondary",
  "bg-signal/15",
  "bg-muted-foreground/15",
];

function TokenChip({ token, showId }: { token: Token; showId: boolean }) {
  const structural = token.kind === "space" || token.kind === "newline";
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center gap-0.5 border px-1.5 py-1 align-top",
        structural
          ? "border-dashed border-border bg-transparent text-muted-foreground"
          : cn("border-transparent", SHADES[token.id % SHADES.length]),
      )}
      title={`id ${token.id} · ${token.kind}`}
    >
      <span className="font-mono text-sm leading-none">
        {token.leadingSpace && (
          <span className="text-muted-foreground/50">·</span>
        )}
        {token.text}
      </span>
      {showId && (
        <span className="font-mono text-[0.6rem] leading-none text-muted-foreground tabular-nums">
          {token.id}
        </span>
      )}
    </span>
  );
}

export function TokenizerDemo() {
  const [text, setText] = useState(TOKENIZER_EXAMPLES[1]);
  const [showId, setShowId] = useState(true);
  const tokens = useMemo(() => tokenize(text), [text]);

  return (
    <Figure
      title="Tokenizer demo"
      help="Type anything. The text is chopped into tokens — the atomic units a model actually sees. Common words stay whole; long or rare words shatter into subword pieces; each token maps to a stable id."
      caption="Illustrative only: a real tokenizer (like GPT's byte-pair encoding) learns its vocabulary from data. The behaviour — whole common words, fragmented rare ones — is the real lesson."
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
          {TOKENIZER_EXAMPLES.map((ex, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => setText(ex)}
              className="h-7 max-w-[14rem] truncate px-2 text-xs font-normal"
            >
              {ex.length > 28 ? ex.slice(0, 28) + "…" : ex}
            </Button>
          ))}
        </div>

        <div className="flex min-h-24 flex-wrap content-start gap-1.5 border border-border bg-graph-fine p-3">
          {tokens.length === 0 ? (
            <span className="font-mono text-sm text-muted-foreground">
              (type something above)
            </span>
          ) : (
            tokens.map((t, i) => (
              <TokenChip key={i} token={t} showId={showId} />
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-sm">
          <span className="text-muted-foreground">
            tokens:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {tokens.length}
            </span>
          </span>
          <span className="text-muted-foreground">
            characters:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {text.length}
            </span>
          </span>
          <span className="text-muted-foreground">
            ratio:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {tokens.length === 0
                ? "—"
                : (text.length / tokens.length).toFixed(1)}{" "}
              chars/token
            </span>
          </span>
        </div>
      </div>
    </Figure>
  );
}
