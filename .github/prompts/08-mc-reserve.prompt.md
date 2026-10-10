---
mode: agent
description: Build MC Reserve (auth plus private client dashboard)
---

Build **MC Reserve** at /mc-reserve. It should feel quieter than the shop, like a private-bank lounge. Release One only. Follow .github/copilot-instructions.md.

Logged-out state:
- H1 "MC Reserve", a short explanation, three benefit cards (Documents in one place, Order and delivery tracking, Asset records), and tabs for Sign in, Create account, Forgot password.
- Zod validation: email, password (min 12 characters with a strength meter), confirm password, terms consent. Add an optional mock TOTP second step.
- authService mock keeps a session in memory and sessionStorage and exposes `useAuth()`. Protect /mc-reserve/* and redirect with a return URL.

Logged-in dashboard at /mc-reserve/dashboard with a sidebar (collapses to a top or bottom nav on mobile):
1. Overview: greeting, tiles (Orders, Documents, Owned products, Open requests), and "Total purchase value" labelled purchase value, never market value. Note: "Indicative valuations are not shown in this release."
2. Orders: table with number, date, items, status chip, total. Detail view with a timeline: Quoted, Price locked, Awaiting payment, Payment received, Sourcing, Packed, Dispatched, Delivered or Collected. Also handle On hold (compliance review), Expired, Cancelled.
3. Documents vault: type filter (Invoice, Certificate, Dispatch record, Other), search, sort by date, preview and mock PDF download, empty state.
4. Owned products: name, weight, fineness, serial [PENDING CLIENT], purchase date, purchase price, storage status.
5. Asset records (MC Asset Passport layout): add form with asset name, category, description, acquisition date and price, evidence upload (type and size checked), notes. Detail page with Asset, Evidence, History sections.
6. Service requests: Sell/Buy-back, Delivery or collection, Storage enquiry forms, plus a list with statuses.
7. Account settings: profile, change password, MFA toggle (mock), notification preferences, sign out, "Download my data" and "Delete account request" with confirmation modals.

Data and safety:
- reserveService returns data for the logged-in user only. Seed demo data for demo@montaguecole.example, clearly labelled "Demo data". Add a unit test proving one user cannot read another's data.
- Auto sign-out after 15 minutes of inactivity, with a warning modal.
- No real-time valuation or custody claims. Mark the route noindex.
- Each tab needs loading, empty and error states.

Run build, lint, typecheck and tests. Commit "feat: mc reserve".
