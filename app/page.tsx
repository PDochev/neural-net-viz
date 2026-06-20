import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Brand, BrandGlyph } from "@/components/nav/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { chapters } from "@/lib/chapters";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* atmospheric backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-graph opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-signal/10 blur-[120px]"
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Brand />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/neuron"
            className="hidden items-center gap-1.5 border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
          >
            Start reading <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 border border-border bg-card/60 px-3 py-1 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-signal" />
              From one neuron to a language model
            </p>
            <h1 className="text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              How AI{" "}
              <span className="relative whitespace-nowrap">
                actually
                <span
                  aria-hidden
                  className="absolute inset-x-0 -bottom-1 h-3 bg-signal/25"
                />
              </span>{" "}
              works.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              An interactive explainer that builds modern AI from the ground up —
              a single artificial neuron, all the way to a transformer-based
              language model. Every idea is something you can{" "}
              <span className="text-foreground">touch and change</span>, not just
              read.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/neuron"
                className="inline-flex items-center gap-2 border border-primary bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Begin with the neuron <ArrowRight className="size-4" />
              </Link>
              <span className="font-mono text-xs text-muted-foreground">
                9 chapters · ~30 min · no math degree required
              </span>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="mx-auto flex aspect-square max-w-sm items-center justify-center rounded-2xl border border-border bg-card/40 bg-graph-fine backdrop-blur">
              <BrandGlyph className="size-40 opacity-90" />
            </div>
          </div>
        </section>

        {/* Chapter index */}
        <section className="border-t border-border py-14">
          <h2 className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            The path
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chapters.map((chapter) => {
              const Icon = chapter.icon;
              return (
                <Link
                  key={chapter.slug}
                  href={`/${chapter.slug}`}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-signal/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(chapter.index).padStart(2, "0")}
                    </span>
                    <Icon className="size-4 text-muted-foreground transition-colors group-hover:text-signal" />
                  </div>
                  <h3 className="font-display text-lg font-medium leading-snug tracking-tight">
                    {chapter.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {chapter.blurb}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="border-t border-border py-8 text-sm text-muted-foreground">
          A hands-on tour of the machinery behind modern AI. All models shown are
          small in-browser simulations — captions flag where reality is
          simplified.
        </footer>
      </main>
    </div>
  );
}
