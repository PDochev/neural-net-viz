import type { LucideIcon } from "lucide-react";
import {
  Circle,
  Network,
  TrendingDown,
  Compass,
  Type,
  Eye,
  Boxes,
  MessageSquareText,
  Telescope,
} from "lucide-react";

export type Chapter = {
  /** Zero-padded order used in the nav. */
  index: number;
  slug: string;
  title: string;
  /** Short label for the sidebar. */
  nav: string;
  /** One-line description shown on cards and the landing page. */
  blurb: string;
  /** Name of the headline interactive in this chapter. */
  interactive: string;
  icon: LucideIcon;
};

export const chapters: Chapter[] = [
  {
    index: 1,
    slug: "neuron",
    title: "The Neuron",
    nav: "The Neuron",
    blurb: "What a single artificial neuron actually computes.",
    interactive: "Neuron playground",
    icon: Circle,
  },
  {
    index: 2,
    slug: "networks",
    title: "Networks & Layers",
    nav: "Networks & Layers",
    blurb: "Stacking neurons into layers and pushing a signal through.",
    interactive: "Forward-pass visualizer",
    icon: Network,
  },
  {
    index: 3,
    slug: "learning",
    title: "How Networks Learn",
    nav: "How Networks Learn",
    blurb: "Loss, gradients, backprop, and gradient descent.",
    interactive: "Gradient-descent sandbox",
    icon: TrendingDown,
  },
  {
    index: 4,
    slug: "embeddings",
    title: "Vectors & Embeddings",
    nav: "Vectors & Embeddings",
    blurb: "Turning meaning into numbers you can do arithmetic on.",
    interactive: "Embedding space explorer",
    icon: Compass,
  },
  {
    index: 5,
    slug: "tokenization",
    title: "Tokenization",
    nav: "Tokenization",
    blurb: "How raw text becomes the integers a model reads.",
    interactive: "Tokenizer demo",
    icon: Type,
  },
  {
    index: 6,
    slug: "attention",
    title: "Attention",
    nav: "Attention",
    blurb: "The core idea that lets tokens look at each other.",
    interactive: "Attention inspector",
    icon: Eye,
  },
  {
    index: 7,
    slug: "transformer",
    title: "The Transformer",
    nav: "The Transformer",
    blurb: "Assembling attention, embeddings, and feed-forward layers.",
    interactive: "Transformer block diagram",
    icon: Boxes,
  },
  {
    index: 8,
    slug: "llm",
    title: "An LLM End-to-End",
    nav: "An LLM End-to-End",
    blurb: "Text in → next-token probabilities → sampled text out.",
    interactive: "Next-token predictor",
    icon: MessageSquareText,
  },
  {
    index: 9,
    slug: "landscape",
    title: "Where We Are Now",
    nav: "Where We Are Now",
    blurb: "An honest tour of scaling, alignment, and limitations.",
    interactive: "Field map",
    icon: Telescope,
  },
];

export const chapterBySlug = (slug: string): Chapter | undefined =>
  chapters.find((c) => c.slug === slug);

/** Previous/next neighbours for in-chapter pager links. */
export function chapterNeighbours(slug: string): {
  prev?: Chapter;
  next?: Chapter;
} {
  const i = chapters.findIndex((c) => c.slug === slug);
  if (i === -1) return {};
  return {
    prev: i > 0 ? chapters[i - 1] : undefined,
    next: i < chapters.length - 1 ? chapters[i + 1] : undefined,
  };
}
