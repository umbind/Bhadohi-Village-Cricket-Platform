# Screen Inventory & UI States

**Document Status:** Approved Baseline v1  
**Project:** Bhadohi Village Cricket Platform (`bvcp`)  
**Design Guidelines:** Primary Green `#1E7A4C`, Forest `#123B2A`, Cream `#F6F8F3`, Amber `#F4B942`, Red `#C74D4D`, Border `#E1E8E1`. All touch targets >= 48dp. Text labels on all icons. Default Devanagari Hindi.

---

## 1. Mobile Screens Inventory (25 Screens)

| Screen ID | Screen Name (English / Hindi) | Primary Purpose | Key Components | Required UI States |
|---|---|---|---|---|
| **SCR-01** | Welcome & Language<br>*(स्वागत एवं भाषा चयन)* | Language confirmation and app onboarding introduction. | Cricket illustration, language switcher (Hindi default, English optional), 18+ declaration checkbox, "शुरू करें" button. | Initial, Age Unchecked Warning. |
| **SCR-02** | Registration<br>*(नया खाता पंजीकरण)* | Create account via mobile and 6-digit PIN. | 10-digit mobile input, 6-digit PIN field, Confirm PIN field, Terms & Disclaimer link, "पंजीकरण करें" button. | Input validation error, Network error, Mobile already exists. |
| **SCR-03** | Login<br>*(लॉग इन)* | Authenticate existing user. | Mobile number input, 6-digit numeric PIN keypad/input, "लॉग इन" button, "पिन भूल गए?" (Forgot PIN) link. | Loading spinner, Invalid PIN error, Rate-limited lockout alert (countdown timer). |
| **SCR-04** | Recovery Code Setup<br>*(रिकवरी कोड सुरक्षा)* | Display generated 8-char recovery code. Rendered strictly once. | Code display box (`XXXX-XXXX`), Copy button, "मैंने कोड डायरी में लिख लिया है" confirmation checkbox, "आगे बढ़ें" button. | Copy success toast, Mandatory checkbox unselected state. |
| **SCR-05** | Role Selection<br>*(भूमिका चयन)* | Choose starting dashboard orientation. | Two prominent cards: "मैं खिलाड़ी हूँ" (Player) and "मैं कैप्टन / टीम संचालक हूँ" (Captain). Switchable later in settings. | Card selection active/hover state. |
| **SCR-06** | Player Home<br>*(खिलाड़ी होम)* | Main player feed. | Header with block name, Quick availability pill ("उपलब्ध"), Open Tournaments carousel, Recent invitations banner. | Loading skeleton, Empty state ("आपके ब्लॉक में कोई नया टूर्नामेंट नहीं है"), Offline error banner. |
| **SCR-07** | Captain Home<br>*(कैप्टन होम)* | Main captain operational dashboard. | Active temporary teams list, "नई टीम बनाएं" CTA, Pending squad invitations badge, Tournament application statuses. | Loading skeleton, Empty state ("आपने अभी कोई टीम नहीं बनाई है"), Network retry banner. |
| **SCR-08** | Tournament Listing<br>*(प्रतियोगिता सूची)* | Browse open tournaments across Bhadohi. | Filter/search bar, Tournament cards (Ground, Dates, Entry fee note, Max teams, Status pill). | Loading skeleton, Empty search results, Pull-to-refresh. |
| **SCR-09** | Tournament Filters<br>*(फ़िल्टर)* | Narrow down tournaments. | Block multi-select (Gyanpur, Aurai, Bhadohi, etc.), Ball type chips (Tennis, Leather, Cosco), Date range picker, Reset and Apply buttons. | Active filter badges, Clear-all action. |
| **SCR-10** | Tournament Details<br>*(प्रतियोगिता विवरण)* | Comprehensive tournament circular. | Banner, Organizer name, Location/Ground, Dates, Registration deadline, Ball type, Match overs, Informational fee note, WhatsApp share button, "टीम का आवेदन करें" button. | Loading skeleton, Registration Closed state, Cancelled Tournament state (with reason). |
| **SCR-11** | Tournament Application<br>*(टूर्नामेंट आवेदन)* | Submit team entry to tournament. | Team selector dropdown, Squad summary preview, Terms confirmation checkbox, Offline fee disclaimer, "आवेदन जमा करें" button. | Submitting loading, Duplicate application error, Deadline passed alert. |
| **SCR-12** | Team Creation<br>*(नई टीम बनाएं)* | Create temporary tournament-bound squad. | Tournament binding label, Team name input, Home village input, Squad capacity indicator (e.g. 0/15), "टीम सहेजें" button. | Form validation error, Capacity warning. |
| **SCR-13** | Team Details<br>*(टीम विवरण एवं रोस्टर)* | Captain view of squad members & invites. | Team header, Captain badge, Roster list with status pills (Accepted, Pending, Declined), "खिलाड़ी जोड़ें" button, "आवेदन भेजें" button. | Loading skeleton, Squad incomplete state, Minimum 11 players reached state. |
| **SCR-14** | Player Search<br>*(खिलाड़ी खोजें)* | Discover available players for squad. | Search input, Block filter dropdown, Role chips (Batsman, Bowler, All-rounder, Wicketkeeper), Available-only toggle. | Loading skeleton, Empty search result ("कोई उपलब्ध खिलाड़ी नहीं मिला"), Blocked user filter. |
| **SCR-15** | Player Invitation<br>*(आमंत्रण भेजें)* | Send squad invite to a specific player. | Player profile summary card, Tournament details summary, Invite message field (optional), "आमंत्रण भेजें" button. | Sending spinner, Already invited error, Squad full error. |
| **SCR-16** | Received Invitations<br>*(प्राप्त आमंत्रण)* | Player's pending team invites. | Invitation cards with Captain name, Team, Tournament, Ground, Match dates. "स्वीकार करें" (Accept) and "अस्वीकार करें" (Decline) buttons. | Empty state ("कोई नया आमंत्रण नहीं है"), Expired invitation tag. |
| **SCR-17** | Sent Invitations<br>*(भेजे गए आमंत्रण)* | Captain's outbound invite tracker. | List of invited players with status pills (`PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`), Cancel invite button. | Empty state, Status update animation. |
| **SCR-18** | Player Profile<br>*(खिलाड़ी प्रोफ़ाइल)* | View and edit personal player details. | Name, Village, Block, Role, Batting/Bowling styles, Edit Profile button, View public preview button. | Loading skeleton, Unsaved changes warning. |
| **SCR-19** | Availability Settings<br>*(उपलब्धता प्रबंधन)* | Manage playing availability window. | Availability switch (ON/OFF), Duration selector (15 days / 30 days), Expiry countdown badge ("12 दिन शेष"), "नवीनीकरण करें" button. | Expired warning banner, Success toast. |
| **SCR-20** | Notifications<br>*(सूचनाएं)* | In-app alerts and updates. | Chronological notification cards (Invite received, Application accepted, Tournament cancelled), Mark as read. | Empty state ("कोई नई सूचना नहीं है"), Network error retry. |
| **SCR-21** | Report User/Content<br>*(रिपोर्ट करें)* | Submit safety/misconduct report. | Entity type tag, Predefined reason radio list, Additional comments text area (max 250 chars), "रिपोर्ट भेजें" button. | Submitting loading, Daily rate-limit reached alert, Submission success confirmation. |
| **SCR-22** | Block User<br>*(उपयोगकर्ता ब्लॉक करें)* | Prevent communication with user. | User name, Warning text ("यह उपयोगकर्ता आपको न तो खोज सकेगा और न ही आमंत्रण भेज सकेगा"), "ब्लॉक करें" destructive button. | Confirmation modal, Unblock action in settings. |
| **SCR-23** | Settings<br>*(सेटिंग्स)* | Account configuration. | Language preference, Change PIN, Blocked users list, Privacy preferences, About platform, Logout button. | Loading, Action confirmation modals. |
| **SCR-24** | Account Deletion<br>*(खाता हटाएं)* | Irreversible deletion request. | Detailed consequences notice, PIN confirmation input, "स्थायी रूप से खाता हटाएं" destructive button. | PIN verification error, Processing spinner, Final success screen. |
| **SCR-25** | Help & Support<br>*(सहायता एवं नियम)* | Guidance and offline contacts. | Platform FAQ in Hindi, Rules of village cricket coordination, Admin support contact form, Offline dispute disclaimer. | Offline accessible cached content. |

