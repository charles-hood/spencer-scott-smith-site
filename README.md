# Spencer Scott Smith & The Cherokee Roses, website

Proof of concept, November 2026. Hand-authored static HTML, CSS and vanilla JavaScript.
No build step, no framework. One site, band first, with Spencer's solo work as its own
section. Research behind every decision is in the working folder
(`~/projects/spencerscottsmith-and-thecherokeeroses/research-2026-11-02.md`), not in this
public repo.

Preview: https://spencerscottsmith.rockofpages.com (noindex). Production target:
https://spencerscottsmith.com.

## Run locally

```bash
python3 -m http.server 8765
# open http://localhost:8765
```

Paths are root-absolute (`/assets/...`, `/data/...`), so serve it, do not open the files
directly.

## Pages

| File | What it is |
|---|---|
| `index.html` | Band front door: video hero, new single, next shows, watch, the band, catalog, solo door, mailing list |
| `spinning-round-again.html` | Release landing page for the Nov 11, 2026 single, with countdown and pre-save button |
| `shows.html` | All dates with band / solo filter, recent shows, booking blocks |
| `solo.html` | Spencer solo: bio, what he does, solo dates, catalog, tip jar |
| `epk.html` | Press kit: single, bios in three lengths, members, photos, video, quotes, 2026 shows, stage plot, contacts |
| `contact.html` | Booking form and direct emails |
| `404.html` | Not found |

`assets/css/site.css` is the whole design system. `assets/js/site.js` does the nav, the
click-to-load video embeds, the show list, the catalog strip, the forms and the
`MusicEvent` structured data. `data/shows.json` and `data/music.json` are the only files
the band edits week to week.

## Editing shows and music

**Shows:** add an object to `data/shows.json`. Fields: `date` (ISO), `time`, `who`
(`band`, `solo` or `duo`), `venue`, `city`, `note`, `url` (the venue's own ticket link, or
empty for free shows). Past dates move to Recent on their own. The home page shows the next
four band dates; `solo.html` shows solo and duo dates.

Once a Bandsintown for Artists profile exists, the official widget goes into `shows.html`
where the HTML comment says so, and this file becomes the fallback.

**Music:** add an object to `data/music.json`. For an unreleased single set `next: true`
and point `page` at its landing page; when it is out, remove `next` and add the Spotify,
Apple and YouTube links.

## Placeholders to replace before launch

Search the project for `YOUR_FORM_ID` and the visible `todo` pills. The list, in
priority order:

1. Formspree form id in `index.html`, `spinning-round-again.html` and `contact.html`.
2. Headshots and short bios for the four Roses: replace the rose placeholders in the
   member grid on `index.html` and the member list on `epk.html`.
3. Bandsintown artist URL next to the Songkick link on `index.html` and `shows.html`.
4. `booking@` and `press@` aliases on spencerscottsmith.com, or the address Spencer wants.
5. Band promo video for the EPK; stage plot and input list PDFs; one-sheet PDF.
6. Confirm the Georgia Songbirds placement and the MadLife live album status before
   removing those `todo` pills.
7. The splash on `index.html` is for the single cycle. After November 11 it reads
   "out now"; remove it, or repoint it at the next release, when that cycle ends.
8. Remove the `.poc` strip from every page.

Done: pre-save link (HyperFollow), single artwork and 45 label, logo kit as transparent
PNGs, solo signature logo from the vector file, real band photos.

## Assumptions made in this proof of concept

- One site at spencerscottsmith.com, band first. A band domain, if bought, redirects here.
- Every release is credited on streaming to the artist "Spencer Scott Smith", so all
  streaming links point at that profile.
- Hometown is Woodstock, Georgia. Tagline is the band's "rolled in" version.
- The hero loop is 12 seconds of the MadLife footage, cropped to remove the burned-in
  lyric captions, muted, about 1.4 MB. It does not play when the visitor prefers
  reduced motion; the poster shows instead.
- Fonts: League Gothic (headings, nav, buttons) and Spectral (body), from Google Fonts.
  Self-host later if the third-party request matters.
- Colours come from the November 2026 logo kit: ink, bone, burnt mustard (the one
  interactive accent), lichen grey, and brick red kept for the single.
- The bandanna frame is an inline SVG border-image plus two corner cutouts from
  Spencer's bandanna photo (`assets/img/brand/bandanna-corner.png`); the cotton ground
  is two repeating diagonal gradients on `body`. Both are decorative and ignore pointer
  events.
- The splash shows once per session and never for deep links or `?nosplash`.

## Deploy

Push to `main`, then on the droplet:

```bash
ssh -i ~/.ssh/reverse-proxy-key root@167.71.24.36 'cd /var/www/spencer-scott-smith-site && git pull'
```

Caddy serves it at spencerscottsmith.rockofpages.com with `X-Robots-Tag: noindex`. The
runbook is in `~/Projects/reverse-proxy/CLAUDE.md`.

## Old WordPress URLs to redirect at launch

| Old | New |
|---|---|
| `/upcoming-shows/` | `/shows.html` |
| `/contact-2/` | `/contact.html` |
| `/my-saving-grace/` | `/#music` |
| `/official-music-video/` | `/#watch` |
| `/epk/` | `/epk.html` |
| everything else from the theme demo and the dormant store | 404 |
