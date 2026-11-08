---
name: miro-to-confluence
description: Publish a Miro diagram frame to a Confluence page as a PNG with a written description. Use when the user asks to publish, copy, export, attach, or put a Miro diagram or frame on a Confluence page (existing, named, or new), or to refresh a diagram already there. Not for Confluence whiteboards or Miro embeds.
license: MIT
compatibility: Needs Miro MCP, Atlassian MCP, Node.js 20+, and a shell for the upload command the Atlassian server returns.
metadata:
  version: "0.2.0"
  suite: miro-atlassian-skills
---

# Miro diagram to Confluence

One Miro frame → Confluence page as a PNG plus a short description. PNG only; never a Miro embed or live board link.

## Call budget

Follow the steps in order. Open `references/publish-steps.md` at step 3, and `references/page-layout.md` plus `references/description-template.md` at step 5. Do not read them earlier, and do not list this folder, read `package.json`, or read another skill's files.

Call the names in `references/tool-map.md`. Do not search the tool registry. `discover` only after a named call is rejected. The attachment and copy operations are named in `publish-steps.md`; call those names, do not discover them first.

Do not read the template page or a sibling diagram page. The copied draft has the headings, and the description comes from the frame plus `description-template.md`. Do not CQL-search a title, parent, or template the map already lists.

Map header `spaceInstructions: none` or `read` means step 5 of `publish-steps.md` is already done. Do not call `getConfluenceSpace` or `getContentFormatGuide` again.

## Workflow

1. **Resolve frame and page.** Use the map already read in this task; open `references/map-contract.md` only if it was not. Frame: Miro table (title, alias, or frame just drawn). Page, in order: user-named page; `page <id>` on the frame row; Diagram targets row for this type; else ask (Target rules). One question max, numbered candidates from the map.
2. **Read the frame.** `canvas_read_as_svg` with `widget_ids=[frameId]`, once. If this task just created the frame and you still hold that SVG, reuse it and do not read again. Save `svg` under `.miro-atlassian/out/`.
3. **Make the PNG.** Follow `references/publish-steps.md`. Run `node <skill>/scripts/frame-to-png.mjs <frame.svg> <name>.png --svg-out <name>.svg`. Install the renderer once if exit code 4. Exit 0 or 2: upload. Exit 5: stop. A PNG that omits the diagram is not produced; do not install a browser and do not write the page.
4. **Upload.** Reuse the attachment if the same filename exists (new version); else create. Run the `curl` the Atlassian server returns. If the upload fails, stop. Do not write the page without an image.
5. **Write the page section.** Read `references/page-layout.md` and `references/description-template.md`. Read the page as a draft; add or replace the diagram section; update with the snapshot token. Keep every other part of the page. Skip `dryRun` on a page this task just copied or created.
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
- When `spaceInstructions` is `unknown`, read the space instructions and the content format guide once, then set the header to `read`. `none` or `read` means those calls are already done.
- Description from frame elements and labels; mark guesses as open questions.
- Ask before creating a page unless the user asked for a new page.
- One map write per task, at the end.
- No image, no page edit. Exit code 5, a failed upload, or a missing `fileId` all stop the task. Do not publish a page that says the image is not attached yet.
