## wwise-expo pass

Vite + React surface for member codes, Firestore directory, and QR display. Server mail is handled by **Cloud Functions** whenever a document is created in the `members` collection.

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

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc/blob/main/README.md) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information about how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
