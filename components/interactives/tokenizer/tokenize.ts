import type { Tiktoken } from "js-tiktoken/lite";

export type DisplayToken = {
  /** stable react key (position in the sequence) */
  key: number;
  id: number;
  /** decoded text — may include leading/trailing spaces, \n, \t */
  text: string;
  /** true when this token is a raw byte fragment of a multi-byte character */
  partial: boolean;
  /** hex rendering of the raw bytes, e.g. "\\xE2\\x9C", used when partial */
  hex: string;
};

const REPLACEMENT = "�";

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => "\\x" + b.toString(16).padStart(2, "0").toUpperCase())
    .join("");

/**
 * Encode `text` with the real BPE tokenizer and resolve each token to something
 * renderable. Special-token strings are treated as ordinary text (allowed +
 * disallowed both empty) so user input can never throw. Byte-level fragments of
 * multi-byte characters (emoji, non-Latin scripts) decode to U+FFFD, so we fall
 * back to their raw bytes as hex instead of showing a broken "�".
 */
export function tokenize(enc: Tiktoken, text: string): DisplayToken[] {
  if (!text) return [];

  const ids = enc.encode(text, [], []);
  // id → raw bytes (Uint8Array). `textMap` is an internal field of the lite
  // Tiktoken instance; it is the only reliable way to recover a token's bytes.
  const byteMap = (enc as unknown as { textMap: Map<number, Uint8Array> })
    .textMap;

  return ids.map((id, key) => {
    const decoded = enc.decode([id]);
    const partial = decoded.includes(REPLACEMENT);
    const bytes = partial ? byteMap.get(id) : undefined;
    return {
      key,
      id,
      text: decoded,
      partial,
      hex: bytes ? toHex(bytes) : "",
    };
  });
}

export const DEFAULT_TEXT =
  "Tokenization isn't the same as splitting on spaces — GPT-4o sees subwords.";

export const PRESETS: { label: string; text: string }[] = [
  {
    label: "Code",
    text: "const sum = (a, b) => a + b; // adds two numbers",
  },
  {
    label: "Emoji",
    text: "I ❤️ tokenizers 🤖🚀 — even emoji! 👩‍💻",
  },
  {
    label: "日本語 + Кириллица",
    text: "こんにちは世界! Привет, мир! 안녕하세요 👋",
  },
  {
    label: "Long word",
    text: "Donaudampfschifffahrtsgesellschaftskapitän",
  },
];
