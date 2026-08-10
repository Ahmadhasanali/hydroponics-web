# Framer Theme Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the hydroponics web app from its yellow/lime palette to the Framer design language (black void + electric blue `#0099ff`) and activate a working light/dark theme system with a persisted toggle.

**Architecture:** Re-value the existing CSS-variable token blocks in `src/index.css` to Framer's light/dark tokens, add a tiny `ThemeProvider` React context (localStorage + `prefers-color-scheme` + `.dark` class on `<html>`), and sweep every hardcoded feature/layout hex literal (`#ffce54`, `#d4a020`, `#cbe273`, `#4fc3f7`, `slate-*`) into semantic tokens.

**Tech Stack:** React 19, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui v4 + Base UI, TanStack Router/Query, lucide-react, CVA, `tw-animate-css`.

## Global Constraints

- Style locked: **framer** (needmcp). Accent = electric blue `#0099ff` (`secondary`).
- Both light (`:root`) and dark (`.dark`) modes must work; default = `system` with persisted override.
- No new npm dependencies. `next-themes` is NOT allowed (Vite, not Next).
- Preserve all existing in-progress work: Bahasa Indonesia localization strings and the `RecordSheet` bottom-nav feature. This refactor changes **colors only**, never logic, routing, API calls, forms, or copy.
- Layout classes (grid, padding, responsive breakpoints) stay as-is. Radius changes are limited to the base tokens and the Card primitive.
- Verification per task: `npm run lint` (must pass) and `npm run build` (tsc -b && vite build, must pass). There is no unit-test framework in this repo.
- De-hardcode mapping reference (use everywhere):
  | Old literal | New token |
  |---|---|
  | `#ffce54` (brand/accent) | `secondary` (blue) |
  | `#d4a020`, `#a07a10`, `#8a6d00` (yellow text) | `warning` / `secondary` for links |
  | `#cbe273`, `#a3c44a` (lime) | `success` (emerald) |
  | `#4fc3f7`, `#1c6f96` (cyan) | `info` |
  | `slate-900/700` text | `foreground` |
  | `slate-500/400/300` text | `muted-foreground` |
  | `bg-slate-50/100`, `bg-white`, `bg-slate-300` | `muted` / `card` / `muted-foreground/40` |
  | `slate-200` borders, `white/90` chrome | `border`, `background` |
  | `#1a1c1e` (ink on brand) | `secondary-foreground` |

---

