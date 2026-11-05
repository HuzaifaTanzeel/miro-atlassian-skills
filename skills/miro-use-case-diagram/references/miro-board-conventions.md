# Miro board conventions (shared by every diagram skill)

This file is copied into each diagram skill by `scripts/sync-shared.mjs`. Edit the copy in `shared/`, never the copies under `skills/`.

These rules sit on top of Miro's own canvas guidance. Where this file and the live Miro guidance disagree on **notation** (for example dashed lines for «include»), this file wins, because UML and DFD notation require it. Where they disagree on **SVG mechanics** (attribute names, escaping, sizes), the live Miro guidance wins, because the server enforces it.

## 1. Load Miro's guidance once per chat

Before the first `canvas_create_from_svg` or `canvas_update_from_svg` in a chat:

1. `canvas_get_canvas_composer_skill` with `step="design"`, then with `step="dsl"`. Skip `design` reflection questions that do not apply to a technical diagram; you are making a **synthesis** artifact, not a workshop.
2. `canvas_load_format_skill` with `format_name="diagramming"` and the notation your skill names (`free_form` for use case and data flow diagrams, `uml_sequence` for sequence diagrams).

Load each once and reuse it for every diagram of that type in the chat. Do not re-load after every edit.

Set `invocation_source="skill"` on every Miro tool call that accepts it.

## 2. Board and frame

- **Board.** Use the board from the request, else `miro.defaultBoard` in `miro-atlassian.config.yaml`, else the map's Miro rows. Never create a board unless the user says yes in this chat. On a Miro free plan only the three most recently created boards stay editable, so a new board can lock an old one.
- **One diagram per frame.** A frame answers one question at one zoom level. Do not put two diagrams in one frame, and do not wrap frames in a super-frame.
- **Frame title prefix** carries the diagram type, because the canvas tools do not return Miro tags:

  | Type | Prefix | Example |
  |---|---|---|
  | Use case | `[UC]` | `[UC] Evidence a control` |
  | Sequence | `[SEQ]` | `[SEQ] Upload evidence` |
  | Data flow, context level | `[DFD-0]` | `[DFD-0] Platform context` |
  | Data flow, level 1 or below | `[DFD-1]`, `[DFD-2]` | `[DFD-1] Assessment process` |

- **Frame size.** Use one of two sizes per board: 1600 x 1200 (standard) or 2400 x 1600 (large). Pick large only when the element budget in your skill is near its limit. Frame fill `#ffffff`.
- **Placement.** On a non-empty board, call `canvas_search` with `result_mode="overview"` once, find the right-most frame, and place the new frame 320 px to its right with the same top edge. On an empty board use `translate(0,0)`. Do not rely on auto-placement.
- **Inside the frame**, coordinates are frame-relative. Padding is 64 on every side.

## 3. Fixed regions inside every frame

| Region | Position (frame-relative) | Content |
|---|---|---|
| Header | x=64, y=56 (textArea, width = frame width - 128) | 33 px bold `#1a1a1a`: the diagram title without the prefix. Use a `textArea`, not `<text>`: Miro sizes a `<text>` widget to a narrow box that can wrap and run into the subtitle. |
| Subtitle | x=64, y=124 (textArea, width = frame width - 128) | One line, 18 px `#595959`: scope and question answered, e.g. "Scope: GRC Catalog. Shows who evidences one control." |
| Canvas | y=180 to frame height - 200 | The diagram |
| Legend | bottom-left, x=64, y=frame height - 168 | A textArea, 16 px `#595959`, listing only the symbols used in this frame |
| Footer | bottom-right, textArea right-aligned, x=frame width - 564, y=frame height - 96, width 500 | `Status: Draft \| v1 \| YYYY-MM-DD` and, if known, the use-case or page id this traces to (plain text, no URL) |

Keep header and footer text short. No emojis, no decorative Unicode, no em dashes in board copy. The guillemets « » in «include» and «extend» are notation, not decoration.

