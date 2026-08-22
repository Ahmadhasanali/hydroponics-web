# Staff Portal (Login & Dashboard) — Design

**Date:** 2026-08-22
**Status:** Approved

## Goal

Give farm staff (petugas) a way to sign in from the web app and see their
assigned farm's live status. Today the API already exposes
`POST /v1/staff/login`, `GET /v1/staff/dashboard`, and `POST /v1/staff/logout`,
but the web app has no staff-facing pages at all — the only staff-related UI is
the owner-side management screen (`/farms/$farmId/staff`). This design adds:

1. A link on the main login page: **"Masuk sebagai Petugas"** → `/staff/login`
2. A staff login page (`/staff/login`) with fields **Nama Kebun, Username,
   Kata Sandi**
3. A staff dashboard (`/staff`) showing farm stats and tank readings, plus a
   logout button

## Current State

- Owner auth uses `auth_token` in `localStorage`. The shared axios instance
  (`src/lib/api.ts`) attaches it to every request and hard-redirects to
  `/login` on 401.
- Route guards: `_auth.tsx` bounces authenticated users away from auth pages;
  `_authenticated.tsx` requires `auth_token` and renders the owner layout
  (Sidebar / BottomNav / ChatWidget).
- Staff tokens are issued by the API with abilities `['staff']`; owner routes
  reject them. Mixing both token types in one storage key would let guards and
  interceptors fight each other.
- No test framework exists in `hydroponics-web`; verification is
  `npm run lint` (oxlint) + `npm run build` (tsc).

## Design Decision

**Isolated staff portal** (chosen over a shared session + role flag): staff get
their own storage key (`staff_token`), their own axios instance, and their own
route layout. All changes are purely additive — no existing owner flow is
touched.

## Design

### 1. Routing & Guards (`src/routes/`)

| File | Path | Behavior |
|------|------|----------|
| `_staff.tsx` | — | Pathless layout, renders `<Outlet />` only |
| `_staff/login.tsx` | `/staff/login` | `beforeLoad`: if `staff_token` exists → redirect `/staff` |
| `_staff/index.tsx` | `/staff` | `beforeLoad`: if no `staff_token` → redirect `/staff/login` |

The route tree (`src/routeTree.gen.ts`) regenerates automatically via the
TanStack Router Vite plugin during `npm run dev` / `npm run build`.

### 2. API Client (`src/lib/staffApi.ts`)

A small axios instance mirroring `api.ts`, with two differences:

- Reads `staff_token` instead of `auth_token`.
- On 401: removes `staff_token` and redirects to `/staff/login`.

### 3. Feature Module (`src/features/staff-portal/`)

Named `staff-portal` to avoid colliding with the existing owner-side
`src/features/staff/` (staff account management).

- `types.ts` — `StaffAccount`, `StaffDashboardData`
  (`{ farm: Farm; tanks: Tank[]; stats: StaffDashboardStats }`),
  `StaffDashboardStats` (`total_tanks`, `active_tanks`, `avg_ppm`, `avg_ph`,
  `avg_temp`).
- `hooks/useStaffPortal.ts`:
  - `useStaffLogin()` — mutation → `POST /staff/login`
    (`{ farm_name, username, password }`), stores `staff_token`, redirects to
    `/staff`.
  - `useStaffLogout()` — mutation → `POST /staff/logout`, removes
    `staff_token`, redirects to `/staff/login`.
  - `useStaffDashboard()` — query → `GET /staff/dashboard`, enabled only when
    `staff_token` exists.
- `components/StaffLoginForm.tsx` — reuses `AuthShell` (eyebrow
  `"Akses Petugas"`); react-hook-form fields: Nama Kebun, Username, Kata
  Sandi; footer links back to `/login` ("Masuk sebagai Pemilik").
- `components/StaffDashboard.tsx`:
  - Header: farm name + logout button.
  - Stat cards: Total Tank, Tank Aktif, rata-rata PPM, pH, Suhu air.
  - Tank list: name plus current ppm/pH/temperature readings.

### 4. Link on Main Login Page

Footer of `src/features/auth/components/LoginForm.tsx` gains a second line
below the existing register line:

> Masuk sebagai Petugas → `/staff/login`

Existing register link stays unchanged.

### 5. Error Handling

- Wrong credentials (401) or inactive account (403): show the API message via
  the existing `ErrorNote` pattern from `features/auth/components/field.tsx`.
- Expired session (401 on any staff call): interceptor clears the token and
  returns the user to `/staff/login`.
- Dashboard fetch failure (non-auth): inline error note with a retry via
  react-query refetch.

## Verification

- `npm run lint` — oxlint passes.
- `npm run build` — tsc + vite build pass.
- Manual smoke test (dev server): link visible on `/login`; wrong credentials
  show error; valid staff credentials land on `/staff` with farm stats;
  logout returns to `/staff/login`; visiting `/staff` unauthenticated
  redirects to `/staff/login`; owner flows (`/login`, `/`) unaffected.

## Out of Scope

- Staff monitoring / nutrient / pH-down / reminders / reports pages — the API
  supports them, but this design covers only auth + dashboard. Follow-up specs
  can extend the `_staff` layout.
- Mobile app changes.
