# Use case layout

Fixed coordinates so every use case frame on a board looks the same. All coordinates are frame-relative. The frame is 1600 x 1200. Header, subtitle, legend, and footer positions are in `miro-board-conventions.md` section 3.

## Pick the layout

| Condition | Layout |
|---|---|
| 6 or fewer use cases, and no use case is included by two or more bases | One column |
| 7 to 12 use cases, or a use case shared by two or more bases | Two columns |
| More than 12 use cases or more than 8 actors | Split into two frames (see `notation.md` rule 8) |

## System boundary

| | One column | Two columns |
|---|---|---|
| Rectangle | x=360, y=200, width=880 | x=360, y=200, width=880 |
| Height | (last row cy) + 36 + 64 - 200, minimum 400 | same |
| Label | `data-content` = subject name, `data-text-align="left"`, `data-text-align-vertical="top"`, 22 px bold, ink `#1a1a1a` | same |

Draw the boundary **first** in the SVG so it sits behind the use cases.

## Use cases

Ellipse `rx="170" ry="36"` (340 x 72), label 18 px bold, `noto_sans`, triplet by role.

| | One column | Two columns |
|---|---|---|
| Column centre | cx=800 | left cx=600, right cx=1000 |
| Rows | cy = 300 + 130 x row | same, per column |

Order rows top to bottom in the primary actor's natural order of goals (the order a new user meets them), not alphabetically.

Keep each actor's use cases in adjacent rows. If one actor's rows sit above and below another actor's row on the same side, the lines cross. Move whole include or extend chains up or down until each actor's rows are together. Lines that don't cross matter more than the natural order.

Placement of related use cases:

- An **included** use case with one base sits directly **below** its base in the same column. Connector: start `bottom` of base, end `top` of included.
- An **extension** sits directly **below** its base in the same column. Connector: start `top` of extension, end `bottom` of base.
- An included use case **shared** by two or more bases goes in the **right column**, at the row nearest the average cy of its bases. Connectors: start `right` of each base, end `left` of the shared use case.
- In the two-column layout, a use case that only a right-side actor touches also goes in the right column.

## Human actors (stick figure)

Each human actor is six widgets wrapped in one group so they move together, plus a see-through anchor box that connectors attach to. For a head centre at (cx, cy):

```xml
<g data-group="">
  <rect id="act_ID" x="cx-40" y="cy-18" width="80" height="118" fill="none" stroke="none" />
  <circle cx="cx" cy="cy" r="18" fill="#1a1a1a" stroke="#313131" stroke-width="2" />
  <line data-type="divider" x1="cx" y1="cy+18" x2="cx" y2="cy+64" stroke="#1a1a1a" stroke-width="2" />
  <line data-type="divider" x1="cx-28" y1="cy+36" x2="cx+28" y2="cy+36" stroke="#1a1a1a" stroke-width="2" />
  <line data-type="divider" x1="cx" y1="cy+64" x2="cx-20" y2="cy+100" stroke="#1a1a1a" stroke-width="2" />
  <line data-type="divider" x1="cx" y1="cy+64" x2="cx+20" y2="cy+100" stroke="#1a1a1a" stroke-width="2" />
  <textArea x="cx-90" y="cy+108" width="180" font-family="noto_sans" font-size="18" font-weight="bold" text-align="center" fill="#1a1a1a">Role name</textArea>
</g>
```

Write the numbers out; the SVG does not evaluate expressions. The anchor box is the only part of the actor that connectors reference, so lines meet the figure at arm height.

| Side | Head cx | Head cy |
|---|---|---|
| Left (primary actors) | 180 | Average cy of the actor's use cases, minus 41. Then push apart so heads are at least 190 apart. Clamp to 260..860. |
| Right (supporting actors and systems) | 1420 | Same rule |

## System actors

A rectangle 200 x 88, Gray triplet, label `«system»&lt;br&gt;Name` (the `<br>` is escaped inside the attribute), 18 px bold. Left edge x=1320 on the right side or x=80 on the left side. Vertical centre follows the same rule as human actors (average cy of its use cases), at least 120 apart.

## Connectors

- Association: `data-start` = actor anchor id (or system box id), `data-end` = use case id. Left actors: start `right`, end `left`. Right actors: start `left`, end `right`. No `data-arrow`. `data-shape="straight"`. Stroke `#313131`, width 2.
- «include»: `stroke-dasharray="5,5"`, `data-arrow="end"`, `data-content="«include»"`, stroke `#2C97BB`.
- «extend»: `stroke-dasharray="5,5"`, `data-arrow="end"`, `data-content="«extend»"` (or `«extend» (condition)`), stroke `#CC7830`.
- Generalization: solid, `data-arrow="end"` at the parent, no label, stroke `#313131`.

List every connector after every shape.

## Legend text

Include only the lines for symbols that appear:

```text
Solid line: the actor takes part in the use case.
Dashed «include»: the base always runs the included use case.
Dashed «extend»: optional behaviour added to the base when the condition holds.
Solid arrow: generalization (child to parent).
Blue: user goal. Yellow: shared sub-goal. Orange: extension. Gray: later or external system.
```
