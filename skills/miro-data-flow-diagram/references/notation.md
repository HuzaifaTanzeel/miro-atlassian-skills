# Data flow diagram notation

Symbols follow Gane and Sarson; levelling and validation rules follow DeMarco and Yourdon; trust boundaries follow Microsoft's Threat Modeling Tool (CC BY 4.0) and Shostack. All paraphrased; see `CREDITS.md`.

## What a data flow diagram is for

It shows **where data comes from, what transforms it, where it is stored, and where it goes**. It does not show order, timing, decisions, or who clicks what. Order belongs in a sequence diagram; goals belong in a use case diagram.

With trust boundaries added, the same diagram is the starting point for a threat model and for a data-protection review: every flow that crosses a boundary is a place to ask "who can see or change this data here?"

## Elements

| Element | Meaning | Name it | Miro drawing |
|---|---|---|---|
| External entity | A person, organisation, or system outside the scope that sends or receives data. Also called an external interactor. | A noun: "Employee", "Bank", "Identity Provider" | Rectangle with sharp corners, 240 x 100, Gray triplet |
| Process | Work that transforms input data into output data. | Number, then active verb + object: "2.0 Validate claim" | Rectangle with `rx="24"` (rounded corners), Blue triplet. Label `2.0&lt;br&gt;Validate claim` |
| Data store | Data at rest: a database, file store, cache, queue, or register. | `D` + number, then a plural noun: "D1 Claims", "D2 Receipts" | `data-shape="flow_chart_predefined_process"` (a box with an id compartment), 320 x 90, Yellow triplet. Label `D1  Claims` |
| Data flow | Data in motion between two elements. | A noun phrase naming the data, not the action: "Claim details", "Payment instruction". Optionally the channel in brackets: "Payment file (SFTP)" | Connector with an arrowhead toward the receiver, `data-shape="elbowed"`, label in `data-content` |
| Trust boundary | A line where privilege, ownership, network, tenant, or legal jurisdiction changes. | "Trust boundary: " + what is inside: "Trust boundary: Platform, in-country region" | See-through rectangle, dashed `5,5`, stroke `#CC7830`, label top-left in `#542700` |

Gane and Sarson draw a data store as an open-ended box with an id compartment on the left. Miro has no open-ended box; the predefined-process shape (a box with a compartment line) is the closest. The legend says what it means, so readers do not mistake it for a flowchart sub-process.

### Two-way flows

When the same two elements exchange data in both directions, use **one** connector with `data-arrow="both"` and label it `forward / back`, for example `Claim details / Claim status`. Two separate connectors between the same pair would be drawn on top of each other. Microsoft's Threat Modeling Tool supports bi-directional flows for the same reason.

### Data markers

| Marker | Add to the flow label | Stroke | Meaning |
|---|---|---|---|
| Personal data | ` [PD]` | Purple `#8A7BE0` | The flow carries personal data (any data about an identified or identifiable person). |
| Sensitive personal data | ` [SPD]` | Purple `#8A7BE0`, stroke-width 4 | Health, financial, biometric, genetic, religious, criminal, or similar categories. |
| Leaves the jurisdiction | ` [X-border]` | as above | The receiver is outside the in-country boundary. |

Use markers only when the source says what the data is. If you are not sure whether a flow carries personal data, mark it `UNKNOWN/VERIFY` in the legend rather than guessing. The markers support a review; they are not a legal assessment.

## Levels

| Level | Frame prefix | Contents |
|---|---|---|
| Context | `[DFD-0]` | Exactly one process, numbered `0`, named after the whole system. All external entities. All flows between them and the system. **No data stores** (a store outside the system is an external entity). |
| Level 1 | `[DFD-1]` | The single context process broken into its main processes `1.0`, `2.0`, ... (at most 7, ideally 3 to 6). Data stores `D1`, `D2`, ... appear here. The same external entities as the context diagram. |
| Level 2 | `[DFD-2]` | One level-1 process broken down: process `2.0` becomes `2.1`, `2.2`, ... Only draw it when the user asks. |

## Rules (validation)

Check every one before you build. Each is a classic DFD error with a name.

1. **No entity-to-entity flows.** Two external entities never connect directly. Data between them is out of scope or passes through a process.
2. **No store-to-store flows** and **no entity-to-store flows.** Data reaches or leaves a store only through a process.
3. **No black holes.** Every process has at least one output.
4. **No miracles.** Every process has at least one input.
5. **No write-only or read-only stores** across the set of diagrams. Every store is written by some process and read by some process. On a single level-1 frame, a store that is only read must say where it is written (note in the legend).
6. **Balancing.** Every flow between an entity and process `0` on the context diagram appears on the level-1 diagram with the same name, between the same entity and some level-1 process. Level 1 adds no new external entities.
7. **Names.** Processes are verb + object. Flows and stores are nouns. Never label a flow with a verb ("send", "update") or with *uses, contains, relates, has, supports, manages, integrates*.
8. **Numbering.** Context process `0`. Level-1 processes `1.0` to `n.0`. Stores `D1` to `Dn`, and the same store keeps its number on every level.
9. **Budget.** At most 7 processes, 8 entities, and 6 stores per frame, and at most about 20 flows. More than that: split, or drop a level.
10. **Trust boundaries.** Draw one wherever privilege, ownership, network, tenant, or jurisdiction changes. Typical ones: internet to platform, platform to third-party system, in-country region to outside, one tenant to another, application to administrator tooling. An element is entirely inside or entirely outside a boundary, never cut by it.

## Color roles

| Role | Triplet |
|---|---|
| External entity | Gray |
| Process | Blue |
| Data store | Yellow |
| Trust boundary | Orange stroke only, no fill |
| Flow | Ink `#313131`; Purple stroke for `[PD]` and `[SPD]` |
