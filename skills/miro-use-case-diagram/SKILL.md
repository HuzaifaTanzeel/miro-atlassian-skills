---
name: miro-use-case-diagram
description: Draw or update a UML use case diagram on a Miro board (actors, system boundary, use cases, «include»/«extend»). Use when the user asks to create, draw, sketch, or update a use case diagram, actor diagram, or "who does what with the system" view on Miro. Not for sequence or data flow diagrams, or publishing to Confluence.
license: MIT
compatibility: Needs Miro MCP (https://mcp.miro.com/) with canvas_* tools; Atlassian MCP optional for the workspace map.
metadata:
  version: "0.2.0"
  suite: miro-atlassian-skills
---

# Use case diagram on Miro

One frame per diagram. Answer: **who uses this system, for which goals?**

## Call budget

Follow this file in order. Open a reference only at the step that names it. Do not list this folder or read every reference first, and do not open another skill until its own workflow starts. Call tools by the names in `references/tool-map.md`; do not search the registry for them. Map reads start at `detail="summary"`.

## Workflow

### 1. Resolve the target

1. Read `references/map-contract.md`. Find and read the workspace map (use the cache when its version matches).
2. Board: request URL, else `miro.defaultBoard`, else map Miro rows. Ask once if several boards fit. Never create a board without an explicit yes.
3. Updating? Match a `use-case` map row and use its frameId. Read `references/miro-board-conventions.md` §7.

### 2. Gather the model

From the request, attachments, or the one Confluence page the map names (`detail="full"` only if you need the body):

- Subject (system name) and the question the diagram answers.
- Actors: primary/supporting, human/system.
- Use cases with primary actor and any supporting actors.
- «include» / «extend» (with extend condition if known); use case ids if the map has a list page.

Read `references/notation.md`. Replace "Manage X" with real goals, turn steps into one goal, drop actors with no use case. Ungrounded items → `UNKNOWN/VERIFY`. Do not invent actors or goals.

### 3. Confirm the model in chat

Show a compact model; wait for yes unless the user already approved:

```text
[UC] Expense claims  (subject: Expense Service)
Actors: Employee (primary, human), Approver (primary, human), Identity Provider (supporting, system)
Use cases:
  Submit expense claim  <- Employee   «include» Attach receipt, «include» Sign in
  Approve claim         <- Approver   «include» Sign in
UNKNOWN/VERIFY: none
```

If notation.md rule 8 budget breaks, propose the split here.

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` with `step="dsl"` only. Do not call `step="design"` or `canvas_load_format_skill`. Hand-assemble shapes and connectors (no Mermaid for use cases). Do not `canvas_read_as_svg` after a create that listed no failed items.

### 5. Place and build

1. Read `references/layout.md` and `references/miro-board-conventions.md` (§2 for position).
2. Compute every coordinate; write the numbers out.
3. One SVG, order: frame, header, subtitle, boundary, use cases, actor groups, system actors, legend, footer, connectors. Follow `references/example.svg`.
4. Escape `&`, `<`, `>` in attributes and text. Inside a `«system»` label, `<br>` is `&lt;br&gt;`.
5. `canvas_create_from_svg` with the board URL. Fix overlaps via `canvas_update_from_svg` from `result_svg` if needed.

### 6. Check and record

1. Run the Checklist section of `references/notation.md` against `result_svg`; fix failures.
2. Write the map row (`map-contract.md` "Write one row back"): type `use-case`, one-sentence description, links if known.
3. Report frame title/link, counts, `UNKNOWN/VERIFY`, offer to publish to Confluence.

## Rules that are easy to break

- No arrows between use cases except «include», «extend», and generalization.
- «include» points to the included use case; «extend» points to the base it extends.
- Actor names are roles; use case names are goals.
- One subject per frame; split rather than shrink text.
- Do not create a board, Confluence page, or whiteboard from this skill.
