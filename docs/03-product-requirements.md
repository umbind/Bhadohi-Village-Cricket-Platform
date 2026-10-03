# Product Requirements Document (PRD)

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Target Locale:** Bhadohi District, Uttar Pradesh (Hindi Devanagari Primary)  

---

## 1. Product Goals & Success Criteria

1. **Streamline Local Discovery:** Eliminate pamphlet-based announcements and scattered WhatsApp chains by providing a single, trustworthy calendar of village cricket tournaments across Bhadohi.
2. **Empower Village Captains:** Enable captains to form complete rosters by discovering available local players in nearby villages and sending direct invitations.
3. **Protect User Privacy & Trust:** Safeguard village players from unsolicited marketing calls and spam by strictly masking phone numbers and avoiding public personal directory dumps.
4. **Frictionless Accessibility:** Eliminate complex SMS OTPs, password reset emails, paid payment flows, and digital scoring headaches.

---

## 2. Detailed Functional Requirements

### 2.1 Authentication & Onboarding (AUTH)

* **FR-AUTH-01 (18+ Verification):** During registration, user must check a legally binding confirmation: *"मेरी आयु 18 वर्ष या उससे अधिक है"* before proceeding.
* **FR-AUTH-02 (PIN Registration):** User registers using an Indian 10-digit mobile number, sets a 6-digit numeric PIN, and re-enters the PIN for confirmation.
* **FR-AUTH-03 (PIN Cryptographic Storage):** The system must hash the 6-digit PIN using standard `bcrypt` (work factor 12) or `Argon2id` before saving to database. Plaintext PINs must never be logged or persisted.
* **FR-AUTH-04 (Recovery Code Generation):** Upon registration, the system generates an 8-character unique alphanumeric recovery token (formatted as `XXXX-XXXX`). The plaintext code is displayed strictly once with explicit instructions: *"इस कोड को सुरक्षित लिख लें। यदि आप पिन भूल जाते हैं, तो यह पुनः प्राप्ति का एकमात्र तरीका है।"*
* **FR-AUTH-05 (Recovery Code Storage):** The recovery code is immediately hashed before database persistence. The server never retains or logs the unhashed recovery code.
* **FR-AUTH-06 (Login):** User logs in using their 10-digit mobile number and 6-digit PIN. Successful authentication yields a time-bounded signed session token (JWT/Bearer).
* **FR-AUTH-07 (Brute-Force Lockout):** System tracks failed consecutive login attempts per mobile number. After 5 consecutive failures within 15 minutes, login is locked for 15 minutes. Failed attempts are logged securely.
* **FR-AUTH-08 (Self-Service PIN Reset):** User enters mobile number + plaintext recovery code + new 6-digit PIN. If valid, the new PIN is hashed and saved, the old recovery code is invalidated, and a new recovery code is presented.
* **FR-AUTH-09 (Admin Assisted Recovery):** If recovery code is lost, a platform administrator can initiate an identity verification reset, which creates an immutable record in `AuditLog`.
* **FR-AUTH-10 (Account Deletion):** User can request account deletion in Settings. Upon confirmation with their PIN, all profile availability is immediately removed, and PII is scheduled for permanent purge.

### 2.2 Player Profile & Availability (PROF)

* **FR-PROF-01 (Profile Creation):** User enters Full Name (हिंदी/English), Home Village, Development Block (dropdown: Gyanpur, Aurai, Bhadohi, Suriyawan, Deegh, Abholi), Primary Playing Role (बल्लेबाज / Batsman, गेंदबाज / Bowler, ऑलराउंडर / All-rounder, विकेटकीपर / Wicketkeeper), Batting Style (दाएं हाथ / बाएं हाथ), and Bowling Style (मध्यम तेज, स्पिन, आदि).
* **FR-PROF-02 (Availability Toggle):** Player can mark availability status as "उपलब्ध" (Available) or "अनुपलब्ध" (Not Available).
* **FR-PROF-03 (Availability Window & Expiry):** Player can set availability duration for 15 or 30 days. If not manually refreshed, availability status automatically flips to "अनुपलब्ध" after the period.
* **FR-PROF-04 (Contact Privacy Preference):** Player can toggle: *"कैप्टन को व्हाट्सएप संपर्क की अनुमति दें"* (हाँ / नहीं).

### 2.3 Tournament Management (TOUR)

* **FR-TOUR-01 (Creation Wizard):** Organizers create tournaments via a 4-step wizard:
  1. *Basic Details:* Name, Village/Ground, Block, Start Date, End Date, Organizer Contact Preference.
  2. *Registration Details:* Registration Open Date, Close Date, Max Teams (e.g. 16, 32), Team Size (e.g. 11+4), Ball Type (Tennis / Leather / Cosco), Match Format (Overs).
  3. *Rules & Disclaimer:* Regional eligibility, entry fee information note, tournament rules, offline responsibility disclaimer.
  4. *Review & Publish:* Preview mobile card and publish or save as draft.
