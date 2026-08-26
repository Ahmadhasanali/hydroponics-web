# Auto-Select Single Farm/Tank Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wherever the app asks users to pick a farm or tank, a lone option is auto-selected; multiple options still require manual choice.

**Architecture:** One shared hook (`useAutoSelectSingle`) encapsulates the rule "exactly one loaded option + empty current value → select it, at most once per mount". Six call sites consume it; the Catat wizard implements per-open skip logic inline (its state resets on every open, so mount-scoped guarding does not apply there).

**Tech Stack:** React 19, TypeScript, TanStack Query v5, TanStack Router v1, Tailwind CSS v4, oxlint.

**Spec:** `docs/superpowers/specs/2026-08-26-auto-select-single-farm-tank-design.md`

## Global Constraints

- **No test framework exists in this repo. Do NOT install or create one** (spec-approved deviation from TDD). Per-task verification = `npm run lint` (oxlint) + `npm run build` (`tsc -b && vite build`), plus the manual matrix in Task 8.
- Repo root for all commands: `/home/ali/Documents/Work/Agriculture/Hydroponics/hydroponics-web`.
- Unrelated dirty files exist in the worktree (`android/*`, `package.json`, `package-lock.json`, `src/main.tsx`, `.superpowers/`, `src/hooks/useAndroidBackButton.ts`). **Never stage them** — stage only files listed per task.
- Commits follow Conventional Commits (`feat(scope): ...`, lowercase, imperative) matching `git log` style.
- Code style: NO comments anywhere, double quotes, 2-space indent, single quotes inside JSX attributes as-is in existing files. Match surrounding code exactly.
- All user-facing copy is Indonesian, matching existing strings (`Pilih farm`, `Belum ada tank di farm ini.`).
- Rules of hooks: every new hook call goes at the top of its component body, before any early `return`.
- Core rule (verbatim from spec): 0 options → unchanged empty state; exactly 1 → auto-selected; more than 1 → manual selection required. A user's explicit choice is never overridden (the hook fires at most once per mount).
- Types available: `Farm { id: number; name: string; ... }`, `Tank { id: number; farm_id: number; name: string; ... }` in `src/lib/types.ts`.
- `FinanceWidget` (dashboard widget) is intentionally NOT modified — already assumes the first farm, which equals the new rule when only one exists (spec §8).

---

### Task 1: Shared Hook `useAutoSelectSingle`

**Files:**
- Create: `src/hooks/useAutoSelectSingle.ts`

**Interfaces:**
- Consumes: nothing (React only).
- Produces: `useAutoSelectSingle<T>(items: T[] | undefined, currentValue: unknown, select: (item: T) => void): void`. Fires when `items` is loaded (not `undefined`) with exactly one element and `currentValue` is `undefined`/`null`/`''`. An internal ref makes it fire at most once per mount; afterwards it never calls `select` again, even if the value becomes empty again.

- [ ] **Step 1: Create the hook file**

```ts
import { useEffect, useRef } from 'react'

function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

export function useAutoSelectSingle<T>(
  items: T[] | undefined,
  currentValue: unknown,
  select: (item: T) => void,
) {
  const didAutoSelect = useRef(false)

  useEffect(() => {
    if (didAutoSelect.current) return
    if (!items || items.length !== 1) return
    if (!isEmptyValue(currentValue)) return
    didAutoSelect.current = true
    select(items[0])
  }, [items, currentValue, select])
}
```

