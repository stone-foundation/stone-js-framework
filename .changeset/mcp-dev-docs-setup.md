---
"@stone-js/mcp-dev": patch
---

docs(mcp-dev): centre the setup on `npx stone mcp --init`

The README told you to start the server yourself, which does nothing useful for a stdio transport: the agent spawns its own child process and talks to it over that process's stdin/stdout, so a server launched in a terminal has no channel to the agent. Setup is now the single `--init` command, with the manual run documented only as a way to read the stderr logs while debugging.

Commands are shown as `npx stone …` since `@stone-js/cli` is a project dev dependency, and the alternative (a global install) is stated.

Also removes `stone_docs` from the documented tool list and from the Agent Skills: that tool does not exist, so an agent following the skills was calling a name the server never advertised.
