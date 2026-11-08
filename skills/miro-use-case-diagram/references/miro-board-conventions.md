# Miro board conventions (shared by every diagram skill)

This file is copied into each diagram skill by `scripts/sync-shared.mjs`. Edit the copy in `shared/`, never the copies under `skills/`.

Where this file and Miro's live guidance disagree on **notation** (e.g. dashed «include»), this file wins. On **SVG mechanics** (attribute names, escaping, sizes), the live guidance wins.

## 1. Load Miro's guidance once per chat

Before the first `canvas_create_from_svg` or `canvas_update_from_svg`, call `canvas_get_canvas_composer_skill` once with `step="dsl"`. Do not call `step="design"`. Bright Paper, its reflection questions, and its pigments do not apply here. This file wins on frame layout; the skill's `notation.md` wins on notation.

Do not call `canvas_load_format_skill` for a use case, sequence, or data flow diagram. Those skills already carry the notation, and that tool's color rules do not apply. Call it only for a notation this suite does not specify.

Reuse the dsl result for every diagram in the chat. Set `invocation_source="skill"` on every Miro call that accepts it. Do not `canvas_read_as_svg` after a create that listed no failed items; check your checklist against the SVG you sent and `result_svg`.

## 2. Board and frame

- **Board.** Request, else `miro.defaultBoard`, else the map's Miro rows. Never create a board without a yes in this chat (on a Miro free plan a new board can lock an old one).
- **One diagram per frame.** No two diagrams in a frame, no super-frames.
- **Title prefix** (tags are not returned by the canvas tools): `[UC]` use case, `[SEQ]` sequence, `[DFD-0]` context, `[DFD-1]`/`[DFD-2]` level 1 or below.
- **Size.** 1600 x 1200 (standard) or 2400 x 1600 (large, only near the element budget). Fill `#ffffff`. Padding 64.
- **Placement.** Non-empty board: one `canvas_search` with `result_mode="overview"`, take the right-most frame, place the new frame 320 px to its right, same top edge. Empty board: `translate(0,0)`. No auto-placement.
- Coordinates inside the frame are frame-relative.

## 3. Fixed regions inside every frame

| Region | Position (frame-relative) | Content |
|---|---|---|
| Header | textArea x=64, y=56, width = frame width - 128 | 33 px bold `#1a1a1a`, the title without prefix. Use `textArea`, not `<text>` (it wraps into the subtitle). |
| Subtitle | textArea x=64, y=124, width = frame width - 128 | One line, 18 px `#595959`: scope and question answered |
| Canvas | y=180 to frame height - 200 | The diagram |
| Legend | textArea x=64, y=frame height - 168 | 16 px `#595959`, only symbols used in this frame |
| Footer | textArea right-aligned, x=frame width - 564, y=frame height - 96, width 500 | `Status: Draft \| v1 \| YYYY-MM-DD` plus traced use-case or page id if known (no URL) |

Keep header and footer short. No emojis, decorative Unicode, or em dashes in board copy. « » are notation.

## 4. Typography and color

- Noto Sans (`noto_sans`). Node labels 18 px bold, body 16 to 18 px, at most three sizes per frame.
- A filled shape sets `fill`, `stroke`, `data-text-color` from one row:

  | Name | fill | stroke | text |
  |---|---|---|---|
  | Gray | `#DDDDD8` | `#8A8A7E` | `#434339` |
  | Blue | `#9CE6FF` | `#2C97BB` | `#1C4657` |
  | Yellow | `#FFE86D` | `#A28E26` | `#574900` |
  | Orange | `#FFB575` | `#CC7830` | `#542700` |
  | Purple | `#B8ACFB` | `#8A7BE0` | `#231266` |
  | Green | `#B3E65F` | `#6E9A24` | `#2F440B` |
  | White (boundary) | `#ffffff` | `#757575` | `#1a1a1a` |

- Each skill assigns a color per role in its `notation.md`; do not recolor. Red is never used. Lines `#313131`, width 2, unless notation says otherwise.

## 5. Connectors

- Every relationship is a `<line>` with `data-start`/`data-end` naming local ids of shapes (never a frame, connector, or text widget).
- List connectors **after** every shape they join.
- Pin `data-start-side`/`data-end-side` to facing edges. One routing style per frame: `straight` (use case), `elbowed` (data flow).
- Labels in `data-content`, specific. Never: *uses, contains, relates, has, supports, manages, integrates*. If unnamed, write `UNKNOWN` and add `UNKNOWN/VERIFY` to the legend.
- Only `data-arrow` end/start/both exist, so no UML hollow triangle. Use dash style plus a label and say so in the legend.

## 6. Build, then fix layout

1. Show the textual model your skill asks for and wait for a yes, unless the user gave the full model and said to go ahead.
2. Build **one** SVG with frame and contents; send with `canvas_create_from_svg`. Readable local ids (`uc_approve`, `act_owner`, `p1`, `d1`).
3. If dimensions changed, move only affected widgets with `canvas_update_from_svg` from the returned `result_svg`. Never regenerate from scratch or invent a `data-miro-id`.
4. Check against your skill's checklist using the `result_svg`. Call `canvas_read_as_svg` only if an item failed or the user edited the frame.

## 7. Editing an existing diagram

1. Frame id from the map (or the URL's `moveToWidget`).
2. `canvas_read_as_svg` with `widget_ids=[frameId]`.
3. Edit in place; keep every `data-miro-id`; new widgets get none; `data-deleted="true"` only after the user confirmed.
4. `canvas_update_from_svg`.
5. Bump the footer version and date.

## 8. After drawing: record it

- Write or update the frame row in the map (`map-contract.md`) once, at the end of the task. When the same task also publishes the frame, leave that write to the publish step so the page id and the frame id land together.
- Report: frame title, link `https://miro.com/app/board/<boardId>/?moveToWidget=<frameId>`, element counts, `UNKNOWN/VERIFY` items.
- Offer one line: "Publish this to Confluence?" (`miro-to-confluence`). Do not publish unasked.
