# Delta sync (keep the map fresh cheaply)

The map stays fresh in two ways:

1. **Write-through.** Every skill in the suite updates the rows it changed, in the same task (`map-contract.md`). Changes made by the agent never need a resync.
2. **Delta sync.** Changes people make by hand in Confluence or Miro are picked up by a cheap diff, run only when needed.

## When to run it

Run a delta sync, scoped as small as possible, when any of these is true:

| Trigger | Scope |
|---|---|
| A mapped page id returns 404, or its title no longer matches | That page's parent: one CQL `parent = <parentId>` |
| A mapped frame id is missing on the board | That board: one `canvas_search` overview |
| The user names a page or frame the map does not have | One CQL title search in the space, or one `canvas_search` with `result_mode="matches"` |
| The map header `scanned` date is older than `staleAfterDays` | Offer a space-wide delta (below). Do not run it unasked. |
| The user asks to resync | Whatever scope they name; default is space-wide delta since `scanned` |

## Space-wide delta

1. CQL: `space = "<KEY>" AND type in (page, folder) AND lastmodified >= "<scanned>" ORDER BY lastmodified DESC`. This returns only pages changed or created since the last scan.
2. For each result:
   - id in the map: update title, `updated`, and the description (only if the excerpt shows the purpose changed). If the title changed, also fix `path` on that row and its children.
   - id not in the map: add a row. Get its `parentId` from `getConfluenceContent` with `detail="summary"` if the search result does not include it (or from `getConfluenceContentAncestors` via executeRead, limit 1).
3. **Deletions and moves.** CQL cannot list deleted pages. Only if the user asked for a full resync, or step 2 shows a moved parent, re-run `getConfluenceContentDescendants` on the homepage and drop rows whose ids are gone. Otherwise deleted pages are dropped when a 404 hits them.
4. **Miro.** For each board in the map, one `canvas_search` overview. Compare frame ids: add new frames, retitle changed ones, drop missing ones. Miro dates are not available from these tools; frame id and title are the only signals.
5. Set `scanned` to today. Write the map once (`write-through.md`). Report added, changed, and removed rows.

## Never

- Never read page bodies during a sync.
- Never write Jira issues into the map. Leave `links` cells as they are unless the user asked to repair links.
- Never run a full tree walk when a scoped one answers the question.
