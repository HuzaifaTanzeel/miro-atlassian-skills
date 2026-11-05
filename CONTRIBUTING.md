# Contributing

Skills must work on the first run: an agent following `SKILL.md` literally should get the right result.

## Skill structure

1. Create `skills/<name>/SKILL.md`. Name is lowercase, hyphenated, and starts with the product (`miro-`, `confluence-`, `jira-`). Directory name must match the frontmatter `name`.
2. Description names this skill's own verbs. Do not overlap another skill's triggers (table below).
3. Shared text lives in `shared/` (canonical). Skills install standalone, so `node scripts/sync-shared.mjs` copies those files into each skill's `references/`. Add new skills to that script. Never edit the copies by hand.
4. Quote only MIT, Apache-2.0, BSD, or CC BY text; add sources to `CREDITS.md`.

| Skill | Triggers on |
|---|---|
| `miro-use-case-diagram` | draw / create / update a use case or actor diagram on Miro |
| `miro-sequence-diagram` | draw / create / update a sequence or interaction diagram on Miro |
| `miro-data-flow-diagram` | draw / create / update a data flow diagram, DFD, context diagram, or trust boundary diagram on Miro |
| `miro-to-confluence` | publish / copy / export / put a Miro diagram or frame on a Confluence page as an image |
| `workspace-map` | build / resync / repair the diagram map, or "where is" a page or frame |

A `jira-*` skill should read the same map, use the `links` column for issue keys, and never store issue catalogs in the map.

## Before a pull request

```bash
node scripts/sync-shared.mjs --check
node scripts/check-private.mjs
npx skills add ./ --list
```

Try the changed skill on at least two agents (for example Cursor and Claude Code).
