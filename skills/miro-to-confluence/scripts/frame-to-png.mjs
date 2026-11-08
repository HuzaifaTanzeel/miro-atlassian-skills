#!/usr/bin/env node
// Fallback PNG renderer for miro-to-confluence.
// Miro MCP exposes frame data as SVG (canvas_read_as_svg) and has no frame→PNG export.
// board_preview_read returns SVG for the preview UI only. image_* tools only read image
// widgets already on the board. This script is the local fallback: one file, one dependency
// (@resvg/resvg-js). Sequence diagrams are drawn in this file. Other Mermaid widgets
// fall back to npx @mermaid-js/mermaid-cli, which needs a browser.
//
// Usage:
//   node frame-to-png.mjs INPUT OUTPUT.png [--frame ID] [--scale 2] [--svg-out FILE] [--title]
//
// INPUT is the "svg" string from canvas_read_as_svg saved to a file (or a JSON response with "svg").
//
// Exit codes:
//   0  PNG written, nothing skipped
//   2  PNG written, some elements were skipped or approximated (see warnings)
//   3  bad input (no frame, unreadable file)
//   4  renderer missing: run `npm install --prefix <this folder>`
//   5  a diagram widget could not be rendered (no PNG is written)

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const warnings = [];
const warn = (m) => warnings.push(m);

// ---------- args ----------
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i === -1) return def;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const flag = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return false;
  args.splice(i, 1);
  return true;
};
const frameArg = opt("--frame", null);
const scale = Number(opt("--scale", "2"));
const svgOut = opt("--svg-out", null);
const withTitle = flag("--title");
const [inputPath, outputPath] = args;
if (!inputPath || !outputPath) {
  console.error("usage: node frame-to-png.mjs INPUT OUTPUT.png [--frame ID] [--scale 2] [--svg-out FILE] [--title]");
  process.exit(3);
}

// ---------- tiny XML parser ----------
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function parseXml(src) {
  const root = { name: "#root", attrs: {}, children: [], text: "" };
  const stack = [root];
  let i = 0;
  const top = () => stack[stack.length - 1];
  while (i < src.length) {
    if (src.startsWith("<!--", i)) {
      const end = src.indexOf("-->", i);
      i = end === -1 ? src.length : end + 3;
    } else if (src.startsWith("<![CDATA[", i)) {
      const end = src.indexOf("]]>", i);
      top().text += src.slice(i + 9, end);
      i = end + 3;
    } else if (src.startsWith("<?", i) || src.startsWith("<!", i)) {
      i = src.indexOf(">", i) + 1;
    } else if (src.startsWith("</", i)) {
      const end = src.indexOf(">", i);
      const name = src.slice(i + 2, end).trim();
      while (stack.length > 1 && top().name !== name) stack.pop();
      if (stack.length > 1) stack.pop();
      i = end + 1;
    } else if (src[i] === "<") {
      let j = i + 1;
      let quote = null;
      while (j < src.length) {
        const c = src[j];
        if (quote) {
          if (c === quote) quote = null;
        } else if (c === '"' || c === "'") quote = c;
        else if (c === ">") break;
        j++;
      }
      let raw = src.slice(i + 1, j);
      const selfClosing = raw.endsWith("/");
      if (selfClosing) raw = raw.slice(0, -1);
      const m = raw.match(/^([^\s/>]+)/);
      const name = m ? m[1] : "";
      const attrs = {};
      const re = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
      let a;
      while ((a = re.exec(raw.slice(name.length)))) attrs[a[1]] = decodeEntities(a[3] ?? a[4] ?? "");
      const node = { name, attrs, children: [], text: "", raw: "" };
      top().children.push(node);
      node.parent = top();
      i = j + 1;
      if (!selfClosing && RAW_TAGS.has(name)) {
        // Keep the inner markup as-is; rich text and Mermaid bodies are handled later.
        const close = src.indexOf(`</${name}>`, i);
        const end = close === -1 ? src.length : close;
        node.raw = src.slice(i, end);
        node.text = decodeEntities(node.raw.replace(/<[^>]+>/g, ""));
        i = close === -1 ? src.length : close + name.length + 3;
      } else if (!selfClosing) stack.push(node);
    } else {
      const end = src.indexOf("<", i);
      top().text += decodeEntities(src.slice(i, end === -1 ? src.length : end));
      i = end === -1 ? src.length : end;
    }
  }
  return root;
}
const RAW_TAGS = new Set(["textArea", "text", "foreignObject", "title", "desc"]);

// Inner markup of a text widget, with escaped HTML (&lt;b&gt;) turned into real tags.
function richBody(n) {
  const inner = n.raw || "";
  return /&lt;\s*\/?\s*(b|br|p|strong|i|u|span|ul|ol|li)\b/i.test(inner) ? decodeEntities(inner) : inner;
}

// ---------- input ----------
let src;
try {
  const bytes = readFileSync(inputPath);
  try {
    src = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    // Some Windows editors and agents save as Windows-1252; «include» would turn into U+FFFD.
    src = new TextDecoder("windows-1252").decode(bytes);
    console.log("note: input is not UTF-8; read it as Windows-1252");
  }
  src = src.replace(/^\uFEFF/, "");
} catch (e) {
  console.error(`cannot read ${inputPath}: ${e.message}`);
  process.exit(3);
}
if (src.trimStart().startsWith("{")) {
  try {
    src = JSON.parse(src).svg;
  } catch {
    console.error("input looks like JSON but has no readable 'svg' field");
    process.exit(3);
  }
}
const doc = parseXml(src);
const svgRoot = doc.children.find((n) => n.name === "svg");
if (!svgRoot) {
  console.error("no <svg> root found in input");
  process.exit(3);
}

// ---------- collect items with absolute geometry ----------
const num = (v, d = 0) => (v === undefined || v === "" || isNaN(Number(v)) ? d : Number(v));
const translateOf = (n) => {
  const t = n.attrs.transform || "";
  const m = t.match(/translate\(\s*([-\d.]+)[\s,]+([-\d.]+)\s*\)/);
  return m ? [Number(m[1]), Number(m[2])] : [0, 0];
};

