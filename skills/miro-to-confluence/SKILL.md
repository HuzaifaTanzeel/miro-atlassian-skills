---
name: miro-to-confluence
description: Publish a Miro diagram frame to a Confluence page as a PNG with a written description. Use when the user asks to publish, copy, export, attach, or put a Miro diagram or frame on a Confluence page (existing, named, or new), or to refresh a diagram already there. Not for Confluence whiteboards or Miro embeds.
license: MIT
compatibility: Needs Miro MCP, Atlassian MCP, Node.js 20+, and a shell for the upload command the Atlassian server returns.
metadata:
  version: "0.1.0"
  suite: miro-atlassian-skills
---

# Miro diagram to Confluence

One Miro frame → Confluence page as a PNG plus a short description. PNG only; never a Miro embed or live board link.

## Workflow

1. **Resolve frame and page.** Read `references/map-contract.md`. Frame: Miro table (title, alias, or frame just drawn). Page, in order: user-named page; `page <id>` on the frame row; Diagram targets row for this type; else ask (Target rules). One question max, numbered candidates from the map.
2. **Read the frame.** `canvas_read_as_svg` with `widget_ids=[frameId]`. Save `svg` under `.miro-atlassian/out/`.
3. **Make the PNG.** Read `references/publish-steps.md`. Run `node <skill>/scripts/frame-to-png.mjs <frame.svg> <name>.png --svg-out <name>.svg`. Install the renderer once if exit code 4. Inspect the PNG before upload. Exit code 2 lists skipped elements; tell the user.
4. **Upload.** Reuse the attachment if the same filename exists (new version); else create. Run the `curl` the Atlassian server returns.
5. **Write the page section.** Read `references/page-layout.md` and `references/description-template.md`. Read the page as a draft; add or replace the diagram section; update with the snapshot token. Keep every other part of the page.
6. **Check and record.** Confirm the new page version; one map write: frame row gets `page <id>`, page row gets `frame <id>`, new pages get their own row.
7. **Report.** Page title/link, attachment filename, skipped elements, what the description covers. Ask the user to look at the page.

Tool and operation names: `references/tool-map.md`.

## Target rules

| Request | Target |
|---|---|
| "Publish to page X" / URL / id | That page. If template, copy to a new page first. |
| "Publish it" / "put it on Confluence" | Frame row's `page <id>`, else Diagram targets for the type. |
| Diagram targets `layout = shared-page` | `parentPageId`, under its own heading (replace section on refresh). |
| Diagram targets `layout = page-per-diagram` | Child of `parentPageId` named after the frame title without prefix; reuse if mapped. |
| "On a new page" | New child. Parent: user choice, else Diagram targets `parentPageId`. Copy `templatePageId` if set. |
| Nothing fits | Ask once with ≤4 map candidates plus "a new page under …". |

## Rules that are easy to break

- PNG only; no Miro iframe or board URL in the page (a "Source: Miro frame …" line is fine).
- Never invent media ids; use `fileId` from the attachment record.
- Replace only a section this skill wrote (`Source: Miro frame` line). Keep people-written text; never edit a template in place.
- Read space instructions and the content format guide once per space; record `spaceInstructions: read` in the map header.
- Description from frame elements and labels; mark guesses as open questions.
- Ask before creating a page unless the user asked for a new page.
- One map write per task, at the end.
