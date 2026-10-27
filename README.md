# STUDIO 27 — Salon Website Demo

A responsive static website built with plain HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies, no backend.

**This is a concept demo, not a live salon website.** It is not connected to a real salon, and it does not store any data.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content: hero, services, story, gallery, quote, booking form, contact, footer |
| `styles.css` | Design system, layout and responsive rules |
| `script.js` | Mobile navigation, footer year, and the WhatsApp appointment request |
| `admin.html` | **Owner dashboard demo** — separate page, not linked from the public site |
| `admin.css` | Dashboard-only styles, loaded after `styles.css` on `admin.html` |
| `admin.js` | Sample data plus the dashboard's filters, status controls and view switching |
| `login.html` | **Owner sign-in demo** — separate page, not linked from the public site |
| `login.css` | Sign-in page styles, loaded after `styles.css` on `login.html` |
| `login.js` | The demo credential check and the show/hide password control |
| `favicon.svg` | Small inline-style SVG favicon (no external dependency) |
| `backup-original/` | Copies of the four original files, kept as a rollback point. Not used by the site. |

## Run it locally

The site is fully static, so any local web server works.

1. Open this folder in your editor.
2. Serve the folder over HTTP — the simplest option on a machine with Node.js installed:

   ```
   npx serve -l 5500 .
   ```

   Then open `http://localhost:5500` for the public site, `http://localhost:5500/login.html` for the demo sign-in screen, and `http://localhost:5500/admin.html` for the dashboard demo.

   > **Do not add the `-s` / `--single` flag.** That flag enables single-page-app mode, which rewrites unmatched paths to `index.html`. With it, `serve` redirects `/admin.html` → `/admin` and then hands back the *public homepage* instead of the dashboard, so the dashboard's filters and status controls appear to be missing. This is a normal multi-page site, so the flag must be left off.

3. Alternatively, in VS Code install the **Live Server** extension and choose *Open with Live Server* on `index.html`. Opening `index.html` directly from the file system also works, though a served copy is closer to the real thing.

There is no build, install or compile step.

**An internet connection is required** while viewing: the page loads Google Fonts and illustrative Unsplash photography from the web.

## WhatsApp configuration (important)

The booking form does not talk to a backend. It simply builds a pre-written WhatsApp message and opens `wa.me` so the customer can review and send it themselves.

The destination number lives at the top of `script.js`:

```js
const DEMO_WHATSAPP_NUMBER = "916297519708";
const IS_DEMO = true;
```

- `916297519708` is an **authorised testing number used only for this demo**. It is not a real salon's public contact number and must not be published as one.
- The value must be in international format, digits only — no `+`, spaces or dashes. For an Indian number, `9876543210` becomes `919876543210`.
- `IS_DEMO` controls the wording of the on-page demo notice and the confirmation toast.

### To point the demo at a real salon's WhatsApp number

1. Replace the value of `DEMO_WHATSAPP_NUMBER` in `script.js` with the number the salon has authorised you to use.
2. Set `IS_DEMO = false`.
3. Delete the `<p class="form-demo-note">` paragraph in `index.html` (it tells visitors this is a demo).
4. Check that the `<noscript>` paragraph and the small print under the submit button still read correctly.

## What works today

- Sticky header and in-page smooth scrolling; every navigation link points to a section that exists (`#home`, `#services`, `#story`, `#gallery`, `#book`, `#contact`).
- Mobile menu below 680px: opens and closes, closes when a link is tapped, closes on `Escape`, and keeps `aria-expanded` in sync.
- Seamlessly looping decorative marquee, hidden from screen readers.
- Booking form:
  - collects name, service, preferred date, preferred time and optional notes;
  - validates the required fields (name, service, date) before doing anything;
  - blocks dates earlier than the visitor's own local "today";
  - builds a readable, URL-encoded message;
  - opens WhatsApp in a new tab, then also reveals a manual link in case the pop-up was blocked;
  - never submits the form to a server, and never places the visitor's name, date or notes in the page URL.
- Footer year is generated automatically.
- Skip-to-content link, visible keyboard focus rings, `44 × 44px` mobile menu target, and `prefers-reduced-motion` support.

## What is NOT implemented

- **Bookings are not saved anywhere.** There is no database, no booking system, no email notification and no secure owner login. The form only prepares a WhatsApp message in the visitor's own browser. A dashboard **interface demo** exists at `admin.html`, but it runs on invented sample data — see below. A **demo sign-in screen** exists at `login.html`, but it is decoration, not protection — see below.
- No appointment is ever confirmed by this website. The on-page notice states that the customer must send the message and wait for a reply.
- No payments, no analytics, no third-party APIs, no paid services. The only sign-in is the deliberately non-secure demo screen described below.

## Owner dashboard (interface demo only)

`admin.html` is a **UI demonstration** of the dashboard the salon owner would use. Open it directly (e.g. `http://localhost:5500/admin.html`).

- The sidebar has **Dashboard, Appointments, Services and Settings**.
- The Dashboard view shows summary cards (total / pending / confirmed / completed), a status split and an "Next up" list.
- The Appointments view has a filterable table (search by name or reference, filter by status and by service) and a per-row status control.
- The top bar has a **Log out** button that returns to `login.html`, alongside **View public site**.
- It is responsive: sidebar and table reflow into a drawer and stacked cards on tablet and mobile.

