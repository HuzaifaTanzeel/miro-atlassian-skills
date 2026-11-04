# Use case checklist

Run this against the `result_svg` before you report done. Fix any failure with `canvas_update_from_svg`.

## Notation

- [ ] Frame title starts with `[UC] `.
- [ ] Exactly one system boundary, labelled with the subject name.
- [ ] Every use case is an ellipse inside the boundary. Every actor is outside it.
- [ ] Every use case name is a verb phrase at user-goal level. No "Manage ...", no screen names, no single nouns.
- [ ] Every actor name is a role. No personal names, no "User" when a specific role is known.
- [ ] Every actor has at least one association. Every use case is linked to an actor directly or through «include» or «extend».
- [ ] Associations are solid with no arrowhead.
- [ ] «include» points from base to included. «extend» points from extension to base. Both dashed and labelled.
- [ ] No other lines between use cases (no sequence arrows).
- [ ] Human actors are stick figures; other systems are `«system»` rectangles.
- [ ] At most 12 use cases and 8 actors.

## Style

- [ ] Every filled shape uses one full triplet (fill, stroke, text color) from the palette.
- [ ] Color roles match `notation.md` (blue user goal, yellow shared sub-goal, orange extension, gray later or system).
- [ ] One font (Noto Sans), at most three sizes.
- [ ] Header, subtitle, legend, and footer are in their fixed regions; the legend lists only symbols used.
- [ ] No shapes overlap. No connector passes through a shape it does not join. If one does, move the use case or pin different sides.
- [ ] Every `UNKNOWN/VERIFY` item is listed in the legend.

## Record

- [ ] Map row written: board, boardId, frameId, `[UC] ...` title, type `use-case`, one-sentence description, links (use case page id if known).
- [ ] Frame link reported to the user.
