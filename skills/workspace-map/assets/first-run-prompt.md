# First-run prompt

Paste the block below into a new chat after Miro and Atlassian are signed in. You do not need a config file or a local map; the agent creates them.

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
