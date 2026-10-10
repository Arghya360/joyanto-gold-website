---
mode: agent
description: Build the Contact page and appointment booking
---

Build the **Contact** page at /contact. Follow .github/copilot-instructions.md.

1. H1 "Contact" with the subline "Speak to a member of our private-client team."
2. Contact cards: Phone, Email, WhatsApp, Address, Opening hours, all [PENDING CLIENT]. Add an "Open now / Closed" indicator computed from an hours constant in Dubai time (UTC+4) regardless of the visitor's timezone.
3. Contact form: name, email, phone, country, enquiry type (General, Buying, Selling, Storage, MC Reserve, Private Assets, Corporate gifting, Dubai Collection, Complaint), message with minimum length and character counter, preferred contact method, consent checkbox. Include a honeypot field, client-side rate limiting, and success (with reference number) and error states.
4. Private appointment booking: date picker, time slots from appointmentService, purpose dropdown, in-person or video, confirmation summary, and an "Add to calendar" .ics download. Block unavailable slots.
5. Map block: a static placeholder, plus an iframe that loads only after the visitor clicks "Load map". Address is a placeholder.
6. Quick links to Sell to Us, Storage, MC Reserve. Complaints note [PENDING LEGAL REVIEW].

Tests: form validation, open-now logic, slot blocking. Run build, lint, typecheck and tests. Commit "feat: contact page".
