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

One DFD level per frame. Answer: **where does data come from, what changes it, where is it kept, where does it go?** Trust boundaries mark control-zone crossings.

## Workflow

### 1. Resolve the target

1. Read `references/map-contract.md`. Find and read the workspace map.
2. Board: request URL, else `miro.defaultBoard`, else map Miro rows. Ask once if several fit. Never create a board without an explicit yes.
3. Level: if the user says "a DFD" with no level and no `data-flow-0` row, draw context first and offer level 1. If a context frame exists, read it (`canvas_read_as_svg`) so level 1 balances.
4. Updating? Use the map frameId; read `references/miro-board-conventions.md` §7.

### 2. Gather the model

From the request, attachments, or Confluence pages the map names:

- System and scope; external entities and what each sends/receives.
- Level 1: main processes in data order; data stores each reads/writes.
- Hosting / parties outside that zone → trust boundaries.
- Flows carrying personal or sensitive data, if the source says so.

Read `references/notation.md` and `references/checklist.md` (model checks). Fix violations before showing the model. Ungrounded → `UNKNOWN/VERIFY`.

### 3. Confirm the model in chat

```text
[DFD-0] Expense Service context
Process: 0 Expense Service   (inside: Trust boundary "Platform, in-country region")
Entities: Employee (left), Approver (left), Identity Provider (right), Payroll System (right)
Flows:
  Employee <-> 0 : Claim, receipt [PD] / Claim status
  0 -> Payroll System : Approved payment [PD]   (crosses boundary)
UNKNOWN/VERIFY: is Payroll System hosted in-country?
```

Wait for yes unless already approved. If notation.md rule 9 budget breaks, propose a split.

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` (`design`, then `dsl`), then `canvas_load_format_skill` with `format_name="diagramming"` and `notation="free_form"`. Hand-assemble (no Mermaid for DFDs).

### 5. Place and build

1. Frame size: 1600×1200 context, 2400×1600 level 1. Position per `miro-board-conventions.md` §2; put level 1 directly right of its context frame.
2. Read `references/levels-and-boundaries.md`. Compute coordinates; write numbers out.
3. One SVG in that file's drawing order (boundaries first, connectors last). Follow `references/example.svg`.
4. `canvas_create_from_svg`. Fix size changes with `canvas_update_from_svg` from `result_svg`.

### 6. Check and record

1. Run style checks in `references/checklist.md`.
2. Write map row (`map-contract.md`): type `data-flow-0` or `data-flow-1`, one-sentence description, links (`frame <contextId>` on level-1).
3. Report frame title/link, counts, flows that cross a trust boundary, `UNKNOWN/VERIFY`, offer to publish.

## Rules that are easy to break

- Data reaches a store only through a process; entities never talk to each other on the diagram.
- Flows are nouns (the data); processes are verbs.
- Context diagram: one process, no stores.
- A boundary never cuts through a shape.
- Markers like `[PD]` support a review; do not present them as a legal conclusion.
- Do not create a board, Confluence page, or whiteboard from this skill.