const items = []; // drawable shapes and text, in document order
const connectors = [];
const frames = [];
const byId = new Map();

function register(item, node) {
  const ids = [node.attrs.id, node.attrs["data-miro-id"], node.attrs["data-miro-id"] && "m" + node.attrs["data-miro-id"]];
  for (const id of ids) if (id) byId.set(id, item);
}

function walk(node, ox, oy, frame) {
  for (const n of node.children) {
    const a = n.attrs;
    if (a["data-deleted"] === "true") continue;
    if (n.name === "g") {
      const [tx, ty] = translateOf(n);
      if (a["data-frame"] !== undefined || n.children.some((c) => c.attrs["data-type"] === "frame")) {
        const bg = n.children.find((c) => c.attrs["data-type"] === "frame") || { attrs: {} };
        const f = {
          kind: "frame",
          id: a["data-miro-id"] || a.id,
          localId: a.id,
          title: a["data-frame"] || a["data-title"] || bg.attrs["data-title"] || "",
          x: ox + tx,
          y: oy + ty,
          w: num(bg.attrs.width, 1000),
          h: num(bg.attrs.height, 1000),
          fill: bg.attrs.fill || "#ffffff",
          members: new Set(),
        };
        frames.push(f);
        register(f, n);
        walk(n, ox + tx, oy + ty, f);
      } else if (a["data-type"] === "html_content") {
        warn(`skipped html_content widget "${a["data-title"] || a.id || ""}"`);
      } else {
        walk(n, ox + tx, oy + ty, frame);
      }
      continue;
    }
    const item = toItem(n, ox, oy);
    if (!item) continue;
    item.frame = frame;
    if (frame) frame.members.add(item);
    if (item.kind === "connector") connectors.push(item);
    else items.push(item);
    register(item, n);
  }
}

