# First run

You do **not** create `miro-atlassian.config.yaml` or `.miro-atlassian/workspace-map.md` yourself. Those files are optional helpers. The agent fills them after you sign in to Miro and Confluence.

What you do: connect the two servers, add the skills, paste one prompt. The agent lists your sites, spaces, and boards, asks you to pick, and writes a **Workspace map** page in Confluence. Later chats read that page.

## 1. Sign in (once)

Both servers use a browser sign-in. Never paste an API token into chat.

| Where you work | How to connect |
|---|---|
| **Cursor** | Marketplace: Miro plugin and Atlassian plugin. Or add the two URLs below to `.cursor/mcp.json`. Sign in when Cursor prompts. |
| **Claude Code** | Terminal: `claude mcp add --transport http miro https://mcp.miro.com/` then the same for `atlassian` at `https://mcp.atlassian.com/v2/mcp`. Run `/mcp` and sign in to each. |
| **Claude.ai** (claude.com in the browser) | Settings → Connectors. Add Miro (`https://mcp.miro.com/`) and Atlassian (`https://mcp.atlassian.com/v2/mcp`) as remote connectors. Sign in to each. There is no `npx` here. |
| **Claude Desktop** | Settings → Connectors (or MCP). Add the same two remote URLs and sign in. |

URLs:

- Miro: `https://mcp.miro.com/`
- Atlassian: `https://mcp.atlassian.com/v2/mcp`

You are signed in when a new chat can list your Miro boards and your Confluence spaces. If a connector shows "needs auth", finish the browser flow and try the list again.

## 2. Add the skills (once)

Install **all five**, including `workspace-map`. The diagram skills read the map it builds.

### Cursor or Claude Code, with the skills CLI

```bash
npx skills add HuzaifaTanzeel/miro-atlassian-skills --skill '*'
```

This installs all five skills. It does not ask you to tick them one by one. It does ask which agents to install into: choose Cursor, Claude Code, or whichever it finds, then confirm. Add `-g` to install for every project.

In Claude Code, the same set is one plugin: `/plugin marketplace add HuzaifaTanzeel/miro-atlassian-skills`, then `/plugin install miro-atlassian-skills@miro-atlassian-skills`.

### Cursor or Claude Code, without npx

Copy each folder under `skills/` into the agent's skills directory. The folder name must stay the same, and `SKILL.md` must sit at the top of that folder.

| Agent | Project (this repo only) | All your projects |
|---|---|---|
| Cursor | `.cursor/skills/<name>/` | `~/.cursor/skills/<name>/` |
| Claude Code | `.claude/skills/<name>/` | `~/.claude/skills/<name>/` |

Example: copy `skills/workspace-map/` to `.claude/skills/workspace-map/`. Repeat for the other four folders.

### Claude.ai (no npx, no project folder)

1. Download this repository (Code → Download ZIP on GitHub, or a clone).
2. For each folder inside `skills/` (`workspace-map`, `miro-use-case-diagram`, `miro-sequence-diagram`, `miro-data-flow-diagram`, `miro-to-confluence`): zip **the folder contents** so `SKILL.md` is at the root of the zip, not nested one level down.
3. In Claude.ai: Settings → Capabilities → Skills (wording varies) → add a custom skill → upload each zip.
4. Start a **Project** for this work if you have one, and turn the five skills on for that project.

Claude.ai has no disk, so the agent will **not** write `miro-atlassian.config.yaml`. That is expected. The Confluence **Workspace map** page is enough. After the first-run prompt, copy the one-line pointer the agent prints into the Project's custom instructions so the next chat finds the map without searching.

## 3. Paste this in a new chat

Use a chat that already has both connectors signed in and the skills loaded. You can send this even if you do not know your space key, cloud id, or board id.

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

The same text lives in `skills/workspace-map/assets/first-run-prompt.md` so you can copy it from the skill folder.

Answer the one question (space, board, parent page). The agent then creates the map. A typical first run is a few Confluence calls and one Miro overview per board.

## 4. Draw, then publish

```text
Draw a use case diagram for the expense claims service: employees submit and track claims, approvers approve or ask for more info, sign-in goes through our identity provider.
```

```text
Publish that frame to Confluence. Use the diagram target in the workspace map, or ask me which page.
```

## Publishing when there is no Node and no shell

`miro-to-confluence` normally runs a small Node script, then a `curl` upload. **Cursor** and **Claude Code** can do that (Node 20+, see [install.md](install.md)).

**Claude.ai** cannot run `npx` or `curl`. Drawing on Miro still works. To put the picture on Confluence:

1. In Miro, open the frame → Export image (PNG) of that frame.
2. Attach the PNG in the Claude chat.
3. Ask: `Publish the attached PNG of frame "[UC] …" to the page named in the workspace map, with the usual description.`

The agent uploads the file you attached (if the host gives it a path) or writes the description and tells you the exact attachment filename to add on the Confluence page by hand.

If you publish often, use Cursor or Claude Code for that step only. The map page is shared, so the same frames and pages show up in every client.

## If something is missing

| Symptom | What to do |
|---|---|
| Agent cannot list boards or spaces | The connector is not signed in. Open the MCP / Connectors panel and finish OAuth. |
| Agent asks you to paste a cloud id or token | Refuse. Cloud id comes from `getAccessibleAtlassianResources`. Tokens never go in chat. |
| Next Claude.ai chat cannot find the map | Paste the "Workspace map:" line into Project instructions, or say `Read the Confluence page titled Workspace map in space KEY`. |
| Skills do not trigger | Confirm each skill zip has `SKILL.md` at the root, and that `workspace-map` is installed next to the diagram skills. |
