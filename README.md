# miro-atlassian-skills

<p align="center">
  <img src="docs/img/banner-3-split.svg" alt="Miro board skills flowing to Atlassian Confluence" width="100%"/>
</p>

Draw a use case, sequence, or data-flow diagram on Miro, then put the picture on a Confluence page. Five [Agent Skills](https://agentskills.io) share one small index of your pages and frames, so the agent opens them by id.

Works with Cursor, Claude Code, Claude.ai, and any other agent the [skills CLI](https://skills.sh) can install to. Diagrams use the official Miro connector. Publishing and the index use the official Atlassian connector.

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills
```

The CLI asks which skills and which agents. The sections below are the same install with the answers already filled in.

![Use case example](docs/img/use-case-example.png)

## Install

Node.js 20 or newer. Run the command in a terminal, from the project if you want the skills only there.

**This project**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -y
```

**Every project on this machine**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -g -y
```

**Cursor only**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -a cursor -y
```

**Claude Code only**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -a claude-code -y
```

**Cursor and Claude Code, every project**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -g -a cursor -a claude-code -y
```

**One skill**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill miro-sequence-diagram -y
```

Names: `workspace-map`, `miro-use-case-diagram`, `miro-sequence-diagram`, `miro-data-flow-diagram`, `miro-to-confluence`. Install all five. The diagram skills and publishing share `workspace-map`.

**See the skills without installing**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --list
```

A project install lands in `.agents/skills/` (Cursor) or `.claude/skills/` (Claude Code). A global install (`-g`) lands in `~/.cursor/skills/` or `~/.claude/skills/`.

Claude Code can also install the set as a plugin. In a Claude Code chat:

```text
/plugin marketplace add HuzaifaTanzeel/miro-atlassian-skills
/plugin install miro-atlassian-skills@miro-atlassian-skills
```

## Update

Check, then update. This reinstalls only skills whose files changed.

```bash
npx skills check
npx skills update -y
```

Global installs:

```bash
npx skills update -g -y
```

One skill:

```bash
npx skills update miro-to-confluence -y
```

Several:

```bash
npx skills update workspace-map miro-sequence-diagram miro-to-confluence -y
```

## See what is installed

```bash
npx skills list
npx skills list -g
```

## Remove

```bash
npx skills remove miro-sequence-diagram
```

Everything from this repo:

```bash
npx skills remove HuzaifaTanzeel/miro-atlassian-skills -y
```

Global:

```bash
npx skills remove -g HuzaifaTanzeel/miro-atlassian-skills -y
```

## Claude.ai

Claude.ai has no `npx`. Download one zip per skill from [`claude-upload/`](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/tree/main/claude-upload) and upload it. Each zip already contains `<skill-name>/SKILL.md`. A merge to `main` that changes `skills/` replaces those zips.

| Skill | Download |
|---|---|
| Workspace map | [workspace-map.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/workspace-map.zip) |
| Use case diagram | [miro-use-case-diagram.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-use-case-diagram.zip) |
| Sequence diagram | [miro-sequence-diagram.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-sequence-diagram.zip) |
| Data flow diagram | [miro-data-flow-diagram.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-data-flow-diagram.zip) |
| Publish to Confluence | [miro-to-confluence.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-to-confluence.zip) |

Upload each file:

1. Settings → Capabilities. Turn on **Code execution and file creation**. On Team and Enterprise, an owner turns on Skills and code execution under Organization settings → Plugins & skills → Policy.
2. Customize → Skills → **+** → **Create skill** → **Upload a skill**.
3. Choose the zip. Turn the skill on.

When a newer zip is on `main`, upload it again. Claude replaces the skill of the same name.

## Connect Miro and Atlassian

Sign in with the browser. A token does not belong in a file or a chat.

| Connector | URL |
|---|---|
| Miro | `https://mcp.miro.com/` |
| Atlassian | `https://mcp.atlassian.com/v2/mcp` |

**Cursor.** Marketplace plugins for both, or this `.cursor/mcp.json` in the project:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    },
    "atlassian": {
      "url": "https://mcp.atlassian.com/v2/mcp"
    }
  }
}
```

**Claude Code**

```bash
claude mcp add --transport http miro https://mcp.miro.com/
claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp
```

Then run `/mcp` in Claude Code and sign in to each.

**Claude.ai.** Settings → Connectors. Add both URLs and sign in.

## Set up the workspace

New chat, both connectors signed in. Paste this once. The agent creates the config and the map.

```text
Set up miro-atlassian-skills for this workspace. I have signed in to the Miro and Atlassian connectors. I do not have miro-atlassian.config.yaml or a workspace map yet. Do not ask me to write YAML or markdown by hand.

