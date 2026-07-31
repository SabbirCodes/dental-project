# BrightSmile — Dental Booking Platform

Full-stack Next.js (App Router, TypeScript) dental booking platform with four roles: `user`, `org`, `admin`, `superadmin`.

## Stack

- Next.js 14 (App Router) + TypeScript
- MongoDB + Mongoose
- NextAuth (Credentials provider, JWT sessions)
- bcryptjs for password hashing
- **axios** for all client-side API calls (`lib/axios.ts`)
- motion (Framer Motion) for animation
- lucide-react + react-icons for icons
- sonner for toasts
- Tailwind CSS, CSS-variable theming (light/dark ready)
- Zod for input validation
- **Middleware-only route guarding** — no separate RBAC helper; `middleware.ts` gates both pages and `/api/*` by role

## Getting started

```bash
npm install
cp .env.example .env
# fill in MONGODB_URI, NEXTAUTH_SECRET
npm run dev
```

## How access control works

`middleware.ts` is the **only** place role checks happen. It holds a `RULES` array mapping path prefixes to allowed roles, covering both page routes (`/org`, `/admin`, `/superadmin`, `/dashboard`) and API routes (`/api/org`, `/api/admin`, `/api/superadmin`). Page requests that fail the check get redirected; API requests get a JSON 403.

Two things route handlers still do on their own, since middleware can't know them:
1. **Ownership checks** — e.g. confirming a dentist being edited actually belongs to the calling org (`dentist.orgId === callerOrgId`).
2. Routes that live **outside** a protected prefix but still need role-gating for one param (e.g. `/api/orgs?all=true` for the admin moderation view) do an inline `getServerSession` check.

If you add a new protected route, add its prefix to **both** `RULES` and `config.matcher` in `middleware.ts` — missing either one leaves that route unguarded.

## Data model

- `User` — one collection for all four roles, `role` field discriminates.
- `Org` — one per `org`-role user (`ownerId`), holds clinic profile + approval status.
- `Dentist` — belongs to an `Org` via `orgId`; doesn't log in itself in this version.
- `Appointment` — links `User` + `Org` + `Dentist`; a unique partial index on `(dentistId, date, time)` for active statuses prevents double-booking at the database level.

## Known stubs / next steps

- No email/SMS notifications yet — add on top of the appointment status-change flow in `app/api/appointments/[id]/route.ts`.
- Availability editing UI for dentists isn't built yet — the schema (`Dentist.availability`) already supports it; the create/edit dentist forms don't expose it.
- `maintenanceMode` / `maintenanceMessage` in `PlatformConfig` are stored and editable but not yet read anywhere (e.g. to show a banner or block non-admin traffic) — wire that into `middleware.ts` or the root layout if you want it enforced.

## Platform settings (superadmin)

`PlatformConfig` (`models/PlatformConfig.ts`) is a singleton document — always queried/updated with an empty filter and `upsert: true`, so there's exactly one config doc. Backed by `app/api/superadmin/settings/route.ts` (`GET`/`PATCH`), edited from `/superadmin/settings`.

Two settings are actually enforced elsewhere, not just stored:
- **`requireOrgApproval`** — read in `app/api/register/route.ts`; if off, a new clinic's `Org` is created already `approved`/`verified` instead of `pending`.
- **`cancellationWindowHours`** — read in `app/api/appointments/[id]/route.ts`; a patient's own cancellation is rejected with a 400 if it falls inside that window.

## Reviews & ratings

Patients can rate a dentist once their appointment is marked `completed` — not before, and not more than once per appointment.

- **`models/Review.ts`** — `userId`, `dentistId`, `orgId`, `appointmentId`, `rating` (1–5), optional `comment`. A **unique index on `appointmentId`** enforces "one review per appointment" at the database level, not just in application code.
- **`app/api/reviews/route.ts`** — `POST` (creates a review; rejects if the appointment isn't the caller's own, isn't `completed`, or already has a review) and `GET ?dentistId=` (public, used on the dentist profile page).
- On every new review, the dentist's `rating` field is recalculated as a fresh average across all their reviews (`recalculateDentistRating`) — simple and always consistent, at the cost of one extra query per submission. Fine at this scale; worth switching to an incremental running average only if review volume ever gets large.
- `Appointment.reviewed` (boolean) is set `true` once a review lands, so the UI knows not to keep showing "Rate visit" for the same appointment without re-querying reviews separately.
- UI: `app/(user)/dashboard/page.tsx` shows a "Rate visit" button on completed, unreviewed appointments, opening a modal with `components/ui/StarRating.tsx`. `app/dentists/[id]/page.tsx` displays the dentist's live average and the full list of reviews underneath their bio.

## Superadmin: full CRUD on users and clinics

Beyond promote/demote (`/superadmin/admins`), superadmin has:

- **`/superadmin/users`** — lists everyone (via `GET /api/admin/users`) and can permanently delete a user via `DELETE /api/superadmin/users/[id]`. Superadmin accounts are blocked from deletion. Deleting an `org`-role user cascades: their `Org`, its `Dentist`s, and its `Appointment`s are all removed too.
- **`/superadmin/orgs`** — the same approve/reject/suspend actions as the admin orgs page (reuses `PATCH /api/admin/orgs/[id]/approve`, which already allows both `admin` and `superadmin`), plus a permanent **Delete** via `DELETE /api/superadmin/orgs/[id]`. Deleting a clinic cascades to its `Dentist`s and `Appointment`s; the owning user is *not* deleted — they're demoted back to a plain `user` with `orgId` unset, rather than being left stranded with role `org` and nothing to manage.

Both delete flows require a confirmation modal in the UI before calling the API — there's no undo once a delete request lands.