function toItem(n, ox, oy) {
  const a = n.attrs;
  const type = a["data-type"];
  const common = {
    node: n,
    fill: a.fill,
    stroke: a.stroke,
    strokeWidth: num(a["stroke-width"], 2),
    dash: a["stroke-dasharray"],
    label: a["data-content"],
    labelRaw: a["data-content"],
    textColor: a["data-text-color"] || "#1a1a1a",
    fontSize: num(a["data-font-size"], 14),
    fontWeight: a["data-font-weight"] || "normal",
    fontFamily: a["data-font-family"] || a["font-family"],
    align: a["data-text-align"] || "center",
    valign: a["data-text-align-vertical"] || "middle",
  };
  switch (n.name) {
    case "rect": {
      if (type === "frame") return null;
      const x = ox + num(a.x), y = oy + num(a.y), w = num(a.width, 100), h = num(a.height, 100);
      if (type === "sticky") return { ...common, kind: "sticky", x, y, w, h, color: a["data-color"] || "yellow" };
      if (type === "custom-widget") {
        const wt = a["data-widget-type"];
        if (wt === "card" || wt === "app_card")
          return { ...common, kind: "card", x, y, w, h: h || 60, title: a["data-title"] || a["data-key"] || "", desc: a["data-description"] || "", color: a["data-color"] || "#2d9bf0" };
        warn(`custom widget "${wt}" drawn as a placeholder box`);
        return { ...common, kind: "shape", shape: "rectangle", x, y, w: w || 200, h: h || 100, fill: "#f7f7f7", stroke: "#b0b0b0", label: wt };
      }
      if (type === "foreign") {
        warn(`skipped foreign widget "${a["data-widget-type"] || ""}"`);
        return null;
      }
      return { ...common, kind: "shape", shape: a["data-shape"] || "rectangle", x, y, w, h, rx: num(a.rx, 0) };
    }
    case "ellipse": {
      const cx = ox + num(a.cx), cy = oy + num(a.cy), rx = num(a.rx), ry = num(a.ry);
      return { ...common, kind: "shape", shape: "ellipse", x: cx - rx, y: cy - ry, w: 2 * rx, h: 2 * ry };
    }
    case "circle": {
      const cx = ox + num(a.cx), cy = oy + num(a.cy), r = num(a.r);
      return { ...common, kind: "shape", shape: "ellipse", x: cx - r, y: cy - r, w: 2 * r, h: 2 * r };
    }
    case "polygon": {
      const pts = (a.points || "").trim().split(/[\s,]+/).map(Number);
      const xs = [], ys = [];
      for (let i = 0; i + 1 < pts.length; i += 2) { xs.push(ox + pts[i]); ys.push(oy + pts[i + 1]); }
      if (!xs.length) return null;
      const x = Math.min(...xs), y = Math.min(...ys);
      return { ...common, kind: "shape", shape: "polygon", points: xs.map((px, i) => [px, ys[i]]), x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
    }
    case "line": {
      if (type === "divider") {
        return { kind: "divider", x1: ox + num(a.x1), y1: oy + num(a.y1), x2: ox + num(a.x2), y2: oy + num(a.y2), stroke: a.stroke || "#b0b0b0", strokeWidth: num(a["stroke-width"], 2), opacity: num(a["stroke-opacity"], 1), style: a["data-line-style"] || "solid" };
      }
      return { ...common, kind: "connector", start: a["data-start"], end: a["data-end"], startSide: a["data-start-side"], endSide: a["data-end-side"], route: a["data-shape"] || "straight", arrow: a["data-arrow"], stroke: a.stroke || "#313131" };
    }
    case "path": {
      if (a["data-start"]) return { ...common, kind: "connector", start: a["data-start"], end: a["data-end"], startSide: a["data-start-side"], endSide: a["data-end-side"], route: a["data-shape"] || "straight", arrow: a["data-arrow"], stroke: a.stroke || "#313131" };
      warn("skipped a free <path>");
      return null;
    }
    case "text": {
      return { kind: "text", x: ox + num(a.x), y: oy + num(a.y), body: richBody(n), fill: a.fill || "#1a1a1a", fontSize: num(a["font-size"], 16), fontWeight: a["font-weight"] || "normal", fontFamily: a["font-family"], anchor: a["text-anchor"] || "start" };
    }
    case "textArea": {
      return { kind: "textArea", x: ox + num(a.x), y: oy + num(a.y), w: num(a.width, 400), h: num(a.height, 0), body: richBody(n), fill: a.fill || "#1a1a1a", fontSize: num(a["font-size"], 16), fontWeight: a["font-weight"] || "normal", fontFamily: a["font-family"], align: a["text-align"] || "left" };
    }
    case "foreignObject": {
      const x = ox + num(a.x), y = oy + num(a.y);
      if (type === "diagram") return { kind: "mermaid", x, y, w: num(a.width, 1600), h: num(a.height, 900), title: a["data-title"] || "", source: decodeEntities(n.raw || "").replace(/^\s*\n/, "") };
      warn(`skipped ${type || "untyped"} foreignObject "${a["data-title"] || ""}" (docs and tables are not rendered)`);
      return null;
    }
    case "image": {
      warn("skipped an image widget (images are not fetched)");
      const x = ox + num(a.x), y = oy + num(a.y);
      return { kind: "shape", shape: "rectangle", x, y, w: num(a.width, 200), h: num(a.height, 150), fill: "#f7f7f7", stroke: "#b0b0b0", strokeWidth: 2, label: "image", textColor: "#595959", fontSize: 14 };
    }
    default:
      if (n.name && !["defs", "title", "desc", "metadata", "edit", "old", "new"].includes(n.name)) warn(`skipped <${n.name}>`);
      return null;
  }
}

walk(svgRoot, 0, 0, null);

// ---------- pick the frame ----------
let frame;
if (frameArg) {
  frame = frames.find((f) => f.id === frameArg || f.localId === frameArg || f.localId === "m" + frameArg);
  if (!frame) {
    console.error(`frame ${frameArg} not found. Frames in input: ${frames.map((f) => `${f.id} "${f.title}"`).join(", ") || "none"}`);
    process.exit(3);
  }
} else if (frames.length === 1) {
  frame = frames[0];
} else if (frames.length > 1) {
  frame = frames[0];
  warn(`input has ${frames.length} frames; rendered the first ("${frame.title}"). Pass --frame ID to choose.`);
} else {
  console.error("no frame found in input. Read the frame with canvas_read_as_svg and widget_ids=[frameId].");
  process.exit(3);
}

const inFrame = (it) => it.frame === frame;
const drawItems = items.filter(inFrame);
const drawConnectors = connectors.filter((c) => {
  const s = byId.get(c.start), e = byId.get(c.end);
  if (!s || !e) {
    if (c.frame === frame) warn(`connector ${c.start} -> ${c.end}: endpoint not found, skipped`);
    return false;
  }
  return s.frame === frame && e.frame === frame;
});

// ---------- helpers ----------
function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
const FONT = (f) => {
  const map = { noto_sans: "Noto Sans", open_sans: "Open Sans", arial: "Arial", roboto: "Roboto", plex_sans: "IBM Plex Sans", pt_sans: "PT Sans" };
  const first = map[f] || (f ? f.replace(/_/g, " ") : "Noto Sans");
  return `${first}, Noto Sans, Open Sans, Segoe UI, Arial, sans-serif`;
};

// Split rich label markup into lines of {text, bold}.
function richLines(markup) {
  if (!markup) return [];
  let s = String(markup).replace(/\r?\n/g, " ");
  s = s.replace(/<\s*br\s*\/?\s*>/gi, "\n").replace(/<\/p>\s*<p[^>]*>/gi, "\n").replace(/<\/?p[^>]*>/gi, "");
  return s.split("\n").map((line) => {
    const bold = /<\s*(b|strong)\b/i.test(line);
    const text = decodeEntities(line.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    return { text, bold };
  });
}

function wrap(text, maxWidth, fontSize, bold) {
  const cw = fontSize * (bold ? 0.6 : 0.55);
  const maxChars = Math.max(1, Math.floor(maxWidth / cw));
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    if (!cur) cur = w;
    else if ((cur + " " + w).length <= maxChars) cur += " " + w;
    else { lines.push(cur); cur = w; }
  }
  if (cur || !lines.length) lines.push(cur);
  return lines;
}

function textBlock({ markup, x, y, w, h, fontSize, color, weight, family, align = "center", valign = "middle", pad = 8 }) {
  const lh = fontSize * 1.3;
  const lines = [];
  for (const l of richLines(markup)) {
    const bold = l.bold || weight === "bold" || Number(weight) >= 600;
    for (const t of wrap(l.text, Math.max(10, w - 2 * pad), fontSize, bold)) lines.push({ t, bold });
  }
  if (!lines.length) return "";
  const total = lines.length * lh;
  let top;
  if (valign === "top") top = y + pad;
  else if (valign === "bottom") top = y + h - pad - total;
  else top = y + (h - total) / 2;
  const anchor = align === "left" ? "start" : align === "right" ? "end" : "middle";
  const tx = align === "left" ? x + pad : align === "right" ? x + w - pad : x + w / 2;
  return lines
    .map((l, i) => `<text x="${r(tx)}" y="${r(top + i * lh + fontSize * 0.95)}" font-family="${FONT(family)}" font-size="${fontSize}" font-weight="${l.bold ? "bold" : "normal"}" fill="${color}" text-anchor="${anchor}">${escapeXml(l.t)}</text>`)
    .join("\n");
}

const r = (v) => Math.round(v * 100) / 100;
const dashOf = (d, sw = 2) => {
  if (!d || d === "none") return "";
  if (d.startsWith("5")) return ` stroke-dasharray="${8 * (sw / 2)},${6 * (sw / 2)}"`;
  if (d.startsWith("2")) return ` stroke-dasharray="${2 * (sw / 2)},${4 * (sw / 2)}"`;
  return ` stroke-dasharray="${d}"`;
};
const DIVIDER_DASH = { dashed: "8,6", dotted: "2,4", dash_dotted: "8,4,2,4", dashed_dense: "6,3", dashed_short: "4,4", dashed_short_dense: "3,2" };
const lineStyleDash = (s) => (DIVIDER_DASH[s] ? ` stroke-dasharray="${DIVIDER_DASH[s]}"` : "");

const STICKY = { gray: "#e6e6e6", light_yellow: "#fff9b1", yellow: "#f5d128", orange: "#ff9d48", light_green: "#d5f692", green: "#c9df56", dark_green: "#93d275", cyan: "#6cd8fa", light_pink: "#ffcee0", pink: "#ea94bb", violet: "#be88c7", red: "#f16c7f", light_blue: "#a6ccf5", blue: "#6c8ff1", dark_blue: "#9ea9ff", black: "#1a1a1a" };

// ---------- render shapes ----------
function paint(it) {
  const fill = it.fill && it.fill !== "none" ? it.fill : "none";
  const stroke = it.stroke && it.stroke !== "none" ? it.stroke : "none";
  const sw = stroke === "none" ? 0 : it.strokeWidth || 2;
  return `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${dashOf(it.dash, sw)}`;
}

function shapeSvg(it) {
  const { x, y, w, h } = it;
  const p = paint(it);
  let body;
  switch (it.shape) {
    case "ellipse":
    case "circle":
      body = `<ellipse cx="${r(x + w / 2)}" cy="${r(y + h / 2)}" rx="${r(w / 2)}" ry="${r(h / 2)}" ${p}/>`;
      break;
    case "round_rectangle":
      body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r(Math.min(w, h) * 0.15)}" ${p}/>`;
      break;
    case "rhombus":
      body = `<polygon points="${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}" ${p}/>`;
      break;
    case "parallelogram": {
      const k = w * 0.15;
      body = `<polygon points="${x + k},${y} ${x + w},${y} ${x + w - k},${y + h} ${x},${y + h}" ${p}/>`;
      break;
    }
    case "trapezoid": {
      const k = w * 0.15;
      body = `<polygon points="${x + k},${y} ${x + w - k},${y} ${x + w},${y + h} ${x},${y + h}" ${p}/>`;
      break;
    }
    case "triangle":
      body = `<polygon points="${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}" ${p}/>`;
      break;
    case "hexagon": {
      const k = w * 0.2;
      body = `<polygon points="${x + k},${y} ${x + w - k},${y} ${x + w},${y + h / 2} ${x + w - k},${y + h} ${x + k},${y + h} ${x},${y + h / 2}" ${p}/>`;
      break;
    }
    case "can": {
      const e = Math.min(h * 0.15, 20);
      body = `<path d="M${x},${y + e} A${w / 2},${e} 0 0 1 ${x + w},${y + e} L${x + w},${y + h - e} A${w / 2},${e} 0 0 1 ${x},${y + h - e} Z" ${p}/><path d="M${x},${y + e} A${w / 2},${e} 0 0 0 ${x + w},${y + e}" fill="none" stroke="${it.stroke || "#313131"}" stroke-width="${it.strokeWidth || 2}"/>`;
      break;
    }
    case "flow_chart_predefined_process": {
      const k = Math.min(16, w * 0.08);
      const s = it.stroke && it.stroke !== "none" ? it.stroke : "#313131";
      body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${p}/><line x1="${x + k}" y1="${y}" x2="${x + k}" y2="${y + h}" stroke="${s}" stroke-width="${it.strokeWidth || 2}"/><line x1="${x + w - k}" y1="${y}" x2="${x + w - k}" y2="${y + h}" stroke="${s}" stroke-width="${it.strokeWidth || 2}"/>`;
      break;
    }
    case "polygon":
      body = `<polygon points="${it.points.map((q) => q.join(",")).join(" ")}" ${p}/>`;
      break;
    case "rectangle":
    case undefined:
      body = `<rect x="${x}" y="${y}" width="${w}" height="${h}"${it.rx ? ` rx="${it.rx}"` : ""} ${p}/>`;
      break;
    default:
      warn(`shape "${it.shape}" drawn as a rectangle`);
      body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${p}/>`;
  }
  const inset = it.shape === "ellipse" ? 0.12 : 0;
  const label = it.label
    ? textBlock({ markup: it.label, x: x + w * inset, y, w: w * (1 - 2 * inset), h, fontSize: it.fontSize, color: it.textColor, weight: it.fontWeight, family: it.fontFamily, align: it.align, valign: it.valign })
    : "";
  return body + "\n" + label;
}

function itemSvg(it) {
  switch (it.kind) {
    case "shape":
      return shapeSvg(it);
    case "sticky": {
      const fill = STICKY[it.color] || "#fff9b1";
      return `<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" fill="${fill}"/>\n` + textBlock({ markup: it.label, x: it.x, y: it.y, w: it.w, h: it.h, fontSize: 18, color: it.color === "black" ? "#ffffff" : "#1a1a1a", family: "noto_sans" });
    }
    case "card":
      return `<rect x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" rx="6" fill="#ffffff" stroke="#e7e7e7" stroke-width="2"/><rect x="${it.x}" y="${it.y}" width="6" height="${it.h}" fill="${it.color}"/>\n` + textBlock({ markup: `<b>${escapeXml(it.title)}</b>${it.desc ? "<br>" + escapeXml(it.desc) : ""}`, x: it.x + 8, y: it.y, w: it.w - 8, h: it.h, fontSize: 14, color: "#1a1a1a", align: "left", family: "noto_sans" });
    case "divider":
      return `<line x1="${it.x1}" y1="${it.y1}" x2="${it.x2}" y2="${it.y2}" stroke="${it.stroke}" stroke-width="${it.strokeWidth}" stroke-opacity="${it.opacity}" stroke-linecap="round"${lineStyleDash(it.style, it.strokeWidth)}/>`;
    case "text": {
      const t = richLines(it.body).map((l) => l.text).join(" ");
      return `<text x="${it.x}" y="${it.y}" font-family="${FONT(it.fontFamily)}" font-size="${it.fontSize}" font-weight="${it.fontWeight}" fill="${it.fill}" text-anchor="${it.anchor}">${escapeXml(t)}</text>`;
    }
    case "textArea":
      return textBlock({ markup: it.body, x: it.x, y: it.y, w: it.w, h: it.h || 1, fontSize: it.fontSize, color: it.fill, weight: it.fontWeight, family: it.fontFamily, align: it.align, valign: "top", pad: 0 });
    case "mermaidImage":
      return `<image x="${it.x}" y="${it.y}" width="${it.w}" height="${it.h}" href="data:image/png;base64,${it.b64}"/>`;
    case "mermaidSvg":
      return `<g transform="translate(${it.x},${it.y}) scale(${it.scale})">${it.svg}</g>`;
    default:
      return "";
  }
}

// ---------- connectors ----------
const center = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
function sidePoint(b, side) {
  switch (side) {
    case "top": return { x: b.x + b.w / 2, y: b.y };
    case "bottom": return { x: b.x + b.w / 2, y: b.y + b.h };
    case "left": return { x: b.x, y: b.y + b.h / 2 };
    case "right": return { x: b.x + b.w, y: b.y + b.h / 2 };
  }
}
function autoSide(from, to) {
  const a = center(from), b = center(to);
  const dx = b.x - a.x, dy = b.y - a.y;
  if (Math.abs(dx) * from.h >= Math.abs(dy) * from.w) return dx >= 0 ? "right" : "left";
  return dy >= 0 ? "bottom" : "top";
}
const horiz = (s) => s === "left" || s === "right";
const normal = (s) => ({ top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] })[s];

