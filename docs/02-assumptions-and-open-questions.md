# Assumptions, Conflicts, and Open Questions

**Document Status:** Baseline v1  
**Project:** Bhadohi Village Cricket Platform  

---

## 1. Technical & User Assumptions

| ID | Category | Assumption Details | Impact / Mitigation |
|---|---|---|---|
| **ASM-01** | Device Profile | Target users utilize low-to-mid tier Android smartphones (Android 8.0+, 2GB-4GB RAM) with patchy rural connectivity. | Optimize Flutter app size (<25MB APK), implement aggressive local caching, low-bandwidth asset bundles, and offline retry queues. |
| **ASM-02** | Language & Literacy | Target users in Bhadohi are conversational in colloquial Hindi (Bhojpuri/Awadhi influences) and read Devanagari script. | Use conversational, authentic Hindi strings (e.g., 'प्रतियोगिता', 'टीम बनाएं', 'खिलाड़ी जोड़ें'). Avoid bureaucratic or complex Sanskritized vocabulary. |
| **ASM-03** | External Messaging | WhatsApp is universally present on almost all target smartphones in Bhadohi. | Deep-link tournament circulars and invitations via WhatsApp intents (`https://wa.me/` and text share payloads). The platform does not need costly SMS integration. |
| **ASM-04** | Administrative Boundaries | Bhadohi district consists of 3 Tehsils (Gyanpur, Aurai, Bhadohi) and 6 Development Blocks (Gyanpur, Aurai, Bhadohi, Suriyawan, Deegh, Abholi). | Pre-populate dropdown menus with verified Bhadohi blocks and prominent gram panchayats to prevent spelling typos and broken filters. |
| **ASM-05** | Timezone & Clocks | All database timestamps are persisted in standard UTC (`TIMESTAMPTZ`), but always parsed and displayed to users in Indian Standard Time (IST, UTC+05:30). | Prevents timezone drifts during deadline comparisons and expiry automation jobs. |

---

## 2. Identified Ambiguities and Proposed Resolutions

### AMB-01: Multi-Role Model within a Single Account
* **Ambiguity:** Section 6 defines distinct user roles (Player, Captain, Organizer, Admin). Can a single mobile number act as both a Player and a Captain, or even organize a tournament?
* **Resolution:** 
  - Every registered mobile user receives a `User` identity.
  - By default, every user can create a `PlayerProfile`.
  - Any registered user can create a temporary `Team` for an open tournament, automatically gaining `Captain` privileges *for that specific team*.
  - To prevent tournament listing spam, the `Organizer` role is an elevated role flag granted either upon simple admin verification or a dedicated organizer registration gate.
  - The `Admin` role is strictly provisioned via backend database seed or CLI flag.

### AMB-02: Individual Player Applications vs. Team Applications
* **Ambiguity:** Section 6 lists "Apply individually where enabled" under Player capabilities, but Section 3 & Section 8 focus primarily on team applications.
* **Resolution:** 
  - For the approved MVP, **Team Applications** constitute the core path: Captain creates team -> invites players -> submits team application to tournament.
  - "Individual Player Application" is interpreted as an optional "Player Availability Pool" attached to a tournament: an unattached player can express interest ("उपलब्ध हूँ"), allowing captains registered for that tournament to discover and invite them. No direct individual tournament slot allocation exists.

### AMB-03: Entry Fee Disclosure without Payment Handling
* **Ambiguity:** Section 8 mentions "Entry fee information" in the tournament creation wizard, while Section 3 strictly forbids "In-app wallet, escrow, or online payment collection".
* **Resolution:**
  - The tournament entry fee field is **purely informational plain text / numeric note** (e.g., "₹500 प्रति टीम - आयोजन समिति को मैदान पर देय").
  - An unskippable bold disclaimer must accompany every fee mention: *"इस ऐप पर कोई वित्तीय लेन-देन नहीं होता है। किसी भी शुल्क का भुगतान आयोजन स्थल पर आयोजकों के साथ स्वयं करें।"*

### AMB-04: Player Contact Privacy vs. Captain Outreach
* **Ambiguity:** Section 4 mandates that mobile numbers must never be public, yet captains need a way to coordinate match logistics with invited players.
* **Resolution:**
  - In public searches, phone numbers are masked/hidden completely.
  - Once a player explicitly **accepts** a team invitation, the captain is granted access to a "WhatsApp पर संपर्क करें" button triggering a direct chat, but raw phone numbers are never exposed in bulk lists or scraping endpoints.
  - Players have a profile toggle: *"क्या कैप्टन मुझे व्हाट्सएप पर संपर्क कर सकते हैं?"* (Default: हाँ).

---

## 3. Open Questions for Stakeholder / Human Approval

1. **Recovery Code Format:** Should the 8-character recovery code be alphanumeric formatted as `XXXX-XXXX` for easier handwriting on paper, or numeric?
   * *Recommendation:* Alphanumeric uppercase excluding ambiguous characters (`0`, `O`, `1`, `I`), formatted as `XXXX-XXXX`.
2. **Organizer Web Hosting vs. Desktop Compatibility:** Should the organizer dashboard also be responsive on mobile browsers if organizers open the link from WhatsApp on their phones?
   * *Recommendation:* Yes, responsive desktop-first design that degrades gracefully to a single-column layout on mobile web for essential review/accept actions.
3. **Availability Expiry Duration:** Should availability expire after 15 days or 30 days?
   * *Recommendation:* Default to 15 days with an in-app 1-tap "नवीनीकरण करें" (Renew) prompt, keeping the player pool actively refreshed.
