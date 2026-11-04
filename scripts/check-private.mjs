#!/usr/bin/env node
// Fails if the repo contains workspace-specific strings.
// Add your own strings in .private-strings (one per line, gitignored) and they are checked too.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skipDirs = new Set([".git", "node_modules", "private", ".miro-atlassian"]);
const skipFiles = new Set([".private-strings"]);

const patterns = [
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i, // cloud ids
  /uXjV[A-Za-z0-9_-]{6,}=/, // real Miro board ids (examples use uXjVExample=)
  /\b3458764\d{12}\b/, // real Miro widget ids
  /[a-z0-9-]+\.atlassian\.net/i, // site hosts (examples use example.atlassian.net)
];
const allowed = [/00000000-0000-0000-0000-000000000000/, /\bexample\.atlassian\.net/i, /your-site\.atlassian\.net/i, /mcp\.atlassian\.com/i, /uXjVExample=/];

const extra = existsSync(join(root, ".private-strings"))
  ? readFileSync(join(root, ".private-strings"), "utf8").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)
  : [];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (skipDirs.has(name) || skipFiles.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else yield p;
  }
}

let hits = 0;
for (const file of walk(root)) {
  if (/\.(png|jpg|gif|ico|lock)$/i.test(file)) continue;
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    let scrubbed = line;
    for (const a of allowed) scrubbed = scrubbed.replace(new RegExp(a.source, "gi"), "");
    const found = patterns.find((p) => p.test(scrubbed)) || extra.find((s) => scrubbed.includes(s));
    if (found) {
      console.error(`${relative(root, file)}:${i + 1}: ${line.trim().slice(0, 120)}`);
      hits++;
    }
  });
}

if (hits) {
  console.error(`\n${hits} line(s) look like private workspace data.`);
  process.exit(1);
}
console.log("no private strings found");
