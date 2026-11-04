# Contributing

Thanks for adding to the suite. The goal is skills that work on the first run, so every change is judged by whether an agent following it literally produces the right result.

## Add a new skill

1. Create `skills/<name>/SKILL.md`. The name is lowercase, hyphenated, and starts with the product it acts on (`miro-`, `confluence-`, `jira-`).
2. Write a description that names the skill's own verbs and objects. Check the table below; if your trigger words overlap an existing skill, narrow them.
3. If the skill reads or writes Confluence pages or Miro frames, it uses the shared workspace map. Copy `shared/map-contract.md` into it by adding the skill to `scripts/sync-shared.mjs`. Do not create a second map.
4. Add at least one prompt to `evals/prompts.yaml` with the expected tool calls.
5. Add any source you quoted to `CREDITS.md` with its license. Only quote MIT, Apache-2.0, BSD, or CC BY text. Paraphrase and cite everything else.

| Skill | Triggers on |
|---|---|
| `miro-use-case-diagram` | draw / create / update a use case or actor diagram on Miro |
| `miro-sequence-diagram` | draw / create / update a sequence or interaction diagram on Miro |
| `miro-data-flow-diagram` | draw / create / update a data flow diagram, DFD, context diagram, or trust boundary diagram on Miro |
| `miro-to-confluence` | publish / copy / export / put a Miro diagram or frame on a Confluence page as an image |
| `workspace-map` | build / resync / repair the diagram map, or "where is" a page or frame |

## Add a new MCP server or vendor

Add rows to the `references/tool-map.md` of each affected skill. Do not change the resolution ladder. Add one eval prompt that runs on the new server.

## Add Jira

See `docs/architecture.md`, section "Plugging in Jira". In short: a `jira-*` skill reads the same map, uses the `links` column for issue keys, and never writes issue catalogs into the map.

## Before a pull request

```bash
node scripts/sync-shared.mjs --check
node scripts/check-private.mjs
npx skills add ./ --list
```

Run the eval prompts that touch your change on at least two agents (for example Cursor and Claude Code).
