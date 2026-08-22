import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/mcp'

/**
 * Extensions: the MCP dev server (@stone-js/mcp-dev).
 */
@Page(PATH, { layout: 'docs' })
export class Mcp implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'MCP dev server',
      description: 'One command, `stone mcp`, serves the framework’s knowledge, your app’s structure, and your own tools to a coding agent over MCP.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='MCP dev server' />
        <Lead>
          A coding agent is only as good as its context. <code>@stone-js/mcp-dev</code> gives it three
          things through one command, <code>stone mcp</code>: the framework’s knowledge, a read-only
          view of <em>this</em> app, and any tools you add. The MCP SDK owns the protocol and runs the
          handlers in-process, so these dev helpers never touch your domain or the kernel.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i -D @stone-js/mcp-dev`}</Code>

        <H2>Nothing to declare</H2>
        <p>
          Installing it is the setup. This is dev tooling, so the CLI auto-discovers its plugin from
          your devDependencies and that plugin registers <code>stone mcp</code>. There is
          {' '}<strong>nothing to add to <code>app/</code></strong>: no decorator, no blueprint. A
          development tool in an application's module graph would make a production build depend on a
          package the application does not need, for a feature nobody uses in production.
        </p>
        <p>
          Configure it where the build is configured, if you want to:
        </p>
        <Code file='stone.config.mjs' lang='js'>{`import { defineBuilderConfig } from '@stone-js/cli'

