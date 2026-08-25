# SkyLine Stretch Ceilings — landing page

React + Vite implementation of the `SkyLine Stretch Ceilings.dc.html` design
from the [Claude Design project](https://claude.ai/design/p/c76d3028-b272-4b6b-a228-3d63d6579969).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

No API keys, accounts or environment variables are needed — clone and run.

## Structure

```
index.html                 App shell
vercel.json                SPA rewrite (every non-API path -> index.html)
public/assets/             Photography and logos, served from /assets/*
api/lead.js                Serverless contact-form handler
src/
  main.jsx                 Entry: BrowserRouter + App
  App.jsx                  Header, routes, footer, route scrolling
  styles.css               All styling, organised section by section
  data.js                  Every piece of copy: nav, services, FAQ, reviews…
  geo/service-area.json    Municipal boundaries for the map
  hooks/useScrollReveal.js IntersectionObserver fade-in
  lib/                     reCAPTCHA + UTM helpers
  components/
    Home.jsx               The landing page, section by section
    PrivacyPolicy.jsx      /privacy
    …                      One component per page section
```

### Routing

Single-page app on `react-router-dom`. Header and footer sit outside
`<Routes>`, so they persist across navigation instead of remounting.

```
/          Home
/privacy   PrivacyPolicy
*          redirect to /
```

Things worth knowing:

- **`vercel.json` is required.** A deep link straight to `/privacy` is a real
  HTTP request; without the rewrite the host returns 404 before React ever
  loads. `/api/*` is excluded so the serverless function still resolves.
  Vite's dev and preview servers do this fallback on their own.
- **`useRouteScroll` in `App.jsx`** scrolls on navigation — a router does not.
  Without it you land partway down the privacy policy after clicking the
  footer link from the bottom of the landing page. It honours a hash target
  (`/#ceilings`) when there is one, otherwise scrolls to the top.
- **Nav links are root-relative** (`/#ceilings`) and rendered with `<Link>`, so
  they work from any route.
- **`useScrollReveal` lives in `Home.jsx`**, not `App.jsx`, so the observer is
  rebuilt when the landing page mounts again after visiting another route.

To add a page: create the component, add a `<Route>` in `App.jsx`, and add its
path to `PAGES` in `vite.config.js` so it lands in the sitemap.

### robots.txt and sitemap.xml

Both are generated at build time by the `seo-files` plugin in
`vite.config.js`, from `VITE_SITE_URL`.

Set `VITE_SITE_URL` to the production origin with no trailing slash
(e.g. `https://skylineceilings.ca`). Without it the build still emits
`robots.txt`, but **skips `sitemap.xml` and prints a warning** — a sitemap
listing a domain you do not own is rejected by search engines, so no file is
better than a guessed one.

Copy lives in `src/data.js`, not in the components — editing text, phone
numbers, cities or FAQ entries should never mean touching JSX.

Styling is a single stylesheet with semantic class names. Only genuinely
dynamic values (accordion `max-height`, slide `opacity`, portfolio
`aspect-ratio`) stay inline.

## Service-area map

`src/components/ServiceAreaMap.jsx` renders a dark map outlining **every
municipality in the service area** in brand orange, each with a hover tooltip.
Built on [Leaflet](https://leafletjs.com/) — open source, no API key, no
account, no billing.

Two free pieces:

- **Tiles** — [CARTO](https://carto.com/basemaps) `dark_all` basemap over
  OpenStreetMap data. Keyless; attribution is rendered by Leaflet bottom-right
  and must stay visible.
- **Boundaries** — `src/geo/service-area.json`, a 12-feature GeoJSON collection
  of the real municipal polygons from OpenStreetMap, fetched via Nominatim,
  simplified and committed (12 KB). Bundled, not fetched at runtime, so the map
  has no third-party dependency beyond tile images.

The 12 features cover the 10 cities in `data.js`, plus both halves of the two
split municipalities: Nominatim's default match for "North Vancouver" and
"Langley" is the small *City*, so the *District of North Vancouver* and
*Township of Langley* are included as well — otherwise most of the populated
area around them would sit outside the outline.

The map frames itself to the polygon's bounds, so there is no zoom level to keep
in sync. Scroll-wheel zoom is off (scrolling the section scrolls the page);
the +/− buttons and dragging still work.

### Changing the outlined cities

Edit `src/geo/service-area.json` — any GeoJSON `FeatureCollection` works, and
`properties.name` becomes the hover tooltip. To pull another municipality from
OpenStreetMap:

```
https://nominatim.openstreetmap.org/search?city=Burnaby&state=British+Columbia
  &country=Canada&format=jsonv2&polygon_geojson=1&polygon_threshold=0.00008
```

`polygon_threshold` trades detail for file size. Wrap the returned `geojson`
object as `{ "type": "Feature", "properties": {}, "geometry": … }`.

### Usage terms

OpenStreetMap data is ODbL — attribution required, which the map already shows.
CARTO's basemaps are free for reasonable volumes; if the site starts drawing
serious traffic, check their [terms](https://carto.com/legal/) or swap
`TILE_URL` for another provider. The tile URL is a single constant in the
component.

## Hero A/B switcher

The design ships two hero treatments and a floating toggle to compare them.
`App.jsx` keeps a `heroVariant` state (`'a'` = dark, `'b'` = image slider).
To ship a single hero, delete the `<HeroSwitcher />` line and render the one
you want.

## Contact form → Telegram and email

The endpoint lives at `/api/lead` on **both** hosting targets. All of the logic
sits in one platform-agnostic module and each runtime gets a thin adapter, so
the same commit deploys to Vercel and to Cloudflare Pages with no edits:

```
shared/lead.js            the whole handler: validation, reCAPTCHA, Telegram
                          in:  { body, env }   out: { status, body }
api/lead.js               Vercel adapter        (req, res)
dist/_worker.js           Cloudflare adapter    generated at build time
vite.config.js devApi()   local adapter         connect middleware
```

The core only uses web-standard APIs (`fetch`, `AbortController`,
`URLSearchParams`), so it runs unchanged on Node and on the Workers runtime.
Env vars reach it as an argument — `process.env` on Vercel and in dev,
`context.env` on Cloudflare — which is the one difference that would otherwise
force a code change.

Verified: all eight request cases (wrong method, empty body, each invalid
field, honeypot, valid lead) return byte-identical status and JSON from both
adapters.

`src/components/Contact.jsx` POSTs to `/api/lead` and handles the
sending / sent / error states.

### Payload

```jsonc
{
  "name":           "Ivan Test",
  "phone":          "+1 604 555 0123",
  "email":          "you@example.com",
  "postal_code":    "V6B 1A1",
  "message":        "",               // optional
  "website":        "",               // honeypot, must stay empty
  "recaptchaToken": "…",              // optional
  "utm_source":     "…"               // plus the other utm_* keys
}
```

Required: `name`, `phone`, `email`, `postal_code`. Only `message` is optional.
Postal code is required because it tells you whether the address is in the
service area before anyone drives out. To relax any of them, drop the check in
`validate()` in `Contact.jsx` **and** the matching guard in `shared/lead.js` —
both sides enforce it.

Every format is checked on both sides: the client for instant feedback, the API
again because client checks are only UX.

The Telegram message turns the phone into `tel:` **and** `wa.me` links and the
email into a `mailto:`, so a lead is one tap to answer.

Phone validation is deliberately format-agnostic rather than a full
international parser — the service area is Metro Vancouver, so a country-code
picker (`react-phone-input-2` + `libphonenumber-js`) would add roughly 80 kB
gzip for no benefit here. Swap it in if the service area ever widens.

### Setup

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Notes |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | channel | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | channel | Message the bot, then read `https://api.telegram.org/bot<TOKEN>/getUpdates` |
| `RESEND_API_KEY` | channel | From [resend.com](https://resend.com) |
| `LEAD_EMAIL_TO` | channel | Recipient; several allowed, comma-separated |
| `LEAD_EMAIL_FROM` | no | Needs a domain verified in Resend; defaults to `onboarding@resend.dev` |
| `VITE_SITE_URL` | no | Production origin **with** the scheme; drives the sitemap |
| `VITE_RECAPTCHA_SITE_KEY` | no | Public — inlined into the bundle |
| `RECAPTCHA_SECRET` | no | Server-side only |

**Delivery channels.** Telegram and email are independent and both optional,
but **at least one pair must be set** or the endpoint answers `500 No delivery
channel is configured`. Each channel activates only when its own variables are
present, so you can run either alone or both.

They are sent in parallel, and a lead counts as delivered if **any** channel
accepts it — the customer sees success as long as the enquiry landed somewhere,
and the failing channel is logged with its error. Only when every channel fails
does the endpoint return `502`. Verified against a stubbed transport:

```
both succeed               -> 200  lead kept
telegram ok, email fails   -> 200  lead kept
telegram fails, email ok   -> 200  lead kept
both fail                  -> 502  reported as failed
```

**Why Resend and not SMTP.** The Cloudflare Workers runtime has no raw TCP, so
nodemailer and every other SMTP client is impossible there. Resend is an HTTPS
API, so the same code runs on both hosts. Switching provider means rewriting
`sendEmail()` in `shared/lead.js` — nothing else knows about it.

The email sets `reply_to` to the customer's address, so replying from the inbox
answers them directly.

Add the same names in your host's dashboard — Vercel under **Project Settings →
Environment Variables**, Cloudflare Pages under **Settings → Environment
variables** (mark the token and secret as *Secret*). Only `VITE_*` reaches the
browser; the Telegram token and reCAPTCHA secret never leave the server.

### Deploying

Both targets build with `npm run build` and publish `dist`.

| | Vercel | Cloudflare Pages |
| --- | --- | --- |
| Function source | `api/` (native) | `dist/_worker.js` (emitted by the build) |
| SPA fallback | `vercel.json` rewrite | Pages default (see below) |
| Worker routing | automatic | `public/_routes.json` (`/api/*` only) |

Each host ignores the other's config files, so they can all sit in the repo at
once.

**Why `_worker.js` and not the `functions/` directory.** The documented Pages
approach is a `functions/api/lead.js` file, and that is what this project used
first — but Pages never picked it up (`POST /api/lead` answered `405` with an
empty body, i.e. the static asset server refusing the method, and `GET`
returned `index.html`). Whether Pages finds `functions/` depends on project
settings that are invisible from the repo. The build output directory is always
published, whatever the deploy method, so the adapter is generated into
`dist/_worker.js` instead and the problem cannot recur.

`_routes.json` limits the Worker to `/api/*`. Everything else is served straight
from static assets with `_redirects` applied, so the Worker is not in the path
of normal page loads — and the `/*  /index.html  200` fallback cannot swallow
`/api/lead`.

`shared/lead.js` has no imports, so the build inlines it verbatim ahead of a
short Worker entry — no bundler step and no extra dependency, and the core
stays the single source of truth.

**No `_redirects` on Cloudflare.** The usual SPA line `/*  /index.html  200` is
rejected by Pages — the build log says *"Infinite loop detected in this rule and
has been ignored"*, because Pages normalises `/index.html` back to `/`, which
matches `/*` again. It reported `Parsed 0 valid redirect rules` and the file did
nothing but produce a warning on every build, so it was removed. Pages already
serves `index.html` for paths with no matching asset, which is what deep links
need; verified live — `/privacy` and an unknown path both return `200 text/html`.
Vercel still needs its own rewrite, which is why `vercel.json` stays.

### Behaviour

- **reCAPTCHA only rejects on a score, never on a failed check.** Verification
  runs when both the site key and the secret are set. A low score (below `0.3`,
  since mobile devices routinely score 0.3–0.5) is a real bot signal and gets a
  403. Anything else — timeout, `success: false`, an unregistered domain, a
  mismatched key pair, a reused token — lets the submission through and logs the
  error codes instead.

  That asymmetry is deliberate. Blocking on `success: false` turns a single
  console misconfiguration into *every enquiry silently disappearing*, and it
  buys nothing: a bot can already omit the token entirely, which lands on the
  skip path. The honeypot and field validation still apply either way.

  **Domains must be registered.** reCAPTCHA rejects tokens from hosts that are
  not on the site key's allow-list, and the badge then shows *"ERROR for site
  owner: Invalid domain for site key"*. Cloudflare gives every preview
  deployment a fresh `<hash>.<project>.pages.dev` host, so register the bare
  `<project>.pages.dev` — subdomains of a listed domain are accepted — plus the
  production domain.
- **Honeypot.** A hidden `website` field; if it is filled the API answers `200`
  and silently drops the lead, so bots get no signal.
- **UTM tags** are read off the landing URL and kept in `sessionStorage`
  (`src/lib/utm.js`), so a lead submitted after scrolling still carries the
  campaign that produced it.
- **Input is HTML-escaped** before it goes into the Telegram message. Telegram
  parses it with `parse_mode: HTML`, so an unescaped `<` in a customer's message
  makes the whole send fail with a 400 — worth porting back to your other
  project, which interpolates the fields raw.
- Fields are length-capped and both outbound calls have abort timeouts
  (4 s reCAPTCHA, 8 s Telegram).

### Local development

`npm run dev` mounts the same handler through a small middleware in
`vite.config.js`, so the form works locally — Vite alone does not serve `/api`.
Verified responses:

```
GET  /api/lead                    405 {"message":"Method not allowed"}
POST /api/lead  (no name)         400 {"message":"Missing required fields"}
POST /api/lead  (honeypot set)    200 {"success":true}   ← dropped
POST /api/lead  (valid)           200 {"success":true}
```

### reCAPTCHA badge

Google's floating badge appears bottom-right by default, which satisfies their
branding requirement. If you hide it, you must instead show the "protected by
reCAPTCHA — Privacy / Terms" text near the form.

## Brief cross-check

Copy was audited against the client brief. Corrections already applied are in
`src/data.js`. The items below are **not** fixed in code because they are the
client's call, and all of them are live claims on the page today.

### Blocking before launch

| Claim on the page | What the brief says |
| --- | --- |
| Three testimonials + "Rated 5.0 by clients across Vancouver" | No completed Canadian projects, no orders yet, Google profile still in progress. The names literally read "Client Name" — these are template placeholders. Publishing them as real reviews is deceptive and is exactly what Canada's Competition Act penalises. Replace with real, attributable reviews or delete the Reviews section and its nav link. |
| "Licensed & insured" (was in the footer and the Why-us grid) | Trust elements answer: *"поки нічого"* — no business licence, liability insurance or workers' comp confirmed. Both mentions have been **removed** pending proof; put them back once documents exist. |
| Portfolio titled "Recent installs" / "Our work" | No Canadian projects yet. Either relabel (e.g. "Finishes and lighting we install") or state that photos are from the team's earlier work. |

### Verify before launch

- **Fire ratings.** The page says films meet North American safety standards, and the Why-us grid now names Laqfoil / Descor Class 1. The brief supports this (CAN-S102, ASTM-E84, EN 13501-1) but adds: confirm the certificates are on hand *and* that SkyLine is permitted to cite them.
- **Experience.** "Since 2017" is on the page. Actual trading was Ukraine 2017–2022, none in Canada. The earlier "A decade of experience" heading was softened to "Experience since 2017".
- **Business address.** The page says "Based in Vancouver"; the registered address is 398 Hickey Dr, Coquitlam. The client's mark-up asks for Vancouver framing, so it was left as is — but the home address is deliberately not published.
- **Hours.** The brief gives only "8AM – 6PM" with no days. The invented Mon–Fri / Sat / Sun breakdown was removed; add days back once confirmed.
- **LED warranty.** Brief marks it "треба уточнити". The page states up to 10 years (10 on materials, 3 on installation) and stays silent on LED — keep it that way until confirmed. Note the brief's own summary line says "Загальна гарантія 15 років"; the site deliberately uses the lower, per-component figure.

### Applied from the brief

- "Dust-free" → "low-dust" / "minimal dust" throughout — the brief explicitly flags *«без пилу» замість «мінімум пилу»* as a phrase to avoid.
- Height loss corrected: was "1–2 inches"; the brief gives under one inch for standard PVC, ~0.25" for Descor, and ~6" for backlit translucent.
- "Backlit / Luminous" renamed **Translucent** — fully luminous ceilings (item 10) are *not* offered; translucent (item 3) is.
- Added **Track Lighting** — one of the three priority lighting solutions for the first screen, previously missing.
- Added a "We also install" list: satin, fabric/polyester, multi-level, acoustic, starry sky, **stretch walls**, repair & replacement. All offered per the brief, none had photography — listed as text rather than illustrated with unrelated images. Stretch walls were an explicit client request.
- Added the load-bearing FAQ (membrane holds nothing; fixtures mount above, penetrations reinforced) and a "where we don't recommend it" FAQ — both marked ОБОВ'ЯЗКОВО.
- Installation times aligned to the brief: 4–6 hours standard room, 2–3 days for light lines / multi-level / commercial; 1–2 weeks from measurement to install.
- Footer now carries the Instagram, Facebook and Google links from the brief.

## Note on the image filenames

The uploaded asset set arrived numbered one higher than the design expects
(`g04.jpg` held the image the page references as `g03.jpg`, and so on all the
way up). The files were renamed down by one to match, verified by SHA-256
against the originals in the design project. Two extensions were corrected at
the same time: the design's `g09.png` and `g10.png` are genuinely PNGs.

If you re-export assets from the design project, keep the original names —
no renaming needed.
