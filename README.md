# WWISE Expo App — User Guide

Digital companion for **SECUREX 2026** and the WWISE member directory. The app has **two sides** that work together: one for **WWISE members** at the expo, and one for **visitors** who scan a member’s QR code.

---

## Overview

| Side | URL | Who uses it |
|------|-----|-------------|
| **Member Expo App** | `/` (root) | WWISE team members with a member access code |
| **Public Profile** | `/{member-slug}` | Visitors who scan a member’s QR code |

Both sides share the same Firebase backend (profiles, connections, competition entries, analytics).

**Event days:** Tue–Thu, 2–4 June 2026 (shown in the member app header as Day 1 / 2 / 3).

**Brand line:** *Working together for a safe world*

---

## Side 1 — Member Expo App

Use this on your phone or tablet when you are **representing WWISE at the expo**.

### 1. Sign in

1. Open the app at the root URL.
2. Enter your **member access code** (the code on your credential).
3. Tap **Sign in**.

If the code is not in the directory yet, you can **register** a new organisation profile instead.

### 2. Register (new members)

If you do not have a code yet:

1. From the landing screen, choose **Register as a new member** (or register after an unknown code).
2. Complete the organisation profile form:
   - Member code (you choose this — it becomes your sign-in code)
   - Full name, role, company details
   - Phone, email, website, LinkedIn (optional fields as shown)
   - Company address and bio
   - Profile photo (optional)
3. Tap **Save company profile**.

After saving:

- Your **QR code** appears immediately.
- A **welcome email** is sent to the address you registered (check spam/promotions if it does not arrive).

### 3. QR screen (your company profile card)

After sign-in you see:

- Your **name and role**
- A **QR code** that links to your public profile

**What to do at the expo:** Let visitors scan this code so they can view your profile, save your contact, and connect with WWISE.

**Buttons:**

- **Analytics** — opens your profile stats and connection list (see below).
- **Logout** — signs you out and clears your saved session on this device.

Your session **stays signed in** on the same phone until you log out (even if you close the browser).

### 4. Analytics

Tap **Analytics** from the QR screen.

#### Scan statistics

Three rings show:

- **Total scans** — how many times your public profile was opened
- **Anonymous visits** — first-time opens (visitor did not submit the Connect form)
- **Known connections** — visitors who submitted their details via Connect

#### My Connections

A numbered list of everyone who submitted the **Connect** form on your public profile. Each entry shows their name, email, phone, company, area of interest, and date.

#### Winners (prize draw — admin only)

Visible only when signed in as **kausar@www.co.za**:

1. Tap **GET THE WINNER**.
2. The app **randomly picks one participant** from the competition pool who has not been drawn yet.
3. The winner appears in the list below.
4. Tap again to draw the next winner — **the same person is never picked twice**.
5. Drawn winners are saved in Firestore (`prizeWinners`) so they **persist across devices** when you sign in with the same member account.

#### Participants

Full list of everyone who completed the **Competition** tab and submitted their email (competition entries).

#### Export (admin only)

The **Export** button and **Winners** prize-draw section only appear when signed in as **kausar@www.co.za**. Export downloads a CSV with connections and competition data.

#### Back to QR

Returns to your QR code screen.

---

## Side 2 — Public Profile (visitor experience)

When someone **scans your QR code**, they open your public profile at:

```
https://your-domain/{member-slug}
```

They do **not** need a member code. This is the visitor-facing experience.

### Header and menu

- **WWISE logo** (top left)
- **Menu button** (top right, pulsing circle) — opens the expo navigation sheet

**Menu contents:**

1. **EXPO** label and WWISE logo
2. Numbered navigation cards:
   - **Contact**
   - **Catalogues**
   - **Schedule**
   - **Competition**
3. WWISE office address (Centurion)
4. **Connect** button — opens the lead-capture form

Tap a nav card to jump to that section and close the menu.

### Connect form (first visit)

The first time someone opens your profile on a device, the **Connect** sheet appears automatically.

They can:

- Fill in: full name, email, contact number, company name, area of interest
- **Submit** — saves a connection to you and sends a confirmation email
- **Skip for now** — closes the form; they can open it later from the menu

Submitting Connect counts as a **known connection** on your analytics.

### Contact tab

- **Profile photo** — tap to view full screen (if uploaded)
- Name, role, company, bio
- **Connect** links: phone, email, website, LinkedIn (only shown if you added them)
- **Save Contact** — downloads a `.vcf` file to add you to their phone
- **Share profile** — native share or copy link

### Catalogues tab

Circular badges for WWISE solution PDFs:

- WWISE Company Overview and SaaS
- Cybersecurity Insurance Support
- Integrated GRC, Cybersecurity & Assurance
- ISO/IEC 42001 and ISO/IEC 27001 services

Tap a badge to open a bottom sheet with an overview, **View PDF**, or **Download**.

### Schedule tab

Download **training.pdf** — the official training schedule document.

### Competition tab

Visitors can enter the WWISE expo competition by completing **3 milestones**:

| Step | Action |
|------|--------|
| 1/3 | **Save the Contact to your phone** — download the member vCard |
| 2/3 | **Download the Training Schedule** — get the PDF |
| 3/3 | **Share any of our posts on any social** — open LinkedIn, X, Instagram, or Facebook |

When all 3 are complete:

1. The entry form scrolls into view automatically.
2. They enter their **email** and submit.
3. Each email can only enter **once** per browser.
4. A confirmation email is sent.

Their entry appears under **Participants** in the member’s Analytics screen.

