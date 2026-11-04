# Install

Three steps: connect the two MCP servers, install the skills, then build the workspace map once.

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

**Other clients**: add both URLs as remote (streamable HTTP) MCP servers in the client's settings.

Optional: switch off the tools you do not need, as listed in [tool-budget.md](tool-budget.md).

## 2. Install the skills

With the [skills CLI](https://github.com/vercel-labs/skills), which detects Cursor, Claude Code, and other agents:

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills            # all five
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill miro-sequence-diagram --skill miro-to-confluence
```

Or copy folders by hand. Each folder under `skills/` is self-contained:

| Agent | Project folder | User folder |
|---|---|---|
| Cursor | `.cursor/skills/<name>/` | `~/.cursor/skills/<name>/` |
| Claude Code | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` |
| Others following the Agent Skills format | see the agent's docs | |

Install `workspace-map` together with any other skill; they all read the map it builds.

### Publishing needs Node.js

`miro-to-confluence` runs a small Node script (Node 20 or later). The first publish installs its one dependency:

```bash
npm install --prefix <skills folder>/miro-to-confluence/scripts
```

Sequence diagrams also use `npx @mermaid-js/mermaid-cli`, which downloads a headless Chromium (about 150 MB) the first time.

## 3. Build the map

Ask your agent:

```text
Build the workspace map for Confluence space KEY and Miro board <board URL>.
```

It reads the page tree (titles and ids only, no page bodies) and the board's frame list, asks before creating the `Workspace map` page, and writes:

- `miro-atlassian.config.yaml` in the project root (site, cloudId, space, map page id). Safe to commit inside a private project; it holds ids, not secrets.
- `.miro-atlassian/workspace-map.md`, the local cache. Add `.miro-atlassian/` to `.gitignore`.
- One line in your `AGENTS.md`: `Workspace map: Confluence page <id>, ...`, so every agent finds the map without the config.

Copy `skills/workspace-map/assets/config.example.yaml` if you want to fill the config by hand.

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
