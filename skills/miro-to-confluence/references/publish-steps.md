# Publish steps

Core tool names are in `tool-map.md`; attachment, copy, space, and format-guide operations are named in the steps below. `cloudId` comes from the config or the map header. Operations marked "executeRead" or "executeWrite" are called through that Atlassian tool with `cloudId` as a top-level argument, next to `name` and `inputs`.

## 1. Resolve

Read the map (`map-contract.md`). You need:

- `boardId`, `frameId`, frame title, and diagram type from the Miro table.
- The target page id, or the parent page id (and `templatePageId`, if any) for a new page.

If the frame is not in the map, run `canvas_search` on the board with the frame title, take the one match, and add the row in step 9.

## 2. Read the frame

```text
canvas_read_as_svg(board_url, widget_ids=[frameId])
```

Save the `svg` field, unchanged, to `.miro-atlassian/out/<slug>.frame.svg`, where `<slug>` is the frame title without the prefix, in lowercase with hyphens (`evidence-a-control`). Saving the whole JSON response also works; the script reads its `svg` field.

Keep this read: the description (step 7) is written from it. Do not read the frame a second time.

## 3. Make the PNG (local fallback)

Miro MCP does not export a frame as PNG. Use `scripts/frame-to-png.mjs` (Node 20+, `@resvg/resvg-js`) on the SVG from step 2. Sequence diagrams are drawn in the script, with no browser. Other Mermaid types fall back to mermaid-cli, which downloads a browser once. If that download is blocked, stop and ask the user to export the frame as PNG from Miro. Do not install Chrome or Puppeteer yourself, and do not retry the download.

```text
node <skill-dir>/scripts/frame-to-png.mjs .miro-atlassian/out/<slug>.frame.svg .miro-atlassian/out/<slug>.png --svg-out .miro-atlassian/out/<slug>.svg
```

| Exit | Meaning | Do |
|---|---|---|
| 0 | PNG written, diagram included | Upload. Do not open the PNG in a browser. |
| 2 | PNG written, some non-diagram elements skipped or approximated | Upload and list the warnings in the report. |
| 3 | No frame in the input | Re-read with the frame id in `widget_ids`, or pass `--frame <id>`. |
| 4 | Renderer missing | Run `npm install --prefix <skill-dir>/scripts` once, then run the script again. |
| 5 | The diagram could not be drawn | No PNG was written. Show the error. Do not upload, and do not create or edit the page. |

Options: `--scale 2` (default, pixel density), `--frame <id>` (input holds several frames), `--title` (adds the frame title above the image; off by default because the frame already has a header).

A line that says `wrote …png` followed by exit code 5 is a failed run; do not upload that file. For Mermaid frames the script also writes `<slug>.mmd` on success, which the page can show as source (see `page-layout.md`).

## 4. Upload the PNG

1. executeRead `listConfluenceAttachments` with `contentId=<pageId>` and `filename=<slug>.png`.
2. executeWrite `createConfluenceAttachment` with `contentId`, `localFilePath` (absolute path of the PNG), `fileSize` (bytes), and `comment` (for example `[UC] Evidence a control, v2`). The same filename on the same page becomes a new version of that attachment, so a refresh keeps one file.
3. Run the returned `uploadCommand` in the shell right away; its token expires after about five minutes. On Windows PowerShell, `curl` is an alias for another command, so call `curl.exe` with the same arguments, and run it from the PNG's folder with a plain filename in `file=@<slug>.png` (the quoted Windows path in the command does not survive PowerShell quoting). Do not print or store any token the command contains.
4. Get the media id: the upload response includes `fileId` (and `version.number`, which is 2 or higher on a refresh). Use that. Otherwise call executeRead `listConfluenceAttachments` again with the filename, then executeRead `getConfluenceAttachment` with `attachmentId` and `view: "full"`. Use its `fileId` as the media id.

If the upload fails, stop and report. Do not write the page without an image.

## 5. Check the space rules (once per space)

Skip this whole step when the map header says `spaceInstructions: none` or `read`. `page-layout.md` is the HTML contract for those spaces. Do not call `getConfluenceSpace` or `getContentFormatGuide`.

