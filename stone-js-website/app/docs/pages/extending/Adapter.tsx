import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extending/adapter'

/**
 * Extending: write your own adapter.
 */
@Page(PATH, { layout: 'docs' })
export class Adapter implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Write your own adapter',
      description: 'Open a new context: capture a platform cause, normalise it to an intention, emit the effect, and register it with a blueprint.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extending' title='Write your own adapter' />
        <Lead>
          When a runtime has no first-party adapter, you write one, and your existing domain runs there
          unchanged. An adapter is the integration dimension: it turns a platform's raw cause into an
          intention, runs the kernel, and turns the result back into a native effect.
        </Lead>

        <H2>What an adapter is</H2>
        <Principle
          principle={
            <p>
              An adapter is a translator at the boundary. Inbound, it turns a raw platform cause into a
              normalised intention. Outbound, it turns the domain's resolution into a native effect.
              Nothing inward needs to know the platform exists.
            </p>
          }
          incarnation={
            <p>
              It is the only long-lived thing in the app. It builds an <code>IncomingEvent</code> from
              the cause, hands it to the kernel (a fresh container per event), and maps the returned
              response back to the platform's response type.
            </p>
          }
        />

        <H2>The three responsibilities</H2>
        <ul>
          <li><strong>Capture</strong> the raw cause the platform delivers (a request, a message, an argv).</li>
          <li><strong>Normalise</strong> it into an <code>IncomingEvent</code>, the intention the kernel reads.</li>
          <li><strong>Emit</strong> the kernel's response as the platform's native effect.</li>
        </ul>
        <Aphorism>Capture the cause. Collapse it to an intention. Emit the effect. That is a context, in three verbs.</Aphorism>

        <H3>The shape of one</H3>
        <Code file='src/MyPlatformAdapter.ts'>{`export class MyPlatformAdapter {
  static create (blueprint) { return new MyPlatformAdapter(blueprint) }
  constructor (blueprint) { this.blueprint = blueprint }

  async run (kernel) {
    platform.on('request', async (raw) => {
      const event = this.toIncomingEvent(raw)     // 1. capture -> 2. normalise
      const response = await kernel.handle(event) // 3. resolve (fresh container per event)
      raw.respond(this.fromResponse(response))    // 4. emit the native effect
    })
  }
}`}</Code>

        <H2>Register it with a blueprint</H2>
        <p>
          Adapters graft onto the kernel through a blueprint, never the other way around. Publish a
          blueprint (and, if you like, a decorator), and your adapter stacks alongside the first-party
          ones exactly as they stack with each other.
        </p>
        <Code file='src/blueprint.ts'>{`export const myPlatformAdapterBlueprint = {
  stone: { adapters: [{ name: 'my-platform', adapter: MyPlatformAdapter, default: false }] }
}

// consumers add it like any other:
// defineStoneApp({ name: 'app' }, [routerBlueprint, myPlatformAdapterBlueprint])`}</Code>

        <Callout kind='future' title='This is how the ecosystem grows'>
          The core never grows to accommodate a new platform; an adapter does, at the edge, without a
          change to the kernel. The next runtime the industry invents is a package someone writes, not
          a release you wait for.
        </Callout>

        <SeeAlso links={[
          { title: 'Adapters (concept)', path: '/docs/foundations/adapters' },
          { title: 'Create a package or plugin', path: '/docs/extending/package' },
          { title: 'The pipeline', path: '/docs/primitives/pipeline' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
