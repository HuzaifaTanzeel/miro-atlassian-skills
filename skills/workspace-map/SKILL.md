---
name: workspace-map
description: Build, resync, or repair a small shared index of Confluence pages and Miro frames (ids, paths, one-sentence descriptions) stored on a Confluence page with a local cache, so agents open pages and frames by id instead of searching. Use when the user asks to build, bootstrap, refresh, resync, or fix the workspace map or diagram map, asks where a page or frame is, or when another skill finds the map missing or stale. Does not read page bodies and does not copy Jira issues into the map.
license: MIT
compatibility: Needs the Atlassian MCP server (https://mcp.atlassian.com/v2/mcp) for Confluence. The Miro MCP server (https://mcp.miro.com/) is needed for the Miro rows. Writes one local cache file in the project.
metadata:
  version: "0.1.0"
  suite: miro-atlassian-skills
---

# Workspace map

Keep one small map of a Confluence space and its Miro boards so that every later chat can go straight to the right page or frame. The map is the shared memory of the suite: the diagram skills add frame rows, `miro-to-confluence` adds page links, and this skill builds and repairs it.

The map holds structure only: ids, titles, paths, parents, one-sentence descriptions, and pointers between pages, frames, and issue keys. It never holds page bodies or Jira issue details.

Files:

- `references/map-contract.md`: where the map lives, how any skill reads it cheaply, the format, and the write-back rule. Read this first.
- `references/bootstrap.md`: first build, no page bodies.
- `references/delta-sync.md`: when and how to pick up changes people made by hand.
- `references/write-through.md`: the map page body and the update procedure.
- `references/resolution.md`: turning a vague request into one id, and how to ask.
- `references/tool-map.md`: tool and operation names for each server.
- `assets/config.example.yaml`, `assets/map-template.md`: starting files.

## What the user can ask

| Request | Do |
|---|---|
| "Build the workspace map for space KEY" / first use | `bootstrap.md` |
| "Resync the map", "refresh since last week", "pages were added by hand" | `delta-sync.md`, scope as named, default since `scanned` |
| "Where is the sequence diagram page?" | Read the map (`map-contract.md`), answer from it. Search only if the map has no match (`resolution.md`). |
| "This page moved", "that id is wrong" | Fix the row (`write-through.md`). |
| Another skill reports the map missing | Offer bootstrap once. If declined, let that skill continue with scoped searches. |
| "Add this page as the home for data flow diagrams" | Update the Diagram targets table. |

## Principles

1. **Map first, search second, explore last.** Every lookup starts with the map. A search is scoped (space, parent, title). A tree walk or body read happens only when the user asks or the cheap paths fail.
2. **One write per task.** Batch all row changes from a task into one update of the map page.
3. **The live system wins.** If an id works but the row is wrong, fix the row silently. If an id is gone, search inside the parent before asking.
4. **Write it down when the user answers.** Every answer to "which one?" becomes an alias row.
5. **Small rows.** One sentence per description. Pointers (`page 123`, `frame 456`, `PROJ-12`), never copies.
6. **No Jira catalog.** Rows may carry an issue key in `links`. Fetch that issue only when the user asks about a ticket. A future `jira-*` skill reads the same keys (see the repository's `docs/architecture.md`).
7. **Never block.** If the map cannot be read or written, say so in one line and let the user's task continue.

## Bootstrap in one prompt

Users can start with:

```text
Build the workspace map for Confluence space KEY and Miro board <board URL>.
```

The skill asks at most one question (anything it cannot find), asks before creating the map page, and reports counts at the end.
