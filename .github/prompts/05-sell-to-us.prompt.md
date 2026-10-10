---
mode: agent
description: Build the Sell to Us quote journey
---

Build the **Sell to Us** page at /sell-to-us (Gold Depot channel). Quote request only, no instant payout. Follow .github/copilot-instructions.md.

1. H1 "Sell to Us" with the subline "A private, transparent route to sell your gold and silver."
2. How it works, four steps: Request a quote, Bring your metal for inspection, Testing and valuation, Settlement [PENDING LEGAL REVIEW].
3. What we buy: Gold bars and coins, Silver bars and coins, Scrap gold and jewellery, Scrap silver, each noting what to bring.
4. Indicative value calculator: metal, item type, weight, unit (g, oz, kg, tola), purity (Karat or fineness dropdown including "Not sure"). Use the live price and a placeholder buy-back percentage [PENDING CLIENT: buy-back rate]. Label it "Indicative only. Final value is confirmed after inspection and testing." If the feed is stale, hide the value and show "Live pricing unavailable".
5. Four-step quote wizard with a progress bar, Back/Next and preserved state:
   - Item details (metal, type, estimated weight, purity, quantity, up to 5 photos, images under 5 MB).
   - Your details (name, email, phone, country, preferred contact method).
   - Preferred route: visit by appointment (date and time slots from appointmentService, no past dates) or insured shipping [PENDING CLIENT].
   - Review and consent (accuracy confirmation, privacy notice, acknowledgement that identity verification may be required).
   - Success page with a reference like SQ-YYYYMMDD-XXXX and "what happens next".
6. What to bring checklist, FAQ accordion (at least 6 questions), and a disclaimer about identity verification, source-of-funds checks and no instant payouts.

Save a wizard draft to localStorage (never the photos) with a "Clear draft" link. Validate per step with Zod. Add tests for the calculator and validation. Run build, lint, typecheck and tests. Commit "feat: sell to us".
