# Requirements Traceability Matrix (RTM)

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Purpose:** Ensure bidirectional traceability across Functional Requirements, Business Rules, UI Screens, API Endpoints, Database Entities, Test IDs, and Implementation Phases.

---

## 1. Master Traceability Matrix

| Req ID | Requirement Summary | Business Rule | UI Screen | API Endpoint | Database Entity | Test Case ID | Target Phase |
|---|---|---|---|---|---|---|:---:|
| **FR-AUTH-01** | 18+ Age Declaration Gate | BR-USER-03 | SCR-01 | `POST /auth/register` | `User.is_age_verified` | `VAL-AUTH-01` | Phase 5 |
| **FR-AUTH-02** | 10-digit Mobile + 6-digit PIN Registration | BR-USER-01, BR-USER-04 | SCR-02 | `POST /auth/register` | `User.mobile_number`, `User.pin_hash` | `VAL-AUTH-02` | Phase 5 |
| **FR-AUTH-03** | Bcrypt / Argon2id PIN Hashing | BR-USER-04 | SCR-02 | `POST /auth/register` | `User.pin_hash` | `SEC-AUTH-01` | Phase 5 |
| **FR-AUTH-04** | Single-use 8-char Recovery Code Display | BR-USER-06 | SCR-04 | `POST /auth/register` | `User.recovery_code_hash` | `SEC-AUTH-02` | Phase 5 |
| **FR-AUTH-06** | Mobile + PIN Login | BR-USER-01 | SCR-03 | `POST /auth/login` | `User` | `INT-AUTH-01` | Phase 5 |
| **FR-AUTH-07** | Brute-force 5-attempt Lockout | BR-USER-05 | SCR-03 | `POST /auth/login` | `User.failed_login_attempts` | `SEC-AUTH-03` | Phase 5 |
| **FR-AUTH-08** | Self-Service PIN Reset via Recovery Code | BR-USER-06 | SCR-03 | `POST /auth/recover-pin` | `User.pin_hash`, `User.recovery_code_hash` | `INT-AUTH-02` | Phase 5 |
| **FR-AUTH-09** | Admin Assisted Recovery with Audit | BR-USER-06 | Admin Portal | `POST /admin/users/:id/reset-pin` | `User`, `AuditLog` | `SEC-AUTH-04` | Phase 9 |
| **FR-AUTH-10** | User Account Deletion with PIN | BR-USER-07 | SCR-24 | `DELETE /auth/account` | `User`, `PlayerProfile` | `SEC-AUTH-05` | Phase 5 |
| **FR-PROF-01** | Player Profile Details (Role, Styles, Block) | BR-USER-07 | SCR-18 | `PUT /profiles/me` | `PlayerProfile` | `INT-PROF-01` | Phase 5 |
| **FR-PROF-02** | Player Availability Toggle & Duration | BR-EXP-01 | SCR-19 | `PATCH /profiles/me/availability` | `PlayerProfile.is_available` | `INT-PROF-02` | Phase 5 |
| **FR-PROF-04** | Mask Mobile & WhatsApp Contact Option | BR-USER-02 | SCR-18 | `GET /players/:id` | `PlayerProfile.allow_whatsapp_contact` | `SEC-PRIV-01` | Phase 5 |
| **FR-TOUR-01** | Tournament Creation Wizard (Steps 1-4) | BR-TOUR-01 | Web Wizard | `POST /tournaments` | `Tournament` | `INT-TOUR-01` | Phase 6 |
| **FR-TOUR-02** | Tournament Publishing & Status Transitions | BR-TOUR-02 | Web Dashboard | `POST /tournaments/:id/publish` | `Tournament.status` | `UNIT-STAT-01` | Phase 6 |
| **FR-TOUR-03** | Tournament Discovery & Filtering by Block | BR-TOUR-01 | SCR-08, SCR-09 | `GET /tournaments` | `Tournament` | `INT-TOUR-02` | Phase 6 |
| **FR-TOUR-04** | Tournament Cancellation with Mandatory Reason | BR-TOUR-04 | SCR-10, Web | `POST /tournaments/:id/cancel` | `Tournament.cancellation_reason` | `INT-TOUR-03` | Phase 6 |
| **FR-TOUR-05** | WhatsApp Share Link Generation | BR-TOUR-01 | SCR-10 | Client intent | `Tournament` | `UI-SHARE-01` | Phase 6 |
| **FR-TEAM-01** | Temporary Team Formation for Tournament | BR-TEAM-01 | SCR-12 | `POST /tournaments/:id/teams` | `Team` | `INT-TEAM-01` | Phase 6 |
| **FR-TEAM-02** | Team Roster & Capacity Checks | BR-TEAM-04 | SCR-13 | `GET /teams/:id` | `TeamMember` | `UNIT-TEAM-01` | Phase 6 |
| **FR-TEAM-03** | Search Available Players by Block/Role | BR-TEAM-02 | SCR-14 | `GET /players` | `PlayerProfile` | `INT-TEAM-02` | Phase 7 |
| **FR-TEAM-04** | Send Squad Invitation | BR-INV-01 | SCR-15 | `POST /teams/:id/invitations` | `PlayerInvitation` | `INT-INV-01` | Phase 7 |
| **FR-TEAM-05** | Player Accept / Decline Invitation | BR-INV-01, BR-TEAM-05 | SCR-16 | `POST /invitations/:id/respond` | `PlayerInvitation`, `TeamMember` | `INT-INV-02` | Phase 7 |
| **FR-TEAM-06** | Submit Team Application to Tournament | BR-APP-01, BR-APP-02 | SCR-11 | `POST /tournaments/:id/applications` | `TournamentApplication` | `INT-APP-01` | Phase 6 |
| **FR-TEAM-07** | Organizer Review Application (Accept/Reject) | BR-APP-03 | Web Table | `PATCH /applications/:id/review` | `TournamentApplication`, `Notification` | `INT-APP-02` | Phase 8 |
| **FR-TEAM-08** | Captain Withdraw Application | BR-APP-04 | SCR-13 | `POST /applications/:id/withdraw` | `TournamentApplication` | `INT-APP-03` | Phase 6 |
| **FR-SAFE-01** | Report User, Team or Tournament | BR-SAFE-01 | SCR-21 | `POST /reports` | `Report` | `INT-SAFE-01` | Phase 9 |
| **FR-SAFE-02** | Report Quota Throttling (Max 5/day) | BR-SAFE-02 | SCR-21 | `POST /reports` | `Report` | `SEC-SAFE-01` | Phase 9 |
| **FR-SAFE-03** | Mutual User Blocking | BR-SAFE-05 | SCR-22 | `POST /blocks` | `Block` | `SEC-SAFE-02` | Phase 9 |
| **FR-SAFE-04** | Admin Moderation & Account Suspension | BR-SAFE-03 | Admin Portal | `POST /admin/users/:id/suspend` | `User.is_active`, `AuditLog` | `INT-SAFE-02` | Phase 9 |
| **FR-EXP-01** | Automated 15-day Availability Expiry | BR-EXP-01 | Cron Engine | `POST /internal/jobs/run-expiry` | `PlayerProfile`, `ExpiryJob` | `JOB-EXP-01` | Phase 9 |
| **FR-EXP-02** | Automatic Invitation Expiry on Close/5-days | BR-INV-02 | Cron Engine | `POST /internal/jobs/run-expiry` | `PlayerInvitation`, `ExpiryJob` | `JOB-EXP-02` | Phase 9 |
| **FR-EXP-03** | 90-day Post-Tournament PII Scrubbing | BR-EXP-03 | Cron Engine | `POST /internal/jobs/run-expiry` | `TeamMember`, `ExpiryJob` | `JOB-EXP-03` | Phase 9 |

---

## 2. Verification Protocol

Every requirement is mapped directly to an automated integration test, a specific UI screen, and a distinct backend endpoint. During Phase 10 verification, all test IDs listed in this matrix must be executed and reported with 100% passing status.