function connectorSvg(c) {
  const s = byId.get(c.start), e = byId.get(c.end);
  const ss = c.startSide || autoSide(s, e);
  const es = c.endSide || autoSide(e, s);
  const p1 = sidePoint(s, ss), p2 = sidePoint(e, es);
  let pts;
  if (c.route === "elbowed") {
    const off = 24;
    const [n1x, n1y] = normal(ss), [n2x, n2y] = normal(es);
    const a = { x: p1.x + n1x * off, y: p1.y + n1y * off };
    const b = { x: p2.x + n2x * off, y: p2.y + n2y * off };
    if (horiz(ss) && horiz(es)) {
      const mx = (a.x + b.x) / 2;
      pts = [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
    } else if (!horiz(ss) && !horiz(es)) {
      const my = (a.y + b.y) / 2;
      pts = [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
    } else if (horiz(ss)) {
      pts = [p1, { x: p2.x, y: p1.y }, p2];
    } else {
      pts = [p1, { x: p1.x, y: p2.y }, p2];
    }
  } else {
    pts = [p1, p2];
  }
  const sw = c.strokeWidth || 2;
  const stroke = c.stroke || "#313131";
  let d;
  if (c.route === "curved") {
    const [n1x, n1y] = normal(ss), [n2x, n2y] = normal(es);
    const k = Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.4;
    d = `M${r(p1.x)},${r(p1.y)} C${r(p1.x + n1x * k)},${r(p1.y + n1y * k)} ${r(p2.x + n2x * k)},${r(p2.y + n2y * k)} ${r(p2.x)},${r(p2.y)}`;
    pts = [p1, { x: p1.x + n1x * k, y: p1.y + n1y * k }, { x: p2.x + n2x * k, y: p2.y + n2y * k }, p2];
  } else {
    d = "M" + pts.map((q) => `${r(q.x)},${r(q.y)}`).join(" L");
  }
  let out = `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"${dashOf(c.dash, sw)}/>`;
  const head = (tip, from) => {
    const ang = Math.atan2(tip.y - from.y, tip.x - from.x);
    const L = 10 + sw * 2, W = 5 + sw;
    const bx = tip.x - L * Math.cos(ang), by = tip.y - L * Math.sin(ang);
    const lx = bx + W * Math.sin(ang), ly = by - W * Math.cos(ang);
    const rx2 = bx - W * Math.sin(ang), ry2 = by + W * Math.cos(ang);
    return `<polygon points="${r(tip.x)},${r(tip.y)} ${r(lx)},${r(ly)} ${r(rx2)},${r(ry2)}" fill="${stroke}"/>`;
  };
  if (c.arrow === "end" || c.arrow === "both") out += head(pts[pts.length - 1], pts[pts.length - 2]);
  if (c.arrow === "start" || c.arrow === "both") out += head(pts[0], pts[1]);
  if (c.label) {
    const m = midpoint(pts);
    const lines = richLines(c.label).map((l) => l.text).filter(Boolean);
    const fs = 14;
    const wMax = Math.max(...lines.map((l) => l.length)) * fs * 0.56 + 12;
    const hBox = lines.length * fs * 1.3 + 6;
    out += `<rect x="${r(m.x - wMax / 2)}" y="${r(m.y - hBox / 2)}" width="${r(wMax)}" height="${r(hBox)}" fill="#ffffff" opacity="0.92"/>`;
    lines.forEach((l, i) => {
      out += `<text x="${r(m.x)}" y="${r(m.y - hBox / 2 + 3 + fs + i * fs * 1.3 - 2)}" font-family="${FONT("noto_sans")}" font-size="${fs}" fill="#313131" text-anchor="middle">${escapeXml(l)}</text>`;
    });
  }
  return out;
}

function midpoint(pts) {
  const segs = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const L = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    segs.push(L);
    total += L;
  }
  let half = total / 2;
  for (let i = 1; i < pts.length; i++) {
    if (half <= segs[i - 1] || i === pts.length - 1) {
      const t = segs[i - 1] ? half / segs[i - 1] : 0;
      return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * t, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * t };
    }
    half -= segs[i - 1];
  }
  return pts[0];
}

