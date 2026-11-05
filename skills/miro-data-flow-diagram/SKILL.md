---
name: miro-data-flow-diagram
description: Draw or update a data flow diagram on a Miro board (Gane-Sarson symbols, context/level 1, trust boundaries, personal-data markers). Use when the user asks to create, draw, or update a DFD, context diagram, level 0/1 diagram, or trust-boundary / data-residency view on Miro. Not for use case or sequence diagrams, or publishing to Confluence.
license: MIT
compatibility: Needs Miro MCP (https://mcp.miro.com/) with canvas_* tools; Atlassian MCP optional for the workspace map.
metadata:
  version: "0.1.0"
  suite: miro-atlassian-skills
---

# Data flow diagram on Miro

Draw one DFD level per Miro frame. The diagram answers one question: **where does this data come from, what changes it, where is it kept, and where does it go?** Trust boundaries show where the data crosses from one zone of control to another.

Read these files before drafting:

- `references/notation.md`: elements, naming, two-way flows, data markers, levels, and the ten validation rules.
- `references/levels-and-boundaries.md`: element categories, context and level-1 coordinates, drawing order, shape snippets, legend text.
- `references/miro-board-conventions.md`: board choice, frame regions, palette, build-then-fix loop. Shared by all diagram skills.
- `references/map-contract.md`: where the workspace map is and how to write a row back.
- `references/example.svg`: a complete context diagram frame.
- `references/checklist.md`: model checks before building, style checks after.

## Workflow

### 1. Resolve the target (no exploration)

1. Find and read the workspace map as described in `map-contract.md`.
2. Board: the URL in the request, else `miro.defaultBoard`, else the map's Miro rows. Ask one question if several boards fit. Never create a board without an explicit yes.
3. Level: if the user asks for "a DFD" with no level and the map has no `data-flow-0` row for this system, draw the context diagram first and offer level 1 next. If a context frame exists, read it (`canvas_read_as_svg` with its frameId) so level 1 balances with it.
4. Updating? Use the frameId from the map row (section 7 of `miro-board-conventions.md`).

### 2. Gather the model

From the request, attachments, or the Confluence pages the map points at (architecture overview, domain rules, use case pages; read only what the map names):

- The system and its scope.
- External entities, with what each sends and receives.
- For level 1: the main processes in data order, and the data stores each reads or writes.
- Where the system is hosted and which parties sit outside that zone (cloud region, country, tenant, third party). These become trust boundaries.
- Which flows carry personal or sensitive personal data, if the source says so.

Run the model checks in `checklist.md` and fix violations before showing the model. Anything not grounded in the source is `UNKNOWN/VERIFY`.

### 3. Confirm the model in chat

```text
[DFD-0] Expense Service context
Process: 0 Expense Service   (inside: Trust boundary "Platform, in-country region")
Entities: Employee (left), Approver (left), Identity Provider (right), Payroll System (right, Trust boundary "Third party")
Flows:
  Employee <-> 0 : Claim, receipt [PD] / Claim status
  Approver <-> 0 : Approval decision / Claims to review
  Identity Provider -> 0 : Sign-in assertion
  0 -> Payroll System : Approved payment [PD]   (crosses boundary)
UNKNOWN/VERIFY: is Payroll System hosted in-country?
```

Wait for a yes unless the user already supplied the full model and said to go ahead. If the budget in `notation.md` rule 9 is exceeded, propose a split.

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` (`design`, then `dsl`), then `canvas_load_format_skill` with `format_name="diagramming"` and `notation="free_form"`. DFDs have no Mermaid notation, so they are hand-assembled.

### 5. Place and build

1. Frame size: 1600 x 1200 for context, 2400 x 1600 for level 1. Position per section 2 of `miro-board-conventions.md`; put a level-1 frame directly right of its context frame.
2. Compute coordinates from `levels-and-boundaries.md`. Write the numbers out.
3. Build one SVG in the drawing order given there (boundaries first, connectors last). Follow `example.svg`.
4. Send it with `canvas_create_from_svg`. Fix any reported size changes with `canvas_update_from_svg` from the `result_svg`.

### 6. Check and record

1. Run the style checks in `checklist.md`.
2. Write the map row (`map-contract.md`): type `data-flow-0` or `data-flow-1`, description in one sentence, links (`frame <context frameId>` on a level-1 row).
3. Report the frame title and link, counts, the flows that cross a trust boundary (these are the review points), the `UNKNOWN/VERIFY` list, and offer to publish it to Confluence.

## Rules that are easy to break

- Data reaches a store only through a process. Entities never talk to each other on the diagram.
- Flows are named with nouns (the data), processes with verbs.
- The context diagram has one process and no stores.
- A boundary never cuts through a shape.
- Markers like `[PD]` support a review; do not present them as a legal conclusion.
- Do not create a board, a Confluence page, or a whiteboard from this skill.
