---
name: workspace-map
description: Build, resync, or repair a shared index of Confluence pages and Miro frames on a Confluence page with a local cache. Use when the user asks to build, bootstrap, refresh, resync, or fix the workspace/diagram map, asks where a page or frame is, or another skill finds the map missing or stale. Not for reading page bodies or copying Jira issues into the map.
license: MIT
compatibility: Needs Atlassian MCP for Confluence; Miro MCP for Miro rows.
metadata:
  version: "0.1.0"
  suite: miro-atlassian-skills
---

# Workspace map

Shared index of one Confluence space and its Miro boards so later chats open pages and frames by id. Structure only: ids, titles, paths, parents, one-sentence descriptions, pointers. Never page bodies or Jira issue details.

## What the user can ask

| Request | Do |
|---|---|
| "Build the workspace map for space KEY" / first use | Read `references/bootstrap.md` |
| "Resync the map", "refresh since last week", pages added by hand | Read `references/delta-sync.md`; scope as named, default since `scanned` |
| "Where is the sequence diagram page?" | Read `references/map-contract.md`; answer from the map. If no match, read `references/resolution.md` |
| "This page moved", "that id is wrong" | Read `references/write-through.md`; fix the row |
| Another skill reports the map missing | Offer bootstrap once; if declined, let that skill continue with scoped searches |
| "Add this page as the home for data flow diagrams" | Update the Diagram targets table (`write-through.md`) |

Starting files: `assets/config.example.yaml`, `assets/map-template.md`. Tool names: `references/tool-map.md`. First-run prompt text: `assets/first-run-prompt.md`.

## Principles

1. **Map first, search second, explore last.** Search is scoped (space, parent, title). Tree/body reads only when asked or cheap paths fail.
2. **One write per task.** Batch all row changes into one map-page update.
3. **The live system wins.** Id works but row wrong → fix silently. Id gone → search inside the parent before asking.
4. **Write answers down.** Every "which one?" reply becomes an alias row.
5. **Small rows.** One sentence per description. Pointers (`page 123`, `frame 456`, `PROJ-12`), never copies.
6. **No Jira catalog.** Issue keys in `links` only; fetch live when the user asks about a ticket.
7. **Never block.** If the map cannot be read or written, say so in one line and continue the user's task.

## Bootstrap in one prompt

```text
Build the workspace map for Confluence space KEY and Miro board <board URL>.
```

Ask at most one question for anything missing, ask before creating the map page, report counts at the end.
