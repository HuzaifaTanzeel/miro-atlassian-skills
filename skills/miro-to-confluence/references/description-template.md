# Description template

The default is the standard sections below. If the user asks for something else ("just a summary", "only the actors", "in our ADR format"), write that instead and keep the image.

Write from the frame read in publish step 2: titles, labels, legend, and subtitle. Add what the user said in the chat. Do not open other Confluence pages or Jira issues to pad the text. If something matters but the diagram does not show it, put it under open questions.

## Sections

| Section | What goes in it | Length |
|---|---|---|
| Purpose | What question the diagram answers and for whom. | 1 to 2 sentences |
| Scope | What is inside the boundary or lifelines, and what is left out on purpose. | 1 to 3 sentences |
| Elements | One table row per element (see below). | One row each |
| Key flows / Key rules | The main paths, in order. | 3 to 7 items |
| Assumptions and open questions | What the diagram takes for granted and what still needs a decision. | Bullets |
| Last updated | Date, in the source line under the image. | One line |

## Per diagram type

**Use case.** Elements: each actor (kind `Actor` or `System actor`) and each use case (kind `Use case`, `Included`, `Extension`), with a one-line goal. Key rules: the include and extend relations, written as sentences ("Submit expense claim always includes Sign in.").

**Sequence.** Elements: each participant with its role. Key flows: the numbered main path, then one line per `alt`, `opt`, or `loop` fragment with its guard. Add the Mermaid source block (`page-layout.md`).

**Data flow.** Elements: external entities, processes (with number), data stores (with `D` id), and trust boundaries. Key flows: each flow that crosses a trust boundary, with its data and any `[PD]`, `[SPD]`, or `[X-border]` marker. Open questions: one line per boundary crossing that has no stated control (authentication, encryption, residency).

## Style

- Plain sentences. Use the diagram's exact names for elements, so readers can match text to image.
- No marketing words, no restating the image pixel by pixel.
- English, matching the labels on the diagram.
