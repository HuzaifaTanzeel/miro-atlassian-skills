# Resolving a target

Use this whenever a request names a page, folder, board, or frame and you have to turn it into an id.

## Ladder

1. **Map match.** One row matches the title, path, frame title, or an alias. Use it. No search.
2. **Several matches.** Rank by type (a `use-case` frame for "use case diagram"), path ("in Design" = rows under that folder), alias, recency (`updated`), and links. Keep the top 4.
3. **No match, or the id 404s.** One cheap lookup scoped to a parent, a title, or a label: CQL `space = "KEY" AND title ~ "words"`, or `parent = <id>`, or one `canvas_search` with `result_mode="matches"`. Do not read bodies.
4. **Still ambiguous.** Ask one question (format below). Then stop and wait.
5. **Explore** only if the user says "figure it out", the session cannot ask questions, the map is missing and they declined a bootstrap, or step 3 failed. Enumerate titles first (descendants, overview), read bodies last. Say what you found and add rows to the map.

Act without asking when one candidate is clearly best and the action is a read, or a reversible edit with an obvious default. Ask when a write, move, delete, or overwrite has more than one plausible target, or a required input has no safe default.

## Asking

```text
Which one should I use?

1. Sequence Diagrams - /Design/Diagrams/Sequence Diagrams - page 111
2. [SEQ] Upload evidence - Miro frame on board "Product design"
3. Other / none of these
```

- One question per turn. Batch the gaps (target page, heading, replace or append) into that one message.
- Never ask for something already in the map or earlier in the chat.
- Use the host's structured question tool if it has one; otherwise send the plain list.
- After the answer, add the user's words as an alias row so the question does not come back.
- After two questions that still do not resolve it, take the top candidate, say which assumption you made, and continue.

## Common cases

| Situation | Action |
|---|---|
| Id works, stored title differs | Use the id. Fix the row's title. Do not ask. |
| Id 404s | Title search inside the row's parent. One result: repair the row. Several: ask. None: explore. |
| Two boards with the same name | Ask, and show both board URLs. Never pick the first. |
| "Put it in Design" and Design is a folder | A folder is not a page. Use the folder's diagram target if the map has one; otherwise ask which page or offer to create one. |
| "The diagram" and several diagram rows exist | Ask among the diagram rows. |
| The row is a template | Never edit it. Offer to copy it to a new page. |
