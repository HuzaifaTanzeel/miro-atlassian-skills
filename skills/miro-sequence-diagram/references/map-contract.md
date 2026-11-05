# Workspace map contract (shared by every skill)

This file is copied into each skill by `scripts/sync-shared.mjs`. Edit the copy in `shared/`, never the copies under `skills/`.

The workspace map is one small index of Confluence pages and Miro frames, with ids and one-sentence descriptions. It lets an agent call a page or frame by id instead of searching or walking trees. Every skill in this suite reads the same map. No skill keeps a second one.

The `workspace-map` skill owns bootstrap, resync, and repair. This file is the minimum every other skill needs: where the map is, how to read it cheaply, and how to write one row back.

Contents: [Where it lives](#where-it-lives) · [Find the map](#find-the-map-stop-at-the-first-hit) · [Read it cheaply](#read-it-cheaply) · [Use it](#use-it) · [Map format](#map-format) · [Write one row back](#write-one-row-back-write-through)

## Where it lives

| Piece | Location | Who reads it |
|---|---|---|
| Map (source of truth) | One Confluence page, titled `Workspace map`, body is a single markdown code block | Every teammate's agent |
| Local cache | `cachePath` in the config, default `.miro-atlassian/workspace-map.md` | This machine only; gitignore it |
| Config | `miro-atlassian.config.yaml` in the project root | Every skill |

Config keys (blank means not set):

```yaml
atlassian:
  site: https://your-site.atlassian.net
  cloudId: ""
  spaceKey: ""
map:
  confluencePageId: ""
  cachePath: .miro-atlassian/workspace-map.md
  staleAfterDays: 7
miro:
  defaultBoard: ""   # full board URL
```

## Find the map (stop at the first hit)

1. `miro-atlassian.config.yaml` in the project root: `map.confluencePageId`.
2. A line in the project's `AGENTS.md` that starts with `Workspace map:` and names a Confluence page id.
3. One CQL search: `space = "<spaceKey>" AND title = "Workspace map" AND type = page`.
4. None: say the map is missing, offer one bootstrap scan (the `workspace-map` skill), and continue the user's task with a scoped search if they decline. Never block the task on the map.

## Read it cheaply

1. If the cache file exists, read its header. If `mapVersion` is set, call `getConfluenceContent` on the map page with `detail="summary"` and compare the version number.
2. Same version: use the cache. Do not read the page body.
3. Different version, or no cache: read the page with `detail="full"` and `content_format="markdown"`, take the text inside the code block, write it to the cache, and set `mapVersion` in the cache header to the page version.
4. If the cache header `scanned` date is older than `staleAfterDays`, tell the user in one line and offer a delta resync. Do not run it unasked.

`cloudId` comes from the config or the map header. Call `getAccessibleAtlassianResources` only when both are blank, then write the value back into the config.

## Use it

- Match the request against titles, paths, frame titles, and the Aliases table. One clear match: use that id. Do not search.
- Several matches and the next step is a write: ask one question with 2 to 4 numbered candidates (title, path, id) plus "other".
- An id that returns 404: one title search inside the row's parent, then ask or repair. Never silently pick a different page.
- Rows may carry a Jira key in `links`. That is a pointer only. Do not call Jira unless the user asks about a ticket.

## Map format

```markdown
# Workspace map
site: https://example.atlassian.net
cloudId: 00000000-0000-0000-0000-000000000000
space: KEY (id 111, homepage 112)
spaceInstructions: unknown
mapPageId: 113
mapVersion: 1
scanned: 2026-01-01
note: Confluence and Miro only. One sentence per description. A Jira key in links is a pointer, not a copy.

## Confluence
| id | type | title | path | parentId | description | updated | links |
|---|---|---|---|---|---|---|---|
| 112 | page | Home | / | - | Space home. | 2026-01-01 | |

## Miro
| board | boardId | frameId | title | type | description | links |
|---|---|---|---|---|---|---|

## Diagram targets
| diagram | parentPageId | templatePageId | layout | note |
|---|---|---|---|---|
| use-case | | | page-per-diagram | |
| sequence | | | page-per-diagram | |
| data-flow | | | page-per-diagram | |

## Aliases
| phrase | resolves to |
|---|---|
```

Column rules:

- `type` (Confluence): `page`, `folder`, `template`, `map`. A page whose title ends in `Template` or `-000` is `template`, and is never edited in place.
- `type` (Miro): `use-case`, `sequence`, `data-flow-0`, `data-flow-1`, `other`, or `empty` for a board with no frames (frameId `-`).
- `description`: one sentence written from the resource (excerpt, title, frame content), not guessed.
- `links`: comma-separated pointers: `page 123`, `frame 345`, `PROJ-12`. Never status, summary, or assignee.
- `layout` (Diagram targets): `page-per-diagram` (each diagram gets its own child page) or `shared-page` (all diagrams of that type go on `parentPageId` under their own heading).

## Write one row back (write-through)

Do this once at the end of a task that created, renamed, moved, or published a page or frame. Batch every change from the task into one write.

1. Read the map page with `getConfluenceContent`, `draft=true`, `detail="full"`, `content_format="html"`. Keep `snapshotToken`.
2. Change only the rows you touched in the code block text. Keep the table order. Update `scanned` only on a resync, not here.
3. `updateConfluenceContent` with one edit, `{"name": "replaceNode", "localId": "<data-local-id of the <pre>>", "value": "<pre><code class=\"language-markdown\">...</code></pre>"}` (escape `&`, `<`, `>` inside the code), plus the `snapshotToken`, `minorEdit=true`, and a `versionMessage` such as `map: + frame [SEQ] Upload evidence`. The intro paragraph stays as it is. If edits are not supported, send the full body instead: the intro paragraph plus the one `<pre>` block.
4. Write the same text to the cache and set `mapVersion` to the new page version.
5. If the map write fails, say the user's change succeeded and the map is behind. Never undo the user's change because the map write failed.

If there is no map page yet, write only the cache and tell the user the row is local until the map is bootstrapped.
