import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions'

/**
 * Extensions: overview and catalog.
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Extensions overview',
      description: 'Opt-in capabilities that graft onto the kernel through blueprints: validation, auth, resources, OpenAPI, testing, agents, telemetry.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Extensions' />
        <Lead>
          Extensions are the opt-in capabilities that turn a kernel into a product: validation, auth,
          authorization, resources, OpenAPI, testing, agent tooling, telemetry. Each is a package that
          attaches through a blueprint and providers, never by the core reaching out to it.
        </Lead>

        <H2>How an extension attaches</H2>
        <p>
          The pattern is always the same: install the package, add its blueprint (or its decorators)
          to the manifest, and its services and middleware become available. The kernel needs no
          knowledge of any of them; they plug in, it does not plug out.
        </p>
        <Aphorism>The core stays small. Capability arrives as packages that graft on, and never the other way around.</Aphorism>

        <H2>The catalog</H2>
        <PropsTable nameHeader='Extension' rows={[
          { name: '@stone-js/validation', type: 'validation', desc: 'One schema, enforced on the API and the frontend form.' },
          { name: '@stone-js/auth', type: 'authentication', desc: 'Stateless JWT / OAuth, edge-native, no session.' },
          { name: '@stone-js/authz', type: 'authorization', desc: 'Isomorphic RBAC + ABAC: one rule set for API and UI.' },
          { name: '@stone-js/resources', type: 'output shaping', desc: 'Deliberate projections from model to public shape.' },
          { name: '@stone-js/openapi', type: 'contract', desc: 'A public OpenAPI document derived from your schemas.' },
          { name: '@stone-js/testing', type: 'testing', desc: 'Boot the real app in memory; dispatch real events.' },
          { name: '@stone-js/mcp', type: 'agents / docs', desc: 'The framework’s MCP tooling and llms.txt generation.' },
          { name: '@stone-js/telemetry', type: 'observability', desc: 'Spans and metrics with pluggable exporters.' }
        ]} />

        <Callout kind='note' title='Two kinds of package'>
          Adapters open a new context (where the app runs); extensions add a capability inside it (what
          the app can do). Both attach through blueprints; this section is the capabilities, the
          Adapters section is the contexts.
        </Callout>

        <SeeAlso links={[
          { title: 'Service providers', path: '/docs/di/providers' },
          { title: 'Marketplace', path: '/docs/ecosystem' },
          { title: 'Adapters', path: '/docs/adapters' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
