# Data flow checklist

Run the model checks before you build, and the style checks against the `result_svg` before you report done.

## Model (before building)

- [ ] Level is clear: `[DFD-0]` has exactly one process `0` and no data stores; `[DFD-1]` has processes `1.0` to `n.0`.
- [ ] No entity-to-entity, store-to-store, or entity-to-store flow.
- [ ] Every process has at least one input and one output (no black holes, no miracles).
- [ ] Every store is both written and read somewhere, or the legend says where.
- [ ] Level 1 balances with the context diagram: same entities, same flow names.
- [ ] Process names are verb + object. Flow and store names are nouns. No vague verbs on flows.
- [ ] Two-way exchanges between the same pair are one connector with `data-arrow="both"`.
- [ ] Trust boundaries drawn where privilege, ownership, network, tenant, or jurisdiction changes. No element is cut by a boundary.
- [ ] `[PD]`, `[SPD]`, `[X-border]` markers only where the source says so; unknowns listed as `UNKNOWN/VERIFY`.
- [ ] Within budget: at most 7 processes, 8 entities, 6 stores, about 20 flows.

## Style (after building)

- [ ] Frame title starts with `[DFD-0] ` or `[DFD-1] `.
- [ ] Every filled shape uses one full triplet; roles match `notation.md`.
- [ ] Boundaries are drawn first (behind), dashed orange, no fill.
- [ ] Every flow has a label. All connectors are elbowed.
- [ ] No shapes overlap; no connector runs through a shape it does not join.
- [ ] Legend lists only the symbols used, plus `UNKNOWN/VERIFY` items.

## Record

- [ ] Map row written: type `data-flow-0` or `data-flow-1`, frameId, title, one-sentence description, links (for a level-1 frame, `frame <context frameId>` so the levels are linked).
- [ ] Frame link, element counts, and the list of boundary-crossing flows reported to the user.
