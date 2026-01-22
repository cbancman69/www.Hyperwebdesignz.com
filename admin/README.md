# Admin — Futuristic Portfolio

This folder contains a tiny admin UI for generating short-lived demo tokens (QR) and editing testimonials.

How to use

- Start the server and open `/admin` in your browser.
- Log in with the value of `ADMIN_SECRET` from your environment (see `.env.example`).
- Once authenticated you'll see:
  - QR Generator: create short-lived tokens and QR codes that open the SPA at `/s/:token`.
  - Testimonials Editor: load, edit, and save `public/data/testimonials.json` via the authenticated `POST /admin/testimonials` endpoint.

Security notes

- The admin UI uses an in-memory session stored in an `admin_sid` cookie. For production, replace with a proper session store and stronger auth.
- `ADMIN_SECRET` should be set to a strong random value and never committed to source control.

API endpoints used by the admin UI

- `POST /admin/login` — body: `{ "secret": "..." }` sets a session cookie on success.
- `POST /admin/generate` — body: `{ ttlMs: <ms> }` returns `{ token, url, qr, expires }`.
- `POST /admin/testimonials` — body: array of testimonials (replaces `public/data/testimonials.json`).