- [ ] **Step 2: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAutoSelectSingle.ts
git commit -m "feat(hooks): add useautoselectsingle shared hook"
```

---

### Task 2: Finance — Auto-Select Lone Farm

**Files:**
- Modify: `src/routes/_authenticated/finance.tsx` (imports at lines 1–12; `FinancePage` body starting line 37)

**Interfaces:**
- Consumes: `useAutoSelectSingle` (Task 1), `useFarms()` → `{ data: Farm[] | undefined }` (`src/features/farms/hooks/useFarms.ts:42`).
- Produces: nothing downstream.

Behavior: with exactly one farm, `farmId` becomes that id right after load, so the gate card (`farmId === ''` branch, line 75) never shows and summary queries fetch immediately. The `FarmPicker` dropdown stays visible, pre-filled. With >1 farms nothing changes. If the user later re-selects the empty "Pilih farm" placeholder, the once-per-mount guard keeps it from being re-filled.

- [ ] **Step 1: Add imports**

In `finance.tsx`, add after the last existing import (line 12):

```tsx
import { useFarms } from '../../features/farms/hooks/useFarms'
import { useAutoSelectSingle } from '../../hooks/useAutoSelectSingle'
```

- [ ] **Step 2: Call the hook in `FinancePage`**

Replace:

```tsx
function FinancePage() {
  const [farmId, setFarmId] = useState<number | ''>('')
  const [txOpen, setTxOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
```

with:

```tsx
function FinancePage() {
  const [farmId, setFarmId] = useState<number | ''>('')
  const [txOpen, setTxOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)

  const { data: farms } = useFarms()
  useAutoSelectSingle(farms, farmId, (farm) => setFarmId(farm.id))
```

- [ ] **Step 3: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 4: Commit**

```bash
git add src/routes/_authenticated/finance.tsx
git commit -m "feat(finance): auto-select farm when only one exists"
```

---

### Task 3: Catat Wizard — Skip Lone-Option Steps + Info Chips

**Files:**
- Modify: `src/components/layouts/Navigation.tsx` (imports line 1–28; `RecordSheet` lines 107–220)

**Interfaces:**
- Consumes: `useFarms()` and `useTanks(farmId)` already used inside `RecordSheet`.
- Produces: nothing downstream.

Why inline effects instead of the shared hook: `RecordSheet` stays mounted across open/close cycles and resets its state on every close, so selection must be re-evaluated **per open**, not once per mount.

Resulting UX: 1 farm + 1 tank → sheet opens straight on the type step with chips "Farm: X" / "Tank: Y" on top. 1 farm + several tanks → starts at the tank step with chip "Farm: X". Several farms → unchanged full wizard. Chips are informational spans, never buttons.

- [ ] **Step 1: Update React import**

Line 1 changes from:

```tsx
import { useState } from 'react'
```

to:

```tsx
import { useEffect, useState } from 'react'
```

- [ ] **Step 2: Add skip effects and derived selections in `RecordSheet`**

After this existing line (line 113):

```tsx
  const { data: tanks } = useTanks(farmId ?? 0)
```

add:

```tsx
  useEffect(() => {
    if (step === 'farm' && farms && farms.length === 1 && farmId === null) {
      setFarmId(farms[0].id)
      setStep('tank')
    }
  }, [farms, step, farmId])

  useEffect(() => {
    if (step === 'tank' && farmId !== null && tanks && tanks.length === 1 && tankId === null) {
      setTankId(tanks[0].id)
      setStep('type')
    }
  }, [tanks, step, farmId, tankId])

  const selectedFarm = farms?.find((f) => f.id === farmId) ?? null
  const selectedTank = tanks?.find((t) => t.id === tankId) ?? null
```

- [ ] **Step 3: Render info chips above the option grid**

Inside the returned JSX, between `</DialogHeader>` and `<div className="grid gap-2">`, insert:

```tsx
        {(selectedFarm || selectedTank) && (
          <div className="flex flex-wrap gap-2">
            {selectedFarm && (
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                Farm: {selectedFarm.name}
              </span>
            )}
            {selectedTank && (
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-semibold text-secondary">
                Tank: {selectedTank.name}
              </span>
            )}
          </div>
        )}
```

- [ ] **Step 4: Add empty-tank hint on the tank step**

Directly after the existing block:

```tsx
          {step === 'tank' && (tanks ?? []).map((tank) => (
            <button
              key={tank.id}
              type="button"
              onClick={() => { setTankId(tank.id); setStep('type') }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-secondary/10"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Droplets className="size-5" />
              </span>
              <span className="text-sm font-semibold text-foreground">{tank.name}</span>
            </button>
          ))}
```

insert:

```tsx
          {step === 'tank' && tanks && tanks.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Belum ada tank di farm ini.</p>
          )}
```

- [ ] **Step 5: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 6: Commit**

```bash
git add src/components/layouts/Navigation.tsx
git commit -m "feat(catat): skip wizard steps with a single option and show selection chips"
```

---

### Task 4: Reports — Auto-Select Lone Farm and Tank

**Files:**
- Modify: `src/features/reports/components/ReportFilters.tsx` (imports lines 1–6; component body lines 16–32)

**Interfaces:**
- Consumes: `useAutoSelectSingle` (Task 1). Parent-owned state via `onChange(params)`; `params.farm_id`/`params.tank_id` are strings (`src/features/reports/types.ts:22-27`). Local `tankId` state self-syncs from `params.tank_id` via the existing effect at lines 25–27 — the auto-selects below only call `onChange` and let that sync happen.
- Produces: nothing downstream.

Once-per-mount semantics here mean: if the user clears the farm select back to "Pilih farm", it will not silently refill.

- [ ] **Step 1: Add import**

Add to the import block at the top:

```tsx
import { useAutoSelectSingle } from '../../../hooks/useAutoSelectSingle'
```

- [ ] **Step 2: Add the two auto-selects in `ReportFilters`**

After this existing line (line 23):

```tsx
  const tanks = tanksQuery.data ?? []
```

add:

```tsx
  useAutoSelectSingle(farms, params.farm_id, (farm) =>
    onChange({ ...params, farm_id: String(farm.id), tank_id: '' }),
  )

  useAutoSelectSingle(tanksQuery.data, params.tank_id, (tank) =>
    onChange({ ...params, tank_id: String(tank.id) }),
  )
```

Ordering note: the tank select only fires after a farm id reaches the parent state (which enables `useTanks`), so on first render with one farm + one tank both get filled within two renders.

- [ ] **Step 3: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 4: Commit**

```bash
git add src/features/reports/components/ReportFilters.tsx
git commit -m "feat(reports): auto-select farm and tank when only one exists"
```

---

### Task 5: Reminders — Skip Picker Dialog for Lone Farm

**Files:**
- Modify: `src/features/reminders/components/GlobalReminderList.tsx` (imports lines 1–8; `GlobalReminderList` body lines 43–63, button at line 62)

**Interfaces:**
- Consumes: `useFarms()` → `{ data: Farm[] | undefined }`; existing `formFarmId`/`formOpen`/`pickerOpen` state.
- Produces: nothing downstream.

- [ ] **Step 1: Add import**

Add to the import block:

```tsx
import { useFarms } from '../../farms/hooks/useFarms'
```

- [ ] **Step 2: Fetch farms and add the opener handler**

Replace:

```tsx
export function GlobalReminderList() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const activeQuery = useGlobalReminders(activePage, 'aktif')
  const historyQuery = useGlobalReminders(historyPage, 'riwayat')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formFarmId, setFormFarmId] = useState<number | null>(null)
```

with:

```tsx
export function GlobalReminderList() {
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const activeQuery = useGlobalReminders(activePage, 'aktif')
  const historyQuery = useGlobalReminders(historyPage, 'riwayat')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [formFarmId, setFormFarmId] = useState<number | null>(null)
  const { data: farms } = useFarms()

  const openNewReminder = () => {
    const list = farms ?? []
    if (list.length === 1) {
      setFormFarmId(list[0].id)
      setFormOpen(true)
      return
    }
    setPickerOpen(true)
  }
```

- [ ] **Step 3: Wire the button to the handler**

Replace (line 62):

```tsx
        <Button onClick={() => setPickerOpen(true)}>Tambah Pengingat</Button>
```

with:

```tsx
        <Button onClick={openNewReminder}>Tambah Pengingat</Button>
```

While farms are still loading, `list.length` is 0 → the picker dialog opens (identical to today's behavior); once loaded, the lone-farm case skips it.

- [ ] **Step 4: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 5: Commit**

```bash
git add src/features/reminders/components/GlobalReminderList.tsx
git commit -m "feat(reminders): open form directly when only one farm exists"
```

---

### Task 6: Dashboard — Default to the Lone Farm

**Files:**
- Modify: `src/features/dashboard/components/Dashboard.tsx` (import line 1; `Dashboard` body lines 44–46)

**Interfaces:**
- Consumes: `useAutoSelectSingle` (Task 1); `useDashboard(farmId)` payload `data.farms: Farm[]` (already consumed at lines 54 and 85).
- Produces: nothing downstream.

The shared hook's once-per-mount guard matters here: without it, tapping the active farm in `FarmSwitcher` (toggle-deselect → `farmId === undefined`) would instantly re-select. With it, deselect sticks until remount.

- [ ] **Step 1: Add import**

Add to the import block:

```tsx
import { useAutoSelectSingle } from '../../../hooks/useAutoSelectSingle'
```

- [ ] **Step 2: Call the hook before any early return**

Replace:

```tsx
export function Dashboard() {
  const [farmId, setFarmId] = useState<number | undefined>(undefined)
  const { data, isLoading, isError } = useDashboard(farmId)
```

with:

```tsx
export function Dashboard() {
  const [farmId, setFarmId] = useState<number | undefined>(undefined)
  const { data, isLoading, isError } = useDashboard(farmId)
  useAutoSelectSingle(data?.farms, farmId, (farm) => setFarmId(farm.id))
```

It must stay above the `if (isLoading) return ...` early return (rules of hooks). While loading, `data?.farms` is `undefined` and the hook is inert.

- [ ] **Step 3: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard/components/Dashboard.tsx
git commit -m "feat(dashboard): auto-select farm when only one exists"
```

---

### Task 7: Activity — Only Auto-Select a Lone Farm

**Files:**
- Modify: `src/routes/_authenticated/activity.tsx` (full file shown below; currently 42 lines)

**Interfaces:**
- Consumes: `useAutoSelectSingle` (Task 1); `useFarms()` already imported.
- Produces: nothing downstream.

Today lines 15–19 pick the FIRST farm even when several exist. That violates the ">1 = choose manually" rule and gets replaced wholesale.

- [ ] **Step 1: Swap the effect for the shared hook**

Replace the entire file content with:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useFarms } from '../../features/farms/hooks/useFarms'
import { useAutoSelectSingle } from '../../hooks/useAutoSelectSingle'
import { FarmSwitcher } from '../../features/dashboard/components/FarmSwitcher'
import { ActivityLogList } from '../../features/activity/components/ActivityLogList'

export const Route = createFileRoute('/_authenticated/activity')({
  component: ActivityPage,
})

function ActivityPage() {
  const { data: farms } = useFarms()
  const [farmId, setFarmId] = useState<number | undefined>(undefined)

  useAutoSelectSingle(farms, farmId, (farm) => setFarmId(farm.id))

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Aktivitas</h1>
          <p className="text-sm text-muted-foreground">Riwayat aktivitas di kebun Anda.</p>
        </div>
        <FarmSwitcher
          farms={farms ?? []}
          selectedFarmId={farmId}
          onSelect={(id) => setFarmId(id)}
        />
      </div>

      {farmId !== undefined ? (
        <ActivityLogList key={farmId} farmId={farmId} />
      ) : (
        <p className="text-sm text-muted-foreground">Pilih farm untuk melihat aktivitas.</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify lint and build pass**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 3: Commit**

```bash
git add src/routes/_authenticated/activity.tsx
git commit -m "refactor(activity): only auto-select farm when it is the only one"
```

---

### Task 8: Full Verification (Manual Matrix)

**Files:**
- None created or modified (fix-forward only if a defect surfaces; any fix committed against the owning file).

- [ ] **Step 1: Lint + build the whole app**

Run: `npm run lint && npm run build`
Expected: both exit clean.

- [ ] **Step 2: Manual matrix in the browser (`npm run dev`)**

Test each cell that exists in your data and confirm:

| Feature | Scenario | Expected |
|---------|----------|----------|
| Finance | 1 farm | Page loads data immediately, dropdown pre-filled, no gate card |
| Finance | >1 farms | Gate card until manual pick; clearing back to "Pilih farm" stays cleared |
| Catat | 1 farm + 1 tank | Opens straight on type step; chips show Farm + Tank names |
| Catat | 1 farm + >1 tanks | Starts on tank step; chip shows Farm name |
| Catat | >1 farms | Full 3-step wizard, no chips until selections made |
| Catat | 1 farm + 0 tanks | Lands on tank step showing "Belum ada tank di farm ini." |
| Reports | 1 farm + 1 tank | Both selects filled automatically |
| Reports | >1 of either | That dimension stays manual |
| Reminders | 1 farm | "+ Tambah Pengingat" opens the form directly |
| Reminders | >1 farms | Picker dialog opens first |
| Dashboard | 1 farm | Shows that farm's stats ("Farm aktif:" label visible) |
| Dashboard | 1 farm, toggle off | Deselect sticks (does not snap back) |
| Activity | 1 farm | List loads without interaction |
| Activity | >1 farms | "Pilih farm untuk melihat aktivitas." until manual pick |

- [ ] **Step 3: Fix anything found, re-run lint/build, commit fixes**

```bash
git add <only-the-fixed-files>
git commit -m "fix(<scope>): <what was wrong>"
```

No commit if everything passed.
