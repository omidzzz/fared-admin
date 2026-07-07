# Aura Mystic Admin — Handoff Document

**Repo:** `aura-mystic-admin` · **Date:** 2026-06-24 · **Snapshot tag:** `v0.9-handoff` (suggested)

This is the final-handoff state of the admin panel. It documents how to run the
project, what is implemented vs not, the backend API contract it expects, and the
known issues outstanding at handoff.

> **Repo layout note.** The deliverable lives in this directory
> (`aura-mystic-admin/`), which is its own git repository. Its parent folder
> (`Fard-admin/`) is just a containing folder with an unrelated near-empty
> `package.json`/`package-lock.json` and is **not** part of this project — run all
> commands from inside `aura-mystic-admin/`.

---

## 1. Stack & how to run

| Tool | Version | Purpose |
| --- | --- | --- |
| Next.js (App Router) | 14.2.35 | Framework |
| React | 18 | UI |
| TypeScript | 5.x | Type safety (strict, `noEmit`) |
| TailwindCSS | 3.4 | Styling (CSS variables + Vazirmatn font) |
| `@tanstack/react-query` | 5.x | Server state / data fetching |
| `react-hook-form` + `zod` | 7.x / 3.x | Forms & validation |
| `react-hot-toast` | 2.x | Toasts |
| `lucide-react` | 1.x | Icons |
| Tiptap | 3.x | Rich-text editor (used in CMS article body) |

### Install / run / build

```bash
# from inside aura-mystic-admin/
npm install
cp .env.example .env.local      # then set NEXT_PUBLIC_API_URL
npm run dev                     # dev server at http://localhost:3000
npm run build                   # production build (passes — exit 0)
npm run start                   # serve the production build
npx tsc --noEmit                # type check (passes — 0 errors)
npm run lint                    # ESLint
```

### Required environment variables (names only)

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | **Yes** | Base origin of the `fared-backend` REST API. **Every** data call goes here. If unset or unreachable, login fails and no data loads. |

There are no other env vars and no secrets stored in the repo.

---

## 2. Architecture at a glance

- **All UI is Persian (Farsi) + RTL.** `dir="rtl"` on `<html>` ([app/layout.tsx](app/layout.tsx)), sidebar pinned right, numbers/dates via `toLocaleString('fa-IR')`.
- **Data layer talks to a real backend.** Each `lib/services/*` module calls `apiClient` ([lib/api/client.ts](lib/api/client.ts)) against `NEXT_PUBLIC_API_URL`. Pages consume services through React Query — components never import data directly.
- **Auth is cookie-based against the backend.** `apiClient` sends `credentials: "include"` (httpOnly cookie). [middleware.ts](middleware.ts) gates all routes on an `auth-token` cookie and redirects to `/login`. There is **no mock/localStorage auth** — see Known Issues #1.
- **`lib/mock-data/` is dead code.** Nothing imports it (the project was migrated from mock data to the live API). Left in place intentionally so the client retains the original seed data.

> **Bottom line for running it:** this admin panel is a **frontend that requires
> a running `fared-backend`.** Standing it up end-to-end means bringing up that
> backend (with matching endpoints — see §5) and pointing `NEXT_PUBLIC_API_URL` at
> it. Out of the box, with no backend, you can load `/login` but cannot log in.

---

## 3. Implemented vs not (summary)

Legend: ✅ complete · 🟡 partial · 🔵 stub/placeholder · ❌ broken

### Working features (✅, backend-dependent)

