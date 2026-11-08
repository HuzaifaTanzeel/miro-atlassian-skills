---
name: miro-sequence-diagram
description: Draw or update a UML sequence diagram on a Miro board as a Mermaid widget (lifelines, messages, activations, fragments). Use when the user asks to create, draw, or update a sequence diagram, interaction diagram, or "what calls what, in order" for one scenario on Miro. Not for use case or data flow diagrams, or publishing to Confluence.
license: MIT
compatibility: Needs Miro MCP (https://mcp.miro.com/) with canvas_* tools and Mermaid widgets; Atlassian MCP optional for the workspace map.
metadata:
  version: "0.2.1"
  suite: miro-atlassian-skills
---

# Sequence diagram on Miro

One scenario per frame as a Mermaid `sequenceDiagram` widget. Answer: **in what order do these participants exchange messages?**

## Call budget

Follow this file in order. Open a reference only at the step that names it, and only that file. Do not list this folder, do not read every reference first, and do not open another skill until its own workflow starts.

Call tools by the names in `references/tool-map.md`. Do not search the tool registry and do not `discover` a name that file already lists.

Map: `detail="summary"` first. `detail="full"` only when the cached `mapVersion` differs or there is no cache. One full read. Do not read a sibling page to copy its style.

## Workflow

### 1. Resolve the target

1. Page id, in order: config `map.confluencePageId`, a `Workspace map:` line in `AGENTS.md`, and, only when `spaceKey` is known, one CQL search `space = "<spaceKey>" AND title = "Workspace map" AND type = page`. Then the cheap read in the call budget. None of those: the map is missing. Offer one bootstrap (`workspace-map`); it lists sites, spaces, and boards, and the user does not write a config file. If they decline, continue. Open `references/map-contract.md` only for the write in step 6.
2. Board: request URL, else `miro.defaultBoard`, else map Miro rows. Ask once if several fit. Never create a board without an explicit yes.
3. Updating? Use the `sequence` row's frameId. Read `references/miro-board-conventions.md` §7 only. To change Mermaid only: diagram stub with `data-miro-id` and `<edit><old>…</old><new>…</new></edit>`.

### 2. Gather the scenario

From the request, attachments, or the one Confluence page the map names:

- Scenario name, trigger, preconditions, outcome.
- Participants left-to-right (initiating actor first; humans are `actor`, systems are `participant`). Open `references/notation.md` only when a fragment, activation, or budget is not already in the rules below.
- Happy-path messages with data; one or two alternatives and where they branch.

Keep use-case step order when the source is a use case. Ungrounded → `UNKNOWN/VERIFY`.

### 3. Confirm the model in chat

Show participants and the planned Mermaid (unescaped `text` block). Wait for yes unless already approved. If notation.md budgets break, propose a split here.

### 4. Load Miro guidance

Once per chat: `canvas_get_canvas_composer_skill` with `step="dsl"` only. Do not call `step="design"` and do not call `canvas_load_format_skill`. `notation.md` is the sequence contract; Bright Paper and the format skill's colors do not apply.

### 5. Place and build

1. Read `references/layout.md` for the frame size and the skeleton. Sequence frames are not 1600×1200; use that file's height formula or the legend overlaps the diagram. Position: one `canvas_search` `result_mode="overview"`, 320 px right of the right-most frame, same top.
2. Build one SVG from that skeleton. Inside the `foreignObject`, escape `->>` as `-&gt;&gt;` and `-->>` as `--&gt;&gt;`. Open `references/mermaid-patterns.md` only for a fragment that skeleton does not show.
3. `canvas_create_from_svg`. If the diagram grew, move legend/footer and enlarge the frame via `canvas_update_from_svg` from `result_svg`. Do not `canvas_read_as_svg` when create returned no failed items.
4. On render failure: fix Mermaid and resend only the diagram. After two failures, report the error and line; do not redraw with shapes.

### 6. Check and record

1. Check the Mermaid you sent against the rules below and `result_svg`. Open the Checklist in `references/notation.md` only if a rule there is not already in this file.
2. One map write at the end of the task (`map-contract.md`, "Write one row back"): type `sequence`, one-sentence description, links if known. If this same task also publishes the frame, skip the write here and let that step write the frame and the page together.
3. Report frame title/link, counts, `UNKNOWN/VERIFY`, offer to publish (Mermaid in an expand block if wanted).

## Rules that are easy to break

- One scenario per diagram; alternatives go in `alt`/`break` or a second diagram.
- Escape `>` as `&gt;` inside the SVG body; a raw `&` or `>` fails the request.
- Mermaid 10 only: no `box`, no `create`, no bidirectional arrows.
- Do not use `-` deactivation on replies inside two `alt` branches; use `activate`/`deactivate` around the fragment.
- Do not create a board, Confluence page, or whiteboard from this skill.
- Frame height comes from `layout.md`. A 1200-tall sequence frame overlaps the legend once the diagram widget is in place.
