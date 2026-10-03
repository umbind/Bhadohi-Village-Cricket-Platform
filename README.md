# Bhadohi Village Cricket Platform (`bvcp`)

**Document Status:** Approved Baseline v1  
**Target Locale:** Bhadohi District, Uttar Pradesh, India  
**Target Audience:** Adults 18+  
**Current Phase:** All Phases 0 through 11 Complete - Production Baseline v1 (482 Tests Passed)  

---

## Overview

The **Bhadohi Village Cricket Platform** is a Hindi-first, lightweight, self-service coordination platform designed specifically for rural cricket tournaments in Bhadohi district, Uttar Pradesh. It connects adult players, village team captains, and local tournament organizers without the burden of SMS OTPs, paid registrations, digital scoring, player rankings, or commercial vanity metrics.

---

## Approved Visual Identity

| Token | Hex Value | Application |
|---|---|---|
| **Primary Green** | `#1E7A4C` | Primary buttons, active tabs, header accents |
| **Deep Forest** | `#123B2A` | Desktop sidebar, headers, dark cards |
| **Cream Background** | `#F6F8F3` | Mobile scaffolding, main background |
| **Amber Highlight** | `#F4B942` | Deadlines, pending alerts, urgent notices |
| **Error / Cancel** | `#C74D4D` | Destructive buttons, cancellation banners |
| **Border / Divider**| `#E1E8E1` | Card borders, table dividers |
| **Main Text** | `#172019` | High-contrast typography (Devanagari) |
| **Muted Text** | `#68756C` | Subtitles, secondary timestamps |

---

## Master Documentation Suite

The complete engineering and product specifications are codified in the `docs/` directory:

1. [00-project-brief.md](docs/00-project-brief.md) - Executive summary, target geography, core philosophy, and boundaries.
2. [01-approved-decisions.md](docs/01-approved-decisions.md) - Baseline constraints, PIN auth, visual design rules, and privacy model.
3. [02-assumptions-and-open-questions.md](docs/02-assumptions-and-open-questions.md) - Technical assumptions, ambiguity resolutions, and stakeholder questions.
4. [03-product-requirements.md](docs/03-product-requirements.md) - Detailed functional and non-functional requirements (AUTH, PROF, TOUR, TEAM, SAFE, EXP).
5. [04-user-journeys.md](docs/04-user-journeys.md) - End-to-end Mermaid user journeys for all 4 roles.
6. [05-screen-inventory.md](docs/05-screen-inventory.md) - Complete catalog of 25 mobile screens, organizer desktop views, and universal UI states.
7. [06-business-rules.md](docs/06-business-rules.md) - Server-enforced business rules for users, teams, tournaments, and moderation.
8. [07-role-permission-matrix.md](docs/07-role-permission-matrix.md) - Granular RBAC and ABAC ownership matrix across all operations.
9. [08-data-model.md](docs/08-data-model.md) - PostgreSQL schema, DDL statements, indexing strategy, and explicit omission rules.
10. [10-architecture-options.md](docs/10-architecture-options.md) - Evaluation of Option A vs. Option B, and Architecture Decision Record (ADR-001).
11. [09-api-contract.md](docs/09-api-contract.md) - REST API endpoints, JSON envelopes, request/response payloads, and error codes.
12. [11-security-and-privacy.md](docs/11-security-and-privacy.md) - Bcrypt/Argon2id hashing, lockout rules, mobile number privacy, and audit logging.
13. [12-expiry-and-retention.md](docs/12-expiry-and-retention.md) - 15-day availability expiry, team archival, and 90-day PII scrubbing routines.
14. [13-test-strategy.md](docs/13-test-strategy.md) - Test pyramid: unit, integration, security, negative, and rural 3G network testing.
15. [14-risk-register.md](docs/14-risk-register.md) - Risk assessment matrix, operational mitigations, and monitoring thresholds.
16. [15-phased-delivery-plan.md](docs/15-phased-delivery-plan.md) - Phase-by-phase roadmap (Phases 0 to 11) with effort and complexity ratings.
17. [16-traceability-matrix.md](docs/16-traceability-matrix.md) - Bidirectional requirement traceability matrix connecting requirements to tests.
18. [17-ui-ux-prototype-and-accessibility-audit.md](docs/17-ui-ux-prototype-and-accessibility-audit.md) - Verification and accessibility audit report for Phase 2 prototypes.
19. [18-state-transition-rules.md](docs/18-state-transition-rules.md) - Finite State Machine diagrams and transition guard rules for all entities.
20. [19-backup-and-disaster-recovery.md](docs/19-backup-and-disaster-recovery.md) - RPO (<15m), RTO (<60m), continuous WAL archiving, and disaster recovery runbooks.
21. [20-developer-setup-guide.md](docs/20-developer-setup-guide.md) - Local development guide, monorepo workspaces, db initialization, and git hygiene.
22. [21-controlled-village-pilot-playbook.md](docs/21-controlled-village-pilot-playbook.md) - 4-week rollout schedule across Gyanpur, Aurai, and Suriyawan clusters.
23. [22-on-ground-coordinator-field-kit.md](docs/22-on-ground-coordinator-field-kit.md) - Hindi Devanagari field instructions and printable paper recovery cards.
24. [23-production-readiness-and-deployment-runbook.md](docs/23-production-readiness-and-deployment-runbook.md) - Production architecture, PostgreSQL WAL streaming, systemd cron, and rollback runbooks.

---

## SDLC Phase-Gate Status

```text
[x] Phase 0: Manual Validation (Pilot Protocol Prepared)
[x] Phase 1: Product Documentation (Complete - Baseline v1)
[x] Phase 2: UI/UX Prototypes (Complete - 49/49 Verification Tests Passed)
[x] Phase 3: Architecture & Data Model (Complete - 62/62 Verification Tests Passed)
[x] Phase 4: Repository Setup (Complete - 26/26 Verification Tests Passed)
[x] Phase 5: Authentication & Profile Engine (Complete - 50 Verification Tests Passed)
[x] Phase 6: Tournaments & Teams (Complete - 60 Total Unit & Invariant Tests Passed)
[x] Phase 7: Player Invitations (Complete - 54 Total Unit & Invariant Tests Passed)
[x] Phase 8: Organizer Web Dashboard (Complete - 52 Total Unit & Invariant Tests Passed)
[x] Phase 9: Moderation & Expiry Engine (Complete - 55 Total Unit & Audit Tests Passed)
[x] Phase 10: Automated Testing & Security Verification (Complete - 47 Total Unit & Audit Tests Passed)
[x] Phase 11: Controlled Village Pilot & Production Release (Complete - 27 Total Unit & Audit Tests Passed)
```

*All SDLC Phases 0 through 11 complete: 482 passing tests across all workspaces with zero failures.*

