# Workspace map contract (shared by every skill)

This file is copied into each skill by `scripts/sync-shared.mjs`. Edit the copy in `shared/`, never the copies under `skills/`.

The workspace map is one small index of Confluence pages and Miro frames (ids, titles, one-sentence descriptions) so an agent opens things by id instead of searching. The `workspace-map` skill owns bootstrap, resync, and repair; its `assets/map-template.md` and `assets/config.example.yaml` hold the full template and config.

- **Map (source of truth):** one Confluence page titled `Workspace map`, body is a single markdown code block.
- **Local cache:** `map.cachePath` in the config, default `.miro-atlassian/workspace-map.md` (gitignored).
- **Config:** `miro-atlassian.config.yaml` in the project root. Keys: `atlassian.site`, `atlassian.cloudId`, `atlassian.spaceKey`, `map.confluencePageId`, `map.cachePath`, `map.staleAfterDays`, `miro.defaultBoard` (full board URL). Blank means not set.

## Find the map (stop at the first hit)

1. Config `map.confluencePageId`.
2. A line in the project's `AGENTS.md` starting `Workspace map:` that names a Confluence page id.
3. One CQL search: `space = "<spaceKey>" AND title = "Workspace map" AND type = page`.
4. None: say the map is missing, offer one bootstrap scan (the `workspace-map` skill), and continue with a scoped search if they decline. Never block the task on the map.

## Read it cheaply

1. Cache exists with `mapVersion`: `getConfluenceContent` on the map page, `detail="summary"`, compare the version.
2. Same version: use the cache. Do not read the body.
3. Different version or no cache: read with `detail="full"`, `content_format="markdown"`, take the code block text, write it to the cache, set `mapVersion` in the cache header.
4. Cache header `scanned` older than `staleAfterDays`: say so in one line and offer a delta resync. Do not run it unasked.

`cloudId` comes from the config or map header. Call `getAccessibleAtlassianResources` only when both are blank, then write it to the config.

## Use it

- Match the request against titles, paths, frame titles, and the Aliases table. One clear match: use that id, no search.
- Several matches and the next step is a write: ask one question with 2 to 4 numbered candidates (title, path, id) plus "other".
- An id that returns 404: one title search inside the row's parent, then ask or repair. Never silently pick a different page.
- Jira keys in `links` are pointers only. Do not call Jira unless the user asks about a ticket.

## Map format

Tables in the code block (full template: `workspace-map` skill, `assets/map-template.md`):

- **Confluence:** `id, type, title, path, parentId, description, updated, links`. `type`: `page`, `folder`, `template`, `map`. A title ending in `Template` or `-000` is `template` and is never edited in place.
- **Miro:** `board, boardId, frameId, title, type, description, links`. `type`: `use-case`, `sequence`, `data-flow-0`, `data-flow-1`, `other`, `empty` (board with no frames, frameId `-`).
- **Diagram targets:** `diagram, parentPageId, templatePageId, layout, note`. `layout`: `page-per-diagram` (child page each) or `shared-page` (all of that type on `parentPageId`, one heading each).
- **Aliases:** `phrase, resolves to`.
- `description`: one sentence from the resource, not guessed. `links`: pointers only (`page 123`, `frame 345`, `PROJ-12`), never status, summary, or assignee.
- Header lines: `site`, `cloudId`, `space`, `spaceInstructions` (`unknown`, `none`, `present`, `read`), `mapPageId`, `mapVersion`, `scanned`.

## Write one row back (write-through)

Once, at the end of a task that created, renamed, moved, or published a page or frame. Batch every change into one write.

1. `getConfluenceContent` on the map page with `draft=true`, `detail="full"`, `content_format="html"`. Keep `snapshotToken`.
2. Change only the rows you touched, keep table order. Update `scanned` only on a resync.
3. `updateConfluenceContent` with one edit `{"name": "replaceNode", "localId": "<data-local-id of the <pre>>", "value": "<pre><code class=\"language-markdown\">...</code></pre>"}` (escape `&`, `<`, `>` in the code), plus `snapshotToken`, `minorEdit=true`, and a `versionMessage` such as `map: + frame [SEQ] Upload evidence`. If edits are not supported, send the full body: the intro paragraph plus the one `<pre>` block.
4. Write the same text to the cache and set `mapVersion` to the new page version.
5. If the map write fails, say the user's change succeeded and the map is behind. Never undo the user's change.

No map page yet: write only the cache and tell the user the row is local until the map is bootstrapped.
