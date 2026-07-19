import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters'

/**
 * Adapters: overview and catalog.
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Adapters overview',
      description: 'Every adapter that ships, what it targets, and the one pattern they all share: add a decorator or a blueprint, deploy the same domain.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Adapters' />
        <Lead>
          An adapter is a context: it captures a platform's cause, normalises it into an intention, and
          emits the result as a native effect. This section documents each first-party adapter A to Z.
          Adding one is always the same move, a decorator or a blueprint, and your domain never changes.
        </Lead>

        <H2>The shared pattern</H2>
        <p>
          Every adapter is enabled the same way: install the package, add its decorator to the manifest
          (or its blueprint imperatively), and deploy. Adapters stack, so several can coexist and the
          collapse to one happens at runtime.
        </p>
        <Aphorism>Install, decorate, deploy. The domain you wrote is already every one of these targets.</Aphorism>

        <H2>The catalog</H2>
        <PropsTable nameHeader='Adapter' rows={[
          { name: '@stone-js/node-http-adapter', type: '@NodeHttp', desc: 'A production HTTP server on Node.' },
          { name: '@stone-js/node-cli-adapter', type: '@NodeConsole', desc: 'Your handlers as CLI commands.' },
          { name: '@stone-js/fetch-adapter', type: '@Fetch', desc: 'One Web-standard adapter: Cloudflare, Deno, Bun, Vercel, Netlify.' },
          { name: '@stone-js/aws-lambda-http-adapter', type: '@AwsLambdaHttp', desc: 'HTTP events from API Gateway / Lambda.' },
          { name: '@stone-js/aws-lambda-adapter', type: '@AwsLambda', desc: 'Generic (non-HTTP) Lambda invocations.' },
          { name: '@stone-js/browser-adapter', type: '@Browser', desc: 'Run in the browser (SPA, hydration).' },
          { name: '@stone-js/mcp-adapter', type: '@Mcp', desc: 'Expose the domain as MCP tools for agents.' },
          { name: 'Mobile', type: 'coming', desc: 'React Native / Expo, planned.' }
        ]} />

        <H2>Choosing and stacking</H2>
        <p>
          Pick the adapter for where you deploy; stack several to keep the choice open until runtime.
          The pages that follow cover each one's install, decorator and blueprint, configuration keys,
          platform specifics and deployment.
        </p>

        <Callout kind='future' title='Not listed? Write it'>
          The core defines the boundary and nothing beyond it, so a runtime with no first-party adapter
          is one package away: capture, normalise, emit, register via a blueprint. See Write your own
          adapter.
        </Callout>

        <SeeAlso links={[
          { title: 'Adapters (concept)', path: '/docs/foundations/adapters' },
          { title: 'Write your own adapter', path: '/docs/extending/adapter' },
          { title: 'Superposition & collapse', path: '/docs/foundations/superposition' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
