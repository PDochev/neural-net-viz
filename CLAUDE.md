# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> The `@AGENTS.md` import above is binding: this is Next.js **16.2.9**, which has breaking changes versus older versions. Consult `node_modules/next/dist/docs/` before writing routing, data-fetching, or config code rather than relying on memory.

## Commands

- `npm run dev` — start the dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)

There is no test runner configured yet. Type-check with `npx tsc --noEmit`.

## Architecture

App Router project (`app/`) with React 19 Server Components by default (`components.json` has `rsc: true`). Stack: Next 16, Tailwind CSS **v4**, shadcn/ui, Radix.

- **Styling is Tailwind v4** — configured entirely in `app/globals.css` via `@import`/`@theme` (CSS variables, `baseColor: zinc`). There is no `tailwind.config.*` file; do not add one expecting v3 behavior.
- **shadcn/ui** is wired through `components.json` (style `radix-lyra`, icon library `lucide-react`). Add components with the shadcn CLI rather than hand-writing them so aliases and tokens stay consistent. UI primitives live in `components/ui/`.
- **Path aliases** (`tsconfig.json` + `components.json`): `@/*` → repo root; `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`.
- **`cn()` in `lib/utils.ts`** merges class names (`clsx` + `tailwind-merge`); use it for all conditional/combined class strings.
- **Fonts** are loaded via `next/font/google` in `app/layout.tsx` and exposed as CSS variables (`--font-sans`, `--font-geist-sans`, `--font-geist-mono`). Reference them through Tailwind font utilities, not raw `font-family`.

The app is still the create-next-app scaffold (`app/page.tsx` is the starter page); the intended feature is a neural-network visualization (per the repo name), which is not yet built.
