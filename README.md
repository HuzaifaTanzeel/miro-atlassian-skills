# miro-atlassian-skills

Agent skills that draw standard design diagrams on Miro and publish them to Confluence, without the agent searching your whole workspace each time.

Works with any agent that supports the [Agent Skills](https://agentskills.io) format, such as Cursor and Claude Code, together with the official Miro and Atlassian MCP servers.

| Skill | What it does |
|---|---|
| [`miro-use-case-diagram`](skills/miro-use-case-diagram/SKILL.md) | UML use case diagram: actors, system boundary, use cases, «include» and «extend». |
| [`miro-sequence-diagram`](skills/miro-sequence-diagram/SKILL.md) | UML sequence diagram as a native Mermaid widget, with fragments and activations. |
| [`miro-data-flow-diagram`](skills/miro-data-flow-diagram/SKILL.md) | Data flow diagram (Gane-Sarson / Yourdon) at context and level 1, with trust boundaries and personal-data markers. |
| [`miro-to-confluence`](skills/miro-to-confluence/SKILL.md) | Exports a Miro frame to PNG and puts it on a Confluence page with a structured description. |
| [`workspace-map`](skills/workspace-map/SKILL.md) | Builds and maintains a small index of Confluence pages and Miro frames so skills call them by id. |

![Use case example](docs/img/use-case-example.png)

## How it works

A **workspace map** on a Confluence page (plus an optional local cache) holds page and frame ids. Skills read it first, write their own changes back, and resync only when something is stale.
Diagram skills draw one notation each on a Miro frame. `miro-to-confluence` reads the frame SVG, renders a PNG locally, and uploads it with a description.
Jira is out of scope for now. Map rows may carry issue keys as pointers; a future `jira-*` skill would fetch them live and never store issue catalogs in the map.

## Quick start

Do not create `miro-atlassian.config.yaml` or the map by hand. Sign in, install the skills, paste one prompt.

**Connectors** (browser OAuth; never paste a token):

| Server | URL |
|---|---|
| Miro | `https://mcp.miro.com/` |
| Atlassian | `https://mcp.atlassian.com/v2/mcp` |

Cursor: marketplace plugins, or put both URLs in `.cursor/mcp.json`. Claude Code: `claude mcp add --transport http …` for each, then `/mcp`. Claude.ai / Desktop: Settings → Connectors.

**Install** (all five skills; then pick agents if asked):

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*'
```

Add `-g` for every project. On Claude.ai there is no `npx`: download the repo, zip each `skills/<name>/` folder so `SKILL.md` is at the zip root, and upload each as a custom skill.

**Setup prompt** (new chat, both connectors signed in):

```text
Set up miro-atlassian-skills for this workspace. I have signed in to the Miro and Atlassian connectors. I do not have miro-atlassian.config.yaml or a workspace map yet. Do not ask me to write YAML or markdown by hand.

1. From Atlassian, list the sites I can access. If there is more than one, ask which. Then list Confluence spaces on that site (key, name, id).
2. From Miro, list my boards (name and URL).
3. Ask me once, with numbered choices: which Confluence space, which Miro board (or all my boards), and where to create a page titled "Workspace map".
4. After I answer: scan that space's page tree (titles and ids only) and the chosen board's frames. Build the map, ask before creating the page, then create it.
5. Write local config and cache only if this environment can write files. On Claude.ai, skip those and give me a "Workspace map: Confluence page …" line for Project instructions.
6. Report counts, then stop.
```

Then draw and publish, for example: `Draw a sequence diagram for uploading evidence…` / `Publish it to the Sequence Diagrams page.`

On Claude.ai, publishing a PNG needs the frame exported from Miro and attached in the chat (no Node, no `curl`). Cursor and Claude Code can render and upload on their own. Publishing needs Node 20+ for the local PNG script the first time you publish from those agents.

## Optional: tools you can disable

Once the map exists, you can turn off tools the skills never call (saves context). Keep the Miro `canvas_*` tools you draw with, plus `canvas_search` and `board_search_boards`. Keep Atlassian `getConfluenceContent`, `updateConfluenceContent`, `createConfluenceContent`, `searchConfluence`, `discover`, `executeRead`, `executeWrite`.
Safe to disable: Miro board/space/table/prototype/comment/admin tools; Atlassian Jira, Loom, Teamwork Graph, people/portfolio tools, and `executeDestructive`. Re-enable Jira tools when you add a `jira-*` skill.

## Scope

- Miro and Confluence only. Jira is not used yet; map rows can carry issue keys as pointers.
- Labels and descriptions in English.
- The page shows a PNG and text, never a Miro embed.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Sources: [CREDITS.md](CREDITS.md). License: [MIT](LICENSE).
