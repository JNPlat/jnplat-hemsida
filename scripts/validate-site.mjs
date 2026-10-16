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
const checked = { javascript: 0, json: 0, localReferences: 0, projects: 0, projectImages: 0 };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".github") return [];
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(root);
const relative = (file) => path.relative(root, file).split(path.sep).join("/");

/* Keep the main responsive layout boundary aligned between CSS and JavaScript. */
const headerCss = fs.readFileSync(path.join(root, "header.css"), "utf8");
const homepageScript = fs.readFileSync(path.join(root, "script.js"), "utf8");
if (!/@media\s*\(max-width:\s*810px\)/.test(headerCss)) {
  errors.push("The shared header must use 810px as its mobile layout boundary.");
}
if (!/matchMedia\(["']\(max-width:\s*810px\)["']\)/.test(homepageScript)) {
  errors.push("The homepage carousel must use 810px as its mobile layout boundary.");
}

for (const stylesheet of ["style.css", "undersidor.css", "header.css"]) {
  const css = fs.readFileSync(path.join(root, stylesheet), "utf8");
  if (/@media\s*\([^)]*(?:max-width|min-width)\s*:\s*(?:1100|1150)px/i.test(css)) {
    errors.push(`${stylesheet} contains an intermediate 1100px/1150px layout breakpoint; use fluid sizing within the desktop layout instead.`);
  }

  // Lightweight delimiter check that catches accidental unmatched CSS braces
  // without introducing a parser dependency into this static site.
  let depth = 0;
  let quote = null;
  let inComment = false;
  let escaped = false;
  for (let index = 0; index < css.length; index++) {
    const character = css[index];
    const next = css[index + 1];
    if (inComment) {
      if (character === "*" && next === "/") {
        inComment = false;
        index++;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }
    if (character === "/" && next === "*") {
      inComment = true;
      index++;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "{") {
      depth++;
    } else if (character === "}") {
      depth--;
      if (depth < 0) break;
    }
  }
  if (depth !== 0 || inComment || quote) {
    errors.push(`${stylesheet} has unbalanced CSS delimiters.`);
  }
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

// Validate the project catalogue's shape and identifiers before the UI consumes it.
const projectsFile = path.join(root, "data", "projects.json");
if (fs.existsSync(projectsFile)) {
  try {
    const projects = JSON.parse(fs.readFileSync(projectsFile, "utf8"));
    const allowedServices = new Set([
      "byggnadsplatslageri",
      "kopparslageri",
      "restaurering",
      "specialprojekt"
    ]);
    const ids = new Set();

    if (!Array.isArray(projects)) {
      errors.push("data/projects.json must contain an array of projects.");
    } else {
      checked.projects = projects.length;
      projects.forEach((project, index) => {
        const label = `data/projects.json project #${index + 1}`;
        if (!project || typeof project !== "object" || Array.isArray(project)) {
          errors.push(`${label} must be an object.`);
          return;
        }
        if (typeof project.id !== "string" || !project.id.trim()) {
          errors.push(`${label} is missing a non-empty id.`);
        } else if (ids.has(project.id)) {
          errors.push(`Duplicate project id in data/projects.json: "${project.id}".`);
        } else {
          ids.add(project.id);
        }
        if (typeof project.title !== "string" || !project.title.trim()) {
          errors.push(`${label} is missing a non-empty title.`);
        }
        if (!allowedServices.has(project.service)) {
          errors.push(`${label} has an unknown service: "${project.service}".`);
        }
        if (project.gallery !== undefined && !Array.isArray(project.gallery)) {
          errors.push(`${label} gallery must be an array when provided.`);
        }

        const imagePaths = [
          project.hero,
          project.cardImage,
          ...(Array.isArray(project.gallery) ? project.gallery : [])
        ].filter((imagePath) => typeof imagePath === "string" && imagePath.trim());
        for (const imagePath of new Set(imagePaths)) {
          checked.projectImages++;
          const resolvedImage = path.resolve(root, imagePath);
          if (!resolvedImage.startsWith(root + path.sep) || !fs.existsSync(resolvedImage)) {
            errors.push(`${label} references a missing or invalid project image: "${imagePath}".`);
          }
        }
      });
    }
  } catch (error) {
    errors.push(`Unable to validate data/projects.json: ${error.message}`);
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

  // The site uses one width breakpoint for its two layout modes: 810px / 811px.
  // Small mobile refinements and height/hover queries remain allowed.
  if (["style.css", "undersidor.css", "header.css"].includes(path.basename(file))) {
    if (/@media[^{}]*max-width\s*:\s*(?:1100|1150)px/i.test(css)) {
      errors.push(`Obsolete intermediate desktop breakpoint found in ${relative(file)}.`);
    }
    if (/@media[^{}]*min-width\s*:\s*801px/i.test(css) || /@media[^{}]*max-width\s*:\s*800px/i.test(css)) {
      errors.push(`Inconsistent 810px / 811px layout boundary found in ${relative(file)}.`);
    }
  }
  for (const match of css.matchAll(/url\(\s*["']?([^"'\)]+)["']?\s*\)/gi)) {
    checkReference(file, match[1], "CSS asset");
  }
}

if (errors.length) {
  console.error(`Site validation failed with ${errors.length} issue(s):\n\n- ${errors.join("\n\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("Site validation passed.");
  console.log(`Checked ${checked.javascript} JavaScript files, ${checked.json} JSON files, ${checked.projects} projects, ${checked.projectImages} project images and ${checked.localReferences} local references.`);
}
