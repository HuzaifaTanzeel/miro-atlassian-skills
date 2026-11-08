# Use case notation

Paraphrased from UML 2.5.1 clause 18 and from Cockburn, *Writing Effective Use Cases*. See `CREDITS.md` in the repository.

A use case diagram answers one question: **who uses this system, for which goals?** It shows no order, screens, data, or how a goal is achieved (sequence and data flow diagrams do that; the written steps live on a Confluence page). One diagram covers one **subject** at one goal level.

## Elements

| Element | Meaning | How to name it | Miro drawing |
|---|---|---|---|
| Subject (system boundary) | The system under design | Product or subsystem name, e.g. "Expense Service" | Rectangle, White triplet, label top-left 22 px bold |
| Actor | A **role** outside the boundary | Role noun: "Approver", "Employee". Not a person's name, a department, or "User" when a specific role exists | Human: stick figure (`layout.md`). System: rectangle with `«system»` above the name, Gray triplet |
| Primary actor | Starts the use case to reach their goal | | Left column |
| Supporting actor | Provides a service during the use case (approver, e-mail gateway, identity provider) | | Right column |
| Use case | A goal of the primary actor that the subject delivers | Active verb + object, actor's view: "Submit expense claim". Optional id prefix "UC-003 Approve claim" | Ellipse 340 x 72 |
| Association | The actor takes part | No label | Solid, **no arrowhead** |
| «include» | The base **always** runs the included use case | `«include»` | Dashed, **base → included**, arrow at included |
| «extend» | The extension **optionally** adds behaviour to the base when a condition holds | `«extend»`, optionally `«extend» (amount over limit)` | Dashed, **extension → base**, arrow at base |
| Generalization | Specialised actor or use case inherits (sparingly) | No label | Solid, child → parent, arrow at parent |

Miro has one arrowhead type, so the legend states: dashed with a label = dependency, solid with arrow = generalization, solid no arrow = association.

## Color roles

| Role | Triplet |
|---|---|
| User-goal use case | Blue |
| Included (shared sub-goal) | Yellow |
| Extension | Orange |
| Out of scope for this release | Gray, label ends ` (later)` |
| External system actor | Gray |
| System boundary | White |
| Stick figure | Ink `#1a1a1a` |

Connector strokes: include `#2C97BB`, extend `#CC7830`, association and generalization `#313131`.

## Rules that keep the diagram honest

1. **Goal level.** A goal the actor would be satisfied to finish in one sitting ("Approve claim"), not a step ("Click approve"), screen ("Claims page"), or CRUD ("Manage claims"). On "Manage X", ask which goals it hides.
2. **No flow between use cases.** Only «include», «extend», generalization. No "then" arrows.
3. **No functional decomposition.** «include» only for behaviour two or more bases share, or a reusable sub-goal (e.g. "Authenticate").
4. **Every use case has an actor** directly, or is reached by «include»/«extend» from one that does.
5. **Every actor touches at least one use case.** Remove the rest.
6. **Actors outside, use cases inside.** Exactly one boundary, labelled with the subject.
7. **Truthfulness.** If the source does not say who does something, put `UNKNOWN/VERIFY` in the legend and ask. Do not invent actors.
8. **Budget.** At most 12 use cases and 8 actors per frame. Above that, split by actor group or sub-goal, e.g. `[UC] Claims, employee side` and `[UC] Claims, finance side`.
9. **Traceability.** If the map has a use case list page (title or alias matches "use cases"), prefix each use case with its id from it. Do not invent ids.

## Checklist

Run against the `result_svg` before reporting done. Fix failures with `canvas_update_from_svg`. Rules 1 to 9 above also apply; these are the extra checks.

- [ ] Frame title starts with `[UC] `. Every use case is an ellipse inside the boundary, every actor outside it.
- [ ] Associations solid, no arrowhead. «include» and «extend» dashed, labelled, pointing as in the table.
- [ ] Human actors are stick figures; other systems are `«system»` rectangles.
- [ ] Every filled shape uses one full triplet; colors match the roles above; Noto Sans, at most three sizes.
- [ ] Header, subtitle, legend, footer in their fixed regions; the legend lists only symbols used and every `UNKNOWN/VERIFY`.
- [ ] No shapes overlap; no connector passes through a shape it does not join (move the use case or pin different sides).
- [ ] Map row written (board, boardId, frameId, `[UC] ...` title, type `use-case`, one-sentence description, links) and frame link reported.
