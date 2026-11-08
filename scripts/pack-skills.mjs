#!/usr/bin/env node
// Zip each skills/<name>/ directory into claude-upload/<name>.zip.
// The zip contains <name>/SKILL.md, which is what Claude.ai custom-skill upload expects.
// The same filenames are overwritten. A zip whose skill folder is gone is deleted.
// Timestamps inside the zip are fixed so an unchanged skill does not produce a new file.

import { createHash } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { readdirSync, readFileSync, mkdirSync, writeFileSync, unlinkSync, existsSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const skillsDir = join(root, "skills");
const outDir = join(root, "claude-upload");
const skipDirs = new Set(["node_modules", "out", ".git"]);

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function skipFile(name) {
  return name === ".DS_Store" || name === "Thumbs.db" || name.endsWith(".png") || name.endsWith(".frame.svg") || name.endsWith(".zip");
}

function collect(dir, skillRoot, skillName, files) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.isDirectory()) {
      if (skipDirs.has(ent.name)) continue;
      collect(join(dir, ent.name), skillRoot, skillName, files);
      continue;
    }
    if (!ent.isFile() || skipFile(ent.name)) continue;
    const path = join(dir, ent.name);
    const rel = relative(skillRoot, path).split("\\").join("/");
    files.push({ name: `${skillName}/${rel}`, data: readFileSync(path) });
  }
}

function buildZip(files) {
  const parts = [];
  const centrals = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const crc = crc32(file.data);
    const deflated = deflateRawSync(file.data, { level: 9 });
    const store = deflated.length >= file.data.length;
    const method = store ? 0 : 8;
    const body = store ? file.data : deflated;
    const local = Buffer.alloc(30 + name.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    name.copy(local, 30);
    parts.push(local, body);
    const central = Buffer.alloc(46 + name.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    name.copy(central, 46);
    centrals.push(central);
    offset += local.length + body.length;
  }
  const centralDir = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralDir.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...parts, centralDir, eocd]);
}

const skills = readdirSync(skillsDir, { withFileTypes: true })
  .filter((ent) => ent.isDirectory() && existsSync(join(skillsDir, ent.name, "SKILL.md")))
  .map((ent) => ent.name)
  .sort();

mkdirSync(outDir, { recursive: true });
const keep = new Set();

for (const name of skills) {
  const skillRoot = join(skillsDir, name);
  const files = [];
  collect(skillRoot, skillRoot, name, files);
  files.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  if (!files.some((f) => f.name === `${name}/SKILL.md`)) {
    console.error(`${name}: zip is missing ${name}/SKILL.md`);
    process.exit(1);
  }
  const zip = buildZip(files);
  const dest = join(outDir, `${name}.zip`);
  writeFileSync(dest, zip);
  keep.add(`${name}.zip`);
  const sha = createHash("sha256").update(zip).digest("hex").slice(0, 12);
  console.log(`${name}.zip  ${files.length} files  ${zip.length} bytes  ${sha}`);
}

if (existsSync(outDir)) {
  for (const ent of readdirSync(outDir, { withFileTypes: true })) {
    if (!ent.isFile() || !ent.name.endsWith(".zip") || keep.has(ent.name)) continue;
    unlinkSync(join(outDir, ent.name));
    console.log(`removed ${ent.name}`);
  }
}

if (!skills.length) {
  console.error("no skills found");
  process.exit(1);
}
