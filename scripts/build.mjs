// Fyller i sajtens texter och bilder från content/*.json (redigeras i Pages CMS).
// Cloudflare kör skriptet före varje publicering (se "build" i wrangler.jsonc),
// så att texterna ligger i själva HTML-filen. Kör det lokalt efter en ändring:
//   node scripts/build.mjs
//
// I HTML-filen markeras varje ifyllt område så här:
//   <!-- cms:hem.title -->…<!-- /cms:hem.title -->
// Allt mellan markeringarna skrivs om. Utseendet (klasser, layout) styrs här och i CSS,
// så innehållet kan ändras utan att layouten går sönder.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

// ---------- Hjälpfunktioner ----------

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const clean = (value) => String(value ?? "").trim();

// Text med [länktext](https://…) blir länkar; allt annat escapas.
function inline(value) {
  return esc(clean(value)).replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    (_, text, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
}

// En tom rad i texten ger ett nytt stycke.
function paragraphs(value, className = "") {
  const cls = className ? ` class="${className}"` : "";
  return clean(value).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => `<p${cls}>${inline(p).replace(/\n/g, "<br>")}</p>`).join("\n");
}

// Valfritt element: tom text ger inget element alls.
const optional = (value, html) => (clean(value) ? html : "");

function localImage(src, label) {
  const value = clean(src).replace(/^\/+/, "");
  if (!value) { errors.push(`${label}: bild saknas.`); return { src: "", size: null }; }
  if (/^https?:\/\//.test(value)) return { src: value, size: null };
  const file = path.join(root, value);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) {
    errors.push(`${label}: bilden "${value}" finns inte.`);
    return { src: value, size: null };
  }
  return { src: value, size: imageSize(fs.readFileSync(file)) };
}

// Läser bredd och höjd ur JPEG, PNG och WebP utan externa paket.
function imageSize(buf) {
  if (buf.length > 24 && buf.toString("ascii", 1, 4) === "PNG") {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
  }
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    const type = buf.toString("ascii", 12, 16);
    if (type === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
    if (type === "VP8L") {
      const b = buf.readUInt32LE(21);
      return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) };
    }
    if (type === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  return null;
}

function img(src, alt, label, extra = 'loading="lazy" decoding="async"') {
  const image = localImage(src, label);
  const size = image.size ? ` width="${image.size.w}" height="${image.size.h}"` : "";
  return `<img src="${esc(image.src)}" alt="${esc(clean(alt))}"${size} ${extra}>`;
}

const eyebrow = (value) => optional(value, `<p class="eyebrow">${esc(clean(value))}</p>`);
const list = (value) => (Array.isArray(value) ? value : []);

// ---------- Startsidan ----------