**What it is not:**

- Every name, date, service and status is **invented sample data** in `admin.js` (`S27-1031`…`S27-1044`). None of it is a real booking.
- It is **not connected to the public booking form** — sending a WhatsApp request does **not** create a record here, and this page does not claim otherwise.
- **Appointment data is not saved.** No database, no network calls, no cookies, no `localStorage`, no `sessionStorage` for the records themselves. Status changes live in memory only and reset on reload. (The only thing stored anywhere is the demo sign-in's session flag — see below.)
- **It is not protected by a login.** A demo sign-in screen exists at `login.html`, but it only compares the typed credentials against values written in plain text in `login.js`. Signing in sets a single session flag in `sessionStorage`; `admin.html` checks that flag on load and redirects to `login.html` when it is missing, and Log out clears it. That is a convenience gate, **not security** — the flag can be set by hand in devtools and JavaScript can be switched off, so `admin.html` can still be opened directly. The page says so on its own banner and in Settings.
- The page is marked `noindex,nofollow` and is not linked from the public site.

A real database and secure owner authentication are the next phase.

## Demo sign-in screen (not authentication)

`login.html` is a **demonstration** entry point to the dashboard, styled to match the public site.

- **Credentials:** username `admin`, password `12345678`. Both are hard-coded near the top of `login.js`. The password is deliberately **not** printed anywhere in `login.html`.
- Correct credentials navigate to `admin.html`; wrong ones stay on the page and show an error that never repeats what was typed.
- On success it also writes one session flag (`s27AdminDemoSession`) to `sessionStorage` — a browser-side marker only, never the username or password. `admin.js` reads it on load: without it, the dashboard redirects to `login.html` instead of rendering. The dashboard's **Log out** link clears the flag before returning to `login.html`.
- The password field has a show/hide control, and Enter submits the form.
- The form uses `method="post"` **and** calls `preventDefault()`, so the typed password is never sent anywhere and never lands in the URL, a query string or the browser history.
- The page carries the notice *"DEMO LOGIN ONLY — NOT SECURE FOR REAL CLIENT DATA."* and is marked `noindex,nofollow`.

**This is not a security feature.** Anyone can read `login.js` (or view the page source) and see the credentials. The session flag that gates the dashboard is set in the browser, so anyone can set it by hand in devtools and open `admin.html` directly; a visitor with JavaScript disabled also still receives the dashboard's static markup. Do not treat the dashboard as private and do not put real customer data into it. Server-side authentication with hashed, stored credentials is a later phase.

## Business details that are still placeholders

Nothing below is verified information. Every item must be confirmed with the salon before this is shown as a real business website.

- **Prices** — the "FROM ₹299 / ₹999 / ₹499 / ₹799" figures are invented demo values, labelled as such under the services grid. Delete or replace them.
- **Street address** — only "Bankura, West Bengal" is shown. There is no verified street address, so the contact section says *"Location only — full address not supplied yet"* and the map card is a labelled placeholder, not a real map or pin.
- **Opening hours** — "Every day · 10 AM – 8 PM" is a demo value, labelled *"Demo hours — confirm with the salon"*.
- **Phone, email, Instagram and Google Business links** — none exist. No such links have been created, because inventing them would be misleading.
- **Photography** — all images are illustrative Unsplash stock photos, not the studio's own work. Captions say so.
- **Canonical URL, `og:url` and share image** — deliberately omitted. There is no live domain yet, and a made-up one would be misleading. The Open Graph and Twitter Card tags use only the accurate title and description.
- **Structured data (JSON-LD)** — deliberately not added, because it would require a real address, phone number and opening hours.

## Before presenting this to a real salon client

1. Get the salon's written authorisation to use their WhatsApp number, and replace the testing number as described above.
2. Replace the demo prices with real ones, or remove the price line entirely.
3. Add the real street address, opening hours, phone number and any social links the salon actually uses — then replace the map placeholder with a real, chosen map embed.
4. Replace the stock photography with the salon's own photos, with permission, and update the `alt` text.
5. Update `<title>`, the meta description and the Open Graph/Twitter descriptions in `index.html` to match the real business.
6. Once a domain exists, add a canonical `<link>` and real `og:url` / `og:image` values.
7. Re-test the form with the real number on an actual phone before going live.
8. When the backend phase happens, wire `admin.html` (currently a UI demo on sample data) to real storage and add real owner authentication — replacing the demo check in `login.js` with server-side verification and hashed credentials — and keep the "not confirmed until we reply" wording.

## Accessibility notes

Keyboard focus is visible throughout, decorative symbols are hidden from assistive technology, icon-only links have accessible names, and the ticker is not read out repeatedly. The colour palette was adjusted so normal text meets a contrast ratio of roughly 4.5:1 and large text / interface elements meet 3:1.

This is a best-effort pass, **not a certified WCAG audit**. It has not been tested with screen readers or automated accessibility tooling, and it has not been verified on real mobile hardware.
