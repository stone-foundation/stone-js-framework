import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/openapi'

/**
 * Extensions: OpenAPI.
 */
@Page(PATH, { layout: 'docs' })
export class OpenApi implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'OpenAPI',
      description: 'Derive a public OpenAPI contract from the schemas you already write, instead of maintaining a second document by hand.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='OpenAPI' />
        <Lead>
          A public API deserves a public contract, but a contract maintained by hand drifts from the
          code the day after it is written. <code>@stone-js/openapi</code> derives the document from the
          schemas your validation and resources already define, so it stays true by construction.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/openapi`}</Code>

        <H2>Derive, do not duplicate</H2>
        <Principle
          principle={
            <p>
              Two descriptions of the same API, the code and a hand-written spec, cannot stay in sync.
              Keep one description, the code, and generate the other from it. The contract becomes a
              view of the implementation, not a parallel artifact.
            </p>
          }
          incarnation={
            <p>
              <code>OpenApiGenerator</code> builds a valid OpenAPI document from your app: the info
              block, servers, and the paths and schemas taken from your routes, validation and
              resources. Serve it at a URL and point any tool at it.
            </p>
          }
        />
        <Code file='app/openapi.ts'>{`import { OpenApiGenerator } from '@stone-js/openapi'

export const spec = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0' })
  .addServer('https://api.example.com')
  .generate()   // a valid OpenAPI document`}</Code>

        <H2>Serving it, with Swagger UI</H2>
        <p>
          Expose the document from a route for tools and machines, and serve a ready-made Swagger UI
          for humans, <code>swaggerUiHtml</code> renders the interactive explorer against your spec, no
          separate docs site to run.
        </p>
        <Code file='app/Docs.ts'>{`import { swaggerUiHtml } from '@stone-js/openapi'
import { htmlHttpResponse } from '@stone-js/http-core'

@Get('/openapi.json')
spec () { return spec }                                  // the raw document

@Get('/docs')
ui () { return htmlHttpResponse(swaggerUiHtml('/openapi.json')) }  // interactive explorer`}</Code>

        <H3>Schemas to JSON Schema</H3>
        <p>
          Under the hood <code>toJsonSchema</code> converts your validation schemas (Zod and other
          Standard Schemas) into the JSON Schema the document embeds, which is why the contract stays a
          faithful view of what you actually validate.
        </p>
        <Aphorism>You wrote the schema for validation. The contract is a view of it, not a second copy.</Aphorism>

        <Callout kind='future' title='The contract agents read too'>
          The same document that documents your API for humans describes it for machines. Paired with
          the MCP adapter, an agent can discover and call your endpoints from the contract you already
          generate.
        </Callout>

        <SeeAlso links={[
          { title: 'Resources', path: '/docs/extensions/resources' },
          { title: 'Validation', path: '/docs/extensions/validation' },
          { title: 'MCP (agents)', path: '/docs/adapters/mcp' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
