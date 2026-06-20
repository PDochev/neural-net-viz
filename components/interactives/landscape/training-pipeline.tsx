"use client";

import { useState } from "react";
import { Figure } from "@/components/figure";
import { cn } from "@/lib/utils";

type Stage = {
  id: string;
  label: string;
  tag: string;
  detail: React.ReactNode;
};

const STAGES: Stage[] = [
  {
    id: "pretrain",
    label: "Pre-training",
    tag: "predict the next token",
    detail:
      "The model is trained on an enormous slice of the internet, books, and code with the single objective from the last chapter: predict the next token. This is where almost all the knowledge and capability comes from — and it costs millions of dollars of compute. The result is a “base model”: fluent and knowledgeable, but not yet helpful or safe.",
  },
  {
    id: "sft",
    label: "Instruction tuning",
    tag: "learn to follow instructions",
    detail:
      "The base model is fine-tuned on curated example conversations — prompts paired with good responses. It learns the format of being a helpful assistant: answering questions, following instructions, refusing some requests. Far cheaper than pre-training, but it shapes behaviour dramatically.",
  },
  {
    id: "rlhf",
    label: "Preference tuning (RLHF)",
    tag: "align to human preference",
    detail:
      "Humans (and increasingly other models) rank candidate responses, and the model is optimised toward the preferred ones. This “reinforcement learning from human feedback” is what makes assistants feel polished, helpful, and reluctant to misbehave — though it also bakes in the preferences of whoever did the ranking.",
  },
  {
    id: "deploy",
    label: "Deployment",
    tag: "tools, retrieval, agents",
    detail:
      "In production the model is wrapped with extra machinery: retrieval to look things up, tools and code execution it can call, and agent loops that let it take multi-step actions. The core next-token engine doesn't change — it's given hands and reference material.",
  },
];

export function TrainingPipeline() {
  const [selected, setSelected] = useState("pretrain");
  const active = STAGES.find((s) => s.id === selected)!;

  return (
    <Figure
      title="From raw model to assistant"
      help="The model you've built is the pre-training stage. Turning it into a usable assistant takes several more steps. Click each one."
      caption="A chatbot is a pre-trained next-token model plus several rounds of fine-tuning and some deployment scaffolding. These stages evolve fast."
      graph={false}
    >
      <div className="space-y-5 p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STAGES.map((s, i) => {
            const sel = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(s.id)}
                aria-pressed={sel}
                className={cn(
                  "flex flex-col gap-1 border p-3 text-left transition-colors",
                  sel
                    ? "border-signal bg-signal/10"
                    : "border-border bg-card hover:border-signal/40",
                )}
              >
                <span className="font-mono text-[0.6rem] text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium leading-tight">
                  {s.label}
                </span>
                <span className="font-mono text-[0.65rem] text-muted-foreground">
                  {s.tag}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground text-pretty">
          <span className="mb-1 block font-mono text-[0.65rem] font-medium uppercase tracking-[0.16em] text-signal">
            {active.label}
          </span>
          {active.detail}
        </div>
      </div>
    </Figure>
  );
}
