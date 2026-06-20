"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type ControlRowProps = {
  label: ReactNode;
  /** Formatted current value shown on the right (usually monospace). */
  value?: ReactNode;
  /** Accent the value chip with the signed-value palette. */
  tone?: "neutral" | "pos" | "neg";
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

/**
 * A labelled control: name on the left, live value on the right, and the
 * control itself (slider, switch, tabs…) beneath. The repeated layout unit
 * for every interactive's control panel.
 */
export function ControlRow({
  label,
  value,
  tone = "neutral",
  htmlFor,
  className,
  children,
}: ControlRowProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-medium text-foreground/90"
        >
          {label}
        </Label>
        {value !== undefined ? (
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums",
              tone === "neutral" && "bg-muted text-muted-foreground",
              tone === "pos" && "bg-pos-soft text-foreground",
              tone === "neg" && "bg-neg-soft text-foreground",
            )}
          >
            {value}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

type SliderControlProps = {
  id?: string;
  label: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  /** How to format the value chip. */
  format?: (v: number) => string;
  /** Tone follows the value's sign when "signed". */
  tone?: "neutral" | "pos" | "neg" | "signed";
  className?: string;
};

/** Convenience: a ControlRow wrapping a single shadcn Slider. */
export function SliderControl({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 0.1,
  format = (v) => v.toFixed(2),
  tone = "neutral",
  className,
}: SliderControlProps) {
  const resolvedTone =
    tone === "signed" ? (value >= 0 ? "pos" : "neg") : tone;
  return (
    <ControlRow
      label={label}
      value={format(value)}
      tone={resolvedTone}
      htmlFor={id}
      className={className}
    >
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </ControlRow>
  );
}