function startsida(c) {
  const hem = c.hem || {}, loftet = c.loftet || {}, steg = c.saJobbarJag || {};
  const om = c.om || {}, akt = c.aktuellt || {}, kontakt = c.kontakt || {};
  return {
    "hem.eyebrow": eyebrow(hem.eyebrow),
    "hem.title": `<h1>${esc(clean(hem.title))}</h1>`,
    "hem.text": paragraphs(hem.text, "hero-text"),
    "hem.image": img(hem.image, hem.imageAlt, "Startsidan, toppbild", 'fetchpriority="high" decoding="async"'),

    "loftet.eyebrow": eyebrow(loftet.eyebrow),
    "loftet.title": `<h2>${esc(clean(loftet.title))}</h2>`,
    "loftet.text": paragraphs(loftet.text),
    "loftet.quotesEyebrow": eyebrow(loftet.quotesEyebrow),
    "loftet.quotes": list(loftet.quotes).filter((q) => clean(q.quote)).map((q) => [
      `<figure class="trust-quote">`,
      `  <blockquote>`,
      `    <p>${inline(q.quote)}</p>`,
      `  </blockquote>`,
      `  <figcaption>`,
      optional(q.name, `    <span class="trust-name">${esc(clean(q.name))}</span>`),
      optional(q.role, `    <span class="trust-role">${esc(clean(q.role))}</span>`),
      optional(q.project, `    <span class="trust-project">${esc(clean(q.project))}</span>`),
      `  </figcaption>`,
      `</figure>`
    ].filter(Boolean).join("\n")).join("\n\n"),

    "saJobbarJag.image": img(steg.image, steg.imageAlt, "Så jobbar jag, bild"),
    "saJobbarJag.eyebrow": eyebrow(steg.eyebrow),
    "saJobbarJag.title": `<h2>${esc(clean(steg.title))}</h2>`,
    "saJobbarJag.steps": list(steg.steps).filter((s) => clean(s.title)).map((s, i) => [
      `<li>`,
      `  <span class="process-number">${String(i + 1).padStart(2, "0")}</span>`,
      `  <h3>${esc(clean(s.title))}</h3>`,
      optional(s.text, `  <p>${inline(s.text)}</p>`),
      `</li>`
    ].filter(Boolean).join("\n")).join("\n\n"),

    "om.image": img(om.image, om.imageAlt, "Om, bild"),
    "om.eyebrow": eyebrow(om.eyebrow),
    "om.title": `<h2>${esc(clean(om.title))}</h2>`,
    "om.text": paragraphs(om.text),
    "om.merits": list(om.merits).filter((m) => clean(m.title) || clean(m.text))
      .map((m) => `<li>${optional(m.title, `<strong>${esc(clean(m.title))}</strong> `)}${inline(m.text)}</li>`).join("\n"),
    "om.projectsIntro": optional(om.projectsTitle || om.projectsText,
      `<p class="about-projects-intro">${optional(om.projectsTitle, `<strong>${esc(clean(om.projectsTitle))}</strong>\n`)}${inline(om.projectsText)}</p>`),
    "om.projects": list(om.projects).map(clean).filter(Boolean).map((p) => `<li>${esc(p)}</li>`).join("\n"),
    "om.goal": optional(om.goalTitle || om.goalText, [
      `<div class="about-master">`,
      optional(om.goalYear, `  <span class="about-master-year">${esc(clean(om.goalYear))}</span>`),
      `  <p>${optional(om.goalTitle, `<strong>${esc(clean(om.goalTitle))}</strong>\n  `)}${inline(om.goalText)}</p>`,
      `</div>`
    ].filter(Boolean).join("\n")),

    "aktuellt.image": [
      img(akt.image, akt.imageAlt, "Aktuellt, bild"),
      optional(akt.imageCredit, `<figcaption>${inline(akt.imageCredit)}</figcaption>`)
    ].filter(Boolean).join("\n"),
    "aktuellt.eyebrow": eyebrow(akt.eyebrow),
    "aktuellt.title": `<h2>${esc(clean(akt.title))}</h2>`,
    "aktuellt.text": paragraphs(akt.text),
    "aktuellt.link": optional(akt.linkText && akt.linkUrl,
      `<a href="${esc(clean(akt.linkUrl))}" target="_blank" rel="noopener noreferrer" class="btn btn--ghost">${esc(clean(akt.linkText))} <span>→</span></a>`),

    "kontakt.image": (() => {
      const wide = clean(kontakt.imageWide) ? localImage(kontakt.imageWide, "Kontakt, liggande bild") : null;
      const wideSize = wide?.size ? ` width="${wide.size.w}" height="${wide.size.h}"` : "";
      return [
        `<picture>`,
        wide ? `  <source media="(orientation: landscape)" srcset="${esc(wide.src)}"${wideSize}>` : "",
        `  ${img(kontakt.image, kontakt.imageAlt, "Kontakt, stående bild")}`,
        `</picture>`
      ].filter(Boolean).join("\n");
    })(),
    "kontakt.eyebrow": eyebrow(kontakt.eyebrow),
    "kontakt.title": `<h2>${esc(clean(kontakt.title))}</h2>`,
    "kontakt.text": paragraphs(kontakt.text, "contact-intro")
  };
}

// ---------- Fyll i sidorna ----------

const pages = [
  { file: "index.html", content: "content/startsida.json", render: startsida }
];

for (const page of pages) {
  const content = JSON.parse(fs.readFileSync(path.join(root, page.content), "utf8"));
  const values = page.render(content);
  const htmlFile = path.join(root, page.file);
  const html = fs.readFileSync(htmlFile, "utf8");
  const eol = html.includes("\r\n") ? "\r\n" : "\n";
  const used = new Set();

  const output = html.replace(/([ \t]*)<!-- cms:([\w.]+) -->[\s\S]*?<!-- \/cms:\2 -->/g, (match, indent, key) => {
    if (!(key in values)) { errors.push(`${page.file}: okänd markering "${key}".`); return match; }
    used.add(key);
    const body = values[key] ? values[key].split("\n").map((line) => (line ? indent + line : line)).join(eol) + eol : "";
    return `${indent}<!-- cms:${key} -->${eol}${body}${indent}<!-- /cms:${key} -->`;
  });

  for (const key of Object.keys(values)) {
    if (!used.has(key)) errors.push(`${page.file}: markeringen "${key}" saknas i HTML-filen.`);
  }
  if (!errors.length && output !== html) fs.writeFileSync(htmlFile, output);
}

if (errors.length) {
  console.error(`Bygget stoppades (${errors.length} fel):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Bygget klart: ${pages.map((p) => p.file).join(", ")}`);
