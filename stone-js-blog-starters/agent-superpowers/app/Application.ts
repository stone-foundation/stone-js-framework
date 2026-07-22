import { McpDev } from '@stone-js/mcp-dev'
import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * `@NodeHttp` serves the domain as usual. `@McpDev` adds the `stone mcp` command: it starts an MCP
 * server (stdio) that gives your coding agent the framework's knowledge AND this app's own structure
 * (routes, commands, config, providers), plus any tools you declare here. Run `stone dev` for you;
 * run `stone mcp` for the agent that helps you build.
 */
@McpDev({
  name: 'agent-superpowers',
  // A project-specific tool. Dev/knowledge helpers run in-process (they receive their args
  // directly and never touch the domain or the kernel), so this is a plain function.
  tools: [
    {
      name: 'project_notes',
      description: 'Return notes about this project for the coding agent.',
      handler: () => ({
        stack: 'Stone.js: one domain, HTTP + CLI, agent-ready',
        conventions: 'ESM, TS strict, decorators (TC39 stage-3), behavioral tests',
        tip: 'Call stone_routes and stone_app to see what this app declares.'
      })
    }
  ]
})
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'agent-superpowers', logger: { level: LogLevel.INFO } })
export class Application {}
