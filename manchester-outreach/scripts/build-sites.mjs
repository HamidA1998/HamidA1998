#!/usr/bin/env node
/**
 * Builds one demo site per lead from leads.json.
 *
 * Output layout (sites/):
 *   style.css              one shared stylesheet for every page
 *   index.html             directory of all the concepts
 *   <slug>/index.html      the page itself, themed via CSS custom properties
 *   <slug>/hero.jpg        optional, dropped in by generate-images.mjs
 *
 * A page pulls in the shared stylesheet and sets only its own theme colours
 * inline, so pages stay small and the CSS is cached across the whole set.
 *
 *   node scripts/build-sites.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { leads } = JSON.parse(readFileSync(join(root, "leads.json"), "utf8"));
const today = new Date().toISOString().slice(0, 10);

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const CSS = `/* Shared stylesheet for the Greater Manchester website concepts.
   Each page sets --ink, --accent, --accent-2 and optionally --hero itself. */
*{box-sizing:border-box;min-width:0}
html{-webkit-text-size-adjust:100%;overflow-x:hidden}
body{
  margin:0;background:var(--ink);color:#fff;
  font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  overflow-x:hidden;
}
:root{--muted:rgba(255,255,255,.68);--line:rgba(255,255,255,.14);--radius:14px;--max:64rem}
h1,h2,h3{line-height:1.15;margin:0;font-weight:700;letter-spacing:-.02em;overflow-wrap:break-word}
a{color:inherit}
.wrap{width:100%;max-width:var(--max);margin-inline:auto;padding-inline:clamp(1rem,4vw,2rem)}

/* Concept banner - these pages are proposals, not live business websites. */
.concept{background:var(--accent);color:#12100c;font-size:.78rem;font-weight:600;
  text-align:center;padding:.5rem 1rem}

header.bar{position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);
  background:rgba(0,0,0,.72);border-bottom:1px solid var(--line)}
.bar .wrap{display:flex;align-items:center;gap:.75rem;min-height:3.75rem}
.brand{font-weight:700;letter-spacing:-.01em;margin-right:auto;font-size:1.05rem;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.btn{display:inline-flex;align-items:center;gap:.5rem;justify-content:center;
  padding:.7rem 1.1rem;border-radius:999px;border:1px solid transparent;
  font-weight:650;text-decoration:none;white-space:nowrap;cursor:pointer;
  transition:transform .15s ease,filter .15s ease}
.btn:active{transform:scale(.97)}
.btn-primary{background:var(--accent);color:#12100c}
.btn-primary:hover{filter:brightness(1.08)}
.btn-ghost{border-color:var(--line);color:#fff}
.btn-ghost:hover{background:rgba(255,255,255,.06)}
.bar .btn{padding:.55rem .95rem;font-size:.92rem;flex:0 0 auto}
@media(max-width:26rem){.bar .btn .num{display:none}}

.hero{position:relative;padding:clamp(3rem,10vw,6.5rem) 0 clamp(2.5rem,7vw,4rem);
  background-image:
    radial-gradient(120% 90% at 70% 0%,color-mix(in srgb,var(--accent) 14%,transparent) 0%,transparent 60%),
    linear-gradient(180deg,color-mix(in srgb,var(--accent-2) 34%,transparent) 0%,var(--ink) 70%);
  background-size:cover;background-position:center}
.hero.has-hero{background-image:
  linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.75) 60%,var(--ink) 100%),var(--hero)}
.eyebrow{display:inline-block;font-size:.75rem;font-weight:700;letter-spacing:.12em;
  text-transform:uppercase;color:var(--accent);margin-bottom:1rem}
.hero h1{font-size:clamp(2.1rem,7.5vw,3.6rem);max-width:22ch}
.tagline{font-size:clamp(1.05rem,3.4vw,1.3rem);color:var(--muted);margin:1rem 0 0;max-width:40ch}
.cta{display:flex;flex-wrap:wrap;gap:.75rem;margin-top:2rem}
.rating{display:inline-flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:1.75rem;
  padding:.6rem .9rem;border:1px solid var(--line);border-radius:999px;
  background:rgba(0,0,0,.3);font-size:.92rem}
.stars{color:var(--accent);letter-spacing:.1em}

section{padding:clamp(2.75rem,8vw,4.5rem) 0}
.tint{background:linear-gradient(180deg,rgba(255,255,255,.04),transparent)}
.section-title{font-size:clamp(1.5rem,4.5vw,2rem);margin-bottom:.5rem}
.section-sub{color:var(--muted);margin:0 0 2rem;max-width:52ch}

.grid{display:grid;gap:1rem;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr))}
.card{border:1px solid var(--line);border-radius:var(--radius);padding:1.35rem;
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.015))}
.card h3{font-size:1.08rem}
.card p{margin:.4rem 0 0;color:var(--muted);font-size:.94rem}