## 4. Typography and color

- One font: Noto Sans (`noto_sans`). Node labels 18 px bold. Connector labels use the default connector font. Body text 16 to 18 px regular. At most three sizes per frame.
- Colors come from Miro's Fluoro diagram palette as **triplets**. A filled shape always sets `fill`, `stroke`, and `data-text-color` from the same row:

  | Name | fill | stroke | text |
  |---|---|---|---|
  | Gray | `#DDDDD8` | `#8A8A7E` | `#434339` |
  | Blue | `#9CE6FF` | `#2C97BB` | `#1C4657` |
  | Yellow | `#FFE86D` | `#A28E26` | `#574900` |
  | Orange | `#FFB575` | `#CC7830` | `#542700` |
  | Purple | `#B8ACFB` | `#8A7BE0` | `#231266` |
  | Green | `#B3E65F` | `#6E9A24` | `#2F440B` |
  | White (boundary) | `#ffffff` | `#757575` | `#1a1a1a` |

- Each skill assigns each role one color (see its `notation.md`). Do not recolor by taste. Red is reserved for errors and is never used.
- Connectors and lines: `#313131`, stroke-width 2, unless the notation assigns a color.

## 5. Connectors

- Every relationship is a `<line>` connector with `data-start` and `data-end` naming local ids of shapes (never a frame, never another connector, never a text widget).
- List connectors **after** every shape they join. Z-order is creation order, and connectors are created last.
- Pin `data-start-side` and `data-end-side` to the facing edges so lines do not cross shapes.
- Use one routing style per frame: `straight` for use case diagrams, `elbowed` for data flow diagrams.
- Labels go in `data-content`. Label text is specific: never *uses, contains, relates, has, supports, manages, integrates*. If you cannot name the relationship, write `UNKNOWN` and add an `UNKNOWN/VERIFY` line to the frame's legend.
- Arrowheads: only `data-arrow="end"`, `"start"`, or `"both"` exist. Miro cannot draw a UML hollow triangle or an open versus filled head. Where notation depends on the head shape, the skill uses dash style plus a label instead, and the legend says so.

## 6. Build, then fix layout

1. Show the user the textual model your skill asks for (elements and relationships) and wait for a yes, unless the user already supplied the full model and said to go ahead. Fixing a drawn diagram costs more than a question.
2. Build **one** SVG with the frame and everything in it, and send it with `canvas_create_from_svg`. Use local ids that read well (`uc_approve`, `act_owner`, `p1`, `d1`).
3. If the response reports changed dimensions, move only the affected widgets with `canvas_update_from_svg`, starting from the returned `result_svg`. Never regenerate the SVG from scratch, and never invent a `data-miro-id`.
4. Check the result against the Checklist section of your skill's `notation.md` using the `result_svg` you already have. Call `canvas_read_as_svg` only if an item failed or the user edited the frame since.

## 7. Editing an existing diagram

1. Get the frame id from the map (or the URL's `moveToWidget`).
2. `canvas_read_as_svg` with `widget_ids=[frameId]`. That returns the frame and everything inside it.
3. Edit that SVG in place, keep every `data-miro-id`, add new widgets without one, mark removals with `data-deleted="true"` only after the user confirmed the removal.
4. Send it with `canvas_update_from_svg`.
5. Bump the footer version (`v1` to `v2`) and date.

## 8. After drawing: record it

- Write or update the frame row in the workspace map (see `map-contract.md` in this folder): board, boardId, frameId, title, type, one-sentence description, links. Do this in the same task.
- Report to the user: the frame title, the frame link `https://miro.com/app/board/<boardId>/?moveToWidget=<frameId>`, the element counts, and any `UNKNOWN/VERIFY` items.
- Offer the next step in one line: "Publish this to Confluence?" (that is the `miro-to-confluence` skill). Do not publish unasked.
