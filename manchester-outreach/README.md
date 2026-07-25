# Greater Manchester outreach — batch 1

Five Greater Manchester businesses that have an active Google Business Profile but no
working website of their own, each with a one-page website concept and a drafted
outreach email.

Researched 2026-07-25.

```
leads.json                  the five leads + the website case for each (source of truth)
emails/drafts.md            the five outreach emails, ready to send
scripts/build-sites.mjs     generates sites/ from leads.json
scripts/generate-images.mjs generates hero images with the KIE API
sites/                      generated: 5 concept pages + shared style.css
```

## The five leads

| Business | Trade | Borough | Google | Website status |
|---|---|---|---|---|
| Coffee's Cafe | Cafe / breakfast | Salford | 4.7★ · ~148 reviews | None — aggregator pages only |
| Bandido Barbers Oldham | Barbershop | Oldham (Chadderton) | 4.9★ · 21 ratings | None — Fresha + Facebook only |
| Rochdale Motor Services | MOT & repairs | Rochdale | 4.5★ · 84 reviews | None — directories only |
| Stitches Of Bolton | Alterations & tailoring | Bolton | reviews, rating unconfirmed | None found |
| Riz Barbers | Barbershop | Oldham (Chadderton) | strong reviews, rating unconfirmed | Dead `business.site` link |

Full detail, per-business website case, evidence and confidence rating: `leads.json`.

Two caveats worth knowing before you use this:

- **Website absence was verified from the open web, not the Google Places API.** Every
  lead has a `confidence` field and the evidence that backs it. Glance at the live Google
  listing before you send — a site could have appeared since.
- **`Riz Barbers` is a slightly different case.** Their listing points at
  `riz-barber.business.site`. Google retired Business Profile websites in March 2024 and
  those URLs now bounce back to the Google listing, so they have no working site. It is
  also the strongest hook of the five, because it is a concrete, checkable problem.

Three candidates were investigated and dropped for having real websites: The Treehouse
Cafe Salford, Tittertons Family Butchers (Stockport), and Sew Sure (Bolton, which also
carries a 1.0 rating). COCO Nails & Spa Bury was dropped for a `web.app` site.

## No email addresses were found — this is expected

None of the five publishes an email address anywhere public. That is the normal state of
affairs for businesses with no website, and it is not a research gap that more searching
would close. `leads.json` records a `contactRoute` for each one instead — usually the
phone number, sometimes a Facebook or Instagram page.

The practical sequence is: ring the shop, ask who to send it to, then send. Do **not**
guess an address from the business name, and do not use personal Gmail addresses scraped
into directory listings — one turned up during research and it is not a business contact.

Gmail drafts could not be created from the session that wrote this (the Gmail tool needs
interactive approval), so all five emails live in `emails/drafts.md` ready to paste.

## Build and host

The pages are generated, so edit `leads.json` and rebuild rather than editing HTML:

```bash
node scripts/build-sites.mjs
```

Preview locally:

```bash
npx http-server sites -p 8080     # then open http://localhost:8080
```

Host so prospects can see them — keep the directory structure, since each page loads
`../style.css`:

```bash
# Vercel
npx vercel deploy --prod sites

# or GitHub Pages: enable Pages for this repo, after which the links are
# https://hamida1998.github.io/manchester-outreach/sites/<slug>/
```

Then paste each business's URL over `{{DEMO_LINK}}` in its email.

Every page carries a banner and a footer stating it is an unofficial concept prepared by
Nur AI and not the business's own site, and is set to `noindex, nofollow`. Keep both if
you re-theme: sending someone an unlabelled copy of their own business's site is a
different and much worse email.

## Hero images (KIE)

`leads.json` holds a tuned `heroPrompt` per business. To generate:

```bash
export KIE_API_KEY=sk-...
node scripts/generate-images.mjs        # writes sites/<slug>/hero.jpg
node scripts/build-sites.mjs            # pages pick the images up automatically
```

Pages fall back to a themed gradient when no image is present, which is how the current
output looks.

**This has not been run yet.** The environment that produced this repo blocks
`api.kie.ai` at the network policy (`403 Host not in allowlist: api.kie.ai`), and no
`KIE_API_KEY` was available there. The script is complete and syntax-checked; it needs a
machine that can reach `api.kie.ai`. Model defaults to `google/nano-banana`, override
with `KIE_MODEL`.

## Scaling past five

`leads.json` is the only thing that needs to grow — the sites and the email structure
follow from it. What made the difference in finding these five:

- Aggregator sites that mirror Google Business Profile data (`localitybiz.co.uk`,
  `wheree.com`, `localbarber.uk`, `fixter.co.uk`, `cylex-uk.co.uk`) are the fastest way
  to spot a listing with reviews and no website field.
- Trades that skew websiteless: barbers, cafes, independent garages, alterations,
  butchers, hand car washes, nail salons.
- A booking platform is not a website. Fresha, Setmore, Booksy and Treatwell listings
  all mean the business is reachable but owns nothing — that is a stronger pitch, not a
  disqualifier.
- `*.business.site` in a listing means Google built them a page and then switched it off
  in March 2024. Those are the warmest leads of all.
- Always check for a real domain before writing: three of eight candidates had one.
