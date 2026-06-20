/**
 * A small, deterministic, subword-ish tokenizer for illustration only. It is
 * NOT GPT's real byte-pair encoding — but it captures the visible behaviours:
 * common words stay whole, long/rare words break into pieces, punctuation and
 * spaces become their own units, and every token has a stable integer id.
 */

export type TokenKind = "word" | "number" | "punct" | "space" | "newline";

export type Token = {
  text: string;
  /** Whether a single leading space was folded into this token (GPT-style). */
  leadingSpace: boolean;
  id: number;
  kind: TokenKind;
};

const VOCAB_SIZE = 50257; // a nod to GPT-2's vocabulary size

/** Stable string hash → token id in [0, VOCAB_SIZE). */
function tokenId(text: string, kind: TokenKind): number {
  let h = 2166136261;
  const key = (kind === "word" ? text.toLowerCase() : text) + ":" + kind;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % VOCAB_SIZE;
}

const COMMON = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "is", "are", "was",
  "it", "this", "that", "for", "on", "with", "as", "at", "by", "be", "you",
  "i", "we", "they", "he", "she", "not", "can", "will", "how", "what", "why",
]);

const SUFFIXES = ["tion", "ing", "ment", "ness", "able", "ed", "ly", "er", "es", "s"];

const chunk = (s: string, n: number): string[] => {
  if (s.length <= 5) return [s];
  const out: string[] = [];
  for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n));
  return out;
};

/** Break one word into subword pieces. */
function splitWord(word: string): string[] {
  if (word.length <= 5 || COMMON.has(word.toLowerCase())) return [word];
  for (const suf of SUFFIXES) {
    if (word.length > suf.length + 2 && word.toLowerCase().endsWith(suf)) {
      return [...chunk(word.slice(0, -suf.length), 4), word.slice(-suf.length)];
    }
  }
  return chunk(word, 4);
}

const RE = /(\s+)|([A-Za-z]+)|(\d+)|([^\sA-Za-z\d]+)/g;

/** Tokenize text into illustrative subword tokens. */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let pendingSpace = false;
  let m: RegExpExecArray | null;
  RE.lastIndex = 0;

  const push = (text: string, kind: TokenKind, leading: boolean) =>
    tokens.push({ text, kind, leadingSpace: leading, id: tokenId(text, kind) });

  while ((m = RE.exec(text)) !== null) {
    const [, ws, word, num, punct] = m;

    if (ws !== undefined) {
      if (ws === " ") {
        pendingSpace = true;
      } else {
        // newlines and runs of whitespace get their own tokens
        for (const ch of ws) {
          if (ch === "\n") push("\\n", "newline", false);
          else if (ch === " " && !pendingSpace) push("·", "space", false);
        }
        pendingSpace = ws.endsWith(" ");
      }
      continue;
    }

    if (word !== undefined) {
      const pieces = splitWord(word);
      pieces.forEach((p, i) => push(p, "word", i === 0 && pendingSpace));
      pendingSpace = false;
    } else if (num !== undefined) {
      // numbers split per-digit-ish into pieces of 3
      chunk(num, 3).forEach((p, i) =>
        push(p, "number", i === 0 && pendingSpace),
      );
      pendingSpace = false;
    } else if (punct !== undefined) {
      for (const ch of punct) push(ch, "punct", false);
      pendingSpace = false;
    }
  }

  return tokens;
}

export const TOKENIZER_EXAMPLES = [
  "The quick brown fox jumps over the lazy dog.",
  "Tokenization turns text into numbers a model can read.",
  "Antidisestablishmentarianism costs $1,000,000!",
  "def softmax(x): return exp(x) / sum(exp(x))",
];
