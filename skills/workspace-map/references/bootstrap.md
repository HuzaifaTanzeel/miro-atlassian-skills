# Bootstrap the map

Build the first map with as few calls as possible and **no page bodies**. Typical cost: 1 to 3 Confluence calls, 1 Miro board search, and 1 overview per board.

Ask before step 9 (creating the map page). Steps 2 to 8 are read-only, apart from writing ids into the local config.

## Steps

1. **Config.** Read `miro-atlassian.config.yaml`. If it is missing, copy `assets/config.example.yaml` to the project root as `miro-atlassian.config.yaml` and ask for the two things you cannot find yourself: the Confluence space key and the Miro board URL (or "all my boards"). One question, both items.
2. **cloudId.** If blank, call `getAccessibleAtlassianResources` once. If several sites come back, use the one matching `atlassian.site`. Write `cloudId` into the config.
3. **Space.** If `spaceId` or `homepageId` is blank, call `getConfluenceSpace` via executeRead with `inputs={spaceIdOrKey: <spaceKey>}`. Record `spaceId`, `homepageId`, and whether space instructions exist (`spaceInstructions: none` or `present`). Write them into the config and the map header.
4. **Tree.** `getConfluenceContentDescendants` via executeRead, `contentId=<homepageId>`, `depth=10`, `limit=250`. Follow the cursor until done. Each entry gives id, type, title, parentId. Build `path` by joining titles from the homepage down.
5. **Descriptions and dates.** One CQL search: `space = "<KEY>" AND type in (page, folder) ORDER BY lastmodified DESC`, with the largest page size the tool allows. Take `lastmodified` as `updated` and turn the excerpt into **one** sentence for `description`. If an excerpt is empty, write a description from the title and path, and end it with "(from title)".
6. **Miro.** `board_search_boards` with the configured board name, or an empty query if the user said all boards. For each board in scope, one `canvas_search` with `result_mode="overview"`. Add one row per frame. Type comes from the title prefix (`[UC]` = `use-case`, `[SEQ]` = `sequence`, `[DFD-0]` = `data-flow-0`, `[DFD-1]` = `data-flow-1`, anything else `other`). A board with no frames gets one row with frameId `-` and type `empty`. Two boards with the same name: keep both and add an alias row "<name>: two boards, ask which".
7. **Diagram targets.** Look for pages whose titles suggest a home for each diagram type (for example "Diagrams", "Use case diagrams", "Sequence diagrams", "Data flow") and templates (`type` = `template`). Fill `parentPageId` and `templatePageId` only when one page clearly fits; leave blanks otherwise. Never guess between two candidates.
8. **Aliases.** Add an alias only when two rows could be confused, or the user already used a phrase in this chat.
9. **Create the map page** (ask first: "Create a page titled Workspace map under <parent title>?"). `createConfluenceContent` with `contentType="page"`, `title="Workspace map"`, `parent={spaceId, parentContentId: <map.parentPageId or homepageId>}`, and the HTML body in `write-through.md`. Record `mapPageId` and `mapVersion` from the response. Write `map.confluencePageId` into the config.
10. **Cache.** Write the map text to `cachePath`. Add `.miro-atlassian/` to the project `.gitignore` if it is not there.
11. **Pointer.** Offer to add one line to the project's `AGENTS.md` so agents without the skill still find the map:

    ```text
    Workspace map: Confluence page <mapPageId>, cache .miro-atlassian/workspace-map.md. Read it before searching Confluence or Miro.
    ```

12. **Report.** Counts of pages, folders, templates, boards, frames, and any blanks the user should fill (diagram targets, ambiguous boards).

## If the user declines

Say the map is missing, keep a local cache from steps 4 to 6 if they allow it, and continue the original task with scoped searches. Do not ask again in the same chat.
