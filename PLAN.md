# Spencer Scott Smith — Static Site Migration Plan (Phase 1)

**Source:** https://spencerscottsmith.com/ (WordPress)
**Captured:** 2026-06-15 into `./_raw_mirror/` (treat as read-only reference)
**Status:** Phase 1 complete — analysis + plan + questions. **No site code written yet.** Awaiting your answers to the QUESTIONS at the bottom.

---

## 0. TL;DR / headline findings

- The **live, human-facing site is effectively 3 pages**: Home (`/`), Shows (`/upcoming-shows/`), Contact (`/contact-2/`). That's the entire primary nav.
- The WordPress install behind it is **heavily bloated**: ~46 pages and 22 posts, almost all of it **Euphony Pro theme demo content** plus a dormant **WooCommerce store**, a dormant **All-in-One Event Calendar** plugin, and several **orphan pages** not in the nav (EPK, Merch, Instagram, Gallery, Playlist, Promo Video, a single-release page). None of this is reachable from the menu. We drop nearly all of it.
- **Two surprises vs. your brief, both confirmed against source:**
  1. **Shows are NOT in WordPress.** `/upcoming-shows/` embeds a third-party **Loxi.io** calendar widget (`subdomain=sssgigs`, `site-id=78705`). This already works on a static host the same way Juicer does. Your proposed `shows.json` is a viable *alternative*, but it's a real decision — see Q2.
  2. There is real content beyond the 3 nav pages worth preserving — notably a **"My Saving Grace" single** page (Apple Music + Spotify embeds) and a **promo video** — that you didn't mention. See Q1/Q6.
- **SEO is thin:** the homepage has a `<title>` and a canonical tag but **no meta description, no Open Graph, no Twitter cards, and no JSON-LD structured data** anywhere. Big, easy win on the rebuild.
- **Performance is poor:** unoptimized JPEG/PNG (2560×2560 originals, ~900KB–1MB hero shots), jQuery + a dozen plugin CSS/JS bundles, a live Instagram feed, and four media embeds loading eagerly. Lots of headroom for Lighthouse 90+.

---

## 1. Acquisition log (what was captured)

| What | Result |
|---|---|
| `wget --mirror` (level 2, cruft excluded, polite) | 93 files, 38 images, all 3 nav pages + homepage assets. Exit 8 = benign 403/404s on `wp-admin` and broken self-hosted-font URLs. |
| WP REST API (`/wp-json/`) | **Exposed and open.** Saved pages, posts, media (142 items, 2 pages), types, categories, tags → `_raw_mirror/api/` |
| `robots.txt`, `wp-sitemap.xml` | Captured. Sitemap is WP-core default. robots references the dormant `ai1ec` calendar. |
| Brand assets (logo, hero, site icon) | Fetched to `_raw_mirror/brand/` |
| `menu-items` / `navigation` API | 401 / empty — nav read from rendered HTML instead. |

**Hosting origin (incidental):** SiteGround (`charlesh65.sg-host.com`). The SiteGround optimizer baked an absolute server filesystem path into the self-hosted font URLs, so those 404 — cosmetic only, font *families* are still identifiable.

---

## 2. Page / route map

### 2a. Real site (in the primary nav — these we rebuild)

| URL | Title | What's actually on it |
|---|---|---|
| `/` (page id 6111 "bio") | *Spencer Scott Smith — Red clay music mixed with the Mississippi mud.* | Front-page template aggregating: hero (logo over header image), **Biography** prose, **Spotify album** embed, **Spotify artist** embed, **two YouTube** videos, and the **Instagram feed**. |
| `/upcoming-shows/` (6255) | Upcoming Shows | A single **Loxi.io** embed (`<script src="https://sssgigs.loxi.io/embed/client.js">` + config `<p class="loxi">`). Dark theme, accent `#f5b142`. |
| `/contact-2/` (6211) | Contact | **Contact Form 7** form: Your name, Your email, Subject, Your message (optional), Submit. |

### 2b. Orphan / candidate content (NOT in nav, but real — decide per Q1)

| URL | Notes |
|---|---|
| `/my-saving-grace/` (6265) | "My Saving Grace" single. **Apple Music** album embed (`1675174889`) + **Spotify album** embed (`1Yy6POlzT2QL6z32rxiyHM`). Good candidate for a Music section. |
| `/official-music-video/` (5821) | Promo video — YouTube `_1AGcPRqdkM`. |
| `/epk/` (6218), `/merch/` (6215) | Both literally just "**\*\*\* COMING SOON \*\*\***". Placeholders. |
| `/instagram/` (6105), `/gallery-section-page/` (5903), `/playlist/` (6009) | IG feed page (dup of homepage feed); a photo gallery; and a placeholder using WP's default audio playlist (demo text). |

