import type { ReactNode } from "react";
import { Brand } from "@/components/nav/brand";
import { ChapterNav } from "@/components/nav/chapter-nav";
import { MobileNav } from "@/components/nav/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { ReadingProgress } from "@/components/nav/reading-progress";

export default function LessonsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <ReadingProgress />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[19rem] flex-col border-r border-border bg-sidebar lg:flex">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <Brand />
          <ThemeToggle />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <ChapterNav />
        </div>
        <div className="border-t border-border px-5 py-3 font-mono text-[0.65rem] leading-relaxed text-muted-foreground">
          Every model here is a small, deterministic{" "}
          <span className="text-foreground/70">simulation</span> running in your
          browser — captions say where reality is simplified.
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/80 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center gap-1">
          <MobileNav />
          <Brand />
        </div>
        <ThemeToggle />
      </header>

      <main className="lg:pl-[19rem]">
        <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