| Area | Status | Notes |
| --- | --- | --- |
| Layout / Sidebar / Topbar / Mobile drawer | ✅ | RTL, sidebar right, Farsi, role-aware admin links |
| Login | ✅ | RHF + zod; calls real `/api/auth/login` |
| Dashboard | 🟡 | KPI cards use **hardcoded** numbers; recent orders/leads tables fetch live |
| Products (list / create / edit / detail) | 🟡 | Full CRUD wired; **image upload is a no-op** (see Issues #4) |
| Orders (list / detail / status update) | ✅ | Live; status change wired |
| Customers (list / detail) | ✅ | Live (read-only, as designed) |
| Tours (list / create / edit) | ✅ | Full CRUD |
| Courses (list / create / edit) | ✅ | Full CRUD |
| Mentorship (list / create / edit) | ✅ | Reimplemented as **Sessions + Bookings** (see Deviations) |
| Leads / Messages (list + modal detail) | ✅ | Reimplemented as **Messages** read/unread (see Deviations) |
| Media library (grid / upload / delete) | ✅ | Real multipart upload + delete |
| CMS | ✅ | Reimplemented as a **blog/Articles CRUD** (see Deviations) |
| Settings | 🟡 | Profile + password tabs work; "Site settings" tab is a 🔵 placeholder |
| Admins (list / create / edit-role) | ✅ | SUPER_ADMIN-guarded; **fixed at handoff** (see Changelog) |

### Spec deviations (functional, but differ from the original spec)

These are **working features built differently than the original brief.** They are
not defects, but the client should know the delivered product diverged from the
spec — and that the matching `lib/types/*` for the original shapes are now unused.

1. **CMS** — spec described a single tabbed "site content" editor (hero, featured
   products, crystals, category showcase, badges). **Delivered:** a blog **Articles**
   CRUD (`title`, `slug`, `excerpt`, `category`, rich-text `body`, `published`).
   The spec types `CMSContent`/`HeroCMS`/etc. in [lib/types/cms.ts](lib/types/cms.ts) are unused.
2. **Mentorship** — spec described a `Mentor` profile CRUD. **Delivered:** **Sessions**
   (CRUD) + **Bookings** (status updates). [lib/types/mentor.ts](lib/types/mentor.ts) is unused.
3. **Leads** — spec described leads with status `new/contacted/closed` + source.
   **Delivered:** **Messages** with `read`/`subject` (contact-form style). [lib/types/lead.ts](lib/types/lead.ts) is unused.
4. **Settings** — spec described business/SEO/social/email tabs. **Delivered:**
   Profile + Change-password tabs (both live), plus a "Site settings" tab that is a
   "coming soon" placeholder. The business-settings service functions
   (`getSettings`/`updateSettings`) exist but are **not wired to any page**.
5. **UI libraries** — the original spec forbade component libraries, but `shadcn`,
   `@base-ui/react`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`
   are installed and partially used (the project's `Select`/`Toggle`/`Modal`/`Sheet`
   wrap shadcn primitives). This **works**; removing it is a refactor, intentionally
   left out of the stabilization pass.

---

## 4. Backend API contract (what `fared-backend` must implement)

Response envelope is consistently `{ success: boolean, data: {...} }`.
Auth is via httpOnly cookie (`apiClient` sends `credentials: "include"`; a `401`
triggers a client-side redirect to `/login`). All paths are relative to
`NEXT_PUBLIC_API_URL`.

| Service fn (`lib/services/…`) | Method | Path | Returns (`data.…`) |
| --- | --- | --- | --- |
| **auth** `loginAdmin` | POST | `/api/auth/login` | `{ user }` |
| **auth** `logoutAdmin` | POST | `/api/auth/logout` | — |
| **auth** `getCurrentAdmin` | GET | `/api/auth/me` | `{ user }` |
| **products** `getProducts` | GET | `/api/admin/products?page&limit&search&category&featured` | `{ products, total, page, limit }` |
| **products** `getProductById` | GET | `/api/admin/products/:id` | `{ product }` |
| **products** `createProduct` | POST | `/api/admin/products` | `{ product }` |
| **products** `updateProduct` | PUT | `/api/admin/products/:id` | `{ product }` |
| **products** `deleteProduct` | DELETE | `/api/admin/products/:id` | — |
| **orders** `getOrders` | GET | `/api/admin/orders?page&limit&status&search` | `{ orders, total }` |
| **orders** `getOrderById` | GET | `/api/admin/orders/:id` | `{ order }` |
| **orders** `updateOrderStatus` | PUT | `/api/admin/orders/:id` (body `{ status }`) | `{ order }` |
| **customers** `getCustomers` | GET | `/api/admin/users?page&limit&search` | `{ users, total }` |
| **customers** `getCustomerById` | GET | `/api/admin/users/:id` | `{ user }` |
| **admins** `getAdmins` | GET | `/api/admin/users?role=ADMIN` | `{ users }` |
| **admins** `createAdmin` | POST | `/api/admin/users` | `{ user }` |
| **admins** `updateAdminRole` | PUT | `/api/admin/users/:id` (body `{ role }`) | `{ user }` |
| **admins** `deleteAdmin` | DELETE | `/api/admin/users/:id` | — |
| **tours** `getTours` | GET | `/api/admin/tours?page&limit&search` | `{ tours, total }` |
| **tours** `getTourById` | GET | `/api/admin/tours/:id` | `{ tour }` |
| **tours** `createTour` | POST | `/api/admin/tours` | `{ tour }` |
| **tours** `updateTour` | PUT | `/api/admin/tours/:id` | `{ tour }` |
| **tours** `deleteTour` | DELETE | `/api/admin/tours/:id` | — |
| **courses** `getCourses` | GET | `/api/admin/courses?page&limit&search` | `{ courses, total }` |
| **courses** `getCourseById` | GET | `/api/admin/courses/:id` | `{ course }` |
| **courses** `createCourse` | POST | `/api/admin/courses` | `{ course }` |
| **courses** `updateCourse` | PUT | `/api/admin/courses/:id` | `{ course }` |
| **courses** `deleteCourse` | DELETE | `/api/admin/courses/:id` | — |
| **mentorship** `getSessions` | GET | `/api/admin/sessions?page&limit&search` | `{ sessions, total }` |
| **mentorship** `getSessionById` | GET | `/api/admin/sessions/:id` | `{ session }` |
| **mentorship** `createSession` | POST | `/api/admin/sessions` | `{ session }` |
| **mentorship** `updateSession` | PUT | `/api/admin/sessions/:id` | `{ session }` |
| **mentorship** `deleteSession` | DELETE | `/api/admin/sessions/:id` | — |
| **mentorship** `getBookings` | GET | `/api/admin/bookings?page&limit&status` | `{ bookings, total }` |
| **mentorship** `updateBookingStatus` | PUT | `/api/admin/bookings/:id` (body `{ status }`) | `{ booking }` |
| **leads** `getLeads` | GET | `/api/admin/messages?page&limit&read` | `{ messages, total }` |
| **leads** `getLeadById` | GET | `/api/admin/messages/:id` | `{ message }` |
| **leads** `markAsRead` | PUT | `/api/admin/messages` (body `{ id, read }`) | `{ message }` |
| **cms** `getArticles` | GET | `/api/admin/articles?page&limit&category&published` | `{ articles, total }` |
| **cms** `getArticleById` | GET | `/api/admin/articles/:id` | `{ article }` |
| **cms** `createArticle` | POST | `/api/admin/articles` | `{ article }` |
| **cms** `updateArticle` | PUT | `/api/admin/articles/:id` | `{ article }` |
| **cms** `deleteArticle` | DELETE | `/api/admin/articles/:id` | — |
| **media** `getMedia` | GET | `/api/media?page&limit&type` | `{ items, total }` |
| **media** `uploadMedia` | POST (multipart) | `/api/media/upload` (field `file`) | `{ url, id }` |
| **media** `deleteMedia` | DELETE | `/api/media/:id` | — |
| **settings** `getSettings` | GET | `/api/admin/settings` | `{ settings }` (falls back to mock defaults on error) |
| **settings** `updateSettings` | PUT | `/api/admin/settings` | `{ settings }` (no page calls this yet) |
| **settings** `updatePassword` | PUT | `/api/auth/password` (body `{ currentPassword, newPassword }`) | `message` |
| **settings** `updateProfile` | PUT | `/api/users/me` | (raw) |

**Not from the backend:** `dashboard.getDashboardStats()` returns hardcoded KPI
numbers ([lib/services/dashboard.ts:18](lib/services/dashboard.ts#L18)); only the recent-orders/recent-leads
tables on the dashboard fetch live data.

---

## 5. Known issues (outstanding at handoff)

1. **No backend = no usable app.** There is no offline/mock auth fallback; login
   requires a live `/api/auth/login`. Middleware also expects the backend to set an
   `auth-token` cookie. To demo without the backend, a mock auth layer would need to
   be added (the original `lib/mock-data/` and the mock admin credentials from the
   original spec are a starting point, but are not currently wired).
2. **Dashboard KPIs are hardcoded** (revenue/orders/customers/products counts).
   Needs a real stats endpoint.
3. **Orphaned route:** [app/leads/[id]/page.tsx](app/leads/%5Bid%5D/page.tsx) is a complete lead-detail page,
   but the leads list opens a modal instead of navigating to it — so it's only
   reachable by typing the URL. (Also calls `markAsRead` during render rather than
   in an effect — works, but not idiomatic.) Left in place; decide whether to wire
   or remove.
4. **Product image upload is a no-op.** In product create/edit the `ImageUpload`'s
   `onChange` is `() => {}` ([app/products/create/page.tsx](app/products/create/page.tsx),
   [app/products/[id]/edit/page.tsx](app/products/%5Bid%5D/edit/page.tsx)), so a selected image is never saved to
   the product payload. The media library's own upload works.
5. **`getAdmins` filters `role=ADMIN`** ([lib/services/admins.ts:8](lib/services/admins.ts#L8)) — depending on
   backend semantics this may exclude SUPER_ADMIN/STAFF users from the admins list.
6. **Admin edit only changes role**, not full profile (name/email/password) — per
   how it was built, narrower than the spec's "edit admin".
7. **Settings "Site settings" tab** is a "coming soon" placeholder
   ([app/settings/page.tsx:121](app/settings/page.tsx#L121)).
8. **Dead code / unused types:** `lib/mock-data/*` (9 files, imported nowhere) and
   the spec-shape types in `lib/types/{lead,mentor,cms}.ts` (superseded by inline
   service types). Kept intentionally; safe to delete later if desired.
9. **Forbidden UI deps present** (`shadcn`, `@base-ui/react`, etc.) — see Deviation #5.
10. **`components.json` has `"rtl": false`** and `globals.css` carries a large
    leftover shadcn `oklch` theme block (incl. `.dark`) from `shadcn init`. Cosmetic;
    no runtime effect.

---

## 6. Build / type / test health (at handoff)

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | ✅ Passes, 0 errors. No `any` types in the codebase. |
| `npm run build` | ✅ Passes (exit 0). All 31 routes compile. |
| `npm run lint` | ✅ No errors. (A few `@next/next/no-img-element` **warnings** remain — non-blocking; `<img>` used instead of `next/image`.) |
| Automated tests | ⚠️ None in the repo. No test runner configured. |

> Note on the dev environment: the build initially failed because the machine's
> disk was 100% full (caused `ENOSPC`). The `.next/` and `node_modules/.cache`
> directories were cleared to free space; both regenerate automatically.

---

## 7. External services / accounts the client must own

- **`fared-backend`** — the REST API (separate repo). Must implement the §4
  contract and run at `NEXT_PUBLIC_API_URL`. **Not present in this repo** and needs
  its own audit/handoff pass.
- **Hosting** for the Next.js app (e.g. Vercel or any Node host) — `npm run build`
  + `npm run start`, or a static/serverless deploy.
- **File storage** behind `/api/media/upload` (e.g. S3/Cloudinary/local disk) — the
  admin only calls the endpoint; storage is the backend's responsibility.
- The companion `fared-frontend` (storefront) repo is also separate and out of scope here.

---

## 8. Sibling repositories (not in this handoff)

The platform is three repos: `fared-frontend`, `fared-backend`, `aura-mystic-admin`.
**Only `aura-mystic-admin` was audited/stabilized here.** `fared-backend` and
`fared-frontend` are not present in this workspace and require the same audit pass.
