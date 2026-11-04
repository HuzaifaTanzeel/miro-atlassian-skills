# Tool budget: what you can switch off

Every MCP tool you leave enabled costs context: its name, description, and input schema are sent with each chat. Once the workspace map exists, the skills in this repository need a small set of tools. This page lists what to keep and what you can disable, per server.

How to disable a tool:

- **Cursor**: Settings, then MCP (or Tools and MCP), open the server, and toggle individual tools off.
- **Claude Code**: add the tool to `permissions.deny` in `.claude/settings.json`, for example `"mcp__atlassian__getJiraIssue"`. The exact prefix is the server name you registered.
- **Claude Desktop and others**: use the client's per-tool toggle if it has one; otherwise leave the tool on. The skills never call tools they do not need.

Tool names below were checked against the live servers in November 2026. Servers add and rename tools; if a name here no longer exists, ignore that row.

## Miro (`https://mcp.miro.com/`)

### Keep

| Tool | Used by | Why |
|---|---|---|
| `canvas_get_canvas_composer_skill` | diagram skills | Authoring guidance, once per chat. |
| `canvas_load_format_skill` | diagram skills | Notation guidance (`free_form`, `uml_sequence`). |
| `canvas_create_from_svg` | diagram skills | Draws a frame. |
| `canvas_update_from_svg` | diagram skills | Fixes and edits a frame. |
| `canvas_read_as_svg` | diagram skills, `miro-to-confluence` | Reads one frame by id; the source of the PNG. |
| `canvas_search` | all | Board overview for placement and resync; find a frame by title. |
| `board_search_boards` | `workspace-map` | Lists boards during bootstrap. Can be switched off after bootstrap if your boards never change. |

### Can disable

| Tool or group | Why it is not needed |
|---|---|
| `board_create`, `board_create_format` | The skills never create boards without asking, and the free plan locks older boards. Re-enable when you want a new board. |
| `board_show`, `board_preview_read` | The map holds board ids and titles. |
| `board_move`, `board_move_to_team`, `board_update_metadata`, `board_get_space`, `board_restore` | Board administration. |
| `board_share`, `board_role_update`, `content_item_list_roles` | Sharing and permissions. |
| `space_create`, `space_update_metadata`, `space_list`, `space_list_boards`, `space_list_children`, `space_share`, `space_role_update` | Miro spaces are not used. |
| `section_create`, `section_delete`, `section_update_metadata` | Board sections are not used; frames are. |
| `table_create`, `table_list_rows`, `table_sync_rows`, `table_update_view`, `table_get_latest_update_history` | Miro tables are not used. |
| `image_get_url`, `image_get_data`, `image_get_upload_url`, `image_create` | The PNG is made locally from the frame SVG. |
| `comment_list_comments`, `comment_create`, `comment_reply`, `comment_resolve` | Not used. Keep them if you review diagrams with comments. |
| `prototype_read`, `prototype_get_upload_url`, `prototype_create` | Prototypes are not diagrams. |
| `canvas_get_html_upload_url` | HTML widgets are not used by these notations. |
| `content_search`, `get_brand_context`, `user_who_am_i`, `user_search_organization_users` | Not needed for diagrams. |
| `create_boardcast`, `record_ui_feedback` | Not used. |

## Atlassian (`https://mcp.atlassian.com/v2/mcp`)

### Keep

| Tool | Used by | Why |
|---|---|---|
| `getConfluenceContent` | all | Reads the map page (summary for the version check), reads a page draft before an edit. |
| `updateConfluenceContent` | `miro-to-confluence`, map write-through | Writes the diagram section and the map. |
| `createConfluenceContent` | `miro-to-confluence`, `workspace-map` | New diagram pages and the map page. |
| `searchConfluence` | `workspace-map`, fallback lookups | Scoped CQL when the map has no match, and delta resync. |
| `discover` | all | Finds operation names when a call is rejected. |
| `executeRead` | all | Page tree, attachments, space instructions, format guide. |
| `executeWrite` | `miro-to-confluence` | Attachment upload and template copy. |
| `getAccessibleAtlassianResources` | first run | Finds `cloudId`. Disable it once `cloudId` is in the config. |

### Can disable

| Tool or group | Why it is not needed |
|---|---|
| `executeDestructive` | No skill deletes anything. Disabling it is a cheap safety net. |
| `getJiraIssue`, `searchJiraIssuesUsingJql`, `createJiraIssue`, `editJiraIssue`, `transitionJiraIssue`, `addOrEditJiraIssueComment`, `listJiraIssueComments` | Jira is out of scope for now. Map rows carry issue keys as pointers only. Re-enable when you add a `jira-*` skill (see `architecture.md`). |
| `getLoomObjectsContent` | Loom is not used. |
| `getGraphContext`, `getGraphObject`, `addGraphContext` | Teamwork Graph is not needed; the map holds the relations these skills use. |
| `getCollaborators`, `getPeopleInfo`, `getWorkActivity`, `getWorkPortfolio` | People and portfolio data are not used. |
| `search` (cross-product Rovo search) | `searchConfluence` with a space filter is cheaper and scoped. |
| `atlassianUserInfo` | Not needed. |

## Community `mcp-atlassian` server

Keep the Confluence page read, search, create, update, and attachment tools. Disable the Jira tools for now. Tool names vary by version, so check its tool list.

## Minimum sets

| Workflow | Miro tools | Atlassian tools |
|---|---|---|
| Draw a diagram | 6 canvas tools | `getConfluenceContent`, `updateConfluenceContent` (map write-through) |
| Publish to Confluence | `canvas_read_as_svg`, `canvas_search` | `getConfluenceContent`, `updateConfluenceContent`, `createConfluenceContent`, `executeRead`, `executeWrite`, `discover` |
| Bootstrap or resync the map | `board_search_boards`, `canvas_search` | add `searchConfluence` |