1. From Atlassian, list the sites I can access. If there is more than one, ask which. Then list Confluence spaces on that site (key, name, id).
2. From Miro, list my boards (name and URL).
3. Ask me once, with numbered choices:
   - which Confluence space
   - which Miro board (or all my boards)
   - where to create a page titled "Workspace map" (suggest a standards or engineering parent if one exists, otherwise the space home)
4. After I answer: scan that space's page tree (titles and ids only, no page bodies) and the chosen board's frames. Build the map from that.
5. Ask before creating the page, then create "Workspace map" where I said, and put the map in it.
6. If this environment can write files, also write miro-atlassian.config.yaml in the project root, .miro-atlassian/workspace-map.md, and add .miro-atlassian/ to .gitignore. If there is no project folder (Claude.ai), skip local files and give me one line to paste into Project instructions: "Workspace map: Confluence page <id> <url>. Read it before searching Confluence or Miro."
7. Report counts (pages, folders, templates, boards, frames) and any diagram-target rows I should fill. Then stop. Do not draw a diagram until I ask.
```

On Claude.ai, paste the "Workspace map: …" line it gives you into the project instructions.

## What to say next

```text
Draw a use case diagram for a customer uploading evidence and a reviewer accepting it.
```

```text
Draw a sequence diagram for closing a remediation issue after a retest.
```

```text
Draw a context data flow diagram for that same evidence upload, and mark the trust boundary.
```

```text
Publish the sequence diagram to the Sequence Diagrams page.
```

```text
Where is the workspace map?
```

```text
Resync the workspace map.
```

| Skill | Use it when you want |
|---|---|
| [`workspace-map`](skills/workspace-map/SKILL.md) | The index built, refreshed, or a page or frame found by name. |
| [`miro-use-case-diagram`](skills/miro-use-case-diagram/SKILL.md) | Who uses the system, and for which goals. Actors, boundary, «include» and «extend». |
| [`miro-sequence-diagram`](skills/miro-sequence-diagram/SKILL.md) | One scenario in order. Lifelines, messages, activations, fragments. |
| [`miro-data-flow-diagram`](skills/miro-data-flow-diagram/SKILL.md) | Where data comes from, what changes it, where it is kept. Context or level 1, with trust boundaries. |
| [`miro-to-confluence`](skills/miro-to-confluence/SKILL.md) | That frame on a Confluence page as a PNG plus a short description. |

## Publishing the picture

Miro's connector does not export a frame as PNG. On Cursor and Claude Code the publish skill runs `frame-to-png.mjs` (Node.js 20+). The first run installs the renderer under that skill; you do not run npm yourself. On Claude.ai, export the frame as PNG from Miro and attach it in the chat. The page gets that PNG and text. It does not embed the live board.

## Tools you can turn off

After the map exists, unused tools only add noise.

Keep: Miro `canvas_*`, `canvas_search`, `board_search_boards`. Atlassian `getConfluenceContent`, `updateConfluenceContent`, `createConfluenceContent`, `searchConfluence`, `discover`, `executeRead`, `executeWrite`.

Safe to turn off until you want them: Miro board, space, table, prototype, comment, and admin tools. Atlassian Jira, Loom, Teamwork Graph, people and portfolio tools, and `executeDestructive`.

## License

[MIT](LICENSE). Sources: [CREDITS.md](CREDITS.md). Contributors: [CONTRIBUTING.md](CONTRIBUTING.md).