.quote{border-left:3px solid var(--accent);padding:.25rem 0 .25rem 1.25rem;
  font-size:clamp(1.15rem,3.6vw,1.5rem);line-height:1.45;font-weight:500;max-width:44ch}
.quote cite{display:block;margin-top:1rem;font:600 .85rem/1.4 inherit;color:var(--accent);font-style:normal}

.split{display:grid;gap:2.5rem;grid-template-columns:1fr}
@media(min-width:52rem){.split{grid-template-columns:1fr 1fr;gap:3rem}}

table.hours{width:100%;border-collapse:collapse;font-size:.96rem}
table.hours th{text-align:left;font-weight:600;padding:.6rem 0;color:var(--muted);font-size:.85rem;
  text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--line)}
table.hours th:last-child,table.hours td:last-child{text-align:right}
table.hours td{padding:.62rem 0;border-bottom:1px solid var(--line)}
table.hours td:last-child{color:var(--muted)}
.note{font-size:.82rem;color:var(--muted);margin-top:.9rem}

.chips{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.25rem;padding:0;list-style:none}
.chips li{border:1px solid var(--line);border-radius:999px;padding:.4rem .8rem;font-size:.86rem;color:var(--muted)}

address{font-style:normal;font-size:1.05rem;line-height:1.7}
.contact-strip{margin-top:2rem;border:1px solid var(--line);border-radius:var(--radius);
  padding:clamp(1.35rem,4vw,2rem);
  background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 12%,transparent),transparent 70%)}
.contact-strip p{color:var(--muted);margin:.4rem 0 1.25rem}

