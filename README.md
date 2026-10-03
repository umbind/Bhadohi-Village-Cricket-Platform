# भदोही ग्रामीण क्रिकेट प्लेटफ़ॉर्म (`bvcp`)
### Bhadohi Village Cricket Platform

[![CI](https://github.com/umbind/Bhadohi-Village-Cricket-Platform/actions/workflows/ci.yml/badge.svg)](https://github.com/umbind/Bhadohi-Village-Cricket-Platform/actions)
[![Release](https://img.shields.io/badge/Release-v1.0.0--pilot-F4B942.svg)](https://github.com/umbind/Bhadohi-Village-Cricket-Platform/releases/tag/v1.0.0-pilot)
[![Tests](https://img.shields.io/badge/Automated%20Tests-482%20Passed-1E7A4C.svg)](scripts/)
[![District](https://img.shields.io/badge/District-Bhadohi%20(6%20Blocks)-123B2A.svg)](docs/00-project-brief.md)
[![Language](https://img.shields.io/badge/Language-Hindi%20(हिन्दी--प्रथम)-1E7A4C.svg)](docs/01-approved-decisions.md)
[![Age Verification](https://img.shields.io/badge/Eligibility-18%2B%20Adults%20Only-C74D4D.svg)](docs/06-business-rules.md)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Masked%20Mobile-1E7A4C.svg)](docs/11-security-and-privacy.md)

---

## 📖 परिचय (Overview)

The **Bhadohi Village Cricket Platform (BVCP)** is a Hindi-first, self-service operational coordination platform designed specifically for rural tennis-ball cricket tournaments across **Bhadohi district (Sant Ravidas Nagar), Uttar Pradesh**, covering all 6 administrative blocks:
* **ज्ञानपुर (Gyanpur)**
* **औराई (Aurai)**
* **भदोही (Bhadohi)**
* **सुरियावां (Suriyawan)**
* **डीघ (Deegh)**
* **अभोली (Abholi)**

The platform provides a simple, fraud-resistant workflow for adult players, team captains, and tournament organizers without the burden of external SMS OTPs, paid registrations, digital scoring disputes, or commercial vanity metrics.

---

## 🚫 कड़े निषेध नियम (Universal Negative Invariants)

The platform is strictly bounded by permanent architectural negative invariants:

| Feature / Behavior | Platform Status | Rationale |
| :--- | :--- | :--- |
| **SMS / Email OTP** | ❌ **Strictly Prohibited** | Telecom network drops in rural UP cause high drop-off. Authentication uses 6-digit PIN + physical recovery code. |
| **Ball-by-Ball Live Scoring** | ❌ **Strictly Prohibited** | On-ground disputes over runs/boundaries lead to conflict. Scoring remains strictly physical on ground. |
| **Individual Career Stats** | ❌ **Strictly Prohibited** | Zero runs, wickets, strike rate, or bowling averages. Prevents vanity metrics, ego battles, and poaching. |
| **Points Tables & Rankings** | ❌ **Strictly Prohibited** | Eliminates algorithmic ranking debates and maintains village camaraderie. |
| **In-App Payments / Wallets** | ❌ **Strictly Prohibited** | Zero UPI gateways, zero escrow. Entry fees are strictly cash on ground (`₹500 प्रति टीम - मैदान पर नकद`). |
| **Public Chat & Comments** | ❌ **Strictly Prohibited** | Eliminates online harassment. Team coordination uses direct opt-in WhatsApp links (`wa.me/91...`). |
| **Under-18 Registrations** | ❌ **Strictly Prohibited** | Platform is exclusively for adults (18+). Under-age registrations are blocked at registration. |

---

## 🎨 स्वीकृत रंग योजना (Approved Design Tokens)

| Token | Hex Code | Visual Preview | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Green** | `#1E7A4C` | <img src="https://via.placeholder.com/15/1E7A4C/000000?text=+" width="15" height="15" /> `1E7A4C` | Buttons, active navigation tabs, action badges |
| **Deep Forest** | `#123B2A` | <img src="https://via.placeholder.com/15/123B2A/000000?text=+" width="15" height="15" /> `123B2A` | Headers, desktop sidebar, dark container cards |
| **Amber Highlight** | `#F4B942` | <img src="https://via.placeholder.com/15/F4B942/000000?text=+" width="15" height="15" /> `F4B942` | Alerts, deadlines, badges, cash notice highlight |
| **Cream Background** | `#F6F8F3` | <img src="https://via.placeholder.com/15/F6F8F3/000000?text=+" width="15" height="15" /> `F6F8F3` | Primary mobile app scaffolding and body background |
| **Destructive / Error**| `#C74D4D` | <img src="https://via.placeholder.com/15/C74D4D/000000?text=+" width="15" height="15" /> `C74D4D` | Rejections, cancellations, lockouts, age warnings |

---

## 📁 मोनोरेपो संरचना (Monorepo Workspaces)

```text
bhadohi-cricket-platform/
├── apps/
│   ├── web/                    # Next.js 14 Desktop Organizer & Admin Dashboard
│   │   ├── src/app/            # App Router (Pages, Wizards, Layouts)
│   │   ├── src/components/     # TournamentWizard, ApplicationsTable, RosterDrawer
│   │   └── tailwind.config.js  # Approved BVCP color palette tokens
│   ├── server/                 # Express REST API Backend
│   │   ├── src/modules/        # Auth, Profile, Tournament, Team, Invitation, Safety
│   │   ├── src/repositories/   # In-Memory & PostgreSQL Persistence Layer
│   │   └── tests/              # 482 Automated Unit, Security & Simulation Tests
│   └── mobile/                 # Flutter Cross-Platform Architecture Definition
├── database/
│   ├── schema.sql              # Raw PostgreSQL Schema with BOLA & Phone Masking
│   ├── schema.prisma           # Prisma ORM Data Model
│   └── seed-data.sql           # Pre-seeded Bhadohi Pilot Dataset
├── docs/                       # 24 Formal Engineering Specifications (00 to 23)
├── prototypes/
│   ├── index.html              # Full Interactive Prototype (25 Screens + Desktop)
│   └── pilot-field-kit.html    # Printable A4 Kit with 10 Cut-Out Recovery Cards
├── scripts/
│   ├── run-dev-server.js       # Standalone Node.js Dev Server (Zero Setup)
│   ├── ui-templates.js         # Browser Visual UI Renderer for API Endpoints
│   └── verify-phase*.js        # Phase-Gate Audit & Test Runners
└── package.json                # Monorepo Workspaces Configuration
```

---

## ⚡ त्वरित शुरुआत (Quick Start)

### 1. पूर्वापेक्षाएँ (Prerequisites)
* Node.js v18 or v20+
* Git

### 2. क्लोन एवं स्थापना (Clone & Install)
```bash
git clone https://github.com/umbind/Bhadohi-Village-Cricket-Platform.git
cd Bhadohi-Village-Cricket-Platform
npm install
```

### 3. विकास सर्वर चलाएं (Start Development Servers)

```bash
# 1. Start the Unified Prototype & Visual API Server (Port 4000)
npm run dev:server

# 2. In another terminal, start the Next.js Desktop Dashboard (Port 3000)
npm run dev:web
```

### 4. ब्राउज़र में खोलें (Open in Browser)
* **आयोजक डेस्कटॉप डैशबोर्ड (Next.js 14):** `http://localhost:3000/`
* **मोबाइल सिम्युलेटर एवं एकीकृत पोर्टल:** `http://localhost:4000/`
* **प्रिंट करने योग्य ऑन-ग्राउंड फ़ील्ड किट:** `http://localhost:4000/field-kit`
* **टूर्नामेंट्स सूची:** `http://localhost:4000/api/v1/tournaments`
* **खिलाड़ी खोज (Privacy Masked):** `http://localhost:4000/api/v1/players`
* **सर्वर स्थिति:** `http://localhost:4000/health`

---

## 🧪 स्वचालित परीक्षण (Automated Tests)

The repository features comprehensive automated test coverage (100% pass rate):

```bash
npm run test:all
```

```text
========================================================================
✔ Phase 2: UI/UX Prototypes Verification          - 49/49 PASSED
✔ Phase 3: Architecture & Data Model               - 62/62 PASSED
✔ Phase 4: Monorepo Workspaces & Health Checks     - 26/26 PASSED
✔ Phase 5: Authentication & Profile Engine         - 50/50 PASSED
✔ Phase 6: Tournaments & Teams Lifecycle           - 60/60 PASSED
✔ Phase 7: Player Scouting & WhatsApp Invitations  - 54/54 PASSED
✔ Phase 8: Organizer Web Dashboard                 - 52/52 PASSED
✔ Phase 9: Moderation, Blocking & Expiry Sweeps    - 55/55 PASSED
✔ Phase 10: OWASP Security & Rural 3G Resilience   - 47/47 PASSED
✔ Phase 11: 4-Week Controlled Village Pilot Suite  - 27/27 PASSED
------------------------------------------------------------------------
TOTAL: 482 TESTS PASSED | 0 FAILURES | 100% SUCCESS
========================================================================
```

---

## 📚 संपूर्ण दस्तावेज़ सूची (Master Specifications)

| # | फ़ाइल का नाम | विवरण |
| :---: | :--- | :--- |
| **00** | [00-project-brief.md](docs/00-project-brief.md) | Executive brief, target geography, core philosophy, and boundaries. |
| **01** | [01-approved-decisions.md](docs/01-approved-decisions.md) | Baseline constraints, PIN auth, visual design rules, and privacy model. |
| **02** | [02-assumptions-and-open-questions.md](docs/02-assumptions-and-open-questions.md) | Technical assumptions, ambiguity resolutions, and stakeholder questions. |
| **03** | [03-product-requirements.md](docs/03-product-requirements.md) | Comprehensive functional and non-functional requirements. |
| **04** | [04-user-journeys.md](docs/04-user-journeys.md) | End-to-end Mermaid user journeys for all 4 roles. |
| **05** | [05-screen-inventory.md](docs/05-screen-inventory.md) | Catalog of 25 mobile screens, organizer desktop views, and universal states. |
| **06** | [06-business-rules.md](docs/06-business-rules.md) | Server-enforced business rules for users, teams, tournaments, and moderation. |
| **07** | [07-role-permission-matrix.md](docs/07-role-permission-matrix.md) | Granular RBAC and ABAC ownership matrix across all operations. |
| **08** | [08-data-model.md](docs/08-data-model.md) | PostgreSQL schema, DDL statements, indexing, and omission rules. |
| **09** | [09-api-contract.md](docs/09-api-contract.md) | REST API endpoints, JSON envelopes, request/response payloads, and error codes. |
| **10** | [10-architecture-options.md](docs/10-architecture-options.md) | Evaluation of architecture options and Architecture Decision Record (ADR-001). |
| **11** | [11-security-and-privacy.md](docs/11-security-and-privacy.md) | Bcrypt/Argon2id hashing, lockout rules, mobile privacy, and audit logging. |
| **12** | [12-expiry-and-retention.md](docs/12-expiry-and-retention.md) | 15-day availability expiry, team archival, and 90-day PII scrubbing routines. |
| **13** | [13-test-strategy.md](docs/13-test-strategy.md) | Test pyramid: unit, integration, security, negative, and rural 3G network testing. |
| **14** | [14-risk-register.md](docs/14-risk-register.md) | Risk assessment matrix, operational mitigations, and monitoring thresholds. |
| **15** | [15-phased-delivery-plan.md](docs/15-phased-delivery-plan.md) | Phase-by-phase roadmap (Phases 0 to 11) with effort and complexity ratings. |
| **16** | [16-traceability-matrix.md](docs/16-traceability-matrix.md) | Bidirectional traceability matrix connecting requirements to automated tests. |
| **17** | [17-ui-ux-prototype-and-accessibility-audit.md](docs/17-ui-ux-prototype-and-accessibility-audit.md) | Verification and accessibility audit report for Phase 2 prototypes. |
| **18** | [18-state-transition-rules.md](docs/18-state-transition-rules.md) | Finite State Machine diagrams and transition guard rules for all entities. |
| **19** | [19-backup-and-disaster-recovery.md](docs/19-backup-and-disaster-recovery.md) | RPO (<15m), RTO (<60m), continuous WAL archiving, and disaster recovery runbooks. |
| **20** | [20-developer-setup-guide.md](docs/20-developer-setup-guide.md) | Local development guide, monorepo workspaces, db initialization, and git hygiene. |
| **21** | [21-controlled-village-pilot-playbook.md](docs/21-controlled-village-pilot-playbook.md) | 4-week rollout schedule across Gyanpur, Aurai, and Suriyawan clusters. |
| **22** | [22-on-ground-coordinator-field-kit.md](docs/22-on-ground-coordinator-field-kit.md) | Hindi Devanagari field instructions and printable paper recovery cards. |
| **23** | [23-production-readiness-and-deployment-runbook.md](docs/23-production-readiness-and-deployment-runbook.md) | Production architecture, PostgreSQL WAL streaming, systemd cron, and rollback runbooks. |

---

## 📜 लाइसेंस (License)

This project is licensed under the MIT License - see the LICENSE file for details.
