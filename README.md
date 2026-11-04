# miro-atlassian-skills

Agent skills that draw standard design diagrams on Miro and publish them to Confluence, without the agent searching your whole workspace each time.

Works with any agent that supports the [Agent Skills](https://agentskills.io) format, such as Cursor and Claude Code, together with the official Miro and Atlassian MCP servers.

| Skill | What it does |
|---|---|
| [`miro-use-case-diagram`](skills/miro-use-case-diagram/SKILL.md) | UML use case diagram: actors, system boundary, use cases, «include» and «extend». |
| [`miro-sequence-diagram`](skills/miro-sequence-diagram/SKILL.md) | UML sequence diagram as a native Mermaid widget, with fragments and activations. |
| [`miro-data-flow-diagram`](skills/miro-data-flow-diagram/SKILL.md) | Data flow diagram (Gane-Sarson / Yourdon) at context and level 1, with trust boundaries and personal-data markers in the style of threat models. |
| [`miro-to-confluence`](skills/miro-to-confluence/SKILL.md) | Exports a Miro frame to PNG and puts it on a Confluence page (existing, named, or new) with a structured description. |
| [`workspace-map`](skills/workspace-map/SKILL.md) | Builds and maintains a small index of Confluence pages and Miro frames, so the other skills call pages and frames by id. |

![Use case example](docs/img/use-case-example.png)

## Why

An agent asked to "put this diagram on the right Confluence page" usually spends many calls and tokens exploring pages. These skills keep a **workspace map** on a Confluence page (shared by the team) with a local cache (cheap to read). Skills read the map first, write their own changes back right away, and resync only what people changed by hand.

The diagram skills follow published notation rules (UML 2.5, Gane-Sarson, Microsoft threat modeling) and fixed layouts, so diagrams come out the same way every time. See [CREDITS.md](CREDITS.md) for sources.

## Quick start

1. Connect the Miro (`https://mcp.miro.com/`) and Atlassian (`https://mcp.atlassian.com/v2/mcp`) MCP servers.
2. Install the skills:

   ```bash
   npx skills add HuzaifaTanzeel/miro-atlassian-skills
   ```

3. Build the map once:

   ```text
   Build the workspace map for Confluence space KEY and Miro board <board URL>.
   ```

4. Draw and publish:

   ```text
   Draw a sequence diagram for uploading evidence: owner, web app, API, storage, reviewer notification.
   Publish it to the Sequence Diagrams page.
   ```

Full steps, including manual install and Node.js for PNG export: [docs/install.md](docs/install.md).

## Docs

- [Install](docs/install.md)
- [Tool budget](docs/tool-budget.md): which MCP tools you can switch off.
- [Architecture](docs/architecture.md): the map, rendering, and how Jira plugs in later.
- [Contributing](CONTRIBUTING.md)

## Scope

- Miro and Confluence only. Jira is not used yet; map rows can carry issue keys as pointers for a future Jira skill.
- Labels and descriptions in English.
- The page shows a PNG and text, never a Miro embed.

## License

[MIT](LICENSE). Quoted and adapted material keeps its own license; see [CREDITS.md](CREDITS.md).
