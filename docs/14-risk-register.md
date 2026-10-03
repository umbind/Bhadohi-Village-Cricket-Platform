# Risk Register & Mitigation Strategy

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Scope:** Operational, Technical, Legal, and User Experience Risks  

---

## 1. Risk Assessment Matrix

| Risk ID | Category | Description | Severity | Likelihood | Impact | Mitigation Strategy | Owner |
|---|---|---|:---:|:---:|:---:|---|---|
| **RSK-01** | User / Auth | User forgets 6-digit PIN and loses the one-time recovery code. | High | High | High | Display recovery code with unskippable acknowledgement; encourage writing it in a physical notebook; provide controlled offline admin verification with full `AuditLog` tracking. | Tech / Ops |
| **RSK-02** | Connectivity | Intermittent 2G/3G connectivity in Bhadohi villages causes duplicate requests or UI hangs. | Medium | High | High | Implement client-side idempotency keys (`X-Idempotency-Key`) on POST actions; show clear retry buttons; cache data locally with offline banners. | Mobile Eng |
| **RSK-03** | Product / Trust | Fraudulent organizer posts fake tournament to collect offline cash entry fees. | High | Medium | High | Require organizer verification flag before publishing; prominent bold disclaimer: *"प्लेटफ़ॉर्म पर कोई भुगतान नहीं होता"*; instant reporting mechanism with rapid admin takedown. | Ops / Product |
| **RSK-04** | Legal / Scope | Match disputes, umpiring arguments, or ground accidents attributed to platform. | High | Medium | High | Explicit Terms of Service & Disclaimers: *"यह केवल एक सूचना और समन्वय प्लेटफ़ॉर्म है। अंपायरिंग, ग्राउंड सुरक्षा, यात्रा और मैच संचालन पूरी तरह से आयोजकों और कप्तानों की व्यक्तिगत जिम्मेदारी है।"* | Legal / Product |
| **RSK-05** | Privacy | Mobile numbers harvested by local commercial entities for unsolicited calls/spam. | High | Low | High | Mobile numbers strictly hidden from all public APIs and UI views; contacts accessed solely via opt-in WhatsApp intents for accepted squad members. | Security Eng |
| **RSK-06** | Safety / Abuse | Malicious user spams captains or floods players with unwanted squad invitations. | Medium | Medium | Medium | Limit active outgoing invitations to 20 per team; allow players to block abusers with 1-tap; limit reporting to 5/day to prevent griefing. | Product / Backend |
| **RSK-07** | Regulatory / Compliance | Under-18 player registers and participates in adult tournament. | High | Medium | High | Mandatory legal checkbox at onboarding; prominent reporting category for suspected minors; immediate account suspension upon verified report. | Ops / Admin |
| **RSK-08** | Usability | Rural players struggle with technical terminology or complex forms. | Medium | High | Medium | Conduct localized usability sessions in Bhadohi; use conversational village Hindi (सरल ग्रामीण शब्दावली); divide all forms into small 1-2 step cards. | Design / UX |
| **RSK-09** | Data Staleness | Captains reach out to players who are no longer active or available. | Medium | High | Low | Automated 15-day availability expiry; nightly cleanup job (`ExpiryJob`); 1-tap renewal button on home screen. | Backend Eng |
| **RSK-10** | Device Constraints | App crashes or experiences lag on low-cost Android phones (2GB RAM). | Medium | High | Medium | Keep APK size under 25MB; minimize background threads; avoid heavy asset bundles or custom shaders. | Mobile Eng |

---

## 2. Risk Monitoring & Trigger Thresholds

- **Lockout Spike Trigger:** If > 5% of active users experience PIN lockouts in a 24-hour period, trigger UX review of PIN entry keypad and keypad vibration feedback.
- **Report Queue SLA:** Any report categorized as `MISBEHAVIOR` or `UNDERAGE` must be reviewed by platform admins within 24 hours.
- **Offline Dispute Escalation:** If an organizer receives 3 or more negative reports from different captains, their publishing permissions are automatically suspended pending physical review.