### 2c. Cruft we drop entirely (theme demo + dead plugins)

- **Euphony Pro demo posts** (22): "Typesetting & Design", "Human Faces in Web Design", "Markup: HTML Tags…", "Lighthouse", "Vespa Scooter", "Beautiful Landscape", etc. — none are SSS content.
- **Euphony Pro demo pages:** `style-guide`, `templates/*`, `front-page`, `hero-content`, `header-top-playlist`, `sample-page*`, `blog`, `about`/`contact` (older dupes), `test`.
- **WooCommerce store:** `shop`, `cart`, `checkout`, `my-account` (no real products surfaced).
- **All-in-One Event Calendar (ai1ec):** `calendar`, `events*`, `event-venues`, `venue-dashboard`, `organizer-dashboard`, `post-an-event`, `my-bookings`, taxonomies. Dormant — superseded by Loxi.
- Jetpack CPTs (`jetpack-portfolio`, `jetpack-testimonial`, `featured-content`, `ect-service`) — empty/demo.

> **Discrepancy flag:** your brief implied a small handful of pages. The *menu* matches that (3 pages), but the install is far larger. I'm treating the nav as the source of truth for "the site" and proposing to rescue only 2b items you confirm.

---

## 3. Media & asset inventory

142 media records: **99 JPEG, 36 PNG, 3 audio (mp3), 3 txt, 1 zip.** Heavy and unoptimized.

**Heaviest assets (flagged for optimization or removal):**

| Size | Dims | File | Disposition |
|---|---|---|---|
| 28.4 MB | — | `Spencer-Scott-Smith-Music-2022.zip` | Press-kit/download bundle. Don't ship in repo; link or host separately. |
| 1.8 MB | — | `While_You_Work_It.mp3`, `Take_it_Back.mp3` | Original tracks (likely from the WP audio playlist). |
| 1.7 MB | — | `bensound-buddy-1.mp3` | **Stock/demo track** — drop. |
| 1.5 MB ea | 2560×2560 | `album_spencer_7D*.jpg`, `album_spencer_7_background*.jpg` | Album art — resize + WebP/AVIF. |
| ~0.9–1.2 MB ea | 1920×1080 / 1707×2560 | `IMG_7396/7/8.jpg`, `IMG_7978-scaled.jpg`, `hero-main.jpg` | Photos — resize + modern formats. |

**Brand assets (measured):**

| Asset | Dims | Size | Notes |
|---|---|---|---|
| `SSS-Logo_Full-w-Glow.png` | 750×434 | 62 KB | The "SSS glow" logo. Glow is baked into the PNG (transparent bg). Want a higher-res or vector source — see Q4. |
| `cropped-IMG_7399.jpg` | 1920×1080 | 335 KB | Homepage hero/header background. |
| `cropped-siteicon512x512jpg-*.jpg` | 512→32/180/192 | — | Favicon/site icon, currently a **JPEG** (no transparency). Should become proper PNG/ICO/SVG set. |

All originals live under `/wp-content/uploads/` (mostly `2023/02/` and `2024/10/`). On the static site these move to a clean `/assets/img/` tree, re-encoded to WebP (with JPEG fallback) and sized to the layouts.

**Page-weight budget proposal:** ≤ 500 KB for the initial render of each page (HTML + CSS + critical JS + hero image), with all embeds (Spotify/YouTube/Loxi/Juicer) lazy-loaded behind facades so they don't count against first paint.

---

## 4. Third-party embeds (must survive the port)

| Service | ID / handle | Where | Port strategy |
|---|---|---|---|
| **Spotify album** | `7oImQwDx5ZqFyTam3OGhoG` | Homepage | Facade → iframe on click |
| **Spotify album** | `1Yy6POlzT2QL6z32rxiyHM` (My Saving Grace) | /my-saving-grace/ | Facade → iframe |
| **Spotify artist** | `5Wp9gpcf5KGO6pVcpgvgLW` | Homepage | Facade → iframe |
| **Apple Music** | album `1675174889` | /my-saving-grace/ | Facade → iframe |
| **YouTube** | `_1AGcPRqdkM` (promo) | Homepage + /official-music-video/ | Facade (poster + click-to-load) |
| **YouTube** | `2aYx4p_MVDQ` | Homepage | Facade |
| **YouTube** | `O_HyZ5aW76c`, `SQEQr7c0-dw` | demo posts | Likely drop (not on real pages) |
| **Loxi.io shows** | `sssgigs` / site `78705` / accent `#f5b142` | /upcoming-shows/ | Keep JS embed (or replace w/ shows.json — Q2) |
| **Instagram (Smash Balloon)** | `@spencerscottsmith_music` | Homepage | **Replace with Juicer** (Q1) |

