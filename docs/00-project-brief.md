# Project Brief: Bhadohi Village Cricket Platform

**Document Status:** Approved Baseline v1  
**Target Geography:** Bhadohi District, Uttar Pradesh (covering Gyanpur, Aurai, Bhadohi, Suriyawan, Deegh, Abholi)  
**Sport:** Cricket only  
**Target User Group:** Adults 18+ only  
**Product Name Working Placeholder:** Bhadohi Village Cricket Platform (`bvcp`)

---

## 1. Executive Summary

In rural Uttar Pradesh, specifically Bhadohi district, village cricket tournaments are organized year-round, drawing passionate local participation. Currently, tournament coordination relies on fragmented WhatsApp groups, physical printed pamphlets, word-of-mouth notices, and ad-hoc phone calls. This results in:
- Talented village players missing tournament opportunities due to lack of local awareness.
- Team captains struggling to assemble complete squads and find available local talent.
- Organizers lacking a single operational dashboard to announce tournaments, manage team applications, and broadcast schedule updates.
- Widespread friction caused by complex commercial cricket apps that mandate SMS OTPs, paid registrations, digital scoring, individual rankings, and team ratings.

The **Bhadohi Village Cricket Platform** is a Hindi-first, lightweight, self-service operational coordination platform designed to bridge this exact gap for adults aged 18 and above in Bhadohi district.

---

## 2. Core Philosophy & Boundaries

The platform operates on a strict **operational coordination only** mandate:
- **Self-Service Discovery & Registration:** Players register profiles; captains form temporary tournament rosters; organizers post tournament circulars.
- **Hindi-First Usability:** Default Devanagari Hindi typography, large touch targets, accessible contrast, and zero dependency on English fluency.
- **Zero Third-Party SMS/OTP Friction:** Replaces brittle SMS OTP gateways with a resilient mobile number + 6-digit PIN + one-time recovery code model.
- **Strictly Offline Operations Boundary:** Offline player selection, match conduct, umpiring, match operations, prize distribution, travel, food, ground logistics, and match-day disputes remain strictly outside the platform's scope.
- **No Vanity or Ranking Systems:** No player stats, run tallies, bowling averages, team rankings, awards, best player badges, or competitive vanity metrics.

---

## 3. Key User Groups

1. **Local Players (18+):** Create personal playing profiles, specify role (Batsman, Bowler, All-rounder, Wicket-keeper) and village/block availability, discover tournaments, receive and accept/decline team invites, and report misconduct.
2. **Team Captains / Owners:** Form temporary tournament-specific teams, search available local players, send roster invitations, submit applications to open tournaments, and manage squad readiness.
3. **Tournament Organizers:** Draft and publish tournament notices via desktop web dashboard (with quick-action mobile web), set deadlines, review and approve/reject team applications, issue official announcements, and handle inquiries.
4. **Platform Administrators:** Manage user status, audit administrative actions, process safety reports, enforce automatic data retention/expiry, and handle controlled account recovery.

---

## 4. Platform Delivery Targets

- **Mobile Client:** Android Application (Flutter) optimized for low-end devices, unstable 3G/4G connectivity, and offline-graceful states.
- **Organizer & Admin Client:** Responsive Desktop Web Dashboard optimized for data-dense tabular review, fast multi-application approvals, and administrative controls.
- **Backend Services:** Secure, lightweight REST API backed by relational PostgreSQL with strict server-side authorization and scheduled retention jobs.
