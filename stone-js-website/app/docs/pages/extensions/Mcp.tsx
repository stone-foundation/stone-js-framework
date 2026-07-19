import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/mcp'

/**
 * Extensions: MCP server & llms.txt (the framework's agent tooling).
 */
@Page(PATH, { layout: 'docs' })
export class Mcp implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'MCP server & llms.txt',
      description: 'Teach the coding agent that builds with Stone.js: an MCP server over the framework’s knowledge, and generated llms.txt.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='MCP server & llms.txt' />
        <Lead>
          There are two agents in the room. One consumes your app at runtime (the MCP adapter). The
          other builds <em>with</em> the framework, and needs to understand Stone.js itself.
          <code> @stone-js/mcp</code> serves that second agent: the framework's knowledge, as tools and
          as a machine-readable map.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/mcp`}</Code>

        <H2>Knowledge as tools</H2>
        <p>
          The package exposes the framework's concepts, modules and best practices as MCP tools, so a
          coding assistant queries them live instead of scanning packages or guessing from stale
          training data.
        </p>
        <Code file='app/mcp.ts'>{`import { stoneMcpTools, getConcept, searchKnowledge } from '@stone-js/mcp'

// Register the framework's tools with your MCP server.
export const tools = stoneMcpTools

// Or query the knowledge base directly.
const continuum = getConcept('continuum')
const hits = searchKnowledge('how do adapters collapse')`}</Code>
        <Aphorism>The coding agent gets the framework’s map, live, instead of guessing from stale training.</Aphorism>

        <H2>Generating llms.txt</H2>
        <p>
          The same knowledge produces the machine-readable docs map served at the site root. Generate
          the short index or the full text and serve them so any model can load the whole mental model
          at once.
        </p>
        <Code file='scripts/llms.ts'>{`import { generateLlmsTxt, generateLlmsFullTxt } from '@stone-js/mcp'

await writeFile('public/llms.txt', generateLlmsTxt())
await writeFile('public/llms-full.txt', generateLlmsFullTxt())`}</Code>

        <H3>What it provides</H3>
        <PropsTable nameHeader='Export' rows={[
          { name: 'stoneMcpTools', type: 'tools', desc: 'The framework’s MCP tools, ready to register with a server.' },
          { name: 'getConcept(id)', type: '(id) => concept', desc: 'Fetch a single concept from the knowledge base.' },
          { name: 'searchKnowledge(query)', type: '(q) => hits', desc: 'Search concepts, modules and practices.' },
          { name: 'generateLlmsTxt()', type: '() => string', desc: 'The short docs map (llms.txt).' },
          { name: 'generateLlmsFullTxt()', type: '() => string', desc: 'The full docs text (llms-full.txt).' }
        ]} />

        <Callout kind='future' title='Two packages, two agents'>
          <code>@stone-js/mcp-adapter</code> exposes <em>your</em> domain to agents at runtime.
          <code> @stone-js/mcp</code> exposes <em>the framework</em> to the agent building your app. Both
          treat agents as first-class, which is the whole agent-native bet.
        </Callout>

        <SeeAlso links={[
          { title: 'MCP adapter', path: '/docs/adapters/mcp' },
          { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' },
          { title: 'Agents context', path: '/docs/contexts/agents' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
