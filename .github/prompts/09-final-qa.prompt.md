---
mode: agent
description: Final QA, accessibility, and placeholder report
---

Run a final quality pass on the seven pages. Follow .github/copilot-instructions.md.

1. Run build, lint, typecheck and all tests. Fix every failure.
2. Check every navbar and footer link, and confirm there are no 404s or console errors.
3. Review each page for: one H1, SEO title and description, keyboard navigation, visible focus, labelled inputs, AA contrast, reduced-motion support, and layout at 360, 390, 768, 1024, 1280 and 1536 px.
4. Verify the stale-price rule works on Live Prices, Catalogue, Sell to Us, and the ticker (use `?feed=fail`).
5. Run `git diff` against the pre-work commit and confirm no existing page was restyled or refactored. Revert any accidental style change.
6. Complete `docs/PLACEHOLDERS.md` with every [PENDING CLIENT] and [PENDING LEGAL REVIEW] item and the file where it appears.
7. Write a summary: changes by file, which services are mocked and how to swap each for a real API, and what I still need to provide (contact details, address, licences, fee schedule, buy-back rate, product specs, images, legal text).
