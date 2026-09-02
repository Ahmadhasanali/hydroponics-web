# Merge auto-select-single-farm-tank to main — Rebase & Merge Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebase `feature/auto-select-single-farm-tank` onto latest `main` dan merge ke `main` tanpa kehilangan dirty worktree di `main` (Android back button + finance combobox).

**Architecture:** `main` saat ini `30b9ee1` (1 ahead `origin/main`), worktree `feature/auto-select-single-farm-tank` di `2ad741b` (7 commit ahead `main`, 8 ahead `origin/main`). Dirty di `main` (7 modified + 2 untracked) harus di-commit dulu sebagai pre-merge baseline, baru rebase feature di atasnya, verify lint/build, lalu `merge --no-ff` ke `main`. Tidak ada konflik file langsung (feature sentuh 8 file, dirty sentuh 7 file berbeda kecuali `docs/superpowers/plans/...` yang duplicate).

**Tech Stack:** Git worktree, React 19, TypeScript, TanStack Query/Router, Capacitor 8, oxlint, Vite, Gradle.

**Spec:** `docs/superpowers/specs/2026-08-26-auto-select-single-farm-tank-design.md` + existing plan `docs/superpowers/plans/2026-08-26-auto-select-single-farm-tank.md`

## Global Constraints

- Repo root: `/home/ali/Documents/Work/Agriculture/Hydroponics/hydroponics-web`
- Jangan stage unrelated files: `android/*`, `.superpowers/`, `docs/superpowers/plans/2026-08-26-auto-select-single-farm-tank.md` (duplicate) — stage hanya file yang disebut per task.
- Commits Conventional Commits lowercase (`feat(scope):`, `fix(scope):`) sesuai `git log` existing.
- Code style: NO comments, double quotes, 2-space indent.
- Per-task verification = `npm run lint && npm run build` (oxlint + `tsc -b && vite build`) — no test framework di repo.
- Branch `feat/framer-theme` dan `feat/reminder-history-ack-resend` JANGAN disentuh di plan ini.
- `FinanceWidget` intentionally tidak dimodifikasi (spec §8).
- Core rule: 0 options → empty, exactly 1 → auto-select, >1 → manual; once-per-mount guard tidak override pilihan user.

---

### Task 1: Freeze & Audit Main — Pastikan Base Bersih

**Files:**
- Read: `hydroponics-web:git status`, `git log --oneline main..feature/auto-select-single-farm-tank`, `git diff HEAD --stat`

**Interfaces:**
- Consumes: `git worktree list`, `git branch -a`
- Produces: daftar dirty files yang akan di-commit di Task 2

- [ ] **Step 1: Konfirmasi posisi branch**

```bash
git status
# Expected: On branch main, ahead of origin/main by 1 (30b9ee1), 7 modified + 2 untracked
git log --oneline origin/main..main
# Expected: 30b9ee1 docs(spec): auto-select single farm/tank design
git log --oneline main..feature/auto-select-single-farm-tank
# Expected: 7 commits (9bceb24..2ad741b) — 216ca67 docs(plan) sudah di main via spec, tidak dihitung
git worktree list
# Expected: main + .worktrees/auto-select-single-farm-tank (2ad741b) + framer-theme
```

- [ ] **Step 2: Catat dirty diff untuk Task 2**

```bash
git diff HEAD --stat
# Expected:
#  android/app/capacitor.build.gradle | 1 +
#  android/capacitor.settings.gradle  | 3 +
#  package-lock.json                  | 10 ++
#  package.json                       | 1 +
#  src/features/finance/api.ts        | 5 +-
#  src/features/finance/components/TransactionFormDialog.tsx | 160 ++++++++++++++-
#  src/main.tsx                       | 29 +++-
git ls-files --others --exclude-standard
# Expected: .superpowers/diff-web-whole.diff, docs/superpowers/plans/2026-08-26-auto-select-single-farm-tank.md, src/hooks/useAndroidBackButton.ts
```

---

### Task 2: Commit Dirty Worktree di Main sebagai Pre-Merge Baseline

