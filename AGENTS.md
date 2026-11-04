# Working on this repository

This file is for people (and agents) editing the skills themselves. It is not loaded by users who install a skill.

- Skills live in `skills/<name>/SKILL.md`. The directory name and the `name` field must match.
- Frontmatter uses only portable keys: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. Claude.ai upload rejects others.
- Keep each `SKILL.md` under 500 lines. Long procedures go in `references/`.
- Text that more than one skill needs lives in `shared/`. Edit it there, then run `node scripts/sync-shared.mjs`. Never edit the copies under `skills/*/references/` by hand; the sync check fails if they drift.
- Do not hard-code a vendor tool name in `SKILL.md` prose without also listing it in that skill's `references/tool-map.md`.
- No real workspace data: no site URL, cloud id, page id, issue key, or board id from a real customer. Use `PROJ-123`, `page 111`, `uXjVExample=`. Run `node scripts/check-private.mjs` before a commit.
- Each skill's description names its own verbs. Do not add a description that overlaps another skill's triggers (see `CONTRIBUTING.md`).
