# Auto-Select Single Farm/Tank — Design

**Date:** 2026-08-26
**Status:** Approved

## Goal

Wherever the app asks the user to pick a farm or a tank, a single available
option must be selected automatically; more than one option still requires an
explicit manual choice. Today Finance forces an explicit farm pick even with
one farm, and the mobile "Catat" wizard always walks through all three steps
(farm → tank → type). The rule becomes uniform across every selection point:

| Options | Behavior |
|---------|----------|
| 0 | Existing empty states, unchanged |
| Exactly 1 | Auto-selected (no click needed) |
| More than 1 | Manual selection required |

## Current State

Selection is implemented independently in five places — there is no shared
selector state:

- **Finance** (`src/routes/_authenticated/finance.tsx`): local `farmId` state,
  `FarmPicker` dropdown (`features/finance/components/FarmPicker.tsx`), hard
  gate card until a farm is chosen.
- **Catat** (`RecordSheet`, `src/components/layouts/Navigation.tsx:107`):
  3-step bottom-sheet wizard (farm → tank → type); every step requires a tap;
  ends by navigating to `/farms/$farmId/tanks/$tankId/{monitoring,nutrients,ph-down}`.
- **Reports** (`features/reports/components/ReportFilters.tsx`): two `<select>`s
  (farm, then tank cascading from it) + date inputs.
- **Reminders** (`GlobalReminderList.tsx:141`): "+ reminder" opens
  `ReminderFarmPickerDialog` before the form, regardless of farm count.
- **Dashboard** (`features/dashboard/components/Dashboard.tsx:45`): optional
  selection via `FarmSwitcher`; defaults to the all-farms view.
- **Activity** (`routes/_authenticated/activity.tsx:15`): auto-selects the
  *first* farm even when several exist — violates the ">1 = choose manually"
  rule.

Tank lists are always fetched per farm via `useTanks(farmId)`
(`['tanks', 'list', farmId]`). No test framework exists in `hydroponics-web`;
verification is `npm run lint` (oxlint) + `npm run build` (tsc).

## Design Decision

**Shared hook** (chosen over per-feature logic or a global store): one small
hook encapsulates the rule and every call site keeps its own state. Per-feature
logic would duplicate the rule in six places and drift (Activity is proof);
a global persisted store is a large refactor that changes semantics nobody
asked for.

## Design

### 1. Shared Hook — `src/hooks/useAutoSelectSingle.ts`

```ts
useAutoSelectSingle(items: T[] | undefined, currentValue, select: (item: T) => void)
```

- Fires when `items` is loaded (not `undefined`) with exactly one element and
  `currentValue` is empty (`undefined`/`null`/`''`).
- **Once-per-mount guard** (internal ref): auto-fill happens at most once per
  mount. After it fires, later user changes are never overridden — e.g.
  re-selecting the "Pilih farm" placeholder in Finance or deselecting a farm
  in Dashboard's switcher does not trigger re-selection.
- No-op while loading; never overrides an existing value.

### 2. Finance (`finance.tsx`)

Call the hook with `useFarms()` data and `setFarmId(f.id)`. With one farm the
dropdown stays visible but pre-selected, the gate card disappears, and summary/
transaction queries load immediately. Multiple farms behave as today.

### 3. Catat Wizard (`RecordSheet`, Navigation.tsx)

- Skip effects inside the sheet: when farms load with exactly one entry →
  `setFarmId` + jump to the tank step; when tanks for that farm load with
  exactly one entry → `setTankId` + jump to the type step. One farm + one tank
  lands directly on the type step.
- **Info labels:** a compact chip row at the top of the sheet ("Farm: X" /
  "Tank: Y") reflecting the current selections on any step — informational
  only, not buttons.
- Empty tank list on the tank step now renders a "Belum ada tank" hint
  (previously blank; more visible now that auto-skip can land users there).
- Reset-on-close behavior unchanged.

### 4. Reports (`ReportFilters.tsx`)

Hook #1 auto-selects a lone farm (via `onChange({...params, farm_id})`);
once tanks load, hook #2 auto-selects a lone tank. Both selects stay visible
and pre-filled; dates remain manual. Any dimension with >1 options stays manual.

### 5. Reminders (`GlobalReminderList.tsx`)

On "+ new reminder": if `useFarms()` returns exactly one farm, open the form
directly with that `formFarmId` (dialog skipped); otherwise open
`ReminderFarmPickerDialog` as today.

### 6. Dashboard (`Dashboard.tsx`)

If `data.farms` has exactly one entry and no farm is selected → auto-select it
(instead of the all-farms view). `FarmSwitcher` toggle-deselect still works and
won't be undone by the once-per-mount guard.

### 7. Activity (`activity.tsx`)

Replace the auto-select-first-farm effect with the shared hook: auto-select
only when exactly one farm exists; with multiple farms show the existing
"Pilih farm untuk melihat aktivitas." prompt until the user chooses.

### 8. Error Handling & Edge Cases

- 0 farms/tanks: all current empty states untouched.
- Loading: hooks/effects are inert while data is `undefined`.
- User intent: nothing ever overrides an explicit user choice (guard).
- `FinanceWidget` (dashboard widget) already assumes the first farm; with one
  farm this equals the new rule, so it is left unchanged.

## Verification

No test framework in the repo. Verification plan:

1. `npm run lint` and `npm run build` pass.
2. Manual matrix per feature (Finance, Catat, Reports, Reminders, Dashboard,
   Activity): {1 farm, >1 farms} × {1 tank, >1 tanks} — confirm auto-selection,
   manual gating, info chips in Catat, and no re-selection after explicit
   deselection.