**Files:**
- Modify: `src/features/finance/api.ts:90-94`, `src/features/finance/components/TransactionFormDialog.tsx:1-160`, `src/main.tsx:1-56`, `src/hooks/useAndroidBackButton.ts` (new), `package.json:1`, `package-lock.json`, `android/app/capacitor.build.gradle`, `android/capacitor.settings.gradle`
- Ignore: `.superpowers/`, `docs/superpowers/plans/2026-08-26-auto-select-single-farm-tank.md` (sudah ada di feature, jangan duplicate commit)

**Interfaces:**
- Consumes: dirty diff dari Task 1
- Produces: new commit di `main` (`a1` baseline) yang jadi base untuk rebase feature

- [ ] **Step 1: Commit file finance + back button + android config**

```bash
# Di worktree main (/hydroponics-web)
git add src/features/finance/api.ts src/features/finance/components/TransactionFormDialog.tsx src/main.tsx src/hooks/useAndroidBackButton.ts package.json package-lock.json android/app/capacitor.build.gradle android/capacitor.settings.gradle
git status
# Expected: staged 8 files, unstaged hanya .superpowers/ + docs/superpowers/plans/...
git commit -m "feat(finance): inline category create + android back button"
# Body commit harus sebut: api.ts return FinancialCategory, TransactionFormDialog combobox searchable + create inline, useAndroidBackButton double-tap exit, capacitor android sync
```

Isi commit yang diharapkan (verifikasi dengan `git show --stat HEAD`):
- `api.ts:90` `createCategory` return `FinancialCategory` via `SuccessEnvelope<{category}>`
- `TransactionFormDialog.tsx:1` import `useEffect, useRef, Plus, useCreateCategory` + state `categoryQuery/categoryOpen/dropdownRef` + `handleCreateCategory` + reset `categoryId/categoryQuery` on success
- `main.tsx:8,15` import `useAndroidBackButton` + `App()` wrapper dengan toast listener
- `useAndroidBackButton.ts:1-120` full hook (Capacitor.isNativePlatform, App.addListener backButton, dialog Escape, double-tap guard)
- `android/*.gradle` + `package.json` capacitor dep sync

- [ ] **Step 2: Verify lint dan build di main baseline**

```bash
npm run lint && npm run build
# Expected: both exit clean (oxlint 0 errors, vite built 660kB index-CTbf_ZKh.js)
```

- [ ] **Step 3: Push baseline ke origin/main (opsional, tapi disarankan sebelum rebase)**

```bash
git log --oneline -2
# Expected: feat(finance): inline category create + android back button (HEAD) + 30b9ee1
# Jika ingin push sekarang:
git push origin main
# Expected: main now ahead 0 (jika pushed) atau 2 ahead jika belum push — catat untuk Task 4
```

---

### Task 3: Rebase Feature Branch onto Latest Main

**Files:**
- Worktree: `.worktrees/auto-select-single-farm-tank` (branch `feature/auto-select-single-farm-tank`)
- No file edits expected — hanya git history rewrite

**Interfaces:**
- Consumes: new baseline commit dari Task 2 (`main` HEAD)
- Produces: rebased feature branch (`feature/auto-select-single-farm-tank` rebased, 7 commits replayed)

- [ ] **Step 1: Fetch dan rebase**

```bash
# Di worktree feature
cd .worktrees/auto-select-single-farm-tank
git fetch origin
git rebase main
# Expected: Successfully rebased (7 commits replayed: 9bceb24,40bccdd,fcb7fad,85ba819,c6da931,b414fe1,2ad741b)
# Jika ada konflik, expected: 0 konflik karena file sets disjoint — tapi cek:
git status
# Expected: clean, "nothing to commit, working tree clean"
```

- [ ] **Step 2: Jika konflik muncul (antisipasi), selesaikan per-file**

Potensi konflik hanya jika `main` baseline menyentuh file yang sama dengan feature (saat ini tidak, tapi guard):

```bash
# Jika git rebase berhenti dengan CONFLICT:
git diff --name-only --diff-filter=U
# Expected: empty — jika tidak empty, cek file:
# - src/routes/_authenticated/finance.tsx: feature menambah useFarms+useAutoSelectSingle, main baseline tidak sentuh finance.tsx → tidak konflik
# - src/components/layouts/Navigation.tsx: hanya feature yang sentuh → tidak konflik
# - Jika konflik di docs/superpowers/plans/... : accept theirs (feature) karena main sudah punya spec
git add <resolved-files>
git rebase --continue
# Ulangi sampai rebase selesai
```

