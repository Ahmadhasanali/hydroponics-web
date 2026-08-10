# Framer Theme Refactor — Design

**Date:** 2026-08-10
**Status:** Approved
**Style:** Framer (needmcp, locked) — black/white void + electric blue `#0099ff`

## Goal

Move the hydroponics web app from its current warm yellow/lime palette to the
Framer design language, and activate the dark/light theme system that already
exists in the CSS but is never wired up. The app currently has full
light (`:root`) and dark (`.dark`) token blocks in `src/index.css` but no
provider, no toggle, and no code path ever adds `.dark` to `<html>` — the only
dark surface is the scoped `.auth-shell` auth screen.

## Current State

- `src/index.css`: `@theme inline` maps `--color-*` → CSS vars. `:root` holds
  light tokens (#f8f6f2 bg, #ffce54 primary). `.dark` holds dark tokens
  (#0d0e10 bg). `.auth-shell` is a scoped dark-glass override.
- UI primitives (`src/components/ui/*`): correctly token-driven (`bg-card`,
  `border-input`, `bg-primary`, etc.).
- Layout + feature components: hardcode the palette literally — `#ffce54`,
  `#d4a020`, `#cbe273`, `#a3c44a`, `#4fc3f7`, `slate-*` repeated across
  Navigation, Dashboard, TankCard, FarmCard, HumanStatusCard, lists, etc.
- No theme toggle or provider exists anywhere.
- In-progress uncommitted work (localization to Bahasa Indonesia + RecordSheet
  bottom-nav feature) must be preserved; this refactor changes colors only.

## Design

### 1. Theme System

New `src/hooks/useTheme.tsx` (React context, no new dependency — `next-themes`
is Next-only, this is Vite):

- Reads `localStorage.theme` (`light` | `dark` | `system`), default `system`.
- Resolves via `prefers-color-scheme` and toggles `.dark` on `documentElement`.
- Listens to OS `change` events while in `system` mode.
- Exposes `{ theme, setTheme, resolvedTheme }`.
- Add a `ThemeToggle` (sun/moon, `lucide-react`) in the desktop header and the
  mobile header of `src/routes/_authenticated.tsx`.
- Wrap `<QueryClientProvider>` in `src/main.tsx` with `<ThemeProvider>`.

### 2. Design Tokens (`src/index.css`)

Map Framer tokens onto the existing shadcn variables. Values:

**Dark** (`:root` + `.dark`):
| Var | Value |
|-----|-------|
| `--background` | `#000000` |
| `--card` / `--popover` | `#090909` |
| `--foreground` | `#ffffff` |
| `--primary` / `--primary-foreground` | `#ffffff` / `#000000` |
| `--secondary` / `--secondary-foreground` | `#0099ff` / `#ffffff` |
| `--muted` / `--muted-foreground` | `rgba(255,255,255,0.04)` / `rgba(255,255,255,0.6)` |
| `--accent` / `--accent-foreground` | `rgba(255,255,255,0.04)` / `#ffffff` |
| `--destructive` / `--destructive-foreground` | `#ef4444` / `#ffffff` |
| `--border` / `--input` | `rgba(255,255,255,0.08)` |
| `--ring` | `#0099ff` |
| `--radius` | `8px` base (Framer) |
| `--sidebar*` | mirror background/card/border |
| `--chart-1..5` | Framer success `#10b981`, warning `#f59e0b`, info `#0ea5e9`, secondary `#0099ff`, muted |

**Light** (`:root`, no `.dark`):
| Var | Value |
|-----|-------|
| `--background` | `#f5f5f5` |
| `--card` / `--popover` | `#ffffff` |
| `--foreground` | `#1a1a1a` |
| `--primary` / `--primary-foreground` | `#000000` / `#ffffff` |
| `--secondary` / `--secondary-foreground` | `#0099ff` / `#ffffff` |
| `--muted` / `--muted-foreground` | `rgba(0,0,0,0.03)` / `#999999` |
| `--accent` / `--accent-foreground` | `rgba(0,0,0,0.03)` / `#1a1a1a` |
| `--destructive` / `--destructive-foreground` | `#ef4444` / `#ffffff` |
| `--border` / `--input` | `rgba(0,0,0,0.1)` |
| `--ring` | `#0099ff` |
| `--radius` | `8px` base |
| `--chart-1..5` | same semantic mapping |

`.auth-shell`: restyle to Framer dark glass (black gradient + `#0099ff` ring),
keeping the auth-screens-dark identity.

### 3. De-hardcode Pass (~27 files)

Replace every hardcoded hex with semantic tokens. Only color/value changes — no
logic, routing, or form changes.

- **`src/components/layouts/Navigation.tsx`**: brand block (`#ffce54` →
  `bg-secondary`/blue), active nav link → `bg-secondary/15 text-secondary`,
  hover hues → token-based. BottomNav FAB ring → tokens.
- **Status helpers** (`TankCard.statusBadge`, `TankStatusCard`, FarmCard,
  Dashboard): optimal → `success` (`#10b981`), perhatian/out-of-target →
  `warning` (`#f59e0b`), inactive → `muted`. Use `chart-*` / `bg-*/[alpha]`
  token patterns.
- **Dashboard StatCards**: replace per-stat tint hexes (`#ffce54/20`,
  `#cbe273/25`, `#4fc3f7/20`) with chart-token variants.
- **Lists/forms**: any shared per-feature hex literals → tokens where
  reachable; otherwise the primary/secondary helpers cover them.

### 4. Verification

- `npm run build` (tsc -b && vite build) must pass.
- `npm run lint` (oxlint) must pass.

## Scope Guard

Pure styling/theme refactor. No changes to API calls, React Query logic,
routing, forms, or the localization strings added in the current uncommitted
work. Framer's reduced-radius minimalisme applies, but page structure/layout
classes (padding, grids, responsiveness) stay as-is unless a color token maps to
them.