* **FR-TOUR-02 (Publishing States):** Status transitions: `DRAFT` -> `PUBLISHED` -> `REGISTRATION_CLOSED` -> `ONGOING` -> `COMPLETED` / `CANCELLED`.
* **FR-TOUR-03 (Discovery & Filtering):** Players and captains can browse tournaments with filters by Block, Start Date range, Ball Type, and Status (`OPEN`, `UPCOMING`).
* **FR-TOUR-04 (Tournament Cancellation):** Organizer can cancel a tournament before completion. Requires entering a mandatory cancellation reason. Immediately moves status to `CANCELLED`, disables applications, and dispatches in-app notifications to all applied captains.
* **FR-TOUR-05 (WhatsApp Share Link):** Every published tournament includes a "व्हाट्सएप पर शेयर करें" button that generates a pre-formatted Hindi WhatsApp message with key dates and a link.

### 2.4 Temporary Team Management & Applications (TEAM)

* **FR-TEAM-01 (Tournament-Bound Team Creation):** A captain creates a team specifically for a published tournament (e.g., "ज्ञानपुर वारियर्स - औराई कप 2026"). Teams are temporary and do not carry over to future tournaments.
* **FR-TEAM-02 (Squad Composition):** Captain adds registered players up to the tournament maximum squad size. Captain is automatically designated member #1.
* **FR-TEAM-03 (Player Search & Invitation):** Captain searches player directory by Block, Role, and Availability. Captain clicks "आमंत्रण भेजें" (Send Invitation).
* **FR-TEAM-04 (Invitation Lifecycle):** Player receives invitation in mobile "Requests" tab with options: "स्वीकार करें" (Accept) or "अस्वीकार करें" (Decline). Status transitions: `PENDING` -> `ACCEPTED` / `DECLINED` / `EXPIRED` / `CANCELLED`.
* **FR-TEAM-05 (Tournament Application Submission):** Once the captain is satisfied with the roster, they submit the team application to the tournament before the registration deadline.
* **FR-TEAM-06 (Application Duplicate Prevention):** The system prevents duplicate applications from the same team or captain for the same tournament.
* **FR-TEAM-07 (Application Review):** Organizer reviews applications in desktop table and marks them as `ACCEPTED`, `REJECTED`, or `PENDING`. Rejection allows entering an optional feedback note.
* **FR-TEAM-08 (Application Withdrawal):** Captain can withdraw their application prior to organizer approval.

### 2.5 Safety, Moderation & Blocking (SAFE)

* **FR-SAFE-01 (Report Content/User):** Any registered user can submit a report against a Player, Team, or Tournament with predefined reasons (फ़र्ज़ी जानकारी / Fake info, दुर्व्यवहार / Misbehavior, अनुचित भाषा / Inappropriate language, अन्य / Other) and an optional note.
* **FR-SAFE-02 (Report Rate-Limiting):** Users are limited to max 5 reports per day to prevent harassment/spam.
* **FR-SAFE-03 (User Blocking):** User A can block User B. User B can no longer search User A, send invitations, or see User A's availability.
* **FR-SAFE-04 (Admin Moderation):** Admin dashboard lists all reports with action buttons: `DISMISS`, `WARN_USER`, `SUSPEND_ACCOUNT`. Suspended accounts are immediately blocked from logging in.
* **FR-SAFE-05 (No Public Shaming):** Reported or flagged users never receive public labels or badges.

### 2.6 Data Expiry & Archival (EXP)

* **FR-EXP-01 (Availability Expiry):** Nightly job sets availability to `FALSE` for records older than their set duration (15/30 days).
* **FR-EXP-02 (Invitation Expiry):** Invitations pending for more than 5 days or past tournament registration close date automatically transition to `EXPIRED`.
* **FR-EXP-03 (Tournament Post-Event Archival):** Completed tournaments are archived. 90 days after tournament completion, all public roster names and contact visibility links are permanently anonymized.

---

## 3. Explicit Out-of-Scope (Non-Negotiable)

1. **No Online Payment Processing:** No payment gateways (Razorpay, Paytm, Cashfree, UPI deep-links, in-app wallets, escrow).
2. **No Live Ball-by-Ball Scoring:** No match scoring engines, over-by-over scorecards, or commentator inputs.
3. **No Performance Analytics or Rankings:** No leaderboards, player runs, wickets, tournament MVPs, player grades, or team win-loss tables.
4. **No Public Social Network Features:** No open comment sections, public feed, likes, shares, open chat rooms, or video uploads.
5. **No SMS/Email OTP Dependency:** Zero SMS gateway integration.
6. **No Multi-Sport Support:** Restricted solely to Cricket.
7. **No Under-18 Registrations:** Strictly adults 18+.
