<!-- gitnexus:start -->
# GitNexus — Code Intelligence (optional)

This project can be indexed by GitNexus. The GitNexus MCP tools — `gitnexus_impact`,
`gitnexus_query`, `gitnexus_context`, `gitnexus_detect_changes`, `gitnexus_rename` — are
useful for understanding code, assessing change impact, and navigating safely.

> If a GitNexus tool reports the index is missing or stale, run `npx gitnexus analyze` in
> the terminal first. The index (`.gitnexus`) is gitignored, so it may not exist locally.

## Recommended usage

- Before a non-trivial edit to a function/class/method, consider
  `gitnexus_impact({target: "symbolName", direction: "upstream"})` to see the blast radius,
  and surface HIGH/CRITICAL risk to the user.
- Prefer `gitnexus_rename` over find-and-replace for renames — it understands the call graph.
- Use `gitnexus_query({query: "concept"})` to find execution flows, and
  `gitnexus_context({name: "symbolName"})` for a symbol's callers and callees.
- `gitnexus_detect_changes()` before committing helps confirm the change scope.

These tools are aids, not gates — use them where they help. They are not a hard
precondition for every edit.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/TalentSia/context` | Codebase overview, check index freshness |
| `gitnexus://repo/TalentSia/processes` | All execution flows |
| `gitnexus://repo/TalentSia/process/{name}` | Step-by-step execution trace |

> Note: the per-topic `.claude/skills/gitnexus/*/SKILL.md` deep-dive files were removed
> from this repo. To restore the full skill set, `git checkout -- .claude/skills/gitnexus/`.

<!-- gitnexus:end -->