// ---------- Mermaid widgets ----------
function pngSize(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

// The sequence subset from notation.md, drawn here so a sandbox without Chrome
// still gets a diagram in the PNG. Anything else returns null and falls back.
function renderSequence(source) {
  const lines = source.replace(/^\uFEFF/, "").trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.startsWith("%%"));
  if (!lines.length || !/^sequenceDiagram\b/.test(lines[0])) return null;
  const participants = [];
  const events = [];
  let autonumber = false;
  const known = (id) => participants.some((p) => p.id === id);

  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (/^autonumber\b/.test(line)) {
      if (/^autonumber\s+\d/.test(line)) return null;
      autonumber = true;
      continue;
    }
    let m = line.match(/^(actor|participant)\s+(\w+)(?:\s+as\s+(.+))?$/);
    if (m) {
      if (known(m[2])) return null;
      participants.push({ id: m[2], name: (m[3] || m[2]).trim(), actor: m[1] === "actor" });
      continue;
    }
    m = line.match(/^(activate|deactivate)\s+(\w+)$/);
    if (m) {
      if (!known(m[2])) return null;
      events.push({ kind: m[1], id: m[2] });
      continue;
    }
    if (/^(alt|opt|loop|par|break|critical)\b/.test(line)) {
      const op = line.split(/\s+/)[0];
      events.push({ kind: "open", op, label: line.slice(op.length).trim() });
      continue;
    }
    if (/^rect\b/.test(line)) {
      events.push({ kind: "open", op: "rect", label: "" });
      continue;
    }
    m = line.match(/^(else|and|option)\b\s*(.*)$/);
    if (m) {
      events.push({ kind: "divider", label: m[2].trim() });
      continue;
    }
    if (line === "end") {
      events.push({ kind: "end" });
      continue;
    }
    m = line.match(/^Note\s+(?:over|left of|right of)\s+([^:]+):\s*(.*)$/i);
    if (m) {
      const ids = m[1].split(",").map((s) => s.trim()).filter(Boolean);
      if (!ids.length || ids.some((id) => !known(id))) return null;
      events.push({ kind: "note", ids, text: m[2].replace(/<br\s*\/?>/gi, " ").trim() });
      continue;
    }
    m = line.match(/^(\w+)\s*(-->>|->>|-\)|-x)\s*([+-])?\s*(\w+)\s*:\s*(.*)$/);
    if (!m || !known(m[1]) || !known(m[4])) return null;
    const arrow = m[2] === "-->>" ? "reply" : m[2] === "-)" ? "async" : m[2] === "-x" ? "lost" : "call";
    events.push({ kind: "msg", from: m[1], to: m[4], arrow, act: m[3] || "", text: m[5].trim() });
  }
  if (!participants.length) return null;
  let depth = 0;
  for (const e of events) {
    if (e.kind === "open") depth++;
    else if (e.kind === "end") depth--;
    if (depth < 0) return null;
  }
  if (depth !== 0) return null;

  const colW = 220;
  const pad = 36;
  const top = 96;
  const rowH = 52;
  const indexed = participants.map((p, i) => ({ ...p, cx: pad + colW * i + colW / 2 }));
  const byId = Object.fromEntries(indexed.map((p) => [p.id, p]));
  const W = pad * 2 + participants.length * colW;

  let y = top + 20;
  const rows = events.map((e) => {
    const row = { ...e, y };
    if (e.kind !== "activate" && e.kind !== "deactivate") y += rowH;
    return row;
  });
  const H = y + 28;

  const boxes = [];
  const lifelines = [];
  const bars = [];
  const marks = [];
  const stack = [];
  for (const e of rows) {
    if (e.kind === "open") stack.push({ y: e.y - 18, label: e.label, op: e.op, dividers: [] });
    else if (e.kind === "divider" && stack.length) stack[stack.length - 1].dividers.push(e);
    else if (e.kind === "end" && stack.length) {
      const b = stack.pop();
      boxes.push({ ...b, y2: e.y + 10, depth: stack.length });
    }
  }

  const parts = [];
  for (const b of boxes) {
    const x = pad - 16 + b.depth * 10;
    const w = W - (pad - 16) * 2 - b.depth * 20;
    const h = Math.max(18, b.y2 - b.y);
    parts.push(`<rect x="${x}" y="${b.y}" width="${w}" height="${h}" fill="#f7f7f7" stroke="#757575" stroke-width="1"/>`);
    const tab = `${b.op}${b.label ? " [" + b.label + "]" : ""}`;
    const tw = Math.min(w - 2, tab.length * 7 + 16);
    parts.push(`<rect x="${x}" y="${b.y}" width="${tw}" height="18" fill="#ffffff" stroke="#757575" stroke-width="1"/>`);
    parts.push(`<text x="${x + 6}" y="${b.y + 13}" font-family="Arial, sans-serif" font-size="12" fill="#1a1a1a">${escapeXml(tab)}</text>`);
    for (const d of b.dividers) {
      parts.push(`<line x1="${x}" y1="${d.y}" x2="${x + w}" y2="${d.y}" stroke="#757575" stroke-width="1" stroke-dasharray="4 3"/>`);
      if (d.label) parts.push(`<text x="${x + 8}" y="${d.y + 14}" font-family="Arial, sans-serif" font-size="12" fill="#595959">${escapeXml("[" + d.label + "]")}</text>`);
    }
  }

  for (const p of indexed) {
    lifelines.push(`<line x1="${p.cx}" y1="${top}" x2="${p.cx}" y2="${H - 12}" stroke="#313131" stroke-width="1" stroke-dasharray="6 4"/>`);
  }

  const active = {};
  for (const e of rows) {
    if (e.kind === "activate") (active[e.id] = active[e.id] || []).push(e.y);
    else if (e.kind === "deactivate") {
      const s = (active[e.id] || []).pop();
      if (s != null) bars.push({ id: e.id, y1: s, y2: e.y });
    } else if (e.kind === "msg" && e.act === "+") (active[e.to] = active[e.to] || []).push(e.y);
    else if (e.kind === "msg" && e.act === "-") {
      const s = (active[e.from] || []).pop();
      if (s != null) bars.push({ id: e.from, y1: s, y2: e.y });
    }
  }
  for (const [id, starts] of Object.entries(active)) {
    for (const s of starts) bars.push({ id, y1: s, y2: H - 12 });
  }
  for (const b of bars) {
    const p = byId[b.id];
    lifelines.push(`<rect x="${p.cx - 5}" y="${b.y1}" width="10" height="${Math.max(8, b.y2 - b.y1)}" fill="#e7e7e7" stroke="#313131" stroke-width="1"/>`);
  }

  const head = (x1, y0, x2, open) => {
    const dir = x2 >= x1 ? 1 : -1;
    const ax = x2 - dir * 10;
    if (open) return `<polyline points="${ax},${y0 - 5} ${x2},${y0} ${ax},${y0 + 5}" fill="none" stroke="#313131" stroke-width="1.5"/>`;
    return `<polygon points="${x2},${y0} ${ax},${y0 - 4} ${ax},${y0 + 4}" fill="#313131"/>`;
  };
  const wrapLabel = (text) => {
    const max = 32;
    if (text.length <= max) return [text];
    const cut = text.lastIndexOf(" ", max);
    const i = cut > 10 ? cut : max;
    const rest = text.slice(i).trim();
    return rest ? [text.slice(0, i).trim(), rest] : [text];
  };
  let step = 0;
  for (const e of rows) {
    if (e.kind === "note") {
      const xs = e.ids.map((id) => byId[id].cx);
      const x1 = Math.min(...xs) - 80;
      const x2 = Math.max(...xs) + 80;
      marks.push(`<rect x="${x1}" y="${e.y - 16}" width="${x2 - x1}" height="32" fill="#fff6b6" stroke="#af7e04" stroke-width="1"/>`);
      marks.push(`<text x="${(x1 + x2) / 2}" y="${e.y + 4}" font-family="Arial, sans-serif" font-size="13" fill="#574900" text-anchor="middle">${escapeXml(e.text)}</text>`);
      continue;
    }
    if (e.kind !== "msg") continue;
    const a = byId[e.from];
    const b = byId[e.to];
    const lines = wrapLabel((autonumber ? `${++step} ` : "") + e.text);
    const labelY = e.y - 8 - (lines.length - 1) * 15;
    const writeLabel = (x, anchor) => {
      lines.forEach((line, i) => {
        marks.push(`<text x="${x}" y="${labelY + i * 15}" font-family="Arial, sans-serif" font-size="13" fill="#1a1a1a" text-anchor="${anchor}">${escapeXml(line)}</text>`);
      });
    };
    if (a.id === b.id) {
      marks.push(`<path d="M ${a.cx} ${e.y - 12} h 36 v 24 h -36" fill="none" stroke="#313131" stroke-width="1.5"/>`);
      marks.push(head(a.cx + 36, e.y + 12, a.cx, false));
      writeLabel(a.cx + 42, "start");
      continue;
    }
    const dash = e.arrow === "reply" ? ` stroke-dasharray="6 4"` : "";
    marks.push(`<line x1="${a.cx}" y1="${e.y}" x2="${b.cx}" y2="${e.y}" stroke="#313131" stroke-width="1.5"${dash}/>`);
    if (e.arrow === "lost") {
      marks.push(`<path d="M ${b.cx - 5} ${e.y - 5} l 10 10 M ${b.cx - 5} ${e.y + 5} l 10 -10" fill="none" stroke="#313131" stroke-width="1.5"/>`);
    } else marks.push(head(a.cx, e.y, b.cx, e.arrow === "async"));
    writeLabel((a.cx + b.cx) / 2, "middle");
  }

  for (const p of indexed) {
    if (p.actor) {
      const hy = 22;
      marks.push(`<circle cx="${p.cx}" cy="${hy}" r="10" fill="#ffffff" stroke="#313131" stroke-width="2"/>`);
      marks.push(`<line x1="${p.cx}" y1="${hy + 10}" x2="${p.cx}" y2="${hy + 28}" stroke="#313131" stroke-width="2"/>`);
      marks.push(`<line x1="${p.cx - 12}" y1="${hy + 18}" x2="${p.cx + 12}" y2="${hy + 18}" stroke="#313131" stroke-width="2"/>`);
      marks.push(`<line x1="${p.cx}" y1="${hy + 28}" x2="${p.cx - 10}" y2="${hy + 44}" stroke="#313131" stroke-width="2"/>`);
      marks.push(`<line x1="${p.cx}" y1="${hy + 28}" x2="${p.cx + 10}" y2="${hy + 44}" stroke="#313131" stroke-width="2"/>`);
      marks.push(`<text x="${p.cx}" y="84" font-family="Arial, sans-serif" font-size="14" fill="#1a1a1a" text-anchor="middle">${escapeXml(p.name)}</text>`);
    } else {
      const bw = Math.min(colW - 28, Math.max(108, p.name.length * 8 + 20));
      marks.push(`<rect x="${p.cx - bw / 2}" y="20" width="${bw}" height="36" rx="6" fill="#ffffff" stroke="#313131" stroke-width="2"/>`);
      marks.push(`<text x="${p.cx}" y="43" font-family="Arial, sans-serif" font-size="14" fill="#1a1a1a" text-anchor="middle">${escapeXml(p.name)}</text>`);
    }
  }

  return { w: W, h: H, svg: parts.concat(lifelines, marks).join("\n") };
}

