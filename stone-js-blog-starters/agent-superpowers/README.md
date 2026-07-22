# Agent superpowers

A Stone.js starter for **giving your coding agent superpowers** with one command, `stone mcp`, the
recipe from [Give your coding agent Stone.js superpowers](https://stonejs.dev/blog/agent-superpowers).

## The idea

`@stone-js/mcp-dev` adds a `stone mcp` command that starts an MCP server (stdio). It serves your
coding agent three things at once:

- the **framework's knowledge** (`stone_search`, `stone_concept`, `stone_docs`, …),
- a read-only view of **this app** (`stone_routes`, `stone_app`, `stone_commands`, `stone_config`, …),
- and any **tools you declare** (here, `project_notes`).

```ts
@McpDev({ name: 'agent-superpowers', tools: [/* your tools */] })
@Routing()
@NodeHttp({ default: true })   // still a normal REST API
@StoneApp({ name: 'agent-superpowers' })
export class Application {}
```

`GET /tasks` and `POST /tasks` are ordinary handlers in `TaskController`. Because `stone mcp`
introspects the app, your agent can call `stone_routes` and immediately see them, no explanation
needed.

## Run it

As a REST API, for you:

```bash
npm install
npm run dev
curl localhost:<port>/tasks
```

As an MCP server, for your agent:

```bash
stone mcp --init   # writes/merges .mcp.json so the agent discovers the server
stone mcp          # start it (Ctrl+C to stop, like `stone dev`); logs go to stderr
```

Point your editor's agent at it and it will run `tools/list`, then query `stone_routes`,
`stone_app` and `project_notes` while it works.

## Agent Skills

`@stone-js/mcp-dev` also ships [Agent Skills](https://agentskills.io) (the framework's conventions
as `SKILL.md` folders). Copy the ones you want into your agent's skills directory:

```bash
mkdir -p .claude/skills
cp -R node_modules/@stone-js/mcp-dev/skills/stone-js* .claude/skills/
```

## Test

```bash
npm test
```
