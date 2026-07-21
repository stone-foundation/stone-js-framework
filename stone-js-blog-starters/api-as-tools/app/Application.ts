import { Mcp } from '@stone-js/mcp-adapter'
import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * One domain, two contexts. `@NodeHttp` serves the handlers as a REST API; `@Mcp` exposes the very
 * same handlers to AI agents as MCP tools, with no change to a single handler. A tool call and an
 * HTTP request are two causes resolved by the same domain (see TaskController).
 */
@Mcp() // expose the domain as MCP tools
@Routing()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'api-as-tools', logger: { level: LogLevel.INFO } })
export class Application {}