- [ ] **Step 3: Verifikasi history rebased**

```bash
git log --oneline main..HEAD
# Expected: 7 commits sama seperti sebelum rebase, tapi parent sekarang baseline Task 2
# Contoh:
# 2ad741b refactor(activity): only auto-select farm when it is the only one
# b414fe1 feat(dashboard): auto-select farm when only one exists
# ...
# 9bceb24 feat(hooks): add useautoselectsingle shared hook
git log --oneline --graph --all -12
# Expected: feature branch fork point sekarang di feat(finance): inline category create + android back button, bukan 30b9ee1 lagi
```

---

### Task 4: Verify Rebased Feature — Lint, Build, Manual Matrix

**Files:**
- Read: `src/hooks/useAutoSelectSingle.ts:1`, `src/routes/_authenticated/finance.tsx:1`, `src/components/layouts/Navigation.tsx:107`, `src/features/reports/components/ReportFilters.tsx:16`, `src/features/reminders/components/GlobalReminderList.tsx:43`, `src/features/dashboard/components/Dashboard.tsx:44`, `src/routes/_authenticated/activity.tsx:1`
- Plus merged finance combobox + back button dari main baseline (harus masih ada)

**Interfaces:**
- Consumes: rebased feature branch
- Produces: verified branch ready untuk merge

- [ ] **Step 1: Cek file merge tidak hilang**

```bash
# Di worktree feature rebased
ls src/hooks/useAutoSelectSingle.ts src/hooks/useAndroidBackButton.ts src/features/finance/components/TransactionFormDialog.tsx
# Expected: semua ada (3 files)
grep -q "useAutoSelectSingle" src/routes/_authenticated/finance.tsx && echo "finance auto-select OK"
grep -q "useAndroidBackButton" src/main.tsx && echo "back button OK"
grep -q "categoryQuery" src/features/finance/components/TransactionFormDialog.tsx && echo "combobox OK"
# Expected: 3× OK
```

- [ ] **Step 2: Lint + build di feature rebased**

```bash
npm run lint && npm run build
# Expected: both exit clean
# dist/assets/index-*.js harus ~660kB (sudah include finance combobox + auto-select)
```

- [ ] **Step 3: Manual matrix smoke (di `npm run dev` jika ada device/emulator)**

Run `npm run dev` dan cek (jika tidak ada device, lewati manual tapi tetap lanjut merge — lint/build sudah cukup):

| Feature | 1 farm | >1 farms |
|---------|--------|----------|
| Finance | auto-select, tanpa gate card, combobox kategori searchable | gate card sampai pick manual |
| Catat | 1 farm+1 tank → langsung type step + chips Farm/Tank | full wizard 3 step |
| Reports | auto-select farm+tank jika lone | manual jika >1 |
| Reminders | +Tambah langsung form jika 1 farm | picker dialog jika >1 |
| Dashboard | auto-select lone farm, deselect sticks | all-farms view |
| Activity | auto-load jika 1 farm | "Pilih farm..." jika >1 |

- [ ] **Step 4: Jika ada fix, commit di feature branch**

```bash
git add <only-fixed-files>
git commit -m "fix(<scope>): <what was wrong>"
# Expected: tidak ada fix jika lint/build OK
```

---

### Task 5: Merge Feature ke Main (No-FF)

**Files:**
- Main worktree: `hydroponics-web` (branch `main`)
- Merge result: 8 files dari feature + baseline dari Task 2

**Interfaces:**
- Consumes: rebased `feature/auto-select-single-farm-tank` (Task 4)
- Produces: new merge commit di `main`

- [ ] **Step 1: Checkout main dan merge**