---

## How the two sides connect

```
Member signs in  →  Shows QR code  →  Visitor scans
                                           ↓
                              Public profile opens
                                           ↓
                    Connect / Competition / Catalogues
                                           ↓
                    Data saved to Firebase (connections,
                    stats, winners, prizeWinners)
                                           ↓
                    Member opens Analytics to review
```

| Visitor action | What the member sees |
|----------------|----------------------|
| Opens profile (first time, skips Connect) | +1 anonymous visit |
| Submits Connect form | +1 known connection, row in My Connections |
| Completes competition | Row in Participants |
| Member draws winner | Row in Winners (prize draw) |

---

## Tips

**Members**

- Keep your QR screen brightness up for easy scanning.
- Check Analytics during the day for new connections.
- Use **GET THE WINNER** only when you are ready to announce a draw — draws cannot be undone from the app. *(Admin account only: kausar@www.co.za.)*

**Visitors**

- Use **Save Contact** on the Contact tab for the fastest way to keep the member’s details.
- Complete all 3 competition steps before submitting your email.
- If Connect was skipped, open the **menu → Connect** anytime.

**Event badge (member app header)**

- Shows **Day 1 / 2 / 3** during the expo (2–4 June 2026)
- Shows **Event hasn’t started** or **Event has ended** outside those dates

---

## Developer guide

Technical setup for Firebase, email, and deployment.

### Prerequisites

- Firebase project (**Blaze** billing is required so the function can reach the Resend HTTPS API).
- [Resend](https://resend.com) account: create an API key and a **verified sender address** (your org domain or Resend’s onboarding domain for tests).
- [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools` and `firebase login`.

### Welcome email (registration)

1. In the repo-root `.env` (same file as the `VITE_*` Firebase keys), add **without** `VITE_`:
   - `RESEND_API_KEY` – Resend API key
   - `TRANSACTION_MAIL_FROM` – Sender Resend recognises, e.g. `Circuit Pass <onboarding@resend.dev>` or `Name <noreply@your-domain.com>`
   Prefixing mail keys with `VITE_` would bundle them into the browser; do not use that prefix here.

2. Point the Firebase CLI at your project (already defaults to `wwise-expo` in `.firebaserc`, or run `firebase use <projectId>`).

3. Deploy (the `functions` predeploy hook copies those two entries into `functions/.env`, which ships with Cloud Functions):

   ```bash
   npm run firebase:deploy:backend
   ```

4. When Resend accepts the outbound request (HTTP success), Firestore merges `welcomeEmailSentAt`, `welcomeEmailTo`, and `welcomeEmailResendId`. That still does **not** prove inbox delivery — only that Resend queued the mail. Failures populate `welcomeEmailFailedAt` / `welcomeEmailError`.

The QR screen notes that SMTP may lag; correlate with **`welcomeEmailResendId`** in **Resend → Emails → Logs**.

### Email accepted but inbox is empty?

1. **`TRANSACTION_MAIL_FROM` uses `@resend.dev` (sandbox sender)**  
   Resend limits this path: mail is largely meant for **addresses on your Resend account** unless you [**add & verify your own domain**](https://resend.com/docs/dashboard/domains/introduction) and send from **`you@verified-domain`** instead (see **[403 / resend.dev restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)**).  
   **`welcomeEmailSentAt` in Firestore only means the HTTP API returned success** — it is not inbox proof. Confirm every send in **Resend → Emails**.

   **Smoke test**: run one registration using **`delivered@resend.dev`** ([test inboxes docs](https://resend.com/docs/dashboard/emails/send-test-emails)). If logs show delivered there, infra is OK; use a verified domain for real addresses.

2. **Own domain incomplete DNS**: SPF / DKIM must be verified in Resend; otherwise Gmail and others silently drop mail.

3. Open **Functions logs** (`sendMemberWelcomeEmail`) and grep for `Resend accepted` / `welcomeEmailResendId`, then paste the Resend dashboard message id to see bounced / suppressed / queued.

Redeploy after changing `.env`: `firebase deploy --only functions`.

### Deploy / housekeeping

5. **Function region**: **`africa-south1`** to match Firestore in this repo. Adjust `functions/index.js` if your database is elsewhere.

6. Artifact Registry retention: **`firebase deploy --only functions --force`** once configures image cleanup.

7. On Windows, if deploy discovery hangs, **`set FUNCTIONS_DISCOVERY_TIMEOUT_MS=90000`** before `firebase deploy`.

### Firestore collections

| Collection | Purpose |
|------------|---------|
| `members` | Member profiles and access codes |
| `qrCodes` | QR payload records |
| `connections` | Connect form submissions |
| `memberConnectionStats` | Scan / anonymous / known counts per member |
| `winners` | Competition participant entries |
| `prizeWinners` | Random prize draws (persisted per member) |

Deploy indexes after changes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### Firestore rules

`firebase.json` wires `firestore.rules`. Replace the permissive playground rules before production.

### Storage rules (profile photos)

Member profile photos upload to **`memberProfilePhotos/`**. **`storage.rules`** is wired via `firebase.json`; uploads require Firebase Auth on the session (**anonymous sign-in** is enough).

Deploy storage rules:

```bash
firebase deploy --only storage
```

Or bundle with backend:

```bash
firebase deploy --only firestore,functions,storage
```

### Local development

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Tech stack

- **React + Vite** — frontend
- **Firebase** — Auth, Firestore, Storage, Cloud Functions
- **Resend** — transactional email (welcome, connect confirmation, competition entry)