function placeDiagram(it, drawn) {
  const fx = it.frame ? it.frame.x : 0;
  const availW = Math.max(200, it.frame ? fx + it.frame.w - 64 - it.x : it.w);
  const availH = Math.max(160, it.frame ? it.frame.y + it.frame.h - 200 - it.y : it.h);
  const f = Math.min(availW / drawn.w, availH / drawn.h, 2);
  return { kind: "mermaidSvg", x: it.x, y: it.y, scale: f, svg: drawn.svg };
}

function renderMermaid(it) {
  const dir = mkdtempSync(join(tmpdir(), "miro-mmd-"));
  const inFile = join(dir, "diagram.mmd");
  const outFile = join(dir, "diagram.png");
  const cfgFile = join(dir, "puppeteer.json");
  writeFileSync(inFile, it.source);
  writeFileSync(cfgFile, JSON.stringify({ args: ["--no-sandbox"] }));
  const mmdc = process.env.MMDC;
  const cmd = mmdc ? mmdc : process.platform === "win32" ? "npx.cmd" : "npx";
  const cmdArgs = mmdc ? [] : ["-y", "-p", "@mermaid-js/mermaid-cli@11", "mmdc"];
  const oversample = scale * 2;
  cmdArgs.push("-i", inFile, "-o", outFile, "-b", "white", "-s", String(oversample), "-p", cfgFile, "-q");
  const res = spawnSync(cmd, cmdArgs, { encoding: "utf8", shell: process.platform === "win32", timeout: 300000 });
  if (res.status !== 0 || !existsSync(outFile)) {
    console.error(`mermaid-cli failed for diagram "${it.title}":\n${(res.stderr || res.stdout || res.error?.message || "").slice(0, 2000)}`);
    rmSync(dir, { recursive: true, force: true });
    return null;
  }
  const buf = readFileSync(outFile);
  rmSync(dir, { recursive: true, force: true });
  const { w, h } = pngSize(buf);
  const natW = w / oversample, natH = h / oversample;
  // Miro scales the widget to its box, but read-back always reports 1600x900, so fit the
  // frame's canvas region (frame-relative x..W-64, y..H-200) instead.
  const fx = it.frame ? it.frame.x : 0, fy = it.frame ? it.frame.y : 0;
  const availW = it.frame ? fx + it.frame.w - 64 - it.x : it.w;
  const availH = it.frame ? fy + it.frame.h - 200 - it.y : it.h;
  const f = Math.max(0.2, Math.min(availW / natW, availH / natH, 3));
  return { kind: "mermaidImage", x: it.x, y: it.y, w: natW * f, h: natH * f, b64: buf.toString("base64") };
}