**Social profiles (for footer/header links):**
YouTube channel `UCGu0g-Knj2tZ6KXf41QnIfw` · Facebook `facebook.com/spencerscottsmithmusic` · Instagram `instagram.com/spencerscottsmith_music` · Spotify artist `5Wp9gpcf5KGO6pVcpgvgLW` · Apple Music single `1675174889`.

---

## 5. Dynamic features — how each dies on a static host & the fix

- **Instagram feed — Smash Balloon "Instagram Feed" plugin** (confirmed: `/wp-content/plugins/instagram-feed`, 182 `sbi_` markers, `sb_instagram`). It's PHP that calls the IG API server-side and auto-refreshes. **It cannot run on a static host as-is.** → Replace with **Juicer** HTML/JS embed (Q1).
- **Shows — Loxi.io embed.** Already a client-side JS embed, so it *does* survive a static port unchanged. Decision is whether to keep it or move to a self-managed `shows.json` (Q2).
- **Contact form — Contact Form 7** (`contact-form-7/v1` namespace, plugin present, form id 6032). CF7 posts to WP server-side; submissions go to an email set in WP admin **that we can't see from the API**. → Replace with a form service, **Formspree or Web3Forms** (Q3).
- **Search — WordPress server-side search.** Not present in the nav anyway; will not exist on static. No replacement needed (3-page site).

---

## 6. Theme, fonts, colors, logo

- **Theme:** Catch Themes **Euphony Pro** (a music theme) — `wp-theme-euphony-pro`, `front-page` template, `color-scheme-default`, `absolute-header`, `has-header-media`. This is the source of all the demo cruft.
- **Fonts (self-hosted via the WP font optimizer):** **PT Sans** (body) + **Mrs Saint Delafield** (a cursive script display face, used for accents/headings). On the rebuild I'd self-host both as WOFF2 with `font-display: swap` (or substitute a closer pairing if you prefer — Q4).
- **Palette (from theme CSS, by frequency):** amber/gold **`#f9a926`** is the dominant accent (the Loxi embed independently uses `#f5b142`), on a **dark** base (`#151515`, `#222`, `#000`), white text `#fff`. Secondary hits: a gold→orange gradient (`#ffe259`→`#ffa751`) and occasional green `#0f834d` / red-orange `#e2401c`. Proposed system: **dark background, amber accent, white text**, matching the existing brand and the Loxi widget's dark theme.
- **Logo:** `SSS-Logo_Full-w-Glow.png` — the "SSS" monogram with a baked-in glow on transparent background. Works on dark. I'll respect `prefers-reduced-motion` for any added animated glow.

---

## 7. SEO surface (current)

- Homepage `<title>`: **"Spencer Scott Smith – Red clay music mixed with the Mississippi mud."** (good tagline — reuse).
- `<link rel="canonical">` present, **non-www** (`https://spencerscottsmith.com/`).
- **Missing entirely:** meta description, Open Graph, Twitter cards, JSON-LD (`MusicGroup`/`Person`/`Event`). Favicon is a JPEG site-icon.
- Sitemap: default `wp-sitemap.xml` (lists all the cruft — we replace with a clean hand-rolled `sitemap.xml`).

**Rebuild SEO plan:** per-page title/description/canonical; OG + Twitter cards with a proper share image; JSON-LD `MusicGroup` (+ `Person`) site-wide and `Event` per show (if shows.json — see Q2); clean `sitemap.xml` + `robots.txt`.

---

## 8. WordPress/plugin bloat being dropped

jQuery + Euphony Pro + Smash Balloon Instagram Feed + Contact Form 7 + All-in-One Event Calendar + WooCommerce + Jetpack + `musician-gigs` (Loxi plugin) + `essential-widgets` + `catch-instagram-feed-gallery-widget` + `catch-infinite-scroll` + `catch-web-tools` + `to-top` + `localizejs` + SiteGround optimizer/security. The homepage ships ~14 plugin CSS/JS bundles. **All replaced by a few KB of hand-written CSS + vanilla JS.**

---

## 9. Recommended architecture & stack

**Recommendation: hand-authored static HTML + minimal vanilla JS, no build step, no framework.**