export default defineBuilderConfig({
  mcpDev: {
    name: 'my-app',        // the server name your agent sees
    tools: [myOwnTool],    // your own tools, defined outside app/
    publishContext: true   // default outside production
  }
})`}</Code>

        <H2>Register it for your agent</H2>
        <p>
          One command writes <code>.mcp.json</code> for you. It creates or merges the entry and never
          clobbers your own config, so a coding agent (Claude Code, Cursor, Claude Desktop, …)
          discovers the server:
        </p>
        <Code file='terminal' lang='bash'>{`npx stone mcp --init`}</Code>
        <p>
          That is the whole setup. <strong>You never start the server yourself.</strong> It speaks MCP
          over stdio, which means the transport is the child process's own standard input and output:
          your agent reads <code>.mcp.json</code>, spawns its own <code>stone mcp</code> process, and
          performs the handshake. A server you launch in your terminal has no channel to your agent and
          would simply sit there. Restart your agent session after the first <code>--init</code> so it
          picks the entry up.
        </p>

        <Callout kind='tip' title='Logs on stderr, protocol on stdout'>
          Every tool call is logged to <strong>stderr</strong> so you can watch the agent think, while
          stdout stays reserved for the JSON-RPC protocol. That single detail is what breaks most
          hand-rolled stdio MCP servers; here it is handled for you. To read those logs live, run
          <code>npx stone mcp</code> in a terminal: useful for debugging, never required.
        </Callout>

        <Callout kind='note' title='npx, or install the CLI globally'>
          The examples use <code>npx stone …</code> because <code>@stone-js/cli</code> is a dev
          dependency of your project, so the bare <code>stone</code> command only resolves if you also
          installed it globally (<code>npm i -g @stone-js/cli</code>). Inside a package script the
          prefix is unnecessary: <code>&quot;mcp&quot;: &quot;stone mcp --init&quot;</code> works as is.
        </Callout>

        <H2>Framework-knowledge tools</H2>
        <p>
          The agent queries the framework live instead of guessing from stale training data.
        </p>
        <PropsTable nameHeader='Tool' rows={[
          { name: 'stone_search', type: 'query', desc: 'Search concepts, modules, best-practices and gaps.' },
          { name: 'stone_concept', type: 'id?', desc: 'Explain a core concept (omit id to list them).' },
          { name: 'stone_modules', type: '()', desc: 'The ecosystem modules and what each does.' },
          { name: 'stone_best_practices', type: '()', desc: 'Conventions and anti-patterns, with rationale.' },
          { name: 'stone_gaps', type: '()', desc: 'What the framework does not (yet) provide.' },
          { name: 'stone_brief', type: '()', desc: 'The full agent brief (llms-full.txt).' }
        ]} />

        <H2>App-introspection tools</H2>
        <p>
          These read <em>your</em> app’s resolved blueprint, so the agent understands the app you are
          building, not just the framework. They are read-only and redact secret-looking config.
        </p>
        <PropsTable nameHeader='Tool' rows={[
          { name: 'stone_app', type: '()', desc: 'Name, env, active platform, and counts of routes/commands/providers/adapters.' },
          { name: 'stone_routes', type: '()', desc: 'The route tree: path, methods, name, handler, middleware.' },
          { name: 'stone_commands', type: '()', desc: 'The CLI commands (name, alias, args, description).' },
          { name: 'stone_adapters', type: '()', desc: 'Registered adapters and the active platform.' },
          { name: 'stone_providers', type: '()', desc: 'The service providers.' },
          { name: 'stone_kernel', type: '()', desc: 'The kernel pipeline: event handler, middleware, error handlers.' },
          { name: 'stone_key_routes', type: '()', desc: 'Key-routing definitions (event-bus / realtime).' },
          { name: 'stone_config', type: 'key?', desc: 'A resolved stone.* value by dotted key (secrets redacted).' },
          { name: 'stone_describes', type: '()', desc: 'Which application the answers describe, and how the server knows.' }
        ]} />
        <Aphorism>The agent reads the app the way the framework does: one blueprint, one source of truth.</Aphorism>

        <H3>Which application, exactly</H3>
        <p>
          <code>stone mcp</code> is a console command, so a blueprint it resolves itself is the one a
          {' '}<strong>console</strong> boot produces: its adapters, its response type and every
          platform-conditional contribution belong to a different application than the one you run
          under <code>stone dev</code>. Answering from it without saying so is how an agent ends up
          confidently describing an app that does not exist.
        </p>
        <p>
          So the running application publishes its own truth, and the <strong>build</strong> arranges
          it, not your application. Introspection is a development concern: this package ships a CLI
          plugin, the CLI auto-discovers it from your direct dependencies, and on a development build
          it injects a hook that writes the resolved configuration to
          {' '}<code>.stone/app-context.json</code>. Your app never imports this module, and a
          production build carries none of it.
        </p>
        <Code file='terminal' lang='bash'>{'npm i -D @stone-js/mcp-dev'}</Code>
        <p>
          Run <code>stone dev</code> once and the agent sees the real thing: the platform you actually
          run, your adapters, your resolved config. Until then the server answers from its own boot and
          names, through <code>stone_describes</code>, which of its answers not to trust. Opt out with
          {' '}<code>mcpDev: {'{'} publishContext: false {'}'}</code>, which generates nothing at all
          rather than shipping code that decides not to run.
        </p>
        <Callout kind='future' title='A file, not a dev endpoint'>
          The Blueprint is the setup dimension: assembled once before the first event, then read. So
          publishing it at boot is not a snapshot of something moving, it <em>is</em> the value, which
          means no port to discover, no route added to your application, no token to protect, and it
          works for a CLI or an edge context that has no HTTP surface at all. What genuinely moves at
          run time is a different question, and will get a different tool.
        </Callout>
        <p>
          Publishing is on outside production and off in it, since nothing there reads it. Override it
          either way with <code>mcpDev: {'{'} publishContext: true {'}'}</code>.
        </p>

        <H2>Your own tools</H2>
        <p>
          Add project-specific tools. They run in-process and receive their arguments directly. Set the
          server name, instructions, or the GitHub report tools under <code>stone.mcpDev</code>.
        </p>
        <Code file='app/Application.ts'>{`import { McpDev } from '@stone-js/mcp-dev'

@McpDev({
  name: 'my-app-dev',
  tools: [
    { name: 'db_schema', description: 'Return the current DB schema', handler: () => readSchema() }
  ]
})
@StoneApp({ name: 'my-app' })
export class Application {}`}</Code>

        <H2>Agent Skills</H2>
        <p>
          The package ships <a href='https://agentskills.io'>Agent Skills</a>
          (<code>stone-js</code>, <code>stone-js-routing</code>, <code>stone-js-adapters</code>):
          portable <code>SKILL.md</code> folders that teach a skills-compatible agent the framework’s
          conventions on demand. The tools introspect the app; the skills say how to build it. Copy the
          ones you want into your agent’s skills directory.
        </p>
        <Code file='terminal' lang='bash'>{`mkdir -p .claude/skills
cp -R node_modules/@stone-js/mcp-dev/skills/stone-js* .claude/skills/`}</Code>

        <Callout kind='future' title='Serving your domain to agents'>
          <code>@stone-js/mcp-dev</code> serves the agent that <em>builds</em> your app. Exposing your
          running domain to agents as tools (over MCP’s web transport) is a separate, upcoming
          capability, not a bespoke adapter: the same domain, one more context.
        </Callout>

        <SeeAlso links={[
          { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' },
          { title: 'Agents context', path: '/docs/contexts/agents' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
