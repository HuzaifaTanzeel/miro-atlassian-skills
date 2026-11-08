# Bootstrap the map

Agent procedure for the first-run prompt in the README and `assets/first-run-prompt.md`. People paste that prompt. They do not follow this file.

The usual start is empty: no `miro-atlassian.config.yaml`, no Confluence page titled Workspace map, and no `.miro-atlassian/workspace-map.md`. Do not ask the user to create any of those by hand. List what they can already access, then ask.

Build the first map with as few calls as possible and **no page bodies**. After they answer, typical cost is 1 space read, 1 page tree, 1 CQL search, and 1 overview per chosen board.

When this environment can write project files (Cursor, Claude Code), write the config and the cache yourself. When it cannot (Claude.ai), still create the Confluence page, then at step 11 show the filled YAML in chat for them to save at the project root, plus the Project instructions line.

Ask once in step 1 for anything they did not already name. A second question is allowed only when they can access more than one Atlassian site: ask the site first, then list spaces. Ask again before step 9 (creating the map page). Steps 2 to 8 are read-only, apart from writing ids into the local config.

## Steps

1. **Discover.** Read `miro-atlassian.config.yaml` if it exists. Skip any item the user already named or the config already holds. Ignore a placeholder site such as `https://your-site.atlassian.net`.
   - **Site.** `getAccessibleAtlassianResources`. One site: use it. Several, and none chosen yet: ask which, then continue.
   - **Spaces.** executeRead `listConfluenceSpaces` with top-level `cloudId` and `inputs={status: "current", limit: 250}`. Follow the cursor. Keep key, name, and id.
   - **Boards.** `board_search_boards` with an empty query. Keep name and URL.
   - **One question**, numbered choices, every remaining gap in the same message: which Confluence space; which Miro board, or all boards just listed. The map page goes under the space home unless they name a parent.
   Wait for the answer. Then, if this environment can write files, write `miro-atlassian.config.yaml` at the project root using `assets/config.example.yaml` as the shape, with `site`, `cloudId`, `spaceKey`, and `miro.defaultBoard` filled. Leave `defaultBoard` blank when they chose every board. Leave `spaceId` and `homepageId` blank until step 3.
2. **cloudId.** Use the id from step 1. Call `getAccessibleAtlassianResources` only when it is still blank. Write it into the config.
3. **Space.** If `spaceId` or `homepageId` is blank, call `getConfluenceSpace` via executeRead with top-level `cloudId` and `inputs={spaceIdOrKey: <spaceKey>}`. Record `spaceId`, `homepageId`, and whether space instructions exist (`spaceInstructions: none` or `present`). Write them into the config and the map header.
4. **Tree.** `getConfluenceContentDescendants` via executeRead, `contentId=<homepageId>`, `depth=10`, `limit=250`. Follow the cursor until done. Each entry gives id, type, title, parentId. Build `path` by joining titles from the homepage down.
5. **Descriptions and dates.** One CQL search: `space = "<KEY>" AND type in (page, folder) ORDER BY lastmodified DESC`, with the largest page size the tool allows. Take `lastmodified` as `updated` and turn the excerpt into **one** sentence for `description`. If an excerpt is empty, write a description from the title and path, and end it with "(from title)".
6. **Miro.** Reuse the board list from step 1 when you already have it. Otherwise `board_search_boards` with the configured board name, or an empty query if the user said all boards. For each board in scope, one `canvas_search` with `result_mode="overview"`. Add one row per frame. Type comes from the title prefix (`[UC]` = `use-case`, `[SEQ]` = `sequence`, `[DFD-0]` = `data-flow-0`, `[DFD-1]` = `data-flow-1`, anything else `other`). A board with no frames gets one row with frameId `-` and type `empty`. Two boards with the same name: keep both and add an alias row "<name>: two boards, ask which".
7. **Diagram targets.** Look for pages whose titles suggest a home for each diagram type (for example "Diagrams", "Use case diagrams", "Sequence diagrams", "Data flow") and templates (`type` = `template`). Fill `parentPageId` and `templatePageId` only when one page clearly fits; leave blanks otherwise. Never guess between two candidates.
8. **Aliases.** Add an alias only when two rows could be confused, or the user already used a phrase in this chat.
9. **Create the map page** (ask first). If they named a parent, use it. Otherwise, if the tree has one clear standards or engineering page, offer that; if not, offer the space home. "Create a page titled Workspace map under <parent title>?" `createConfluenceContent` with `contentType="page"`, `title="Workspace map"`, `parent={spaceId, parentContentId: <map.parentPageId or homepageId>}`, and the HTML body in `write-through.md`. Record `mapPageId` and `mapVersion` from the response. Write `map.confluencePageId` into the config.
10. **Cache.** Write the map text to `cachePath` (default `.miro-atlassian/workspace-map.md`). Add `.miro-atlassian/` to the project `.gitignore` if it is not there. Skip this step when files cannot be written.
11. **Pointer.** When files can be written, offer to add one line to the project's `AGENTS.md` so agents without the skill still find the map:

    ```text
    Workspace map: Confluence page <mapPageId>, cache .miro-atlassian/workspace-map.md. Read it before searching Confluence or Miro.
    ```

    When they cannot (Claude.ai), show the filled `miro-atlassian.config.yaml` in chat, using the keys in `assets/config.example.yaml`, so they can save it at the project root. `map.confluencePageId` is the page just created. `map.cachePath` stays `.miro-atlassian/workspace-map.md`. Then give this one line to paste into Project instructions:

    ```text
    Workspace map: Confluence page <mapPageId> <url>. Read it before searching Confluence or Miro.
    ```

12. **Report.** Counts of pages, folders, templates, boards, frames, and any blanks the user should fill (diagram targets, ambiguous boards).

## If the user declines

Say the map is missing, keep a local cache from steps 4 to 6 if they allow it, and continue the original task with scoped searches. Do not ask again in the same chat.
