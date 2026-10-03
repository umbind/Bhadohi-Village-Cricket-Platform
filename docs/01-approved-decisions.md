# Approved Baseline Decisions: Bhadohi Village Cricket Platform

**Document Status:** Approved Baseline v1  
**Authority:** Master SDLC Specification v1  

---

## 1. Scope and Geographic Boundaries

1. **Target Region:** Bhadohi District, Uttar Pradesh only. Cross-district expansion is deferred to future releases.
2. **Sport Focus:** Cricket only. Multi-sport architecture is strictly disallowed in MVP.
3. **User Eligibility:** Adults aged 18 and older. Under-18 registration is explicitly prohibited and gated by a mandatory legal declaration at registration.
4. **Offline Operations Boundary:** Ground preparation, ball procurement, umpiring, scoring, match disputes, travel, food, and cash prizes remain strictly offline. The software is purely an administrative coordination layer.

---

## 2. Authentication and Identity Decisions

1. **No SMS OTP / No Email OTP:**
   - SMS OTP was eliminated due to telecommunication costs, DLT registration overhead, delivery latency in rural UP, gateway downtime, and phone spoofing complications.
   - Email is rarely utilized by rural village players and introduces unnecessary onboarding barriers.
2. **PIN-Based Authentication:**
   - Registration requires Mobile Number (10 digits) + 6-digit numeric PIN + PIN confirmation.
   - System generates a single-use 8-character alphanumeric **Recovery Code** shown strictly once during registration.
   - Passwords and PINs are hashed using industry-standard hashing (`bcrypt` with cost factor 12 or `Argon2id`).
   - Recovery codes are stored strictly in hashed format. Plaintext recovery codes are never stored or logged.
3. **Account Recovery Protocol:**
   - Self-service recovery requires: Mobile Number + Plaintext Recovery Code -> Set new 6-digit PIN -> Invalidate old recovery code -> Generate and display new recovery code.
   - Admin-assisted recovery is permitted only under strict procedural verification and must generate an immutable, audited entry in `AuditLog`.
4. **Brute Force & Rate Limiting:**
   - Max 5 failed PIN attempts per mobile number within 15 minutes leads to a progressive lock (15 minutes initial lock, 1 hour on repeated violation).
   - Global API rate limiting applied to authentication endpoints (e.g., 10 requests per minute per IP).

---

## 3. Privacy and Data Protection

1. **Mobile Number Non-Exposure:**
   - Mobile numbers are private login identifiers and shall **never** be rendered in public views, search results, or public tournament listings.
   - Contact between captains and players occurs via opt-in WhatsApp redirect buttons (`https://wa.me/...`) only after explicit invitation or player opt-in permission.
2. **Zero Permanent History & Zero Vanity Metrics:**
   - No career statistics (runs, wickets, strike rate, economy).
   - No player rankings, MVP badges, or team rating scores.
   - No historical win/loss tallies.
   - Teams are ephemeral: created for a single tournament and automatically archived upon tournament completion.

---

## 4. Visual Design & Interface Standards

1. **Design Palette:**
   - Primary Green: `#1E7A4C` (actions, navigation highlights, primary buttons)
   - Deep Forest: `#123B2A` (desktop sidebar, headers, high-contrast badges)
   - Cream Background: `#F6F8F3` (scaffolding background, cards)
   - Amber Highlight: `#F4B942` (warnings, urgent deadlines, pending badges)
   - Main Text: `#172019` (high-contrast typography)
   - Muted Text: `#68756C` (secondary subtitles, timestamps)
   - Error/Cancel: `#C74D4D` (destructive buttons, error states)
   - Border: `#E1E8E1` (card outlines, table dividers)
2. **Typography & Accessibility:**
   - Primary typeface: `Noto Sans Devanagari` for Hindi, `Noto Sans` for English.
   - Font scale minimum: 14sp for body text, 16sp for input labels, 18sp for buttons.
   - Minimum touch target: `48x48 dp` on all interactive mobile components.
   - Icons must always be accompanied by descriptive text labels (no ambiguous icon-only buttons).
   - Status must never be conveyed by color alone; must include textual state pills (e.g., "स्वीकृत" / "Approved").

---

## 5. Architectural & Governance Decisions

1. **Dual Interface Model:**
   - Mobile: Flutter Android app targeting Android 8.0 (API 26) through modern versions.
   - Web: Responsive desktop web dashboard for organizers and administrators.
2. **Server-Side Authorization & Enforcement:**
   - Every state transition, permission check, and deadline evaluation must execute on the backend server.
   - The client UI is purely a presentation layer.
3. **Data Retention & Expiry:**
   - Player availability expires automatically after 15 or 30 days unless explicitly renewed.
   - Tournament public rosters and contact details are automatically anonymized/scrubbed 90 days post-tournament conclusion.
4. **Phase-Gate Software Delivery:**
   - Implementation is strictly compartmentalized across phased gates. No application code may be written until documentation is reviewed and approved.
