# Credits and sources

The skills in this repository are written to work the first time, so most of the notation rules are not invented here. They come from the standards and guides below. Text marked **quoted or adapted** reuses wording from a source whose license allows it, and the license is listed. Everything else is **cited and paraphrased**: we restate the rule in our own short words and point to where it comes from.

Licenses were checked on 5 November 2026.

## Quoted or adapted (permissive licenses)

| Source | License | Used in | What we took |
|---|---|---|---|
| [miroapp/miro-ai](https://github.com/miroapp/miro-ai), `skills/miro-code-explain-on-board/references/diagramming-principles.md` and `SKILL.md`. Copyright (c) 2026 Miro | MIT | `shared/miro-board-conventions.md`, all three diagram skills | The rules "one diagram = one question + one zoom level", "notation must match semantics", the edge-label ban list (*uses, contains, relates, has, supports, manages, integrates*), the `UNKNOWN/VERIFY` convention, the element budgets (about 10 to 15 nodes, split above 15, must split above 20), and the sequence budgets (about 5 to 8 lifelines, 12 to 20 messages). Also the instruction to load Miro's canvas guidance before composing and to confirm the plan before creating a diagram widget. |
| [atlassian/atlassian-mcp-server](https://github.com/atlassian/atlassian-mcp-server) and its Cursor plugin skills. Copyright (c) 2026 Atlassian US, Inc. | Apache-2.0 | `skills/miro-to-confluence/references/page-layout.md`, `tool-map.md` files | The media-single image HTML pattern, the `contentId-<id>` collection convention, the "cloudId is a top-level argument on execute calls" rule, and the discover/executeRead/executeWrite flow. We changed the wording and selected only what these skills need (Apache-2.0 section 4(b)). |
| [mermaid-js/mermaid](https://github.com/mermaid-js/mermaid), `docs/syntax/sequenceDiagram.md` | MIT | `skills/miro-sequence-diagram/references/notation.md`, `mermaid-patterns.md` | Arrow-type table, `activate`/`deactivate`, `loop`, `alt`/`else`, `opt`, `par`/`and`, `critical`/`option`, `break`, `Note`, `autonumber`, and the entity-code escaping rule (`#59;` for a semicolon). |
| [Microsoft Learn: Threat Modeling Tool feature overview](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-feature-overview) (MicrosoftDocs content) | CC BY 4.0 | `skills/miro-data-flow-diagram/references/levels-and-boundaries.md` | The five element categories (process, external interactor, data store, data flow, trust line or border boundary) and their examples. Wording adapted. |
| [Agent Skills specification](https://agentskills.io) ([agentskills/agentskills](https://github.com/agentskills/agentskills)) | Apache-2.0 | Every `SKILL.md` | Frontmatter fields and the progressive-disclosure layout (`SKILL.md` plus `references/`, `scripts/`, `assets/`). |

## Cited and paraphrased (copyrighted works)

| Source | Used for |
|---|---|
| Object Management Group, *OMG Unified Modeling Language (UML) Version 2.5.1*, formal/17-12-05, 2017. Clause 18 (Use Cases) and clause 17 (Interactions) | Actor, use case, subject (system boundary), association, «include», «extend», generalization; the rule that an actor may be drawn as a stick figure or as a rectangle with the keyword «actor»; lifelines, messages, combined fragments (alt, opt, loop, par, break, critical). |
| Alistair Cockburn, *Writing Effective Use Cases*, Addison-Wesley, 2001 | Goal levels (user goal is the default level for a use case diagram), naming a use case as an active verb phrase of the primary actor's goal, primary versus supporting actors, and avoiding functional decomposition with «include». |
| Martin Fowler, *UML Distilled*, 3rd ed., Addison-Wesley, 2003 | Keep use case diagrams simple; the text matters more than the diagram; use «include» only to avoid repetition. Sequence diagrams show one scenario. |
| Chris Gane and Trish Sarson, *Structured Systems Analysis: Tools and Techniques*, Prentice Hall, 1979 | Data flow diagram symbols: external entity, process with an id, data store with an id compartment, labelled data flow. |
| Tom DeMarco, *Structured Analysis and System Specification*, Yourdon Press, 1978; Edward Yourdon, *Modern Structured Analysis*, Prentice Hall, 1989 | Levelling (context diagram, level 0, level 1), balancing between levels, process numbering, "seven plus or minus two" processes per diagram, and the classic errors: black hole, miracle, entity-to-entity flow, store-to-store flow. |
| Adam Shostack, *Threat Modeling: Designing for Security*, Wiley, 2014 | Trust boundaries drawn on a DFD where privilege, ownership, or network changes; every flow that crosses a boundary is a review point. |
| [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html) (CC BY-SA 4.0) | Cited only, to keep this repository MIT. Confirms the DFD-with-trust-boundaries practice. |
| Saudi Data and AI Authority (SDAIA), *Personal Data Protection Law* and its *Regulation on Personal Data Transfer outside the Kingdom* | Why a "KSA data residency" trust boundary and a personal-data marker on flows are worth showing. The skills do not give legal advice. |
| Miro MCP server guidance returned by `canvas_get_canvas_composer_skill` and `canvas_load_format_skill` (no license stated) | Paraphrased only: the Fluoro palette triplets (fill, stroke, ink), Bright Paper spacing values, the Mermaid widget size rule, connector side pinning, and z-order by creation order. The skills tell the agent to load the live guidance rather than relying on our copy. |

## Prior work in this project

The resolution ladder, the one-question rule, the "map has no issue catalog" rule, and the eval approach in `workspace-map` come from the maintainer's own research blueprint written before this repository existed.

If you find text in this repository that should carry an attribution and does not, please open an issue.
