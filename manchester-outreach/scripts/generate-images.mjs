#!/usr/bin/env node
/**
 * Generates one hero image per lead with the KIE API and saves it to
 * sites/<slug>/hero.jpg, where build-sites.mjs picks it up automatically.
 *
 *   export KIE_API_KEY=sk-...
 *   node scripts/generate-images.mjs              # all leads, skips existing
 *   node scripts/generate-images.mjs --force      # regenerate everything
 *   node scripts/generate-images.mjs riz-barbers-chadderton
 *   KIE_MODEL=google/nano-banana node scripts/generate-images.mjs
 *
 * Then rebuild the pages so the images get inlined:
 *   node scripts/build-sites.mjs
 *
 * NOTE: this could not be executed in the environment where it was written -
 * that sandbox's egress policy blocked api.kie.ai (403 on CONNECT). Run it from
 * a machine that can reach api.kie.ai. The endpoints follow KIE's unified job
 * API: POST /api/v1/jobs/createTask then poll GET /api/v1/jobs/recordInfo.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = process.env.KIE_API_BASE ?? "https://api.kie.ai";
const MODEL = process.env.KIE_MODEL ?? "google/nano-banana";
const KEY = process.env.KIE_API_KEY;

if (!KEY) {
  console.error("KIE_API_KEY is not set. Export it and re-run:\n  export KIE_API_KEY=sk-...");
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((a) => !a.startsWith("--"));

const { leads } = JSON.parse(readFileSync(join(root, "leads.json"), "utf8"));
const targets = only.length ? leads.filter((l) => only.includes(l.slug)) : leads;

if (!targets.length) {
  console.error(`No matching leads. Known slugs:\n  ${leads.map((l) => l.slug).join("\n  ")}`);
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function kie(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${path} returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) throw new Error(`${path} failed (HTTP ${res.status}): ${text.slice(0, 300)}`);
  return json;
}

/** KIE nests the payload differently per model, so check the known shapes. */
function extractUrls(record) {
  const candidates = [];
  const push = (v) => {
    if (typeof v === "string" && /^https?:\/\//.test(v)) candidates.push(v);
    else if (Array.isArray(v)) v.forEach(push);
  };

  const data = record?.data ?? record;
  push(data?.resultUrls);
  push(data?.resultUrl);
  push(data?.imageUrls);
  push(data?.response?.resultUrls);
  push(data?.response?.result_urls);

  for (const key of ["resultJson", "result_json"]) {
    const raw = data?.[key];
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        push(parsed?.resultUrls);
        push(parsed?.resultUrl);
        push(parsed?.imageUrls);
      } catch {
        /* ignore malformed result json */
      }
    }
  }
  return [...new Set(candidates)];
}

async function generate(lead) {
  const dir = join(root, "sites", lead.slug);
  const out = join(dir, "hero.jpg");
  if (existsSync(out) && !force) {
    console.log(`- ${lead.slug}: hero.jpg exists, skipping (use --force to redo)`);
    return "skipped";
  }

  console.log(`\n> ${lead.name} (${lead.slug})`);
  const created = await kie("/api/v1/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({
      model: MODEL,
      input: {
        prompt: lead.heroPrompt,
        output_format: "jpeg",
        image_size: "landscape_16_9",
      },
    }),
  });

  const taskId = created?.data?.taskId ?? created?.taskId;
  if (!taskId) throw new Error(`no taskId in create response: ${JSON.stringify(created).slice(0, 300)}`);
  console.log(`  task ${taskId} created, waiting...`);

  const deadline = Date.now() + 5 * 60_000;
  let urls = [];
  while (Date.now() < deadline) {
    await sleep(5000);
    const rec = await kie(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`);
    const state = rec?.data?.state ?? rec?.state;
    if (state === "success") {
      urls = extractUrls(rec);
      break;
    }
    if (state === "fail") {
      throw new Error(`task failed: ${rec?.data?.failMsg ?? JSON.stringify(rec).slice(0, 200)}`);
    }
    process.stdout.write(`  state=${state}\r`);
  }

  if (!urls.length) throw new Error("timed out or no image URL in the successful record");

  const img = await fetch(urls[0]);
  if (!img.ok) throw new Error(`downloading ${urls[0]} failed: HTTP ${img.status}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(out, Buffer.from(await img.arrayBuffer()));
  console.log(`  saved sites/${lead.slug}/hero.jpg`);

  const manifestPath = join(root, "sites", "image-manifest.json");
  const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, "utf8")) : [];
  manifest.push({ slug: lead.slug, model: MODEL, taskId, url: urls[0], generatedAt: new Date().toISOString() });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  return "ok";
}

let ok = 0;
const failures = [];
for (const lead of targets) {
  try {
    if ((await generate(lead)) === "ok") ok++;
  } catch (err) {
    console.error(`  FAILED ${lead.slug}: ${err.message}`);
    failures.push(lead.slug);
  }
}

console.log(`\n${ok} image(s) generated with ${MODEL}.`);
if (failures.length) console.log(`Failed: ${failures.join(", ")}`);
console.log("Next: node scripts/build-sites.mjs");
if (failures.length) process.exitCode = 1;