footer{border-top:1px solid var(--line);padding:2.5rem 0;color:var(--muted);font-size:.86rem}
footer strong{color:#fff}
footer p{margin:0 0 .6rem}

/* Index page */
.dir{list-style:none;padding:0;margin:0;display:grid;gap:.75rem}
.dir li{border:1px solid var(--line);border-radius:12px;padding:1.1rem 1.25rem;
  display:flex;flex-wrap:wrap;gap:.35rem 1rem;align-items:baseline}
.dir a{font-weight:650;text-decoration:none;font-size:1.08rem}
.dir a:hover{text-decoration:underline}
.dir span{color:var(--muted);font-size:.9rem}

@media(prefers-reduced-motion:reduce){*{transition:none!important}}
`;

/** generate-images.mjs drops hero.jpg next to the page; reference it if present. */
function heroFile(slug) {
  const dir = join(root, "sites", slug);
  if (!existsSync(dir)) return null;
  return readdirSync(dir).find((f) => /^hero\.(jpe?g|png|webp)$/i.test(f)) ?? null;
}

function ratingBadge(google) {
  if (!google || google.rating == null) return "";
  const rounded = Math.round(google.rating);
  const stars = "★".repeat(rounded) + "☆".repeat(5 - rounded);
  const count = google.reviewsApprox ? ` · ${google.reviewsApprox}+ reviews` : "";
  return `<div class="rating" aria-label="Rated ${esc(google.rating)} out of 5 on Google">
        <span class="stars" aria-hidden="true">${stars}</span>
        <span><strong>${esc(google.rating)}</strong> on Google${esc(count)}</span>
      </div>`;
}

function page(lead) {
  const { accent, accent2, ink } = lead.theme;
  const hero = heroFile(lead.slug);
  const vars = [`--ink:${ink}`, `--accent:${accent}`, `--accent-2:${accent2}`];
  if (hero) vars.push(`--hero:url("${hero}")`);
  const mapQuery = encodeURIComponent(`${lead.name}, ${lead.address}`);
  const tel = (n) => esc(String(n).replace(/\s/g, ""));

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(lead.name)} — ${esc(lead.trade)} in ${esc(lead.borough)} (design concept)</title>
<meta name="description" content="${esc(lead.name)} — ${esc(lead.tagline)}. ${esc(lead.address)}. Call ${esc(lead.phone)}.">
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="../style.css">
<style>body{${vars.join(";")}}</style>
</head>
<body>

<div class="concept">Design concept prepared by Nur AI for ${esc(lead.name)} · not affiliated with or published by the business</div>

<header class="bar">
  <div class="wrap">
    <span class="brand">${esc(lead.name)}</span>
    <a class="btn btn-primary" href="tel:${tel(lead.phoneHref)}">Call<span class="num">&nbsp;${esc(lead.phone)}</span></a>
  </div>
</header>

<div class="hero${hero ? " has-hero" : ""}">
  <div class="wrap">
    <span class="eyebrow">${esc(lead.trade)} · ${esc(lead.borough)}</span>
    <h1>${esc(lead.name)}</h1>
    <p class="tagline">${esc(lead.tagline)}</p>
    ${ratingBadge(lead.google)}
    <div class="cta">
      <a class="btn btn-primary" href="tel:${tel(lead.phoneHref)}">Call to book</a>
      <a class="btn btn-ghost" href="https://www.google.com/maps/search/?api=1&amp;query=${mapQuery}" target="_blank" rel="noopener">Get directions</a>
    </div>
  </div>
</div>

<section>
  <div class="wrap">
    <h2 class="section-title">What we do</h2>
    <p class="section-sub">Everything under one roof. Call for a price on anything not listed.</p>
    <div class="grid">
      ${lead.services
        .map(
          (s) =>
            `<div class="card">\n        <h3>${esc(s.name)}</h3>${s.note ? `\n        <p>${esc(s.note)}</p>` : ""}\n      </div>`
        )
        .join("\n      ")}
    </div>
    ${lead.highlights?.length ? `<ul class="chips">${lead.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
  </div>
</section>

<section class="tint">
  <div class="wrap">
    <blockquote class="quote">“${esc(lead.review.text)}”
      <cite>${esc(lead.review.attribution)}</cite>
    </blockquote>
  </div>
</section>

<section>
  <div class="wrap split">
    <div>
      <h2 class="section-title">Opening hours</h2>
      <p class="section-sub">Walk in, or call ahead to be sure.</p>
      <table class="hours">
        <thead><tr><th>Day</th><th>Hours</th></tr></thead>
        <tbody>
          ${lead.hours.map(([d, h]) => `<tr><td>${esc(d)}</td><td>${esc(h)}</td></tr>`).join("\n          ")}
        </tbody>
      </table>
      ${lead.hoursNote ? `<p class="note">${esc(lead.hoursNote)}</p>` : ""}
    </div>
    <div>
      <h2 class="section-title">Find us</h2>
      <p class="section-sub">${esc(lead.borough)}.</p>
      <address>
        ${esc(lead.address)}<br>
        <a href="tel:${tel(lead.phoneHref)}">${esc(lead.phone)}</a>${
          lead.phoneAlt ? ` &nbsp;·&nbsp; <a href="tel:${tel(lead.phoneAlt)}">${esc(lead.phoneAlt)}</a>` : ""
        }
      </address>
      <div class="contact-strip">
        <strong>Ready when you are.</strong>
        <p>Tap to call — we will get you booked in.</p>
        <a class="btn btn-primary" href="tel:${tel(lead.phoneHref)}">Call ${esc(lead.phone)}</a>
      </div>
    </div>
  </div>
</section>

<footer>
  <div class="wrap">
    <p><strong>This is an unofficial design concept.</strong> It was produced by Nur AI to show ${esc(lead.name)}
       what their own website could look like. It is not the business's official website and is not published or
       endorsed by them.</p>
    <p>Business details shown were taken from public listings on ${esc(today)} and may need correcting.</p>
  </div>
</footer>

</body>
</html>
`;
}

function indexPage(leads) {
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Greater Manchester — website concepts</title>
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="./style.css">
<style>body{--ink:#0b0d10;--accent:#7dd3fc;--accent-2:#1e3a8a}.wrap{max-width:44rem}</style>
</head>
<body>
<section>
  <div class="wrap">
    <h1 class="section-title" style="font-size:clamp(1.6rem,5vw,2.3rem)">Greater Manchester — website concepts</h1>
    <p class="section-sub">Five unofficial one-page concepts, one per prospect. None of these are official
       business websites.</p>
    <ul class="dir">
${leads
  .map(
    (l) => `      <li>
        <a href="./${esc(l.slug)}/">${esc(l.name)}</a>
        <span>${esc(l.trade)} · ${esc(l.borough)}</span>
      </li>`
  )
  .join("\n")}
    </ul>
    <p class="note">Prepared by Nur AI · ${esc(today)}</p>
  </div>
</section>
</body>
</html>
`;
}

mkdirSync(join(root, "sites"), { recursive: true });
writeFileSync(join(root, "sites", "style.css"), CSS);

for (const lead of leads) {
  const dir = join(root, "sites", lead.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), page(lead));
  console.log(`  sites/${lead.slug}/index.html${heroFile(lead.slug) ? " (+ hero)" : ""}`);
}
writeFileSync(join(root, "sites", "index.html"), indexPage(leads));
console.log(`\n${leads.length} demo sites + shared style.css written to sites/`);
