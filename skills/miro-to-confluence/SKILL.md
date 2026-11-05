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

Put one Miro frame on a Confluence page as a picture, followed by a short description written for the reader of that page. The page shows the PNG only, never a Miro embed or a live board link.

Files:

- `references/map-contract.md`: find and read the workspace map, write rows back. Read it first.
- `references/publish-steps.md`: the full procedure, tool by tool.
- `references/page-layout.md`: the HTML for the diagram section and for a new page.
- `references/description-template.md`: what to write under the image.
- `references/tool-map.md`: tool and operation names.
- `scripts/frame-to-png.mjs`: turns the frame SVG from `canvas_read_as_svg` into a PNG.

## Workflow

1. **Resolve the frame and the page from the map.** Frame: the Miro table (title, alias, or the frame the user just drew). Page, in this order: a page the user named; the `page <id>` link on the frame row (a refresh); the Diagram targets row for this diagram type; otherwise ask (see "Target rules"). One question at most, with numbered candidates from the map.
2. **Read the frame once** with `canvas_read_as_svg` and `widget_ids=[frameId]`. Save the `svg` string to a file in the project's `.miro-atlassian/out/` folder.
3. **Make the PNG**: `node <skill>/scripts/frame-to-png.mjs <frame.svg> <name>.png --svg-out <name>.svg`. Install the renderer once if the script exits with code 4. Look at the PNG before uploading. Exit code 2 lists what was skipped; mention it to the user.
4. **Upload** the PNG to the page: reuse the attachment if one with the same filename exists (it becomes a new version), otherwise create it. The Atlassian server returns a `curl` command; run it in the shell.
5. **Write the page section**: read the page as a draft, add or replace the diagram section (image, then description), and update with the snapshot token. Keep every other part of the page as it was.
6. **Check once and record**: read the page summary to confirm the new version, then write one batch to the map: the frame row gets `page <id>`, the page row gets `frame <id>`, and a new page gets its own row.
7. **Report**: page title and link, the attachment filename, any skipped elements, and what the description covers. Ask the user to look at the page.

Details for each step are in `references/publish-steps.md`.

## Target rules

| Request | Target |
|---|---|
| "Publish to page X" / page URL / page id | That page. If X is a template (`type` template), copy it to a new page first. |
| "Publish it" / "put it on Confluence" | The frame row's `page <id>` link if present, else the Diagram targets row for the type. |
| Diagram targets `layout = shared-page` | `parentPageId`, under its own heading (replace the section on refresh). |
| Diagram targets `layout = page-per-diagram` | A child page of `parentPageId` named after the frame title without the prefix. Reuse it if the map already has it. |
| "On a new page" | A new child page. Parent: the user's choice, else the Diagram targets `parentPageId`. If `templatePageId` is set, copy that template; otherwise use the built-in layout. |
| Nothing fits | Ask once with up to 4 candidates from the map plus "a new page under ...". |

## Rules

1. **PNG only.** No Miro iframe, no board URL in the page. A plain-text line "Source: Miro frame [UC] Expense claims" is fine.
2. **Never invent ids.** The media id comes from the attachment record (`fileId`). Never put a local path or a guessed id in the page.
3. **Do not overwrite.** Replace only a diagram section this skill wrote (it carries the `Source: Miro frame` line). In a section people wrote, add the figure with an `Image: Miro frame` line and keep their text; later refreshes replace only that figure. Never rewrite the rest of the page, and never edit a template page in place.
4. **Respect the space.** Read the space instructions and the content format guide once per space and follow them; record `spaceInstructions: read` in the map header.
5. **Description from the diagram.** Write it from the frame's elements and labels, plus anything the user said. Mark guesses as open questions instead of stating them as facts.
6. **Ask before creating a page** unless the user asked for a new page.
7. **One map write per task**, at the end.

## Examples

```text
Publish the [SEQ] Upload evidence frame to the Sequence Diagrams page.
Put the use case diagram I just drew on Confluence, on a new page under Design.
Refresh the published DFD for the platform context; the frame changed.
```
