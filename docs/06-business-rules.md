# Core Business Rules (BR)

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Enforcement Authority:** Backend API Server (Server-Side Validation Mandatory)  

---

## 1. Identity & Account Rules (BR-USER)

* **BR-USER-01 (Single Account Constraint):** Each Indian 10-digit mobile number can be associated with exactly one user account.
* **BR-USER-02 (Mobile Number Confidentiality):** Mobile numbers are private credentials and must never be transmitted in public API responses or displayed in public rosters or search results.
* **BR-USER-03 (Age Eligibility Enforcement):** Registration requires explicit confirmation of 18+ age. Accounts identified as belonging to minors are immediately suspended.
* **BR-USER-04 (PIN Integrity):** PIN must consist of exactly 6 numeric digits (`^[0-9]{6}$`). PINs are hashed using `bcrypt` (cost 12) or `Argon2id`.
* **BR-USER-05 (Authentication Rate-Limiting):** 5 consecutive failed PIN attempts for an account triggers an automatic 15-minute lockout. Repeated lockouts escalate to 1 hour.
* **BR-USER-06 (Recovery Code Lifecycle):** An 8-character uppercase alphanumeric recovery code is generated at registration, hashed for storage, displayed strictly once, and invalidated immediately upon first successful recovery use.
* **BR-USER-07 (Profile Ownership):** A player can update only their own profile. Cross-account edits are blocked at the database authorization layer.

---

## 2. Temporary Teams & Squad Management (BR-TEAM)

* **BR-TEAM-01 (Tournament Binding):** A team is an ephemeral entity created specifically for a single tournament. Teams cannot be repurposed across multiple tournaments.
* **BR-TEAM-02 (Captain Ownership):** Only the creator (captain) of a team can edit its name, village, invite members, or submit tournament applications.
* **BR-TEAM-03 (Captain Roster Placement):** The captain is automatically designated as Squad Member #1 with role `CAPTAIN`.
* **BR-TEAM-04 (Squad Capacity Constraints):** A team roster cannot exceed the tournament's declared `max_squad_size` (default 15 players).
* **BR-TEAM-05 (Voluntary Participation):** A player cannot be added to a team roster without sending an invitation and receiving an explicit `ACCEPTED` status from the player.
* **BR-TEAM-06 (No Final Match Selection Guarantee):** Acceptance of an invitation places a player on the tournament squad, but does not legally guarantee selection in the playing XI for specific matches. This offline responsibility remains with the captain.
* **BR-TEAM-07 (Offline Logistics Disclaimer):** The team captain remains solely responsible for offline coordination, transport, kit, refreshments, and entry fees.

---

## 3. Tournament Lifecycle & Management (BR-TOUR)

* **BR-TOUR-01 (Organizer Ownership):** Only the creator of a tournament can edit tournament details, update statuses, or review applications.
* **BR-TOUR-02 (State Transitions):** A tournament follows a strict unidirectional state machine:
  $$\text{DRAFT} \longrightarrow \text{PUBLISHED} \longrightarrow \text{REGISTRATION\_CLOSED} \longrightarrow \text{COMPLETED}$$
  A tournament may transition from `PUBLISHED` or `REGISTRATION_CLOSED` to `CANCELLED` at any point prior to completion.
* **BR-TOUR-03 (Registration Deadline Cut-off):** When the current timestamp exceeds `registration_close_date`, the system automatically changes state to `REGISTRATION_CLOSED`. No new applications can be created.
* **BR-TOUR-04 (Cancellation Safeguards):** Cancelling a tournament requires entering a mandatory text reason (minimum 10 characters). Cancelling automatically rejects pending applications and dispatches in-app notifications to all applied captains.
* **BR-TOUR-05 (Non-Financial Entry Fee Notice):** Entry fee information is strictly informational plain text. The system must not process, record, or track payments.

---

## 4. Team Applications & Invitations (BR-APP & BR-INV)

* **BR-APP-01 (Application Prerequisite):** A captain cannot submit an application to a tournament unless the team has reached the tournament's `min_squad_size` (default 11 accepted players).
* **BR-APP-02 (Duplicate Application Prevention):** A team or captain cannot submit more than one application to the same tournament.
* **BR-APP-03 (Application Review Outcomes):** An organizer can mark a pending application as `ACCEPTED` or `REJECTED`. Rejections support an optional text feedback note.
* **BR-APP-04 (Captain Withdrawal):** A captain can withdraw a team application while its status is `PENDING`. Once `ACCEPTED` or `REJECTED`, it cannot be withdrawn.
* **BR-INV-01 (Invitation State Flow):** Invitations follow: `PENDING` -> `ACCEPTED` / `DECLINED` / `CANCELLED` / `EXPIRED`.
* **BR-INV-02 (Automatic Invitation Expiry):** Invitations automatically expire if unaccepted after 5 calendar days or immediately upon the tournament's registration closing.
* **BR-INV-03 (Player Squad Limit):** A player cannot accept invitations to two different teams in the **same** tournament.

---

## 5. Safety, Moderation & Privacy (BR-SAFE)

* **BR-SAFE-01 (Report Submission Criteria):** A registered user can report another user, team, or tournament by specifying a mandatory category and optional details.
* **BR-SAFE-02 (Report Throttling):** A user may submit a maximum of 5 reports per rolling 24-hour period.
* **BR-SAFE-03 (No Automated Deletions):** Reports do not automatically delete teams or ban users. All punitive actions require administrator evaluation.
* **BR-SAFE-04 (No Public Shaming):** Flagged, reported, or under-review entities must never be tagged with public shame banners or warning badges.
* **BR-SAFE-05 (Mutual Blocking):** When User A blocks User B:
  - User B cannot view User A's profile.
  - User B cannot send invitations to User A.
  - User B cannot see User A in player search results.
  - Neither user can interact with the other across teams.

---

## 6. Retention, Expiry & Archival (BR-EXP)

* **BR-EXP-01 (Availability Invalidation):** Player availability automatically expires 15 days (or 30 days if selected) from the last update timestamp.
* **BR-EXP-02 (Post-Tournament Team Archival):** When a tournament is marked `COMPLETED` or reaches 7 days past its `end_date`, all linked teams are marked `ARCHIVED`.
* **BR-EXP-03 (90-Day PII Scrubbing):** Exactly 90 days after tournament completion, public team rosters are scrubbed: player names in archived team rosters are anonymized, and WhatsApp contact links are severed.
* **BR-EXP-04 (Player Profile Retention):** Player profiles remain intact after team archival, allowing players to participate in future tournaments without re-registering.
