---
mode: agent
description: Build the Storage page
---

Build the **Storage** page at /storage. Follow .github/copilot-instructions.md.

1. H1 "Storage" with the subline "Secure options for your physical metal."
2. Three option cards: Delivered to you (insured courier), Collect in Dubai (private appointment), Stored in Dubai (depository). Each has a short description, who it suits, and a "Learn more" expander.
3. Comparison table across the three options: where it is held, access, insurance [PENDING LEGAL REVIEW], fees [PENDING CLIENT], ownership structure [PENDING LEGAL REVIEW], records in MC Reserve.
4. A four-step timeline: Purchase, Allocation, Secure holding, Access or sale.
5. Storage fee estimator: metal, total weight, years. Use one clearly labelled placeholder rate in a config constant [PENDING CLIENT: fee schedule]. Always display "Illustrative estimate only."
6. "Your records" section describing documents available in MC Reserve, with a sign-in CTA.
7. FAQ accordion with at least 8 questions (collection, selling stored metal, insurance, ownership, access). Unknown answers use placeholders.
8. Storage enquiry form: name, email, phone (international format), country, metal, approximate value band (dropdown), preferred option, message, consent checkbox. Validate with Zod, submit via storageService.submitEnquiry, block double submission, show success with a reference number and an error state.
9. Disclaimer that storage terms are subject to final terms [PENDING LEGAL REVIEW].

Add tests for the estimator and form validation. Run build, lint, typecheck and tests. Commit "feat: storage page".
