# Use case notation

Paraphrased from UML 2.5.1 clause 18 and from Cockburn, *Writing Effective Use Cases*. See `CREDITS.md` in the repository.

## What a use case diagram is for

It answers one question: **who uses this system, for which goals?** It does not show order, screens, data, or how a goal is achieved. Order belongs in a sequence diagram. Data belongs in a data flow diagram. The written use case (steps, preconditions, extensions) belongs on a Confluence page; the diagram is the index to it.

One diagram covers one **subject** (one system or subsystem) at one goal level.

## Elements

| Element | Meaning | How to name it | Miro drawing |
|---|---|---|---|
| Subject (system boundary) | The system under design. Everything inside is what we build. | The product or subsystem name, e.g. "Expense Service" | Rectangle, White triplet, label top-left 22 px bold |
| Actor | A **role** played by a person or another system that interacts with the subject. Outside the boundary. | A role noun: "Approver", "Employee". Not a person's name, not a department, not "User" when a more specific role exists. | Human: stick figure (see `layout.md`). System: rectangle with keyword `«system»` above the name, Gray triplet |
| Primary actor | Starts the use case to reach their goal. | | Left column |
| Supporting (secondary) actor | Provides a service to the subject during the use case: an approver, an e-mail gateway, an identity provider. | | Right column |
| Use case | A goal of the primary actor that the subject delivers. | Active verb + object, from the actor's view: "Submit expense claim", "Approve claim". Optional id prefix when the team has a use case list: "UC-003 Approve claim". | Ellipse 340 x 72 |
| Association | The actor takes part in that use case. | No label | Solid connector, **no arrowhead** |
| «include» | The base use case **always** runs the included one. Use it only to avoid writing the same steps twice. | Label `«include»` | Dashed connector from **base** to **included**, arrow at the included end |
| «extend» | The extension use case **optionally** adds behaviour to the base when a condition holds. | Label `«extend»`, optionally with the condition: `«extend» (amount over limit)` | Dashed connector from **extension** to **base**, arrow at the base end |
| Generalization | A specialised actor or use case inherits from a general one. Use sparingly. | No label | Solid connector from child to parent, arrow at the parent end |

UML allows an actor to be drawn either as a stick figure or as a rectangle with the keyword «actor». This skill uses the stick figure for people and the keyword rectangle `«system»` for other systems, so a reader can tell them apart.

Miro connectors have one kind of arrowhead, so a UML hollow triangle (generalization) and an open arrow (include, extend) look the same. The skill tells them apart by line style and label, and the legend states it: dashed with a label is a dependency, solid with an arrow is generalization, solid with no arrow is an association.

## Color roles (from the shared palette)

| Role | Triplet |
|---|---|
| User-goal use case (the normal case) | Blue |
| Included use case (shared sub-goal) | Yellow |
| Extension use case | Orange |
| Out of scope for this release | Gray, label ends with ` (later)` |
| External system actor | Gray |
| System boundary | White |
| Stick figure | Ink `#1a1a1a` |

Include connectors use stroke `#2C97BB`. Extend connectors use stroke `#CC7830`. Associations and generalizations use `#313131`.

## Rules that keep the diagram honest

1. **Goal level.** Each use case is a goal the actor would be satisfied to finish in one sitting ("Approve claim"), not a step ("Click approve"), not a screen ("Claims page"), not CRUD ("Manage claims"). If you see "Manage X", ask which goals it hides and draw those.
2. **No flow between use cases.** The only lines between use cases are «include», «extend», and generalization. Never draw "then" arrows.
3. **No functional decomposition.** Do not use «include» to break a use case into its steps. Include only behaviour that two or more base use cases share, or that is a clearly reusable sub-goal (for example "Authenticate").
4. **Every use case has at least one actor** linked directly, or is reached by «include» or «extend» from one that does.
5. **Every actor touches at least one use case.** Remove actors that do not.
6. **Actors outside, use cases inside.** Nothing that is part of the subject sits outside the boundary.
7. **Truthfulness.** If the source material does not say who does something, put `UNKNOWN/VERIFY` in the legend and ask, rather than inventing an actor.
8. **Budget.** At most 12 use cases and 8 actors per frame. Above that, split by actor group or by sub-goal into two frames, for example `[UC] Claims, employee side` and `[UC] Claims, finance side`.
9. **Traceability.** If the workspace map has a use case list page (a row whose title or alias matches "use cases"), prefix each use case with its id from that page. Do not invent ids.

## Checklist

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

