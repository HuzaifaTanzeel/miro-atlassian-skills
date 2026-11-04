# Writing the map page

The map page is a normal Confluence page so every teammate can read it. Its body is one intro paragraph and one markdown code block. A code block round-trips exactly, so agents can rewrite rows without parsing Confluence tables.

## Page body (HTML)

```html
<p>Maintained by agents using miro-atlassian-skills. It indexes Confluence pages and Miro frames so agents can open them by id. Edit rows inside the code block only; keep one row per page or frame.</p>
<pre><code class="language-markdown">MAP TEXT HERE, with &amp; &lt; &gt; escaped</code></pre>
```

## Update procedure

1. `getConfluenceContent` on `mapPageId` with `draft=true`, `detail="full"`, `content_format="html"`. Keep `snapshotToken` and the page version.
2. Take the code block text, unescape it, apply your row changes, escape it again.
3. `updateConfluenceContent` with `body={format: "html", value: <intro paragraph + code block>}`, `snapshotToken`, `minorEdit=true`, `versionMessage="map: <what changed>"`.
4. On `snapshot_stale`: re-read (step 1), re-apply only your rows to the latest text, retry once.
5. Write the new text to the cache and set `mapVersion` in its header to the new page version (`mapVersion` in the Confluence copy may lag by one; the cache value is what matters).

## Row edits

| Change | Edit |
|---|---|
| New page or frame | Append a row at the end of its table. Do not re-sort. |
| Renamed | Change `title`; change `path` on that row and every row whose path starts with the old path. |
| Moved | Change `parentId` and `path` (and children's paths). |
| Deleted (404 confirmed by a title search in the parent) | Remove the row and any alias pointing at it. |
| Published diagram | On the frame row add `page <id>` to `links`; on the page row add `frame <id>`. |
| User answered a "which one?" question | Add an alias row: their words, then the chosen id. |

Keep descriptions to one sentence. Never add issue summaries, statuses, or page bodies.
