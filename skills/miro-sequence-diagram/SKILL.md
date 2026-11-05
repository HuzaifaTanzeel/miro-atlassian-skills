---
name: miro-sequence-diagram
description: Draw or update a UML sequence diagram on a Miro board as a Mermaid widget (lifelines, messages, activations, fragments). Use when the user asks to create, draw, or update a sequence diagram, interaction diagram, or "what calls what, in order" for one scenario on Miro. Not for use case or data flow diagrams, or publishing to Confluence.
license: MIT
compatibility: Needs Miro MCP (https://mcp.miro.com/) with canvas_* tools and Mermaid widgets; Atlassian MCP optional for the workspace map.
metadata:
  version: "0.1.0"
  suite: miro-atlassian-skills
---

# Sequence diagram on Miro

Draw one scenario per Miro frame as a Mermaid `sequenceDiagram` widget. The diagram answers one question: **in what order do these participants exchange messages to reach this outcome?**

Read these files before drafting:

- `references/notation.md`: participants, arrows, activations, fragments, Mermaid limits on Miro, budgets.
- `references/mermaid-patterns.md`: escaping inside the SVG and five tested patterns.
- `references/layout.md`: frame size formula, regions, full frame skeleton.
- `references/miro-board-conventions.md`: board choice, palette, build-then-fix loop. Shared by all diagram skills.
- `references/map-contract.md`: where the workspace map is and how to write a row back.
- `references/checklist.md`: run before reporting done.

## Workflow

### 1. Resolve the target (no exploration)

1. Find and read the workspace map as described in `map-contract.md`.
2. Board: the URL in the request, else `miro.defaultBoard` from the config, else the map's Miro rows. Ask one question if several boards fit. Never create a board without an explicit yes.
3. Updating? Match the request to a `sequence` row and use its frameId (section 7 of `miro-board-conventions.md`). To change the Mermaid, send the diagram stub with its `data-miro-id` and `<edit><old>...</old><new>...</new></edit>` children rather than resending the whole body.

### 2. Gather the scenario

From the request, attachments, or the one Confluence page the map points at (for example a use case page or an API contract page):

- Scenario name, trigger, preconditions, outcome.
- Participants in left-to-right order (`notation.md`).
- The happy-path messages with their data.
- The one or two alternative paths worth showing, and where they branch.

If the source is a use case with numbered steps, keep its step order. Mark anything not grounded in the source as `UNKNOWN/VERIFY`.

### 3. Confirm the model in chat

Show the participant list and the Mermaid you plan to send (unescaped, as a `text` block), and wait for a yes unless the user already approved the content. A diagram widget is hard to remove once created, so get it right before creating it.

If the scenario exceeds the budgets in `notation.md`, propose the split here ("Overview" plus "Detail", or one diagram per alternative).

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` (`design`, then `dsl`), then `canvas_load_format_skill` with `format_name="diagramming"` and `notation="uml_sequence"`.

### 5. Place and build

1. Compute the frame size from `layout.md`, and its position from section 2 of `miro-board-conventions.md`.
2. Build one SVG with the frame, header, subtitle, scenario line, the diagram `foreignObject`, legend, and footer. Escape the Mermaid as shown in `mermaid-patterns.md`.
3. Send it with `canvas_create_from_svg`.
4. If the diagram grew past the estimate, move the legend and footer below it, and enlarge the frame, with `canvas_update_from_svg` from the `result_svg`.
5. If the widget failed to render, read the error, fix the Mermaid, and resend only the diagram. Report the error and the offending line if it fails twice. Do not redraw it with shapes.

### 6. Check and record

1. Run `checklist.md`.
2. Write the map row (`map-contract.md`): type `sequence`, one-sentence description ("Sequence of an employee submitting a claim through the web app, API, and claims store, with the over-limit branch."), links to the use case or API page if known.
3. Report the frame title and link, participant and step counts, `UNKNOWN/VERIFY` items, and offer to publish it to Confluence (with the Mermaid source in an expand block if they want it).

## Rules that are easy to break

- One scenario per diagram. Alternatives go in `alt` or `break`, or in a second diagram.
- Escape `>` as `&gt;` inside the SVG body. A raw `&` or `>` fails the whole request.
- Only Mermaid 10 syntax. No `box`, no `create`, no bidirectional arrows.
- Do not use `-` deactivation on replies inside two `alt` branches; use `activate`/`deactivate` around the fragment.
- Do not create a board, a Confluence page, or a whiteboard from this skill.
