# Install

**First time?** You never write `miro-atlassian.config.yaml` or the workspace map by hand. Follow [first-run.md](first-run.md): sign in, add the skills (including on Claude.ai without npx), then paste the setup prompt.

This page is the short technical list. Claude.ai, copy-the-folders, and the paste-ready prompt are in [first-run.md](first-run.md).

## 1. Connect Miro and Atlassian

Both are remote MCP servers with OAuth sign-in in the browser. You never paste a token into a chat or a file.

| Server | URL |
|---|---|
| Miro | `https://mcp.miro.com/` |
| Atlassian (Confluence) | `https://mcp.atlassian.com/v2/mcp` |

**Cursor**: install the Miro and Atlassian plugins from the marketplace, or add them to `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (all projects):

```json
{
  "mcpServers": {
    "miro": { "url": "https://mcp.miro.com/" },
    "atlassian": { "url": "https://mcp.atlassian.com/v2/mcp" }
  }
}
```

**Claude Code**:

```bash
claude mcp add --transport http miro https://mcp.miro.com/
claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp
```

Then run `/mcp` and sign in to each.

**Claude.ai and Claude Desktop**: Settings → Connectors. Add both URLs as remote connectors and sign in. There is no `npx` and no project folder; see [first-run.md](first-run.md).

**Other clients**: add both URLs as remote (streamable HTTP) MCP servers in the client's settings.

Optional: switch off the tools you do not need, as listed in [tool-budget.md](tool-budget.md).

## 2. Install the skills

The five skills are one set. The diagram skills read the workspace map, so installing one of them on its own leaves the others with nothing to look up.

With the [skills CLI](https://github.com/vercel-labs/skills), from the project where you want them:

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*'
```

`--skill '*'` installs all five and skips the per-skill checklist. The CLI then asks, interactively, which agents to install into. Pick the ones you use (Cursor, Claude Code, and any others it finds) and confirm. Add `-g` if you want them in every project instead of this one.

In Claude Code you can install the same set as one plugin:

```text
/plugin marketplace add HuzaifaTanzeel/miro-atlassian-skills
/plugin install miro-atlassian-skills@miro-atlassian-skills
```

Or copy folders by hand. Each folder under `skills/` is self-contained:

| Agent | Project folder | User folder |
|---|---|---|
| Cursor | `.cursor/skills/<name>/` | `~/.cursor/skills/<name>/` |
| Claude Code | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` |
| Others following the Agent Skills format | see the agent's docs | |

Copy all five folders. They are written to be installed together.

### Publishing needs Node.js

`miro-to-confluence` runs a small Node script (Node 20 or later). The first publish installs its one dependency:

```bash
npm install --prefix <skills folder>/miro-to-confluence/scripts
```

Sequence diagrams also use `npx @mermaid-js/mermaid-cli`, which downloads a headless Chromium (about 150 MB) the first time.

## 3. Build the map

Do not create the config or the cache yourself. In a new chat, paste the prompt in [first-run.md](first-run.md) (also `skills/workspace-map/assets/first-run-prompt.md`). If you already know the space and board:

```text
Build the workspace map for Confluence space KEY and Miro board <board URL>.
```

The agent lists what it can see from the two connectors, asks you to pick a space, a board, and a parent page, then writes:

- A Confluence page titled `Workspace map` (this is the copy the team shares; enough on its own for Claude.ai).
- `miro-atlassian.config.yaml` in the project root, **only if** the chat can write files. Ids, not secrets. Safe to commit inside a private project.
- `.miro-atlassian/workspace-map.md`, the local cache, same condition. Gitignore `.miro-atlassian/`.
- One pointer line for `AGENTS.md` or a Claude Project's custom instructions.

Copy `skills/workspace-map/assets/config.example.yaml` only if you want to commit known ids yourself. Leaving it to the first-run prompt is the usual path.

## 4. Try it

```text
Draw a use case diagram for the expense claims service: employees submit and track claims, approvers approve or ask for more info, sign-in goes through our identity provider.
Publish it to Confluence under the Design page.
```

## Update

```bash
npx skills update
```

Or pull the repository and copy the folders again.
