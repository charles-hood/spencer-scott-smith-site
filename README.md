# Spencer Scott Smith — static site

A hand-authored static site (HTML + CSS + vanilla JS, **no build step, no framework**).
Push to deploy. Theme: *"Stage Light & Red Clay"* — warm cinematic dark, amber accent,
film-grain texture. Replaces the old WordPress/Euphony Pro site.

## Run locally

No tooling required — it's static files. From the project root:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Any static server works. Use a server rather than opening the files directly, so the
root-absolute `/assets/...` paths and the embeds resolve correctly.)

## ⚠️ Before going live — fill in 3 placeholders

Search the project for `REPLACE_WITH` / `YOUR_FORM_ID` and swap in real values:

| Placeholder | File | What to paste |
|---|---|---|
| `REPLACE_WITH_JUICER_FEED_ID` | `index.html` | Your Juicer feed name (from the Juicer dashboard → *Add Feed* → the feed slug). |
| `REPLACE_WITH_BANDSINTOWN_ARTIST_NAME_OR_ID` and `REPLACE_WITH_BANDSINTOWN_ARTIST_ID` | `shows.html` | From **artist.bandsintown.com → Widgets → Copy Code** (see below). |
| `YOUR_FORM_ID` | `contact.html` | Your Formspree form id, e.g. `xyzabcd` → `https://formspree.io/f/xyzabcd`. |

Until each is set, that section shows a graceful placeholder/fallback (the form falls back
to a normal POST, the widgets show a loading/fallback state). Nothing breaks.

## How to edit common things

### Upcoming shows (Bandsintown)
Shows are **not** stored in this repo — they live in your **Bandsintown for Artists**
account and the widget pulls them live. To wire it up:

1. Claim/confirm the artist profile at **artist.bandsintown.com**.
2. Go to **Widgets**, style if you like, click **Copy Code**.
3. In `shows.html`, replace the `<a class="bit-widget-initializer" …>` block inside
   `<div class="bit-host">` with the anchor from your copied code. **Keep the
   surrounding `<div class="bit-host" data-lazy-script="…">`** — that's what lazy-loads
   the script (deferred, so it doesn't block first paint) and styles it to the theme.
   **Do not** also paste Bandsintown's `<script>` tag; the `data-lazy-script` handles it.
4. Update the two `REPLACE_WITH_BANDSINTOWN_ARTIST_ID` values (the widget's artist
   name/id, and the `bandsintown.com/a/<id>` fallback link).

After that, you never touch the code to change shows — add/edit dates in Bandsintown.

### Contact form (Formspree)
1. Create a form at **formspree.io**, set the destination email there.
2. Put its id into the `action="https://formspree.io/f/YOUR_FORM_ID"` in `contact.html`.
3. (Optional) enable reCAPTCHA in the Formspree dashboard. A honeypot field is already
   included for basic bot filtering.

### Instagram feed (Juicer)
Set `data-feed-id` on the `<ul class="juicer-feed" …>` in `index.html`. The Juicer
script + CSS are lazy-loaded by `assets/js/main.js` when the section scrolls into view.
To restyle, adjust the `.juicer-host …` overrides in `assets/css/styles.css`.

### Swapping images
Drop replacements in `assets/img/photos/` (or `assets/img/brand/`) and point the markup
at them. Keep both a `.webp` and a `.jpg` fallback. To re-optimize a new source photo:

```bash
# hero photo (portrait-orientation; fills the right half of the split hero)
magick source.jpg -strip -resize 1200x -quality 64 assets/img/photos/hero-portrait-lg.webp
magick source.jpg -strip -resize 1200x -quality 66 assets/img/photos/hero-portrait-lg.jpg
magick source.jpg -strip -resize 820x  -quality 62 assets/img/photos/hero-portrait-sm.webp
```

The hero is a **split layout**: type on the dark left, this photo on the right (it also
backs the "Shows" teaser, darkened). Use a strong portrait/3:4 image with the subject
lower-center. Image references live in the `<picture>` blocks in `index.html`; update
`width`/`height` on the `<img>` to match the new aspect ratio (prevents layout shift).

### Music / video embeds
All embeds use a **facade** (a click-to-load poster) so they don't slow first paint.
To change one, edit the `data-id` on the `<button class="facade" …>`:
- YouTube: `data-embed="youtube" data-id="VIDEO_ID"`
- Spotify: `data-embed="spotify" data-id="album/ID"` (or `artist/ID`)
- Apple Music: `data-embed="apple" data-id="us/album/slug/ID"`

### Edit text
Page copy is plain HTML in `index.html`, `shows.html`, `contact.html`. Footer + nav are
duplicated across the three pages (no build step) — if you change a nav/footer link,
update it in all three.

## Repo structure

```
index.html      Home — hero, bio, music, video, shows teaser, Instagram
shows.html      Bandsintown widget page
contact.html    Formspree contact/booking form
404.html        Not-found page
assets/css/     styles.css (the whole design system)
assets/js/      main.js (nav, facades, reveals, lazy-loaded third-party scripts)
assets/img/     brand/ (logo, favicons, OG image) + photos/ (optimized webp+jpg)
sitemap.xml     hand-maintained
robots.txt
_raw_mirror/    read-only capture of the old WordPress site (git-ignored, not deployed)
PLAN.md         Phase-1 migration analysis + decisions
```

## Old → new URL map (for redirects in your hosting layer)

| Old (WordPress) | New | Action |
|---|---|---|
| `/` | `/` | unchanged |
| `/upcoming-shows/` | `/shows.html` | 301 redirect |
| `/contact-2/` | `/contact.html` | 301 redirect |
| `/my-saving-grace/` | `/#music` | 301 (single now featured on home) |
| `/official-music-video/` | `/#watch` | 301 |
| `/epk/`, `/merch/`, `/instagram/`, `/gallery-section-page/`, `/playlist/`, and all theme-demo / WooCommerce / event-calendar URLs | — | let them 404/410 (never real content) |

## Notes
- **Domain/canonical:** all canonical/OG URLs use `https://spencerscottsmith.com` (non-www).
  If you choose `www`, find-and-replace the canonical + `og:url` tags and `sitemap.xml`.
- **Performance:** images are WebP (+JPEG fallback), embeds are facade/lazy-loaded, scripts
  are deferred, no jQuery. Third-party scripts (Juicer, Bandsintown) load only on scroll.
- **Accessibility:** keyboard-navigable nav, visible focus rings, skip link, alt text, and
  `prefers-reduced-motion` is respected for all motion/glow.
- **Fonts:** Fraunces (display) + Hanken Grotesk (body) + Mrs Saint Delafield (script),
  loaded from Google Fonts. Self-host later if you want to drop the third-party request.
