import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Diagram } from '../components/Diagram'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'openapi-from-your-schemas'

/**
 * Blog: A public API contract, generated from the schemas you already write (@stone-js/openapi).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class OpenApiFromYourSchemas implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          A public API deserves a public contract. So teams write an OpenAPI document, and the day after
          they write it, the code moves and the document does not. A hand-written spec is a promise you
          stop keeping almost immediately. The way out is to stop writing it by hand.
        </p>

        <h2>Two descriptions cannot stay in sync</h2>
        <p>
          The moment you have both the code and a separate spec, you have two descriptions of the same
          API and a full-time job keeping them equal. Nobody does that job forever. The spec grows stale,
          consumers trust it less, and eventually it describes an API that no longer exists.
        </p>
        <p>
          You already wrote the truth once: the validation schemas that decide what each route accepts.
          The contract should be a view of those, not a parallel artifact you maintain in parallel.
        </p>

        <Diagram
          caption='The schemas you validate against become the JSON Schema in the document. One source, generated, never a second copy to maintain.'
          nodes={[
            { label: 'Your schemas', sub: 'validation', kind: 'domain' },
            { label: 'toJsonSchema', sub: 'schema → JSON Schema', kind: 'context' },
            { label: 'OpenApiGenerator', sub: 'a valid OpenAPI doc', kind: 'context' },
            { label: '/openapi.json', sub: 'served from a route', kind: 'store' }
          ]}
        />

        <h2>Generate the document</h2>
        <p>
          <code>OpenApiGenerator</code> builds a valid OpenAPI document from your app: the info block, the
          servers, and the paths and schemas taken from your routes, validation and resources. Under the
          hood <code>toJsonSchema</code> converts your Zod and Standard Schemas into the JSON Schema the
          document embeds, which is why the contract stays a faithful view of what you actually validate.
        </p>
        <Code file='app/openapi.ts'>{`import { OpenApiGenerator } from '@stone-js/openapi'

export const spec = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0' })
  .addServer('https://api.example.com')
  .build()   // a valid OpenAPI document`}</Code>

        <h2>Serve it</h2>
        <p>
          Expose the built document from a route. Machines, tools and agents read it directly; point any
          OpenAPI viewer (Swagger UI, Scalar) at that URL for a human-friendly, interactive explorer, so
          there is no second document and no separate docs site to keep in sync.
        </p>
        <Code file='app/OpenApiController.ts'>{`import { EventHandler, Get } from '@stone-js/router'
import { spec } from './openapi'

@EventHandler('/openapi.json')
export class OpenApiController {
  @Get('/')
  document () { return spec }   // the generated OpenAPI document, as JSON
}`}</Code>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>The contract cannot drift.</strong> It is generated from the schemas that already gate your routes, so it is true by construction.</li>
          <li><strong>Zero second document.</strong> You maintain schemas, not a spec, and the spec follows for free on every build.</li>
          <li><strong>One contract, two readers.</strong> The same document that documents your API for humans describes it for machines and agents.</li>
        </ul>

        <p>
          The generator and JSON Schema conversion are covered in
          <StoneLink to='/docs/extensions/openapi'> OpenAPI</StoneLink>. Because the schemas come from
          <StoneLink to='/docs/extensions/validation'> Validation</StoneLink>, the same objects that
          reject a bad request are the ones that describe a good one. Paired with the
          <StoneLink to='/docs/adapters/mcp'> MCP adapter</StoneLink>, an agent can even discover your
          endpoints from the contract you already generate.
        </p>
      </ArticleLayout>
    )
  }
}
