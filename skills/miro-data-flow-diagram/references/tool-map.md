# Tool map

This file is copied into each skill by `scripts/sync-shared.mjs`. Edit the copy in `shared/`.

Call the names in this table. Do not list the skill folder, search the tool registry, or call `discover` to confirm them. If a call is rejected as an unknown operation, `discover` once and say which name you used. Never guess an operation name. A community `mcp-atlassian` server uses different names (`confluence_*`); read its tool list instead of this table.

## Atlassian (official remote MCP, `https://mcp.atlassian.com/v2/mcp`)

"Via executeRead" or "via executeWrite" means: call that execute tool with `name`, top-level `cloudId`, and `inputs`. Run `discover` once if the call is rejected and use the name it returns.

| Capability | Tool or operation | Notes |
|---|---|---|
| Site and cloudId | `getAccessibleAtlassianResources` | Only when the config and map have no cloudId. Write it back to the config. |
| List spaces | `listConfluenceSpaces` via executeRead | First run, when `spaceKey` is blank. Top-level `cloudId`, `inputs={status: "current", limit: 250}`. Follow the cursor. Returns key, name, and id. |
| Search pages (CQL) | `searchConfluence` | Always scope with `space = "KEY"`. Results include excerpts. |
| Page tree | `getConfluenceContentDescendants` via executeRead | `contentId` = space homepage id, `depth` up to 10, `limit` up to 250. Returns id, type, title, parent, depth. No dates. |
| Read one page | `getConfluenceContent` | `detail`: `summary` (cheap), `outline`, `full`. `content_format`: `html` or `markdown`. `draft=true` before an edit gives the `snapshotToken`. |
| Create page or folder | `createConfluenceContent` | `parent`: `{spaceId, parentContentId}`. `contentType="page"`. |
| Update page | `updateConfluenceContent` | Needs the latest `snapshotToken`. `body` (full replace) or `edits` (by `data-local-id`). |

Other operations (space instructions, format guide, template copy, attachments) are described in the reference that uses them (`publish-steps.md`, `bootstrap.md`, `delta-sync.md`).

## Miro (`https://mcp.miro.com/`)

| Capability | Tool | Notes |
|---|---|---|
| Find boards | `board_search_boards` | Empty query lists the user's boards. |
| Board overview | `canvas_search` with `result_mode="overview"` | The cheap call. Once per board for placement or resync. |
| Find one item | `canvas_search` with `result_mode="matches"` and a pattern | For a frame title when the map has no id. |
| Read one frame | `canvas_read_as_svg` with `widget_ids=[frameId]` (or `scope_x/y/width/height` = the frame box) | Returns the frame, its contents, and connectors. Unscoped reads are rejected. |
| Authoring guidance | `canvas_get_canvas_composer_skill` with `step="dsl"` | Once per chat. Do not call `step="design"`. Do not call `canvas_load_format_skill` for use case, sequence, or data flow. |
| Create / edit | `canvas_create_from_svg` / `canvas_update_from_svg` | One SVG per frame. Edit from the latest `result_svg`. |
