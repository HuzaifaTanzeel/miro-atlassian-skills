# Working on this repository

For people and agents editing the skills. Not loaded by users who install a skill.

- Skills live in `skills/<name>/SKILL.md`. Directory name and frontmatter `name` must match.
- Frontmatter: only `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
- Keep each `SKILL.md` short; long procedures go in `references/`, loaded at the step that needs them.
- Shared text lives in `shared/`. Edit there, then `node scripts/sync-shared.mjs`. Do not hand-edit skill copies.
- Vendor tool names in `SKILL.md` must also appear in that skill's `references/tool-map.md`.
- No real workspace data (site URL, cloud id, page id, issue key, board id). Use `PROJ-123`, `page 111`, `uXjVExample=`. Run `node scripts/check-private.mjs` before a commit.
- Each description's verbs must not overlap another skill (see `CONTRIBUTING.md`).