If the map header says `spaceInstructions: unknown`:

1. `getConfluenceContent` with `detail="summary"` on the target page (or its parent) returns `metadata.hasSpaceInstructions`. If it is `false`, skip to 3. If `true`, executeRead `getConfluenceSpace` and read the instructions.
2. executeRead `getContentFormatGuide` with `toolName="updateConfluencePage"` (or `createConfluencePage` when making a page). The guide is keyed by the operation, not by the MCP tool name; `updateConfluenceContent` is not a valid key.
3. Follow them. Set `spaceInstructions: read` (or a short note such as `read: no emojis in titles`) in the map header in step 9.

## 6. New page (only when the target is a new page)

Ask first unless the user asked for a new page. Title: the frame title without the prefix, for example `Evidence a control - sequence`. The next number and the parent come from the map (existing rows under `parentPageId`, plus `templatePageId`). Do not CQL-search those titles, and do not read the template page or a sibling diagram page.

- **Template listed** (`templatePageId` in Diagram targets): executeWrite `copyConfluenceContent` with `contentId=<templatePageId>`, `title`, `parentContentId=<parentPageId>`. Then continue at step 7 with the copy as the target. Fill the template's own headings instead of adding the built-in sections.
- **No template**: `createConfluenceContent` with `parent={spaceId, parentContentId}`, the title, and the built-in page body from `page-layout.md` with an empty figure. Upload the PNG to the new page (step 4), then fill the figure in step 7.

## 7. Write the section

1. `getConfluenceContent` with `draft=true`, `detail="full"`, `content_format="html"`. Keep `snapshotToken`.
2. Find the section heading for this diagram (the `<h2>` with the frame title without the prefix).
   - **Section written by this skill** (it has the `Source: Miro frame ...` line): replace it up to the next `<h2>`.
   - **Section written by people** (no `Source: Miro frame` line): keep their text. Insert only the figure and an image line, `<p><em>Image: Miro frame [UC] Evidence a control, exported <time ...>.</em></p>`, after the section's first paragraph, or after the paragraph that names the source, or where the user said. On a refresh, replace only that figure and its `Image:` line. The different word keeps a later refresh from treating the section as this skill's. Add the description sections only if the user asks.
   - **No section**: append the full section at the end of the body, or under the heading the user named.
3. Build the section from `page-layout.md` and the description from `description-template.md`.
4. `updateConfluenceContent` with `snapshotToken`, a `versionMessage` such as `diagram: [UC] Evidence a control`, and `edits` instead of a full body. Every node in the draft carries a `data-local-id`; target those:
   - Insert: `{"name": "insertNodeAfter", "localId": "<id of the paragraph>", "value": "<figure ...>...</figure><p>...</p>"}`
   - Append a section: `{"name": "appendNodeToEnd", "value": "<h2>...</h2>..."}`
   - Refresh: `replaceNode` on the old figure and on the source or image line, `deleteNode` for old description nodes.

   Edits leave the rest of the page untouched, and the call is a fraction of the size of a full body. Skip `dryRun` on a page this task just copied or created. On any other page, `"dryRun": true` the first time; the response shows the resulting HTML. Fall back to `body` with the full HTML only if an edit is rejected. If the token is stale, read the draft again and redo the edit once. On `internal_error`, read the draft with `detail="outline"`: if the new heading is not there and the `snapshotToken` is unchanged, nothing was applied, so send the edit once more.

## 8. Check

The update response carries `content.version.number`; confirm it went up. Only if it is missing, call `getConfluenceContent` with `detail="summary"`. Do not read the body again.

## 9. Record

One write-through (`map-contract.md`):

- Miro row of the frame: add `page <pageId>` to `links`.
- Confluence row of the page: add `frame <frameId>` to `links`, and set `updated`. A new page gets a new row with a one-sentence description.
- Header: `spaceInstructions`, if step 5 ran.

## 10. Report

Page title and link, attachment filename and version, warnings from step 3, the description sections written, and a request to look at the page.
