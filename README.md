# miro-atlassian-skills

<p align="center">
  <img src="docs/img/banner-3-split.svg" alt="Miro board skills flowing to Atlassian Confluence" width="100%"/>
</p>

Draw a use case, sequence, or data-flow diagram on Miro, then put the picture on a Confluence page. Five [Agent Skills](https://agentskills.io) share one index of your pages and frames, so the agent opens them by id.

Works with Cursor, Claude Code, Claude.ai, and any other agent the [skills CLI](https://skills.sh) installs. Miro draws the diagram. Atlassian holds the index and the published page.

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills
```

![Use case example](docs/img/use-case-example.png)

## Install

Node.js 20 or newer. Install all five: `workspace-map`, `miro-use-case-diagram`, `miro-sequence-diagram`, `miro-data-flow-diagram`, `miro-to-confluence`. The diagram skills and publishing share `workspace-map`.

**This project**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -y
```

**Every project**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -g -y
```

**One agent.** Add `-a cursor`, `-a claude-code`, or both. This one is global, for Cursor and Claude Code:

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*' -g -a cursor -a claude-code -y
```

**One skill**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill miro-sequence-diagram -y
```

**List what the repo contains, without installing**

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --list
```

A project install lands in `.agents/skills/` (Cursor) or `.claude/skills/` (Claude Code). `-g` lands in `~/.cursor/skills/` or `~/.claude/skills/`.

Claude Code can also install the set as a plugin:

```text
/plugin marketplace add HuzaifaTanzeel/miro-atlassian-skills
/plugin install miro-atlassian-skills@miro-atlassian-skills
```

## Update, list, remove

`update` reinstalls only skills whose files changed. Use `-g` when that is how you installed.

```bash
npx skills check
npx skills update -y
```

```bash
npx skills list
npx skills list -g
```

```bash
npx skills remove HuzaifaTanzeel/miro-atlassian-skills -y
```

Global update or remove: add `-g`, for example `npx skills update -g -y`.

## Claude.ai

Claude.ai has no `npx`. Download one zip per skill and upload it. Each zip contains `<skill-name>/SKILL.md`. The zips are committed when a pull request into `main` is opened, or when a draft is marked ready. Merging that pull request replaces the files on `main`.

| Skill | Download |
|---|---|
| Workspace map | [workspace-map.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/workspace-map.zip) |
| Use case diagram | [miro-use-case-diagram.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-use-case-diagram.zip) |
| Sequence diagram | [miro-sequence-diagram.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-sequence-diagram.zip) |
| Data flow diagram | [miro-data-flow-diagram.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-data-flow-diagram.zip) |
| Publish to Confluence | [miro-to-confluence.zip](https://github.com/HuzaifaTanzeel/miro-atlassian-skills/raw/main/claude-upload/miro-to-confluence.zip) |

1. Settings → Capabilities. Turn on **Code execution and file creation**. On Team and Enterprise, an owner turns that on, and Skills, under Organization settings → Plugins & skills → Policy.
2. Customize → Skills → **+** → **Create skill** → **Upload a skill**.
3. Choose the zip and turn the skill on.

When a newer zip is on `main`, upload it again. Claude replaces the skill of the same name.

## Connect Miro and Atlassian

Sign in in the browser. Keep tokens out of files and chats.

| Connector | URL |
|---|---|
| Miro | `https://mcp.miro.com/` |
| Atlassian | `https://mcp.atlassian.com/v2/mcp` |

**Cursor.** Install both marketplace plugins, or save this as `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "miro": { "url": "https://mcp.miro.com/" },
    "atlassian": { "url": "https://mcp.atlassian.com/v2/mcp" }
  }
}
```

**Claude Code.** Then run `/mcp` and sign in to each.

```bash
claude mcp add --transport http miro https://mcp.miro.com/
claude mcp add --transport http atlassian https://mcp.atlassian.com/v2/mcp
```

**Claude.ai.** Settings → Connectors. Add both URLs and sign in.

## Set up the workspace

New chat, both connectors signed in. Paste this once. The agent creates the config and the map. On Claude.ai, paste the "Workspace map: …" line it returns into the project instructions.

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

## What to say next

```text
Draw a use case diagram for a customer uploading evidence and a reviewer accepting it.
Draw a sequence diagram for closing a remediation issue after a retest.
Draw a context data flow diagram for that same evidence upload, and mark the trust boundary.
Publish the sequence diagram to the Sequence Diagrams page.
Where is the workspace map?
Resync the workspace map.
```

| Skill | Use it when you want |
|---|---|
| [`workspace-map`](skills/workspace-map/SKILL.md) | The index built, refreshed, or a page or frame found by name. |
| [`miro-use-case-diagram`](skills/miro-use-case-diagram/SKILL.md) | Who uses the system, and for which goals. |
| [`miro-sequence-diagram`](skills/miro-sequence-diagram/SKILL.md) | One scenario in order: lifelines, messages, fragments. |
| [`miro-data-flow-diagram`](skills/miro-data-flow-diagram/SKILL.md) | Where data comes from, what changes it, where it is kept. |
| [`miro-to-confluence`](skills/miro-to-confluence/SKILL.md) | That frame on a Confluence page as a PNG plus a short description. |

Miro's connector does not export a frame as PNG. On Cursor and Claude Code the publish skill runs `frame-to-png.mjs` and installs its renderer on the first run. On Claude.ai, export the frame as PNG from Miro and attach it in the chat. The page gets that PNG and text.

After the map exists you can turn unused tools off. Keep Miro `canvas_*`, `canvas_search`, and `board_search_boards`, and Atlassian `getConfluenceContent`, `updateConfluenceContent`, `createConfluenceContent`, `searchConfluence`, `discover`, `executeRead`, and `executeWrite`.

## License

[MIT](LICENSE). Sources: [CREDITS.md](CREDITS.md). Contributors: [CONTRIBUTING.md](CONTRIBUTING.md).
