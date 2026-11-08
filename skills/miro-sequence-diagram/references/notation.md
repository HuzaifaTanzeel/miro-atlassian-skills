# Sequence diagram notation

Contents: [What a sequence diagram is for](#what-a-sequence-diagram-is-for) � [Participants](#participants) � [Messages](#messages) � [Activations](#activations) � [Combined fragments](#combined-fragments) � [Notes](#notes) � [Mermaid limits on Miro](#mermaid-limits-on-miro) � [Budgets](#budgets) � [Checklist](#checklist) � [Notation](#notation) � [Widget and layout](#widget-and-layout) � [Record](#record)

Paraphrased from UML 2.5.1 clause 17 (Interactions). Mermaid syntax adapted from the Mermaid documentation (MIT). Budgets adapted from Miro's `miro-code-explain-on-board` skill (MIT). See `CREDITS.md`.

## What a sequence diagram is for

It shows **one concrete scenario**: the messages that pass between participants, in time order, to reach one outcome. Time runs top to bottom. It is not a flowchart of every path, and it is not a component map.

One diagram = one scenario. The happy path is drawn in full; the one or two alternatives that matter (rejection, timeout, validation failure) are drawn as `alt` or `break` fragments. Rare paths get their own diagram or a line in the description.

## Participants

| UML | Mermaid | Use for |
|---|---|---|
| Actor lifeline | `actor E as Employee` | A human role. |
| Lifeline | `participant API as Expense API` | A system, service, component, queue, or data store. |

- Declare every participant at the top, in display order. Declaration order is left-to-right order.
- Order: the initiating actor first (leftmost), then the participants in the order they are first called. External systems and data stores go rightmost.
- Alias ids are short and stable (`UI`, `API`, `DB`, `IdP`). Display names are role or system names, not class names, unless the audience is developers and the user asked for code-level detail.
- Do not declare a participant that sends or receives no message.

## Messages

`Sender->>Receiver: text`. The text after the colon is the label.

| Arrow | Meaning (UML) | When |
|---|---|---|
| `->>` | Synchronous call | A request whose sender waits for the reply |
| `-->>` | Reply | The return of a synchronous call |
| `-)` | Asynchronous message | Fire-and-forget: an event, a queued job, an e-mail |
| `-x` | Lost or failed message | A call that is rejected or never arrives (use inside `alt`/`break`) |

Label rules:

- A call says what is asked, with the key data: `Submit claim (amount, receipt)`, `POST /claims (amount, file)`, `Validate session token`.
- A reply says what comes back: `claimId`, `201 Created (claimId)`, `Token valid`. Do not label a reply "OK" or "response" when you know what it is.
- Never use the vague verbs *uses, handles, processes, manages, sends data*. If you cannot name the message, write `UNKNOWN` and list it as `UNKNOWN/VERIFY`.
- A self-call (`API->>API: Check policy limits`) is fine for an internal step that matters to the reader. Keep them rare.

## Activations

Activation bars show when a participant is busy handling a call.

- For a call and its reply in the same branch, use the shorthand: `UI->>+API: ...` then `API-->>-UI: ...`.
- When the reply is inside `alt` branches, use `activate API` before the fragment and `deactivate API` after `end`. Do not put `-` on replies in two branches; Mermaid fails with "inactive participant".
- Every activation must be closed. Unbalanced activations stop the whole diagram from rendering.

## Combined fragments

| Mermaid | UML operator | Use for |
|---|---|---|
| `alt guard` ... `else guard` ... `end` | alt | Mutually exclusive branches. Write the guard as a condition: `alt within policy limit`. |
| `opt guard` ... `end` | opt | An optional step that runs only when the guard holds. |
| `loop condition` ... `end` | loop | Repetition: `loop each receipt`. |
| `par label` ... `and label` ... `end` | par | Steps that run at the same time. |
| `break condition` ... `end` | break | The scenario stops here: `break token expired`. |
| `critical label` ... `option case` ... `end` | critical | A region that must complete as a unit. Use rarely. |

Nest fragments at most two deep. Deeper nesting means you have more than one scenario; split.

## Notes

`Note over API: Applies PDPL consent check` or `Note right of DB: Encrypted at rest`. Use notes for a business rule or constraint the reader must see. At most three per diagram.

## Mermaid limits on Miro

Miro's diagram widget accepts Mermaid syntax up to version 10. Use only: `sequenceDiagram`, `autonumber`, `actor`, `participant ... as ...`, the four arrows above, `activate`/`deactivate` and `+`/`-`, `Note`, `alt`/`else`, `opt`, `loop`, `par`/`and`, `break`, `critical`/`option`, `rect rgb(...)`.

Do not use: `box`, `create`/`destroy`, bidirectional arrows `<<->>`, half arrows, central connections, participant types other than `actor` and `participant` (`boundary`, `control`, `entity`, `database`, `collections`, `queue`), actor menus, or `autonumber` with start and increment values. They need a newer Mermaid than Miro renders.

## Budgets

| Item | Default | Split when |
|---|---|---|
| Participants | 5 to 8 | more than 8: split by subsystem or make one participant a black box |
| Messages | 12 to 20 | more than 20, or branch-heavy: split into "Overview" and "Detail" |
| Fragment depth | 1 to 2 | 3 or more |
| Notes | 0 to 3 | more than 3: move rules to the Confluence description |

## Checklist

Run against the source you sent and the `result_svg` before you report done. The messages, activations, fragments, Mermaid-limits, and budgets sections above all apply. Extra checks:

- [ ] Frame title starts with `[SEQ] ` and names one scenario. `autonumber` is on.
- [ ] Initiating actor leftmost; data stores and external systems rightmost. Humans are `actor`, everything else `participant`; none is idle.
- [ ] Every call has a reply when the caller waits, and every reply says what comes back. No vague labels (*uses, handles, processes, manages, sends data, OK, response*).

## Widget and layout

- [ ] The diagram widget rendered (not skipped). If the response lists it as failed, fix the Mermaid and resend; do not switch to hand-drawn shapes.
- [ ] Frame is big enough for the size estimate in `layout.md`. Nothing overlaps the legend or footer after the widget grew; move the legend and footer down if it did.
- [ ] Header, subtitle, scenario line, legend, and footer are in their regions.
- [ ] Every `UNKNOWN/VERIFY` item is listed in the legend.

## Record

- [ ] Map row written: type `sequence`, frameId, title, one-sentence description, links.
- [ ] Frame link and the step count reported to the user.

