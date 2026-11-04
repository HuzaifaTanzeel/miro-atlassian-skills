# Page layout

Bodies are Confluence storage-style HTML as accepted by `updateConfluenceContent` and `createConfluenceContent` with HTML content. If the space's content format guide says otherwise, follow the guide.

## Diagram section

One section per diagram. The `<h2>` text is the frame title without its prefix; it is how a later refresh finds the section.

```html
<h2>Evidence a control</h2>
<figure data-type="media-single" data-layout="center" data-width="80" data-width-type="percentage">
  <div data-type="media" data-media-type="file" data-id="MEDIA_FILE_ID" data-collection="contentId-PAGE_ID" data-alt="evidence-a-control.png"></div>
  <figcaption>Use case diagram: Evidence a control</figcaption>
</figure>
<p><em>Source: Miro frame [UC] Evidence a control. Last updated <time datetime="2026-01-01">2026-01-01</time>.</em></p>
<h3>Purpose</h3>
<p>...</p>
<h3>Scope</h3>
<p>...</p>
<h3>Elements</h3>
<table>
  <tr><th>Element</th><th>Kind</th><th>Description</th></tr>
  <tr><td>Control owner</td><td>Actor</td><td>...</td></tr>
</table>
<h3>Key flows</h3>
<ol><li>...</li></ol>
<h3>Assumptions and open questions</h3>
<ul><li>...</li></ul>
```

- `MEDIA_FILE_ID` is the attachment `fileId` (publish step 4). `PAGE_ID` is the page that owns the attachment.
- `data-width="80"` for frames up to 1600px wide, `100` for frames 2400px wide or wider, so text in the image stays readable.
- Put the date inside `<time>` as visible text too; an empty `<time>` shows nothing.
- The heading names in `<h3>` follow `description-template.md`. Leave out a heading that would be empty, except "Assumptions and open questions": write "None recorded." there.
- No Miro link, embed, or iframe.

### Sequence diagrams: show the source

After "Key flows", add the Mermaid text from `<slug>.mmd` in a collapsed block, so reviewers can diff or reuse it:

```html
<details>
  <summary>Mermaid source</summary>
  <pre><code class="language-mermaid">sequenceDiagram
    ...</code></pre>
</details>
```

Escape `&`, `<`, and `>` inside the code block.

## Built-in page (no template)

Used for a new page when the Diagram targets row has no `templatePageId`.

```html
<p>This page holds the TYPE diagram for SCOPE. The image is exported from Miro; edit the frame there and publish again to update it.</p>
<!-- diagram section from above -->
<h2>Change history</h2>
<table>
  <tr><th>Date</th><th>Change</th></tr>
  <tr><td><time datetime="2026-01-01">2026-01-01</time></td><td>First version.</td></tr>
</table>
```

On a refresh, add one row to "Change history" with a one-line summary of what changed (from what the user said, or "Diagram updated").

## Template page

When the page was copied from a team template, keep its headings and fill them. Put the figure under the template's diagram heading, or at the top of the body if the template has none, and map the description sections onto the template's headings.
