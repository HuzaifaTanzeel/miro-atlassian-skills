# Tool map

This file is copied into each skill by `scripts/sync-shared.mjs`. Edit the copy in `shared/`.

Map each capability to the tool the connected server actually offers. Check the live tool list once at the start of a chat. If a name below is missing, look for the server's own discover operation or tool list, and say in the chat which name you used instead. Never guess an operation name.

## Atlassian (official remote MCP, `https://mcp.atlassian.com/v2/mcp`)

Operations marked "via executeRead" or "via executeWrite" are not top-level tools. Call the execute tool with `name`, top-level `cloudId`, and `inputs`. Run `discover` once if the call is rejected, and use the name it returns.

| Capability | Tool or operation | Notes |
|---|---|---|
| Site and cloudId | `getAccessibleAtlassianResources` | Only when the config and map have no cloudId. Write it back to the config. |
| Search pages (CQL) | `searchConfluence` | Always scope with `space = "KEY"`. Results include excerpts. |
| Page tree | `getConfluenceContentDescendants` via executeRead | `contentId` = space homepage id, `depth` up to 10, `limit` up to 250. Returns id, type, title, parent, depth. No dates. |
| Read one page | `getConfluenceContent` | `detail`: `summary` (cheap), `outline` (headings), `full` (body). `content_format`: `html` or `markdown`. Use `draft=true` before an edit to get the `snapshotToken`. |
| Create a page or folder | `createConfluenceContent` | `parent`: `{spaceId, parentContentId}` or `{parentContentId}`. `contentType="page"`. |
| Copy a template page | `copyConfluenceContent` via executeWrite | `contentId` (template), `title`, `parentContentId`. |
| Update a page | `updateConfluenceContent` | Needs `snapshotToken` from the latest draft read. `body` (full replace) or `edits` (granular, by `data-local-id`). |
| Space instructions | `getConfluenceSpace` via executeRead | Once per space per task when the map header says `spaceInstructions: unknown`. Skip it when a `getConfluenceContent` summary in that space returned `metadata.hasSpaceInstructions: false`. Record the result in the map header. |
| Format guide | `getContentFormatGuide` via executeRead, `inputs={toolName: "updateConfluencePage"}` or `"createConfluencePage"` (the key is the operation, not the MCP tool name) | The server asks for it before authoring. Once per chat. |
| List attachments | `listConfluenceAttachments` via executeRead | `contentId`, optional `filename`, `mediaType`. Returns attachment ids; the compact view leaves out `fileId`. |
| One attachment | `getConfluenceAttachment` via executeRead, `view: "full"` | `attachmentId`. Its `fileId` is the media id used in the page body. |
| Prepare an attachment upload | `createConfluenceAttachment` via executeWrite | `contentId`, `localFilePath`, `fileSize`, `comment`. Returns a curl `uploadCommand` to run in a local shell (`curl.exe` on Windows PowerShell). The token in it expires after about five minutes. The upload response includes `fileId`, so the two attachment reads above are usually not needed. |
| Jira (reserved) | `getJiraIssue`, `searchJiraIssuesUsingJql` | Not used by these skills. Only when the user asks about a ticket. |

## Atlassian (community `mcp-atlassian` server)

| Capability | Typical tool |
|---|---|
| Search pages | `confluence_search` |
| Read one page | `confluence_get_page` |
| Page tree | `confluence_get_page_children`, or CQL `ancestor = <id>` |
| Create / update page | `confluence_create_page`, `confluence_update_page` |
| Attachments | `confluence_get_attachments`, `confluence_upload_attachment` (names vary by version) |

Community tool names drift between versions. Read that server's tool list rather than trusting this table.

## Miro (`https://mcp.miro.com/`)

| Capability | Tool | Notes |
|---|---|---|
| Find boards | `board_search_boards` | Empty query lists the user's boards. `modified_at` may be null. |
| Board overview (frames and titles) | `canvas_search` with `result_mode="overview"` | The cheap call. Use once per board for placement or resync. |
| Find one item | `canvas_search` with `result_mode="matches"` and a pattern | For a frame title when the map has no id. |
| Read one frame | `canvas_read_as_svg` with `widget_ids=[frameId]`, or `scope_x`, `scope_y`, `scope_width`, `scope_height` set to the frame box | Returns the frame and everything inside it, plus connectors. Unscoped reads are rejected. |
| Authoring guidance | `canvas_get_canvas_composer_skill` (`design`, `dsl`), `canvas_load_format_skill` | Once per chat per notation. |
| Create items | `canvas_create_from_svg` | One SVG per frame. |
| Edit items | `canvas_update_from_svg` | Start from the latest `result_svg`. |

Removed in September 2026, do not call: `board_list_items`, `context_explore`, `context_get`, `diagram_get_dsl`, `diagram_create`, `layout_read`, `layout_create`, `doc_create`, `doc_get`, `doc_update`.