Rationale: the real site is 3 pages (plus maybe 1–2 rescued ones). A static-site generator (Eleventy) would buy templated header/footer and a loop over `shows.json`, but at the cost of a Node toolchain, `npm install`, and a build step before every git-push deploy — overhead that outweighs the benefit at this scale and works against "a non-developer can edit it." Shared header/footer can instead be handled with a tiny HTML-include script or by simply keeping the 3 pages in sync (they're short). Shows render client-side from `shows.json` (if you choose that route) with no build.

> If you'd rather have templating, I'll switch to **Eleventy** — it's the right tool the moment this grows past ~5 pages or you want the shows loop server-rendered for SEO. Your call (Q7). I'm defaulting to no-build.

**Principles applied:** semantic HTML5, mobile-first responsive, modern image formats (WebP + fallback) with explicit sizes + lazy loading, **facade pattern** for every Spotify/YouTube/Apple embed, deferred scripts, no jQuery, full a11y (alt text, keyboard nav, focus states, ARIA, `prefers-reduced-motion`), and the SEO plan in §7. Target Lighthouse 90+ and the §3 weight budget.

---

## 10. Proposed repo structure

```
spencersmith/
├── index.html                 # Home (bio, music, video, IG feed)
├── shows.html                 # /upcoming-shows/  (Loxi embed OR shows.json render)
├── contact.html               # /contact-2/  (form-service form)
├── (music.html?)              # optional, if we rescue My Saving Grace / video — Q1
├── 404.html
├── assets/
│   ├── css/styles.css
│   ├── js/
│   │   ├── main.js            # nav, embed facades, reduced-motion
│   │   └── shows.js           # renders shows.json (if chosen)
│   ├── img/                   # optimized WebP/JPEG, logo, hero, favicons
│   └── fonts/                 # self-hosted WOFF2 (PT Sans + script face)
├── data/
│   └── shows.json             # editable show list (if chosen — Q2)
├── partials/                  # header.html / footer.html (if include approach)
├── sitemap.xml
├── robots.txt
├── README.md                  # run locally, edit shows, swap images, update Juicer, URL map
├── .gitignore                 # ignores _raw_mirror/, OS junk
└── _raw_mirror/               # read-only source capture (git-ignored)
```

**Old → new URL map (draft, for your redirects):**

| Old | New | Notes |
|---|---|---|
| `/` | `/` | unchanged |
| `/upcoming-shows/` | `/upcoming-shows/` (or `/shows/`) | keep old path to preserve links; alias `/shows/` optional |
| `/contact-2/` | `/contact/` | `/contact-2/` is a WP artifact; redirect old→new |
| `/my-saving-grace/`, `/official-music-video/` | `/music/` (if rescued) | redirect → new section, else 410 |
| all theme-demo / shop / events / calendar URLs | — | let them 404/410 (never real content) |

---

## QUESTIONS (please answer before I build)

1. **Scope beyond the 3 nav pages.** Keep it to **Home / Shows / Contact**, or also rescue: (a) the **"My Saving Grace" single** (Apple Music + Spotify), (b) the **promo video**, (c) a **photo gallery**, (d) **EPK** / **Merch** (currently empty "Coming Soon")? My default: fold (a) and (b) into the Home page (or a small `/music/` page) and drop the rest. Tell me which to include.

2. **Shows.** The live site uses a **Loxi.io** embed (`sssgigs`), which already works on a static host. Do you want to **(A) keep the Loxi embed** (zero maintenance, but a 3rd-party script + no per-show JSON-LD), or **(B) move to a self-managed `shows.json`** I render client-side with `Event` structured data (full control + SEO, but you edit a file per show)? If (B), please **export your current + upcoming shows** from Loxi (or paste them) — date, time, venue, city/state, ticket URL.

3. **Contact form.** Default is a form service (no server). **Formspree or Web3Forms?** And: **what email address** should submissions go to, and do you want **spam protection** (honeypot + optional hCaptcha/Turnstile)?

4. **Brand assets.** Can you provide **higher-res or vector source** for the SSS glow logo (SVG/AI/PNG ≥1500px)? Keep fonts **PT Sans + Mrs Saint Delafield**, or open to a closer/cleaner pairing? Any official **brand color hex values**, or should I standardize on the extracted **amber `#f9a926` on dark**? Got a **share/OG image** preference, or should I generate one from the hero + logo?

5. **URLs / SEO.** Domain stays **spencerscottsmith.com**? Prefer **non-www** (current) or **www**? OK to change `/contact-2/` → `/contact/` (with a redirect you'll configure)?

6. **Instagram (Juicer).** Per your note we'll use Juicer. Please send your **Juicer feed ID and embed snippet** (the `<script>` tag + the `<div class="juicer-feed" data-feed-id="…">`), or confirm and I'll tell you exactly what to copy from the Juicer dashboard.

7. **Build tooling.** OK with **no build step (plain HTML + vanilla JS)**, or do you want **Eleventy** for templated header/footer + a server-rendered shows loop? My default: no build.

8. **Music links.** I found Spotify artist `5Wp9gpcf5KGO6pVcpgvgLW`, two Spotify albums, an Apple Music single, a YouTube channel, Facebook, and Instagram. Any **others** to feature (Bandcamp, Amazon Music, TikTok, SoundCloud, mailing-list/newsletter signup)?

---

*Stopping here per Phase 1. I'll start building once you've answered.*
