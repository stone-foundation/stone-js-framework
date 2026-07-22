# Stone.js Agent Skills

These are [Agent Skills](https://agentskills.io) for building Stone.js apps: portable folders, each
with a `SKILL.md` (name, description, instructions), that a skills-compatible agent (Claude Code,
Cursor, Copilot, Gemini CLI, OpenCode, Goose, …) loads on demand via progressive disclosure. They
are the framework's conventions, packaged so the agent applies them without you re-explaining them.

They pair with the `stone mcp` server: the skills tell the agent *how* to build with Stone.js, and
the `stone_*` MCP tools let it introspect *this* app (routes, commands, adapters, config) in real
time.

## Skills

| Skill | Use it when |
|---|---|
| `stone-js` | Writing, structuring, or reviewing any Stone.js app (the core model + conventions). |
| `stone-js-routing` | Adding or changing routes, controllers, or HTTP endpoints. |
| `stone-js-adapters` | Choosing where the app runs or adding a deploy target. |

## Install

Skills are read from your agent's skills directory. Copy (or symlink) the ones you want:

```bash
# Claude Code (project scope)
mkdir -p .claude/skills
cp -R node_modules/@stone-js/mcp-dev/skills/stone-js* .claude/skills/
```

Other agents use their own directory (`.cursor/skills`, `.github/skills`, …); see your agent's
docs. Each skill is a self-contained folder, so copying the folder is all that is needed.
