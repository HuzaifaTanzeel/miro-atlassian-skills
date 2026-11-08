---
name: miro-to-confluence
description: Publish a Miro diagram frame to a Confluence page as a PNG with a written description. Use when the user asks to publish, copy, export, attach, or put a Miro diagram or frame on a Confluence page (existing, named, or new), or to refresh a diagram already there. If this environment cannot reach the Confluence host, put the PNG inline in the page HTML instead of an attachment. Not for Confluence whiteboards, and not for using a Miro embed as the picture.
license: MIT
compatibility: Needs Miro MCP, Atlassian MCP, Node.js 20+, and a shell for the upload command the Atlassian server returns.
metadata:
  version: "0.2.1"
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
4. **Upload.** Follow `references/publish-steps.md` step 4. Route A when the shell can reach the Confluence host: attachment curl, then the media node. Route B only when the host cannot be resolved (Claude free plan): inline the PNG in the page HTML. Route C when that write does not land: hand over the SVG and PNG and the manual steps. The upload token appears only inside that one curl command.
5. **Write the page section.** Read `references/page-layout.md` and `references/description-template.md`. Change the embed and the image only. Keep the Source sentence and its Miro link, notes, tables, headings, status lozenges, and related-page links. After a full body replace, read the page back and compare those. Skip `dryRun` on a page this task just copied or created.
6. **Check and record.** Confirm the new page version; one map write: frame row gets `page <id>`, page row gets `frame <id>`, new pages get their own row.
7. **Report.** Which route, whether the image is a true attachment or inline, the page version, and anything that could not be done. Ask the user to confirm the picture visually. A read-back is not success by itself.

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

- The picture is a PNG. A Miro smart link, embed, or iframe is not the picture. Keep a Source sentence and its Miro link if the page already has them.
- Never invent media ids. Route A uses `fileId` from the attachment. Route B has no fileId; say that it is inline, not a true attachment.
- An `<img>` src is a `data:image/png;base64,...` value or a Confluence attachment. Never a local file path.
- Replace only the embed and the image. Keep people-written text. Never edit a template in place.
- When `spaceInstructions` is `unknown`, read the space instructions and the content format guide once, then set the header to `read`. `none` or `read` means those calls are already done.
- Description from frame elements and labels; mark guesses as open questions.
- Ask before creating a page unless the user asked for a new page.
- One map write per task, at the end.
- Exit code 5 stops the task with no page edit. An upload that reaches the host and then fails also stops. Route B is the one case that writes a page without a `fileId`. Do not publish a page that says the image is not attached yet.