### Task 1: Framer design tokens in `src/index.css` + flash-free theme bootstrap in `index.html`

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`

**Interfaces:**
- Produces: CSS variables `--success`, `--warning`, `--info` (+ foregrounds) usable as `bg-success/20`, `text-warning`, `bg-info/15`, `bg-primary/90`, `text-secondary`, `bg-secondary/15` etc. in Tailwind v4 (registered in `@theme inline`). An inline bootstrap script in `<head>` that adds `.dark` to `<html>` before paint.

- [ ] **Step 1: Add success/warning/info token mappings to `@theme inline`**

In `src/index.css`, inside the existing `@theme inline { ... }` block (after the `--color-background` line), add:

```css
--color-success: var(--success);
--color-success-foreground: var(--success-foreground);
--color-warning: var(--warning);
--color-warning-foreground: var(--warning-foreground);
--color-info: var(--info);
--color-info-foreground: var(--info-foreground);
```

- [ ] **Step 2: Set Framer radius scale in `@theme inline`**

Replace the `--radius-*` lines so they match Framer (base `--radius: 8px` defined in both palettes below):

```css
--radius-sm: 5px;
--radius-md: 8px;
--radius-lg: 8px;
--radius-xl: 15px;
--radius-2xl: 20px;
--radius-3xl: 24px;
--radius-4xl: 30px;
```

- [ ] **Step 3: Replace the light (`:root`) token values with Framer light**

Replace the entire `:root { ... }` block values (keep the variable names the same):

```css
:root {
    --background: #f5f5f5;
    --foreground: #1a1a1a;
    --card: #ffffff;
    --card-foreground: #1a1a1a;
    --popover: #ffffff;
    --popover-foreground: #1a1a1a;
    --primary: #000000;
    --primary-foreground: #ffffff;
    --secondary: #0099ff;
    --secondary-foreground: #ffffff;
    --muted: rgba(0, 0, 0, 0.03);
    --muted-foreground: #999999;
    --accent: rgba(0, 0, 0, 0.03);
    --accent-foreground: #1a1a1a;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --border: rgba(0, 0, 0, 0.1);
    --input: rgba(0, 0, 0, 0.1);
    --ring: #0099ff;
    --success: #10b981;
    --success-foreground: #ffffff;
    --warning: #f59e0b;
    --warning-foreground: #ffffff;
    --info: #0ea5e9;
    --info-foreground: #ffffff;
    --chart-1: #10b981;
    --chart-2: #f59e0b;
    --chart-3: #0ea5e9;
    --chart-4: #0099ff;
    --chart-5: #a6a6a6;
    --radius: 8px;
    --sidebar: #f5f5f5;
    --sidebar-foreground: #1a1a1a;
    --sidebar-primary: #0099ff;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #0099ff;
    --sidebar-accent-foreground: #ffffff;
    --sidebar-border: rgba(0, 0, 0, 0.08);
    --sidebar-ring: #0099ff;
}
```

- [ ] **Step 4: Replace the `.dark` token values with Framer dark**

Replace the entire `.dark { ... }` block values:

```css
.dark {
    --background: #000000;
    --foreground: #ffffff;
    --card: #090909;
    --card-foreground: #ffffff;
    --popover: #090909;
    --popover-foreground: #ffffff;
    --primary: #ffffff;
    --primary-foreground: #000000;
    --secondary: #0099ff;
    --secondary-foreground: #ffffff;
    --muted: rgba(255, 255, 255, 0.04);
    --muted-foreground: rgba(255, 255, 255, 0.6);
    --accent: rgba(255, 255, 255, 0.04);
    --accent-foreground: #ffffff;
    --destructive: #ef4444;
    --destructive-foreground: #ffffff;
    --border: rgba(255, 255, 255, 0.08);
    --input: rgba(255, 255, 255, 0.08);
    --ring: #0099ff;
    --success: #10b981;
    --success-foreground: #ffffff;
    --warning: #f59e0b;
    --warning-foreground: #000000;
    --info: #0ea5e9;
    --info-foreground: #ffffff;
    --chart-1: #10b981;
    --chart-2: #f59e0b;
    --chart-3: #0ea5e9;
    --chart-4: #0099ff;
    --chart-5: #8a8a8a;
    --radius: 8px;
    --sidebar: #000000;
    --sidebar-foreground: #ffffff;
    --sidebar-primary: #0099ff;
    --sidebar-primary-foreground: #ffffff;
    --sidebar-accent: #0099ff;
    --sidebar-accent-foreground: #ffffff;
    --sidebar-border: rgba(255, 255, 255, 0.08);
    --sidebar-ring: #0099ff;
}
```

- [ ] **Step 5: Restyle `.auth-shell` to Framer dark glass**

Replace the whole `.auth-shell { ... }` block and the two following blocks (the `.auth-shell [data-slot="input"]` and `.auth-shell [data-slot="input"]::placeholder` rules) with:

```css
.auth-shell {
    --background: #000000;
    --foreground: #ffffff;
    --card: rgb(255 255 255 / 6%);
    --card-foreground: #ffffff;
    --popover: rgb(255 255 255 / 6%);
    --popover-foreground: #ffffff;
    --primary: #0099ff;
    --primary-foreground: #ffffff;
    --secondary: #0099ff;
    --secondary-foreground: #ffffff;
    --muted-foreground: #9ca3af;
    --input: rgb(255 255 255 / 10%);
    --border: rgb(255 255 255 / 10%);
    --ring: #0099ff;
    --destructive: #ff4433;
    background: radial-gradient(circle at top left, #0a0a0d 0%, #000000 55%, #040506 100%);
    color: #ffffff;
}

.auth-shell [data-slot="input"],
.auth-shell select {
    background-color: rgb(255 255 255 / 5%);
    border-radius: 1rem;
    color: #ffffff;
}

.auth-shell [data-slot="input"]::placeholder {
    color: #9ca3af;
}
```

- [ ] **Step 6: Add no-flash theme bootstrap to `index.html`**

Edit `<head>` in `index.html`: change the theme-color meta and insert an inline script BEFORE the module script:

```html
<meta name="theme-color" content="#000000" />
<script>
  (function () {
    var stored = localStorage.getItem('theme') || 'system';
    var dark = stored === 'dark' ||
      (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  })();
</script>
```

- [ ] **Step 7: Verify**

Run: `npm run lint` — Expected: PASS (0 errors)
Run: `npm run build` — Expected: PASS (tsc + vite build)

- [ ] **Step 8: Commit**

```bash
git add src/index.css index.html
git commit -m "style: apply Framer design tokens for light and dark modes"
```

---

### Task 2: Theme system — `useTheme` hook + `ThemeProvider` + `ThemeToggle`

**Files:**
- Create: `src/hooks/useTheme.tsx`
- Create: `src/components/theme/ThemeToggle.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: CSS classes `dark:` variants and `.dark` token block (Task 1).
- Produces: hook `useTheme()` returning `{ theme: 'light'|'dark'|'system', setTheme: (t) => void, resolvedTheme: 'light'|'dark' }`. Component `<ThemeToggle />`. Consumed in Task 4 (header/sidebar).

- [ ] **Step 1: Write the ThemeProvider hook**

Create `src/hooks/useTheme.tsx`:

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'
type Resolved = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: Resolved
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function getSystemTheme(): Resolved {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolve(theme: Theme): Resolved {
  if (theme === 'system') return getSystemTheme()
  return theme
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme')
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
  })
  const [resolvedTheme, setResolvedTheme] = useState<Resolved>(() => resolve(theme))

  useEffect(() => {
    const resolved = resolve(theme)
    setResolvedTheme(resolved)
    document.documentElement.classList.toggle('dark', resolved === 'dark')

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const onChange = () => setResolvedTheme(getSystemTheme())
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    }
  }, [theme])

  const updateTheme = (next: Theme) => {
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
```

- [ ] **Step 2: Write the ThemeToggle component**

Create `src/components/theme/ThemeToggle.tsx`:

```tsx
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { Button } from '../ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={isDark ? 'Mode terang' : 'Mode gelap'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
```

- [ ] **Step 3: Wire ThemeProvider into `src/main.tsx`**

Add import at top: `import { ThemeProvider } from './hooks/useTheme'`

New render body:

```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
```

- [ ] **Step 4: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTheme.tsx src/components/theme/ThemeToggle.tsx src/main.tsx
git commit -m "feat: add theme system with system-following light/dark toggle"
```

---

### Task 3: UI primitives — radius, hover, overlay tokens

**Files:**
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/dialog.tsx`

**Interfaces:**
- Consumes: Framer radius tokens (`rounded-2xl`), `secondary` color (Task 1), overlay `black/40`/`black/80`.
- Produces: Token-clean primitives that future feature sweeps rely on.

- [ ] **Step 1: Card radius to Framer scale**

In `src/components/ui/card.tsx`, replace `rounded-[2rem]` with `rounded-2xl` (2 occurrences) and `rounded-t-[2rem]`/`rounded-b-[2rem]` with `rounded-t-2xl`/`rounded-b-2xl` (in the Card base string). Also replace `shadow-slate-900/5` with `shadow-foreground/5`. Resulting base string:

```tsx
"group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-2xl border border-border bg-card py-(--card-spacing) text-sm text-card-foreground shadow-sm shadow-foreground/5 [--card-spacing:--spacing(4)] has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:[--card-spacing:--spacing(3)] data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl"
```

- [ ] **Step 2: Button default hover token**

In `src/components/ui/button.tsx`, change the `default` variant line:

```tsx
default: "bg-primary text-primary-foreground hover:bg-primary/90",
```

- [ ] **Step 3: Dialog overlay depth**

In `src/components/ui/dialog.tsx`, change `DialogOverlay` class to add a dark-variant overlay:

```tsx
"fixed inset-0 isolate z-50 bg-black/40 duration-100 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 dark:bg-black/80",
```

- [ ] **Step 4: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/card.tsx src/components/ui/button.tsx src/components/ui/dialog.tsx
git commit -m "style: tokenize card radius, button hover, dialog overlay for Framer"
```

---

### Task 4: Header + Navigation sweep

**Files:**
- Modify: `src/routes/_authenticated.tsx`
- Modify: `src/components/layouts/Navigation.tsx`

**Interfaces:**
- Consumes: `<ThemeToggle />` (Task 2), token palette (Task 1).
- Produces: Blue-accent branding, token-driven chrome, working theme toggle in desktop header and sidebar.

- [ ] **Step 1: Header (`src/routes/_authenticated.tsx`)**

Replace:
- `border-slate-200/80 bg-white/90 shadow-sm shadow-slate-900/5` → `border-border bg-background/90 shadow-sm shadow-foreground/5`
- brand span `bg-[#ffce54] text-[#1a1c1e]` → `bg-secondary text-secondary-foreground`
- `text-sm font-bold text-slate-900` → `text-sm font-bold text-foreground`
- `text-[10px] leading-none font-medium tracking-[0.24em] text-[#d4a020] uppercase` → `... text-secondary uppercase`
- `text-xl leading-none font-semibold text-slate-900` → `... text-foreground`
- user pill `bg-slate-100 ... text-slate-700` → `bg-muted ... text-foreground`

Add import: `import { ThemeToggle } from '../components/theme/ThemeToggle'`

Insert after the user pill `<span>`, inside the header flex row:

```tsx
<div className="hidden shrink-0 md:block">
  <ThemeToggle />
</div>
```

- [ ] **Step 2: Sidebar (`src/components/layouts/Navigation.tsx`)**

Replace:
- `rowLinkBase` line 1 `text-slate-700` → `text-muted-foreground`
- `rowLinkBase` line 2 `'hover:bg-[#ffce54]/10 hover:text-[#1a1c1e]'` → `'hover:bg-muted hover:text-foreground'`
- `columnLinkBase` `text-slate-500` → `text-muted-foreground`
- brand box `bg-[#ffce54] text-[#1a1c1e]` → `bg-secondary text-secondary-foreground`
- `text-base font-bold text-slate-900` → `text-base font-bold text-foreground`
- "Menu" label `text-slate-400` → `text-muted-foreground`
- active nav `className: 'bg-[#ffce54]/15 text-[#1a1c1e]'` → `className: 'bg-secondary/15 text-secondary'`
- aside border `border-slate-200/80` → `border-border`

Add import: `import { ThemeToggle } from '../theme/ThemeToggle'`

Add at the end of the sidebar `<aside>` (after the NAV_ITEMS map, to make the sidebar a flex column with the toggle pinned to the bottom — the aside already is `flex flex-col`):

```tsx
<div className="mt-auto flex items-center justify-between border-t border-border px-2 pt-3">
  <span className="text-xs font-medium text-muted-foreground">Tema</span>
  <ThemeToggle />
</div>
```

- [ ] **Step 3: BottomNav + RecordSheet (`src/components/layouts/Navigation.tsx`)**

Replace:
- BottomNav `<nav>` `border-slate-200 bg-white/95` → `border-border bg-background/95`
- `activeProps={{ className: 'text-[#d4a020]' }}` (both occurrences) → `activeProps={{ className: 'text-secondary' }}`
- FAB empty text label `text-slate-500` → `text-muted-foreground`
- FAB button `bg-[#ffce54] text-[#1a1c1e] shadow-lg shadow-[#ffce54]/40 ring-4 ring-white` → `bg-secondary text-secondary-foreground shadow-lg shadow-secondary/40 ring-4 ring-background`
- RecordSheet action buttons `border-slate-200/80 bg-white px-4 py-3 ... hover:bg-[#ffce54]/10` → `border-border bg-card ... hover:bg-secondary/10`
- RecordSheet icon box `bg-[#ffce54]/20 text-[#1a1c1e]` → `bg-secondary/15 text-secondary`
- RecordSheet title `text-slate-900` → `text-foreground`

- [ ] **Step 4: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/routes/_authenticated.tsx src/components/layouts/Navigation.tsx
git commit -m "style: Framer-ify header, sidebar, bottom nav and add theme toggle"
```

---

### Task 5: Auth forms sweep

**Files:**
- Modify: `src/features/auth/components/LoginForm.tsx`
- Modify: `src/features/auth/components/RegisterForm.tsx`
- Modify: `src/features/auth/components/ForgotPasswordForm.tsx`
- Modify: `src/features/auth/components/ResetPasswordForm.tsx`

**Interfaces:**
- Consumes: `secondary`, `success`, `muted-foreground` tokens (Task 1), rendered on the Framer-black `.auth-shell`.
- Produces: Blue-accent auth screens in both themes.

- [ ] **Step 1: Batch replacements in all four files**

For each auth form file, apply (identical patterns exist across them):
- logo box `bg-[#ffce54] text-[#1a1c1e]` → `bg-secondary text-secondary-foreground`
- Link `text-[#ffce54] hover:text-[#f0b830]` → `text-secondary hover:text-foreground`
- success message `text-[#a3c44a]` → `text-success`
- `ForgotPasswordForm` extra: `text-slate-300` → `text-muted-foreground`

- [ ] **Step 2: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/components/
git commit -m "style: Framer accents and status tokens on auth screens"
```

---

### Task 6: Dashboard feature sweep

**Files:**
- Modify: `src/features/dashboard/components/Dashboard.tsx`
- Modify: `src/features/dashboard/components/TankStatusCard.tsx`
- Modify: `src/features/dashboard/components/ActivityFeed.tsx`

**Interfaces:**
- Consumes: `success`/`warning`/`info`/`muted`/`secondary` tokens (Task 1).
- Produces: Token-based stat tints and status badges visually identical to Tank card (Task 7).

- [ ] **Step 1: `Dashboard.tsx` stat tints and text**

Replace each `StatCard` `tint`:
- `tint="bg-[#ffce54]/20 text-[#d4a020]"` (Total Tank) → `tint="bg-chart-2/20 text-chart-2"`
- `tint="bg-[#cbe273]/25 text-[#a3c44a]"` (Tank Aktif) → `tint="bg-chart-1/20 text-chart-1"`
- `tint="bg-[#4fc3f7]/20 text-[#1c6f96]"` (Rata-rata PPM) → `tint="bg-chart-3/20 text-chart-3"`
- `tint="bg-[#ffce54]/15 text-[#a07a10]"` (Rata-rata pH) → `tint="bg-chart-2/15 text-chart-2"`
- `tint="bg-slate-100 text-slate-500"` (Rata-rata Suhu) → `tint="bg-muted text-muted-foreground"`

Replace all `text-slate-900` → `text-foreground` (4 headings) and all `text-slate-500` → `text-muted-foreground` (1 stat label).

- [ ] **Step 2: `TankStatusCard.tsx`**

Replace `statusBadge` returns:
- inactive: `'bg-slate-100 text-slate-500'` → `'bg-muted text-muted-foreground'`
- out of target: `'bg-[#ffce54]/20 text-[#a07a10]'` → `'bg-warning/20 text-warning'`
- optimal: `'bg-[#cbe273]/25 text-[#a3c44a]'` → `'bg-success/20 text-success'`

Replace:
- status dot `${tank.is_active ? 'bg-[#cbe273]' : 'bg-slate-300'}` → `${tank.is_active ? 'bg-success' : 'bg-muted-foreground/40'}`
- `CardTitle` `text-slate-900` → `text-foreground`
- reading box `bg-slate-50` → `bg-muted`

- [ ] **Step 3: `ActivityFeed.tsx`**

Replace:
- `CardTitle` `text-slate-900` → `text-foreground`
- item container `border-slate-200/60 bg-white` → `border-border bg-card`
- icon circle `bg-[#ffce54]/15 text-[#d4a020]` → `bg-secondary/15 text-secondary`
- item title `text-slate-900` → `text-foreground`

- [ ] **Step 4: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard/components/
git commit -m "style: tokenize dashboard stat tints and status badges"
```
---

### Task 7: Tank + Farm feature sweep

**Files:**
- Modify: `src/features/tanks/components/TankCard.tsx`
- Modify: `src/features/tanks/components/TankList.tsx`
- Modify: `src/features/farms/components/FarmCard.tsx`
- Modify: `src/features/farms/components/FarmList.tsx`

**Interfaces:**
- Consumes: `success`/`warning`/`secondary`/`muted` tokens.
- Produces: Consistent status badge classes identical to TankStatusCard's (Task 6).

- [ ] **Step 1: `TankCard.tsx`**

Replace `statusBadge` returns with the same tokens as Task 6 Step 2:
- `'bg-slate-100 text-slate-500'` → `'bg-muted text-muted-foreground'`
- `'bg-[#ffce54]/20 text-[#a07a10]'` → `'bg-warning/20 text-warning'`
- `'bg-[#cbe273]/25 text-[#a3c44a]'` → `'bg-success/20 text-success'`

Replace:
- `CardTitle` `text-slate-900` → `text-foreground`
- status dot `${tank.is_active ? 'bg-[#cbe273]' : 'bg-slate-300'}` → `${tank.is_active ? 'bg-success' : 'bg-muted-foreground/40'}`
- reading box `bg-slate-50` → `bg-muted`
- inner spans `text-slate-700` → `text-foreground` (2 occurrences)
- Detail link `text-[#d4a020] hover:text-[#8a6d00]` → `text-secondary hover:text-foreground`

- [ ] **Step 2: `TankList.tsx` + `FarmList.tsx`**

Replace `text-slate-900` heading → `text-foreground` in each.

- [ ] **Step 3: `FarmCard.tsx`**

Replace Detail link `text-[#d4a020] hover:text-[#8a6d00]` → `text-secondary hover:text-foreground`.

- [ ] **Step 4: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/tanks/components/TankCard.tsx src/features/tanks/components/TankList.tsx src/features/farms/components/FarmCard.tsx src/features/farms/components/FarmList.tsx
git commit -m "style: tokenize tank and farm cards"
```

---

### Task 8: Monitoring / Nutrients / pH Down feature sweep

**Files:**
- Modify: `src/features/monitoring/components/MonitoringForm.tsx`
- Modify: `src/features/monitoring/components/MonitoringList.tsx`
- Modify: `src/features/nutrients/components/NutrientForm.tsx`
- Modify: `src/features/nutrients/components/NutrientList.tsx`
- Modify: `src/features/ph-down/components/PhDownForm.tsx`
- Modify: `src/features/ph-down/components/PhDownList.tsx`

**Interfaces:**
- Consumes: `warning`/`foreground` tokens.
- Produces: Token-driven record list headings and the shared "pH out of range" info box.

- [ ] **Step 1: Form info boxes (`*Form.tsx`)**

In each of the three form files, replace the info paragraph:
`border border-[#ffce54]/30 bg-[#ffce54]/15 px-3 py-2 text-sm text-[#a07a10]` → `border border-warning/30 bg-warning/15 px-3 py-2 text-sm text-warning`

- [ ] **Step 2: List headings (`*List.tsx`)**

In each of the three list files, replace `text-slate-900` → `text-foreground`.

- [ ] **Step 3: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/monitoring/ src/features/nutrients/ src/features/ph-down/
git commit -m "style: tokenize monitoring, nutrient, and pH down screens"
```

---

### Task 9: Reports / Staff / Reminders / Chat sweep

**Files:**
- Modify: `src/features/reports/components/ReportStats.tsx`
- Modify: `src/features/staff/components/StaffList.tsx`
- Modify: `src/features/reminders/components/ReminderList.tsx`
- Modify: `src/features/chat/components/ChatWidget.tsx`

**Interfaces:**
- Consumes: `foreground`/`muted-foreground`/`success`/`info`/`secondary` tokens.

- [ ] **Step 1: `ReportStats.tsx`**

Replace:
- stat label `text-slate-500` → `text-muted-foreground`
- stat value `text-slate-900` → `text-foreground`

- [ ] **Step 2: `StaffList.tsx`**

Replace:
- heading `text-slate-900` → `text-foreground`
- active badge `'bg-[#cbe273]/25 text-[#a3c44a]'` → `'bg-success/20 text-success'`
- inactive badge `'bg-slate-100 text-slate-500'` → `'bg-muted text-muted-foreground'`

- [ ] **Step 3: `ReminderList.tsx`**

Replace:
- heading `text-slate-900` → `text-foreground`
- "due" badge `bg-[#4fc3f7]/20 ... text-[#1c6f96]` → `bg-info/20 ... text-info`

- [ ] **Step 4: `ChatWidget.tsx`**

Replace FAB:
`bg-[#ffce54] text-[#1a1c1e] shadow-lg shadow-[#ffce54]/30 hover:bg-[#f0b830]` → `bg-secondary text-secondary-foreground shadow-lg shadow-secondary/30 hover:bg-secondary/90`

- [ ] **Step 5: Verify**

Run: `npm run lint` — Expected: PASS
Run: `npm run build` — Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/reports/ src/features/staff/ src/features/reminders/ src/features/chat/
git commit -m "style: tokenize reports, staff, reminders, chat"
```

---

### Task 10: Route-level sweep + full verification

**Files:**
- Modify: `src/routes/_authenticated.tsx` (double-check Task 4 left no slate/hex leftovers)
- Modify: `src/routes/$.tsx`
- Modify: `src/routes/_authenticated/activity.tsx`
- Modify: `src/routes/_authenticated/reports.tsx`
- Modify: `src/routes/_authenticated/profile.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/index.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/reminders.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/staff.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/tanks/index.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/tanks/$tankId/index.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/tanks/$tankId/monitoring.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/tanks/$tankId/nutrients.tsx`
- Modify: `src/routes/_authenticated/farms/$farmId/tanks/$tankId/ph-down.tsx`

**Interfaces:**
- Consumes: `foreground`/`secondary`/`success`/`muted` tokens.
- Produces: No remaining hardcoded palette anywhere in `src/`.

- [ ] **Step 1: Sweep each route file**

For every route file above, apply the Global Constraints mapping:
- `text-slate-900` → `text-foreground` (page headings, tank names)
- back/detail links `text-[#d4a020] hover:text-[#8a6d00]` → `text-secondary hover:text-foreground` (keep any `hover:underline`)
- status badge ternaries `tank.is_active ? 'bg-[#cbe273]/25 text-[#a3c44a]' : 'bg-slate-100 text-slate-500'` → `tank.is_active ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'`

- [ ] **Step 2: Grep for leftovers**

Run: `rg -n "#ffce54|#d4a020|#8a6d00|#a07a10|#cbe273|#a3c44a|#4fc3f7|#1c6f96|#1a1c1e|slate-" src --glob '!src/components/ui/*'`
Expected: no matches in feature/layout/routes code.

- [ ] **Step 3: Grep for stray `slate-` in ui primitives too**

Run: `rg -n "slate-|#ffce54|#f0b830" src/components/ui`
Expected: no matches (all should be token-based after Tasks 1-3).

- [ ] **Step 4: Full verify**

Run: `npm run lint`
Run: `npm run build`
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add src/routes src/features
git commit -m "style: tokenize route-level pages to complete Framer migration"
```

---

## Self-Review Checklist

- [ ] See spec `docs/superpowers/specs/2026-08-10-framer-theme-refactor-design.md` — every section matched to a task above.
- [ ] No placeholders; every task has concrete find/replace strings.
- [ ] Type/prop names consistent: `useTheme`, `ThemeProvider`, `ThemeToggle`, `resolvedTheme`, `setTheme` used identically across Tasks 2 and 4.
