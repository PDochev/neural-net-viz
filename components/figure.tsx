"use client";

import { HelpCircle } from "lucide-react";
import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type FigureProps = {
  /** Short heading shown in the figure's title bar. */
  title: string;
  /** One-line caption shown beneath the figure. */
  caption?: ReactNode;
  /** Optional "what am I looking at?" explainer surfaced via a tooltip. */
  help?: ReactNode;
  /** Right-aligned controls/legend for the title bar. */
  toolbar?: ReactNode;
  /** Draw the faint graph-paper texture behind the body. */
  graph?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

/**
 * The framed container every interactive lives inside. Gives each visualization
 * a consistent title bar, optional help tooltip, body surface, and caption —
 * the editorial "figure" unit of the explainer.
 */
export function Figure({
  title,
  caption,
  help,
  toolbar,
  graph = true,
  className,
  bodyClassName,
  children,
}: FigureProps) {
  const figId = useId();
  return (
    <figure
      className={cn(
        "group/figure my-8 overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
      aria-labelledby={`${figId}-title`}
    >
      <figcaption className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full bg-signal"
          />
          <h3
            id={`${figId}-title`}
            className="truncate font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground"
          >
            {title}
          </h3>
          {help ? (
            <Tooltip>
              <TooltipTrigger
                aria-label="What am I looking at?"
                className="rounded-full text-muted-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <HelpCircle className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-pretty">
                {help}
              </TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        {toolbar ? (
          <div className="flex shrink-0 items-center gap-2">{toolbar}</div>
        ) : null}
      </figcaption>

      <div className={cn("relative", graph && "bg-graph", bodyClassName)}>
        {children}
      </div>

      {caption ? (
        <figcaption className="border-t border-border/70 px-4 py-2.5 text-sm leading-relaxed text-muted-foreground text-pretty">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
