# Neighborhood Carpooling Platform — Build Plan

Frontend-only React prototype with mock data, generated flat illustrations, and a full 9-page flow suitable for a Smart City hackathon demo.

## Design System

- **Fonts:** Inter (via `@fontsource-variable/inter`), loaded in `src/styles.css`.
- **Colors** (added to `src/styles.css` as OKLCH tokens):
  - `--primary` #2563EB (blue), `--secondary` #22C55E (green), `--accent` #F97316 (orange)
  - Light backgrounds, soft blue tinted surfaces for verification pages
- **Radius:** 16px on cards/buttons (`--radius: 1rem`)
- **Shadows:** soft elevated shadow token `--shadow-card` and `--shadow-hover`
- **Motion:** subtle hover lift + fade-in on cards (Tailwind transitions, no heavy animation)
- Status badge variants: pending (amber), verified (green), rejected (red)

## Routes (TanStack Start)

```
src/routes/
  __root.tsx              → Navbar + Footer shell (hidden on /auth)
  index.tsx               → Landing page
  auth.tsx                → Login / Register (tabs) + Forgot Password
  dashboard.tsx           → Post-login home
  find-ride.tsx           → Search + ride cards
  offer-ride.tsx          → Verification gate → form OR "Become Verified" page
  bookings.tsx            → My Bookings
  profile.tsx             → User info, ratings, ride history
  verification.tsx        → 4-step driver verification wizard
  admin.tsx               → Admin dashboard to approve/reject drivers
```

Each route sets its own `head()` metadata (title/description/og).

## Mock Data & State

- `src/lib/mock-data.ts` — rides, drivers, bookings, users, verification submissions
- `src/lib/store.ts` — Zustand store (or React Context) for: current user, auth state, verification status, bookings, admin queue. Persists to `localStorage` so the demo survives refresh.
- Seed 6–8 rides, 3 sample bookings, 2 pending verification submissions for the admin view.

## Page Details

**1. Landing** — Hero with generated illustration, two CTAs (Find Ride / Offer Ride), 4 feature cards (Verified Drivers, Secure Booking, Community, Eco Friendly), 3-step "How it Works", 3 testimonials, footer.

**2. Auth** — Card with Sign In / Sign Up tabs, Forgot Password link. "Sign in" seeds a mock logged-in user.

**3. Dashboard** — Welcome header, quick search card, Offer Ride CTA, upcoming ride card, recent bookings list, 4 stat tiles (rides taken, offered, CO₂ saved, money saved).

**4. Find a Ride** — Search bar (pickup/destination/date/time) + filterable ride cards with driver photo, verified badge, rating, vehicle, seats, price, departure, Book button → confirmation modal.

**5. Offer a Ride** — Gate:
- If `user.driverStatus !== "verified"` → **Become a Verified Driver** page (hero illustration, 4 trust cards, required documents list, 3-step timeline, "Start Verification" → `/verification`).
- If verified → ride creation form (pickup, destination, date, time, vehicle, seats, price) → Publish.

**6. My Bookings** — Tabbed (Upcoming / Past / Cancelled) card list with View Details modal and Cancel action.

**7. Profile** — Avatar, info, driver verification status card, ratings summary, ride history list, Edit Profile modal.

**8. Verification** — 4-step wizard with progress indicator:
- Step 1: Personal details
- Step 2: DL front/back drag-and-drop upload with previews
- Step 3: Vehicle details + RC + optional insurance
- Step 4: Gov ID + selfie + confirmation checkbox
- Review & Submit → confirmation screen (Pending Review, 24–48h note, reassurance message)
Files stored as base64 data URLs in localStorage for demo.

**9. Admin Dashboard** — Table of pending verifications with document previews, Approve / Reject (with feedback text) buttons. Approving flips the user's `driverStatus` to `verified` so Offer Ride unlocks. Access via `/admin` (no auth gate in demo — link in footer).

## Reusable Components

`src/components/`:
- `Navbar.tsx`, `Footer.tsx`
- `RideCard.tsx`, `BookingCard.tsx`, `FeatureCard.tsx`, `StatCard.tsx`, `TestimonialCard.tsx`
- `StatusBadge.tsx` (pending/verified/rejected)
- `SearchBar.tsx`, `FileUpload.tsx` (drag-and-drop with preview)
- `StepIndicator.tsx` (verification progress)
- `TrustCard.tsx`, `EmptyState.tsx`
- Reuses shadcn: Button, Card, Input, Label, Tabs, Dialog, Select, Checkbox, Textarea, Avatar, Badge, Sonner (toasts)

## Generated Illustrations

Using `imagegen--generate_image` (fast tier, flat vector style, transparent PNG where needed):
1. Landing hero — diverse people carpooling in a car, flat illustration, blue/green/orange palette
2. Verification hero — verified driver with checkmark badge, same style
3. Empty-state illustration for no bookings / no rides found

Saved to `src/assets/`, imported as ES6 modules.

## Navigation

Top navbar (sticky, soft shadow on scroll): Logo, Home, Find Ride, Offer Ride, My Bookings, Profile avatar dropdown (Profile / Admin / Logout). Mobile: hamburger sheet. Hidden on `/auth`.

## Out of Scope (per your answers)

- No Lovable Cloud / real auth / real database
- No Stripe or payment processing
- No email sending / real file uploads to storage

## Technical Notes

- Fonts: `bun add @fontsource-variable/inter`, then `@import "@fontsource-variable/inter";` at top of `src/styles.css`.
- All colors via semantic tokens in `@theme inline` — no hardcoded hex in components.
- Route paths for `<Link to>` are typed; no `<a href>` for internal nav.
- `<Outlet />` in `__root.tsx` renders all routes; navbar conditionally hides on `/auth`.
- localStorage persistence lets the demo flow (register → verify → admin approve → offer ride) work end-to-end without a backend.
