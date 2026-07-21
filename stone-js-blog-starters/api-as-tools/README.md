# API as agent tools

A Stone.js starter for **exposing the same domain to AI agents as MCP tools**, the recipe from
[Your API as MCP tools for agents](https://stonejs.dev/blog/api-as-agent-tools).

## The idea

An AI agent is just another kind of caller. Instead of building a second API for it, you stack one
adapter: `@Mcp()` maps your existing router handlers to MCP tools, so an agent calls the exact
domain your REST API serves.

```ts
@Mcp()          // expose the domain as MCP tools
@Routing()
@NodeHttp({ default: true })   // ...and still a REST API
@StoneApp({ name: 'api-as-tools' })
export class Application {}
```

`GET /tasks` and `POST /tasks` are ordinary handlers in `TaskController`. Over HTTP they answer
requests; under the MCP adapter the same two methods are listed to an agent as callable tools. You
write the handler once; the context reaches it.

## Run it

As a REST API:

```bash
npm install
npm run dev
curl localhost:<port>/tasks
```

As an MCP server (stdio) for a desktop agent: point your MCP client at the built entry; the agent
runs `tools/list` and sees `tasks` as callable tools. MCP speaks stdio by default (a locally
launched tool); switch the transport to `sse` for a remote HTTP server.

## Test

```bash
npm test
```