---

## 2. Organizer Desktop Dashboard Views (Web)

1. **Dashboard Home:** Key operational metrics cards (सक्रिय प्रतियोगिताएं, कुल प्राप्त आवेदन, स्वीकृत टीमें, लंबित समीक्षाएं, निरस्त प्रतियोगिताएं).
2. **My Tournaments:** Data table of tournaments created by the organizer with status pills (`DRAFT`, `PUBLISHED`, `REGISTRATION_CLOSED`, `COMPLETED`, `CANCELLED`).
3. **Tournament Creation Wizard:** 4-step progressive modal or full-page stepper:
   - Step 1: Basic Info (Name, Ground, Block, Dates)
   - Step 2: Registration Config (Dates, Max Teams, Squad Limits, Ball Type, Plaintext Fee Note)
   - Step 3: Rules & Offline Responsibility Disclaimer
   - Step 4: Preview & Publish
4. **Team Applications Table:** High-density review table:
   - Columns: Team Name, Village, Captain Name, Players Count, Applied Date, Status (`PENDING`, `ACCEPTED`, `REJECTED`).
   - Actions: "रोस्टर देखें" (Inspect Roster Drawer), "स्वीकार करें" (Accept), "अस्वीकार करें" (Reject with Reason modal).
5. **Registered Teams Roster View:** List of confirmed teams with expandable player lists. Option to export simple printable sheet for ground officials.
6. **Announcements Broadcaster:** Broadcast short notice (e.g. "बारिश के कारण मैच 2 घंटे देरी से शुरू होगा") to all accepted captains.
7. **Reports & Issues:** View reports filed against the organizer's tournament with resolution actions.

---

## 3. Universal State Specifications

Every mobile screen and desktop view must adhere to these strict state specifications:

1. **Loading State:** 
   - Never use blank white screens.
   - Use skeleton shimmer loaders matching the card shape.
   - For button actions, show a compact inline progress indicator.
2. **Empty State:**
   - Must feature a calm, contextual cricket illustration or clean vector icon.
   - Clear Hindi heading (e.g., *"कोई आमंत्रण नहीं मिला"*).
   - Descriptive Hindi subtext explaining why it's empty.
   - Actionable primary button (e.g., *"खिलाड़ी खोजें"* or *"प्रतियोगिताएं देखें"*).
3. **Error State:**
   - Friendly Hindi error message explaining the root cause (network lost, session expired, server timeout).
   - Prominent "पुनः प्रयास करें" (Retry) button.
   - Error alert box styled in `#C74D4D` tint.
4. **Permission Denied State:**
   - Displayed when an unverified user tries to access organizer actions or edit another user's content.
   - Clear message: *"आपको इस पृष्ठ को संपादित करने की अनुमति नहीं है।"*
5. **Expired / Cancelled State:**
   - Prominent Amber/Red banner at top of tournament/invitation cards.
   - Clear explanation of why the action is disabled.
