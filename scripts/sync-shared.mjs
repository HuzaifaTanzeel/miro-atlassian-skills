#!/usr/bin/env node
// Copies shared/*.md into each skill's references/ folder.
// Usage: node scripts/sync-shared.mjs          (write copies)
//        node scripts/sync-shared.mjs --check  (exit 1 if any copy is missing or stale)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const targets = {
  "miro-board-conventions.md": [
    "miro-use-case-diagram",
    "miro-sequence-diagram",
    "miro-data-flow-diagram",
  ],
  "map-contract.md": [
    "miro-use-case-diagram",
    "miro-sequence-diagram",
    "miro-data-flow-diagram",
    "miro-to-confluence",
    "workspace-map",
  ],
  "tool-map.md": [
    "miro-use-case-diagram",
    "miro-sequence-diagram",
    "miro-data-flow-diagram",
    "miro-to-confluence",
    "workspace-map",
  ],
};

const check = process.argv.includes("--check");
let stale = 0;

for (const [file, skills] of Object.entries(targets)) {
  const source = readFileSync(join(root, "shared", file), "utf8");
  for (const skill of skills) {
    const dir = join(root, "skills", skill, "references");
    const dest = join(dir, file);
    const current = existsSync(dest) ? readFileSync(dest, "utf8") : null;
    if (current === source) continue;
    if (check) {
      console.error(`stale: skills/${skill}/references/${file}`);
      stale++;
      continue;
    }
    mkdirSync(dir, { recursive: true });
    writeFileSync(dest, source);
    console.log(`wrote: skills/${skill}/references/${file}`);
  }
}

if (check && stale) {
  console.error(`${stale} shared file(s) out of date. Run: node scripts/sync-shared.mjs`);
  process.exit(1);
}
if (check) console.log("shared files in sync");
