#!/usr/bin/env node
/**
 * Dependency-free sanity checks for this static site.
 * Run with: node scripts/validate-site.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const checked = { javascript: 0, json: 0, localReferences: 0 };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".github") return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root);
const relative = (file) => path.relative(root, file).split(path.sep).join("/");
const fileSet = new Set(files.map((file) => relative(file)));

/* Keep the main responsive layout boundary aligned between CSS and JavaScript. */
const headerCss = fs.readFileSync(path.join(root, "header.css"), "utf8");
const homepageScript = fs.readFileSync(path.join(root, "script.js"), "utf8");
if (!/@media\s*\(max-width:\s*810px\)/.test(headerCss)) {
  errors.push("The shared header must use 810px as its mobile layout boundary.");
}
if (!/matchMedia\(["']\(max-width:\s*810px\)["']\)/.test(homepageScript)) {
  errors.push("The homepage carousel must use 810px as its mobile layout boundary.");
}

for (const file of files.filter((item) => item.endsWith(".js"))) {
  const result = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  checked.javascript++;
  if (result.status !== 0) errors.push(`JavaScript syntax error in ${relative(file)}:\n${result.stderr || result.stdout}`);
}

for (const file of files.filter((item) => item.endsWith(".json"))) {
  checked.json++;
  try {
    JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    errors.push(`Invalid JSON in ${relative(file)}: ${error.message}`);
  }
}

function checkReference(sourceFile, rawValue, kind) {
  const value = rawValue.trim().replaceAll("&amp;", "&");
  if (!value || value.startsWith("#") || /^(?:[a-z]+:|\/\/)/i.test(value)) return;
  const clean = value.split("#", 1)[0].split("?", 1)[0];
  if (!clean) return;
  let resolved;
  if (clean.startsWith("/")) {
    resolved = path.join(root, clean.replace(/^\/+/, ""));
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) resolved = path.join(resolved, "index.html");
  } else {
    resolved = path.resolve(path.dirname(sourceFile), decodeURIComponent(clean));
  }
  checked.localReferences++;
  if (!fs.existsSync(resolved)) {
    errors.push(`Missing local ${kind} reference in ${relative(sourceFile)}: "${rawValue}"`);
  }
}

for (const file of files.filter((item) => item.endsWith(".html"))) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/gi)) {
    checkReference(file, match[1], "HTML");
  }
}

for (const file of files.filter((item) => item.endsWith(".css"))) {
  const css = fs.readFileSync(file, "utf8");
  for (const match of css.matchAll(/url\(\s*["']?([^"'\)]+)["']?\s*\)/gi)) {
    checkReference(file, match[1], "CSS asset");
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):\n\n- ${errors.join("\n\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Site validation passed.");
  console.log(`Checked ${checked.javascript} JavaScript files, ${checked.json} JSON files and ${checked.localReferences} local references.`);
}