let mermaidFailed = false;
const finalItems = [];
for (const it of drawItems) {
  if (it.kind === "mermaid") {
    const drawn = renderSequence(it.source);
    let placed = null;
    if (drawn) {
      placed = placeDiagram(it, drawn);
      console.log(`sequence diagram rendered in-process (${Math.round(drawn.w)}x${Math.round(drawn.h)})`);
    } else {
      const img = renderMermaid(it);
      if (!img) mermaidFailed = true;
      else placed = img;
    }
    if (!placed) continue;
    finalItems.push(placed);
    const mmdPath = outputPath.replace(/\.png$/i, "") + ".mmd";
    writeFileSync(mmdPath, it.source);
    console.log(`mermaid source written to ${mmdPath}`);
  } else finalItems.push(it);
}
if (mermaidFailed) {
  console.error("refusing to write a PNG that omits the diagram");
  process.exit(5);
}

// ---------- compose ----------
let minX = frame.x, minY = frame.y, maxX = frame.x + frame.w, maxY = frame.y + frame.h;
for (const it of finalItems) {
  if (it.kind === "mermaidImage") {
    maxX = Math.max(maxX, it.x + it.w + 64);
    maxY = Math.max(maxY, it.y + it.h + 64);
  }
}
const titleH = withTitle ? 48 : 0;
const vbX = minX, vbY = minY - titleH, vbW = maxX - minX, vbH = maxY - minY + titleH;

const parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" width="${vbW}" height="${vbH}">`);
parts.push(`<rect x="${vbX}" y="${vbY}" width="${vbW}" height="${vbH}" fill="#ffffff"/>`);
parts.push(`<rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" fill="${frame.fill.length === 9 ? frame.fill.slice(0, 7) : frame.fill}"/>`);
if (withTitle) parts.push(`<text x="${frame.x}" y="${frame.y - 14}" font-family="${FONT("noto_sans")}" font-size="22" font-weight="bold" fill="#1a1a1a">${escapeXml(frame.title)}</text>`);
// Draw see-through shapes (boundaries) first, then the rest in document order, connectors last.
const seeThrough = finalItems.filter((it) => it.kind === "shape" && (!it.fill || it.fill === "none") && it.stroke && it.stroke !== "none");
for (const it of seeThrough) parts.push(itemSvg(it));
for (const it of finalItems) if (!seeThrough.includes(it)) parts.push(itemSvg(it));
for (const c of drawConnectors) parts.push(connectorSvg(c));
parts.push("</svg>");
const outSvg = parts.join("\n");

if (svgOut) writeFileSync(svgOut, outSvg);

// ---------- rasterize ----------
let Resvg;
try {
  ({ Resvg } = await import("@resvg/resvg-js"));
} catch {
  try {
    ({ Resvg } = await import(new URL("./node_modules/@resvg/resvg-js/index.js", import.meta.url).href));
  } catch {
    if (!svgOut) writeFileSync(outputPath.replace(/\.png$/i, "") + ".svg", outSvg);
    console.error(`renderer missing. Run once:\n  npm install --prefix "${here}"\nThe standalone SVG was written next to the output path.`);
    process.exit(4);
  }
}
const resvg = new Resvg(outSvg, {
  fitTo: { mode: "zoom", value: scale },
  background: "#ffffff",
  font: { loadSystemFonts: true, defaultFontFamily: "Arial" },
});
const png = resvg.render().asPng();
writeFileSync(outputPath, png);

const counts = `${drawItems.length} items, ${drawConnectors.length} connectors`;
console.log(`wrote ${resolve(outputPath)} (${pngSize(png).w}x${pngSize(png).h} px) from frame "${frame.title}" (${counts})`);
for (const w of warnings) console.log(`warning: ${w}`);
if (mermaidFailed) process.exit(5);
process.exit(warnings.length ? 2 : 0);