```bash
# Kembali ke worktree main
cd ../..
git status
# Expected: clean (baseline committed)
git merge --no-ff feature/auto-select-single-farm-tank -m "Merge feature/auto-select-single-farm-tank: auto-select lone farm/tank"
# Expected: Merge made by the 'ort' strategy, 8 files changed, 648 insertions(+), 8 deletions(-)
# Files merged:
#  docs/superpowers/plans/2026-08-26-auto-select-single-farm-tank.md (559)
#  src/components/layouts/Navigation.tsx (37 + chips)
#  src/features/dashboard/components/Dashboard.tsx (2)
#  src/features/reminders/components/GlobalReminderList.tsx (14)
#  src/features/reports/components/ReportFilters.tsx (9)
#  src/hooks/useAutoSelectSingle.ts (21 new)
#  src/routes/_authenticated/activity.tsx (9)
#  src/routes/_authenticated/finance.tsx (5)
```

- [ ] **Step 2: Verifikasi merge commit dan lint/build di main**

```bash
git log --oneline --graph -6
# Expected:
# *   Merge feature/auto-select-single-farm-tank...
# |\
# | * 2ad741b refactor(activity): ...
# | * ...
# | * 9bceb24 feat(hooks): ...
# * | feat(finance): inline category create + android back button (Task 2)
# * | 30b9ee1 docs(spec): auto-select single farm/tank design
# |/
# * e49414f feat(icon): switch to droplet...
git show --stat HEAD
# Expected: 8 files dari feature
npm run lint && npm run build
# Expected: both exit clean
```

- [ ] **Step 3: Rebuild dan sync APK (karena main sekarang berubah)**

```bash
npx cap sync android
# Expected: Copying web assets ... Sync finished
cd android && ./gradlew assembleDebug
# Expected: BUILD SUCCESSFUL
cp android/app/build/outputs/apk/debug/app-debug.apk ../app-debug.apk && cp android/app/build/outputs/apk/debug/app-debug.apk ../../app-debug.apk
# Expected: 6.5M, index-CTbf_ZKh.js atau hash baru jika finance combobox ikut
```

---

### Task 6: Push & Cleanup

**Files:**
- None (git remote + worktree cleanup)

**Interfaces:**
- Consumes: merged `main` (Task 5)
- Produces: pushed `main`, optional worktree removal

- [ ] **Step 1: Push main**

```bash
git push origin main
# Expected: main pushed (2-3 commits ahead sebelum push: baseline + merge)
git status
# Expected: Your branch is up to date with 'origin/main'
```

- [ ] **Step 2: Verifikasi di remote dan pertimbangkan cleanup worktree**

```bash
git branch -a
# Expected: feature/auto-select-single-farm-tank masih ada (jangan hapus dulu sampai PR review jika ada)
# Untuk hapus worktree setelah merge confirmed:
git worktree remove .worktrees/auto-select-single-farm-tank
# Optional: git branch -d feature/auto-select-single-farm-tank (hanya setelah push dan yakin tidak perlu hotfix)
```

- [ ] **Step 3: Update docs/superpowers/plans status**

Tambahkan di `docs/superpowers/sdd/2026-08-05-split-monolith-to-spa-api/progress.md` atau `dev-docs` jika ada tracking:

```markdown
- 2026-09-01 merged feature/auto-select-single-farm-tank (7 commits) + feat(finance) inline category create + android back button
```

No commit jika tidak ada tracking file — cukup catat di plan ini.

---

## Self-Review Checklist

- [ ] Spec coverage: tiap section design (hook §1, finance §2, catat §3, reports §4, reminders §5, dashboard §6, activity §7) punya task yang menyentuhnya (Task 3 rebase membawa semua file tersebut).
- [ ] Placeholder scan: tidak ada TBD/TODO — semua file path, command, dan expected output konkret.
- [ ] Type consistency: `useAutoSelectSingle<T>(items: T[]|undefined, currentValue: unknown, select: (item:T)=>void)` konsisten di finance, reports, dashboard, activity; `Farm.id: number` konsisten di semua call sites; `useFarms()->{data: Farm[]|undefined}` konsisten.
- [ ] Dirty worktree tidak hilang: Task 2 commit finance combobox + back button sebelum rebase, Task 3 rebase preservasi, Task 5 merge preservasi keduanya.
- [ ] Tidak sentuh branch lain: `feat/framer-theme` dan `feat/reminder-history-ack-resend` tidak disebut di git commands kecuali di Global Constraints.
