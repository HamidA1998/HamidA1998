# Lead dossiers — sources and confidence

Per-lead detail (Google data, the website case, contact route) lives in `../leads.json`.
This file records **where each finding came from** and **what was ruled out**, so the
research can be audited or repeated.

Researched 2026-07-25. Method: open-web search across directory aggregators that mirror
Google Business Profile data, booking platforms and social pages. Website-absence was
**not** confirmed through the Google Places API, so every lead carries a confidence
rating and should be eyeballed on the live listing before contact.

---

## 1. Coffee's Cafe — Salford · confidence: high

- Unit 59 Richmond St, Blackfriars Rd, Salford M3 7ED · 07719 355060 · Google 4.7★
- Sources: [Restaurantji](https://www.restaurantji.co.uk/greater-manchester/salford/coffees-cafe-/),
  a `goto-where.com` subdomain, Wanderlog.
- Website evidence: every result is an auto-generated aggregator page. The
  `coffees-cafe.goto-where.com` result looks like a website in search results but is a
  directory-built page the owner does not control. No own domain.
- Review count differs by mirror (99 vs 148), which usually means it is actively growing.

## 2. Bandido Barbers Oldham — Chadderton · confidence: high

- 256 Manchester Rd, Chadderton, Oldham OL9 7EL · 07716 492502 · Google 4.9★ (21)
- Sources: [Fresha](https://www.fresha.com/lvp/bandido-barbers-oldham-manchester-road-chadderton-PVx8eb),
  [localbarber.uk](https://localbarber.uk/local/business/bandido-barbers-oldham-559208),
  Facebook page.
- Website evidence: Fresha booking page and Facebook only. `localbarber.uk` renders a
  "Website" field for listings that have one (compare Rehman Motors, which shows a link);
  Bandido's shows only a phone number.
- The car park and the hot towel/steamer detail come from quoted Google reviews.

## 3. Rochdale Motor Services — Rochdale · confidence: high

- 15 St Chad's Close, Rochdale OL16 1QG · 01706 655551 · Google 4.5★ (84)
- Sources: [Fixter](https://www.fixter.co.uk/garage/rochdale-motor-services),
  [Regit](https://www.regit.cars/mot-test-centres/rochdale-motor-services), MOT Local,
  Rochdale Online.
- Website evidence: present across four directories, none listing a domain.
- Fixter intermediates their online booking, which is the commercial angle for the pitch.

## 4. Stitches Of Bolton — Bolton · confidence: medium

- St Andrews Court, 10-11 Mawdsley St, Bolton BL1 1LD · 01204 385512
- Sources: [Scoot](https://www.scoot.co.uk/England/Lancashire/Bolton/Stitches-Of-Bolton-CJDX507.html),
  [MisterWhat](https://www.misterwhat.co.uk/company/1401631-stitches-of-bolton-bolton),
  Cylex, Yably, clothingalterationsnearme.co.uk.
- Website evidence: no domain in any listing.
- **Why only medium:** no current Google star rating or review count was confirmed, and
  the listings disagree on the address — MisterWhat shows postcode BL1 2AS against
  BL1 1LD elsewhere, and several still show the pre-move Mawdsley Street address. Confirm
  the address by phone before sending; the address inconsistency is itself the pitch.

## 5. Riz Barbers — Chadderton, Oldham · confidence: high

- 2 Hardman St, Chadderton, Oldham OL9 7PD · 0161 652 5753 / 07482 680419
- Sources: [Fresha](https://www.fresha.com/lvp/riz-barbers-hardman-street-chadderton-15AxLa),
  [Cylex](https://chadderton.cylex-uk.co.uk/company/riz-barbers-27501744.html),
  localitybiz, Snapchat.
- Website evidence: listings point at `riz-barber.business.site`. Google retired Business
  Profile websites in March 2024 and those URLs now redirect to the Google listing, so
  the "Website" button on their profile goes nowhere useful.
- No confirmed star rating, but review text is consistently strong and specific
  (punctuality, price against a competitor over the road) — good material for the email.

---

## Ruled out

Kept here so the same candidates are not re-researched next round.

| Candidate | Why it was dropped |
| --- | --- |
| The Treehouse Cafe, Salford | Real website: `treehouse-salford.co.uk`, with a reservations page |
| Tittertons Family Butchers, Stockport | Real website: `butchers-stockport.co.uk` (found only on the second pass, via the Woodley branch) |
| COCO Nails & Spa, Bury | Real website: `coco-nails-bury.web.app`, plus Setmore booking |
| Sew Sure, Bolton | Website `theworkwearcompany.co.uk`, and a 1.0 rating on Yell — bad fit regardless |
| Hot Cup Café, Salford | Dead `business.site` page like Riz Barbers, so it qualifies on the criteria, but it is a counter inside an Aldi and a second Salford cafe. Hold as a spare. |
| Ashton-under-Lyne car washes | Directory listings mostly unnamed, with no or negligible review volume |

## What the search taught us

- Aggregators that mirror Google data (`localitybiz`, `wheree`, `localbarber.uk`,
  `find-open`, Cylex) are the fastest way to see the profile fields, including whether a
  website is set. Several block direct fetching, so search snippets are more reliable
  than trying to load the page.
- A booking platform is not a website. Fresha, Setmore, Booksy and Treatwell listings all
  mean the business is discoverable but does not own its own presence — those are good
  leads, not disqualified ones.
- A `goto-where.com` / `wheree.com` / `business.site` URL in the results is not the
  owner's site. Check for a real domain specifically: three of eight candidates had one
  and were dropped.
- Businesses without websites almost never publish an email address. Budget for a phone
  call per lead rather than expecting to find one.
