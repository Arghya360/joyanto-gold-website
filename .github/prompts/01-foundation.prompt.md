---
mode: agent
description: Routes, navbar, footer, shared components, mock services, content files
---

Using the approved plan in docs/PLAN.md, build the foundation. Follow .github/copilot-instructions.md.

1. **Routes (lazy-loaded):** /live-prices, /catalogue, /catalogue/:slug, /storage, /mc-reserve, /mc-reserve/*, /sell-to-us, /about, /contact, and a 404 page in the existing style. Each page can be a minimal shell for now with its H1 and SEO tags.
2. **Navbar:** add only the missing items, in this order: Live Prices, Catalogue, Storage, MC Reserve, Sell to Us, About, Contact. Keep existing items and styling. Add active-link state with aria-current="page", keyboard access, and the existing mobile menu behaviour (if none, a drawer with focus trap and Escape to close). MC Reserve shows "Sign in" when logged out and "My Account" when logged in. Mirror the same links in the footer.
3. **Global price ticker bar:** Gold, Silver, Platinum, Palladium in the selected currency with last-updated time and an up/down indicator, using the shared prices service.
4. **Currency selector:** AED (default), USD, EUR, GBP, INR, SAR. Persist to localStorage.
5. **Services (typed interfaces plus mock implementations):** pricesService, catalogueService, storageService, authService, reserveService, sellQuoteService, contactService, appointmentService. Simulate 300 to 800 ms latency.
6. **Pure pricing library** `src/lib/pricing.ts` with `computeSellPrice({ spotPerGram, fineWeightGrams, premium, delivery, insurance, taxes })` and a staleness helper. Unit test both.
7. **Shared components** (reuse existing ones first): status chip, skeleton, empty state, error state with retry, FAQ accordion, stepper/wizard, modal, toast, section header, CTA band, file uploader (type and size limits), date and time-slot picker.
8. Create `docs/PLACEHOLDERS.md` and `docs/ASSUMPTIONS.md`.

Run build, lint, typecheck and tests. Commit with "feat: foundation for seven pages".
