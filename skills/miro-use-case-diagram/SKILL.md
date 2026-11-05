---
name: miro-use-case-diagram
description: Draw or update a UML use case diagram on a Miro board (actors, system boundary, use cases, «include»/«extend»). Use when the user asks to create, draw, sketch, or update a use case diagram, actor diagram, or "who does what with the system" view on Miro. Not for sequence or data flow diagrams, or publishing to Confluence.
license: MIT
compatibility: Needs Miro MCP (https://mcp.miro.com/) with canvas_* tools; Atlassian MCP optional for the workspace map.
metadata:
  version: "0.1.0"
  suite: miro-atlassian-skills
---

# Use case diagram on Miro

Draw one use case diagram per Miro frame, using UML notation adapted to Miro's shapes. The diagram answers one question: **who uses this system, for which goals?**

Read these files before drafting. Each is short.

- `references/notation.md`: what each element means, how to name it, which color it gets, and the rules that keep the diagram honest.
- `references/layout.md`: exact coordinates, the stick-figure actor block, and connector settings.
- `references/miro-board-conventions.md`: board choice, frame regions, palette, connector rules, build-then-fix loop. Shared by all diagram skills.
- `references/map-contract.md`: where the workspace map is and how to write a row back.
- `references/example.svg`: a complete, valid frame to copy the structure from.
- `references/checklist.md`: run before reporting done.

## Workflow

### 1. Resolve the target (no exploration)

1. Find and read the workspace map as described in `map-contract.md`. Use the cache when its version matches.
2. Board: the URL in the request, else `miro.defaultBoard` from the config, else the map's Miro rows. If the map lists several boards and the request does not say which, ask one question with the candidates. Never create a board without an explicit yes.
3. Updating an existing diagram? Match the request to a `use-case` row in the map and use its frameId. Follow section 7 of `miro-board-conventions.md`.

### 2. Gather the model

Collect from the user's message, the files they attached, or the Confluence pages the map points at (read only the page the map names, with `detail="full"` only if you need its body):

- The subject (system or subsystem name) and the question the diagram answers.
- Actors, each marked primary (has the goal) or supporting (provides a service), human or system.
- Use cases, each with its primary actor and any supporting actors.
- «include» and «extend» relationships, with the extend condition if known.
- Use case ids, if the map has a use case list page.

Apply the rules in `notation.md`. Replace "Manage X" with the real goals, turn steps into one goal, drop actors with no use case. Anything you cannot ground goes on a list of `UNKNOWN/VERIFY` items. Do not invent actors or goals.

### 3. Confirm the model in chat

Show a compact model and wait for a yes, unless the user already gave the full model and said to go ahead:

```text
[UC] Expense claims  (subject: Expense Service)
Actors: Employee (primary, human), Approver (primary, human), Identity Provider (supporting, system)
Use cases:
  Submit expense claim  <- Employee   «include» Attach receipt, «include» Sign in
  Track claim status    <- Employee
  Approve claim         <- Approver   «include» Sign in
  Request more information «extend» Approve claim (receipt unclear)
  Sign in               <- Identity Provider
UNKNOWN/VERIFY: none
Layout: two columns (Sign in is shared)
```

If the model breaks the budget in `notation.md` rule 8, propose the split here.

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` (`design`, then `dsl`), then `canvas_load_format_skill` with `format_name="diagramming"` and `notation="free_form"`. Use case diagrams have no Mermaid notation, so they are hand-assembled from shapes and connectors.

### 5. Place and build

1. Pick the frame position (section 2 of `miro-board-conventions.md`).
2. Compute every coordinate from `layout.md`. Write the numbers out.
3. Build one SVG, in this order: frame, header, subtitle, boundary, use cases, actor groups, system actors, legend, footer, then all connectors. Follow `example.svg`.
4. Escape `&`, `<`, `>` in every attribute and text. The `<br>` inside a `«system»` label is written `&lt;br&gt;`.
5. Send it with `canvas_create_from_svg` and the board URL.
6. If dimensions changed, fix overlaps with `canvas_update_from_svg` from the returned `result_svg`.

### 6. Check and record

1. Run `checklist.md` against the `result_svg`. Fix failures.
2. Write the map row (section "Write one row back" in `map-contract.md`): type `use-case`, description in one sentence ("Use case diagram of who submits, approves, and tracks expense claims in Expense Service."), links to the use case page if known.
3. Report the frame title and link, counts (actors, use cases), the `UNKNOWN/VERIFY` list, and offer to publish it to Confluence.

## Rules that are easy to break

- No arrows between use cases except «include», «extend», and generalization.
- «include» points to the included use case. «extend» points to the base it extends.
- Actor names are roles. Use case names are goals.
- One subject per frame. Split rather than shrink text.
- Do not create a board, a Confluence page, or a Confluence whiteboard from this skill.
