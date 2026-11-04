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

You do not create `miro-atlassian.config.yaml` or `.miro-atlassian/workspace-map.md` yourself. Sign in, add the skills, paste one prompt. Details (including **Claude.ai**, where there is no `npx`): [docs/first-run.md](docs/first-run.md).

1. Connect the Miro (`https://mcp.miro.com/`) and Atlassian (`https://mcp.atlassian.com/v2/mcp`) MCP servers and sign in.
2. Install the whole set. The command installs all five skills, then asks which agents you use (Cursor, Claude Code, and any others it finds). It does not ask you to pick skills one by one.

   ```bash
   npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*'
   ```

   Add `-g` to install for every project. On Claude.ai, upload each folder under `skills/` as a custom skill. Full steps: [docs/install.md](docs/install.md).
3. In a new chat, paste:

   ```text
   Set up miro-atlassian-skills for this workspace. I have signed in to the Miro and Atlassian connectors. I do not have miro-atlassian.config.yaml or a workspace map yet. Do not ask me to write YAML or markdown by hand.

   1. From Atlassian, list the sites I can access. If there is more than one, ask which. Then list Confluence spaces on that site (key, name, id).
   2. From Miro, list my boards (name and URL).
   3. Ask me once, with numbered choices: which Confluence space, which Miro board (or all my boards), and where to create a page titled "Workspace map".
   4. After I answer: scan that space's page tree (titles and ids only) and the chosen board's frames. Build the map, ask before creating the page, then create it.
   5. Write local config and cache only if this environment can write files. On Claude.ai, skip those and give me a "Workspace map: Confluence page …" line for Project instructions.
   6. Report counts, then stop.
   ```

4. Draw and publish:

   ```text
   Draw a sequence diagram for uploading evidence: owner, web app, API, storage, reviewer notification.
   Publish it to the Sequence Diagrams page.
   ```

On Claude.ai, publishing a PNG needs the frame exported from Miro and attached in the chat (no Node, no `curl`). Cursor and Claude Code can render and upload on their own.

Full steps: [docs/first-run.md](docs/first-run.md), [docs/install.md](docs/install.md).

## Docs

- [First run](docs/first-run.md): connectors, Claude.ai without npx, the paste-ready setup prompt
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
