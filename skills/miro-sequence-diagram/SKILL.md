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

One scenario per frame as a Mermaid `sequenceDiagram` widget. Answer: **in what order do these participants exchange messages?**

## Workflow

### 1. Resolve the target

1. Read `references/map-contract.md`. Find and read the workspace map.
2. Board: request URL, else `miro.defaultBoard`, else map Miro rows. Ask once if several fit. Never create a board without an explicit yes.
3. Updating? Use the `sequence` row's frameId. Read `references/miro-board-conventions.md` §7. To change Mermaid only: diagram stub with `data-miro-id` and `<edit><old>…</old><new>…</new></edit>`.

### 2. Gather the scenario

From the request, attachments, or the one Confluence page the map names:

- Scenario name, trigger, preconditions, outcome.
- Participants left-to-right (read `references/notation.md`).
- Happy-path messages with data; one or two alternatives and where they branch.

Keep use-case step order when the source is a use case. Ungrounded → `UNKNOWN/VERIFY`.

### 3. Confirm the model in chat

Show participants and the planned Mermaid (unescaped `text` block). Wait for yes unless already approved. If notation.md budgets break, propose a split here.

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` (`design`, then `dsl`), then `canvas_load_format_skill` with `format_name="diagramming"` and `notation="uml_sequence"`.

### 5. Place and build

1. Read `references/layout.md` (frame size) and `references/miro-board-conventions.md` §2 (position).
2. Read `references/mermaid-patterns.md`. Build one SVG: frame, header, subtitle, scenario line, diagram `foreignObject`, legend, footer. Escape Mermaid as shown there.
3. `canvas_create_from_svg`. If the diagram grew, move legend/footer and enlarge the frame via `canvas_update_from_svg` from `result_svg`.
4. On render failure: fix Mermaid and resend only the diagram. After two failures, report the error and line; do not redraw with shapes.

### 6. Check and record

1. Run the Checklist section of `references/notation.md`; fix failures.
2. Write map row (`map-contract.md`): type `sequence`, one-sentence description, links if known.
3. Report frame title/link, counts, `UNKNOWN/VERIFY`, offer to publish (Mermaid in an expand block if wanted).

## Rules that are easy to break

- One scenario per diagram; alternatives go in `alt`/`break` or a second diagram.
- Escape `>` as `&gt;` inside the SVG body; a raw `&` or `>` fails the request.
- Mermaid 10 only: no `box`, no `create`, no bidirectional arrows.
- Do not use `-` deactivation on replies inside two `alt` branches; use `activate`/`deactivate` around the fragment.
- Do not create a board, Confluence page, or whiteboard from this skill.
