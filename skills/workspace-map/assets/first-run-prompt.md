# First-run prompt

For people. Paste this into a new chat after Miro and Atlassian are signed in. You do not need a config file or a Workspace map page. The same prompt covers both cases: Cursor and Claude Code save the files; Claude.ai shows you the YAML to save yourself. The agent procedure is `references/bootstrap.md`.

```text
I am using these skills for the first time. Both the Miro and Atlassian connectors are signed in. I do not have a config file or a Workspace map yet.

1. Look through what I can already access. List my Atlassian sites. If there is more than one, ask which. Then list my Confluence spaces (name and key) and my Miro boards (name and link).
2. Ask me once, with numbered choices: which Confluence space, which Miro board (or all of them), and where the Workspace map page should go. Use the space home if I have no preference.
3. After I answer, explore that space and those boards. Read the page titles and how the pages are nested, and the frame titles on the boards. Do not read full page bodies.
4. Ask before you create anything. Then create a Confluence page titled "Workspace map" in the place I chose, and put that index on the page.
5. If you can write files in this project (Cursor or Claude Code), save them yourself:
   - miro-atlassian.config.yaml in the project root, filled in with the site, the space, the board, and the new page id
   - .miro-atlassian/workspace-map.md with the same index
   - add .miro-atlassian/ to .gitignore
6. If you cannot write files (Claude.ai), still create the Confluence page. Then show me the full miro-atlassian.config.yaml in chat so I can save it myself as miro-atlassian.config.yaml in the project root. Also give me one line to paste into Project instructions: "Workspace map: Confluence page <id> <url>. Read it before searching Confluence or Miro."
7. Tell me how many pages and frames you indexed, then stop. Do not draw a diagram until I ask.
```
