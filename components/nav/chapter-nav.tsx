"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { chapters } from "@/lib/chapters";

/**
 * The chapter list shared by the desktop sidebar and the mobile sheet.
 * Highlights the active route and numbers each chapter.
 */
export function ChapterNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Chapters"
      className={cn("flex flex-col gap-0.5", className)}
    >
      {chapters.map((chapter) => {
        const href = `/${chapter.slug}`;
        const active = pathname === href;
        const Icon = chapter.icon;
        return (
          <Link
            key={chapter.slug}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group/nav relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-signal"
              />
            ) : null}
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md border text-[0.65rem] font-mono tabular-nums transition-colors",
                active
                  ? "border-signal/40 bg-signal/10 text-signal"
                  : "border-border bg-muted/40 text-muted-foreground group-hover/nav:border-border",
              )}
            >
              {String(chapter.index).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium leading-tight">
                {chapter.nav}
              </span>
              <span className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground/80">
                <Icon className="size-3 shrink-0" />
                <span className="truncate">{chapter.interactive}</span>
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
