---
mode: agent
description: Build the Live Prices page
---

Build the **Live Prices** page at /live-prices. Follow .github/copilot-instructions.md.

Layout, top to bottom:
1. H1 "Live Prices" with the subline "Gold, silver, platinum and palladium, updated continuously."
2. Four metal cards (Gold, Silver, Platinum, Palladium): price per troy oz and per gram in the selected currency, 24h change in amount and percent (arrows and +/- signs, never colour alone), a sparkline, and a last-updated timestamp.
3. An interactive price chart for the selected metal with range tabs 1D, 1W, 1M, 3M, 1Y. Use the charting library already in the project (else Recharts). Tooltip on hover and tap, keyboard-accessible tabs.
4. Unit converter: weight in g, oz, kg or tola plus metal, outputs indicative metal value in the selected currency. Validate numeric input.
5. Feed-health chip: "Live", "Delayed", "Indicative only", with a tooltip explaining each.
6. "How our price is built": a five-step formula row (live metal value + product premium + delivery + insurance + taxes) with one-line explanations.
7. Disclaimer: prices are indicative until an order is confirmed and price-locked, prices can go down as well as up, not investment advice.
8. CTAs: "Browse the Catalogue" and "Request a private quote".

Behaviour:
- Poll pricesService every 5 to 10 seconds. Pause when the tab is hidden and resume on focus.
- Mock FX: AED fixed at 3.6725 per USD, other rates mocked and flagged in docs/PLACEHOLDERS.md.
- Staleness: if the last update is older than the threshold, every card switches to "Indicative" and a banner reads "Live pricing is temporarily unavailable. Prices shown are indicative and purchasing is paused."
- Support a dev-only `?feed=fail` query param to demo the fallback.
- Price changes animate with a brief highlight fade and no layout shift.
- States: skeletons, error with retry, stale, offline.

Add unit tests for staleness and conversion. Run build, lint, typecheck and tests. Commit "feat: live prices page".
