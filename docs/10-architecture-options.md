# Architecture Options & Decision Record (ADR-001)

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Decision Title:** System Architecture Selection for Dual Mobile and Desktop Ecosystem  

---

## 1. Context and Problem Statement

The platform requires:
1. An Android mobile app for local village players and captains who operate low-to-mid tier smartphones on patchy 3G/4G connectivity, requiring high responsiveness and Hindi typography.
2. A desktop web dashboard for tournament organizers and platform administrators who require high-density data tables, fast multi-application review, modal wizards, and keyboard-friendly controls.
3. A centralized, secure backend enforcing all authorization, rate-limiting, and lifecycle rules.

---

## 2. Evaluation of Architectural Options

### Option A: Specialized Dual Frontend Architecture
- **Mobile Client:** Native-compiled Flutter (Dart) Android App.
- **Organizer & Admin Web:** Next.js / React (TypeScript) Web Application.
- **Backend API:** Node.js / Express (TypeScript) REST API or Python FastAPI.
- **Database:** Managed PostgreSQL (with strict relational integrity and UTC timestamps).
- **Static / Media Storage:** S3-compatible Object Storage (for optional grounds/documents).

### Option B: Unified Single-Codebase Flutter Architecture
- **Mobile & Web:** Shared Flutter (Dart) multi-platform codebase compiled for Android (APK) and Web (CanvasKit/WASM).
- **Backend:** Managed PostgreSQL + Server-side API.

---

## 3. Side-by-Side Comparison

| Evaluation Dimension | Option A (Flutter Mobile + Next.js Web) | Option B (Flutter Mobile + Flutter Web) | Decisive Factor |
|---|---|---|---|
| **Development Effort** | Moderate. Requires two UI layers, but leverages best-of-breed component libraries (Flutter Material 3 on mobile; Tailwind + Shadcn on web). | Moderate initially, but high debugging overhead for Flutter Web table responsiveness and browser quirks. | **Option A** avoids fighting web layout rendering. |
| **Maintenance Effort** | Low to Moderate. Clean boundary between player experience and organizer operations. Changes to web do not risk mobile regressions. | Single language (Dart), but heavy conditional compilation (`kIsWeb`) and platform-specific UI branches. | **Tie / Slight Option A**. |
| **Security** | High. Both clients consume an identical authenticated REST API with zero client-side privilege escalation. | High. Same backend security model. | **Tie**. |
| **Hosting & Bandwidth Cost** | Extremely low. Web dashboard is statically exportable and edge-cached (<100KB initial bundle). | Higher web transfer. Flutter Web CanvasKit engine requires 2.5MB - 5MB initial bundle download, failing on rural 3G. | **Option A** is far superior for slow networks. |
| **Desktop Table Usability** | **Exceptional.** Native HTML DOM tables, native text selection, keyboard tab indexing, browser auto-fill, and effortless scrolling. | **Poor to Moderate.** Canvas-rendered text, sluggish scrolling on low-end laptops, difficult browser text copy, and complex accessibility. | **Option A** is vastly superior for organizers. |
| **Future Scalability** | High. Can upgrade or refactor the web portal without re-releasing or re-signing mobile APKs. | Tightly coupled. Web and mobile share dependency tree; package version conflicts can lock both. | **Option A** provides cleaner separation. |
| **Solo Developer Fit** | **Very High.** Next.js allows assembling high-density organizer dashboards in hours using standard UI primitives, while Flutter handles mobile. | Moderate. Writing desktop-grade data tables with pagination and column resizing in Flutter requires custom widget scaffolding. | **Option A** enables faster delivery. |

---

## 4. Architecture Decision Record (ADR-001)

### Status: APPROVED

### Selected Architecture: **Option A**
- **Mobile App:** Flutter Android Application (targeting Android 8.0+ / API 26+).
- **Web Dashboard:** Next.js (React) responsive web application styled with Tailwind CSS.
- **Backend API:** Modular Node.js / TypeScript REST API using Express/Fastify.
- **Database:** PostgreSQL 15+ hosted on a managed relational provider.
- **Authentication Engine:** Stateless JWT Bearer tokens with server-side PIN and recovery code hashing (`bcrypt`).

### Consequences & Mitigations
- *Consequence:* Maintaining both Dart and TypeScript codebases.
  *Mitigation:* The API contract (`docs/09-api-contract.md`) serves as the single source of truth. Models are straightforward and follow strict typed schemas.
- *Consequence:* Organizers opening links on mobile browsers.
  *Mitigation:* The Next.js web application is built mobile-responsive from day one, ensuring organizers can review and approve applications even on a mobile browser if needed.
