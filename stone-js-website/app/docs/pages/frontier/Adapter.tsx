import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/frontier/adapter'

/**
 * Frontier: writing your own adapter.
 */
@Page(PATH, { layout: 'docs' })
export class Adapter implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Write your own adapter',
      description: 'An adapter opens a new dimension: it turns a platform cause into an intention and an intention back into a native effect. Here is how to write one.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontier' title='Write your own adapter' />
        <Lead>
          Every context you have seen so far, Node, the edge, the browser, agents, is an adapter.
          When a new runtime appears, you do not wait for the framework: you write the adapter, and
          your existing domain runs there. This is the extensibility the whole model was built for.
        </Lead>

        <H2>What an adapter is</H2>
        <Principle
          principle={
            <p>
              An adapter is a translator at the boundary. Inbound, it turns a raw platform cause
              into a normalised intention. Outbound, it turns the domain's resolution back into a
              native effect. Nothing else in the system needs to know the platform exists.
            </p>
          }
          incarnation={
            <p>
              In Stone.js the adapter is the integration dimension. It is long-lived (the only
              long-lived thing), it builds an <code>IncomingEvent</code> from the cause, hands it to
              the kernel, and maps the returned response back to the platform's response type.
            </p>
          }
        />

        <H2>The three responsibilities</H2>
        <ul>
          <li><strong>Capture</strong> the raw cause the platform delivers (a request object, a message, an argv).</li>
          <li><strong>Normalise</strong> it into an <code>IncomingEvent</code>, the intention your domain reads.</li>
          <li><strong>Emit</strong> the kernel's response as the platform's native effect.</li>
        </ul>

        <H3>The shape of one</H3>
        <p>
          An adapter reads its configuration from the Blueprint and runs the kernel per cause. The
          essence, with the platform specifics left as comments:
        </p>
        <Code file='app/my-adapter.ts'>{`export class MyPlatformAdapter {
  static create (blueprint) { return new MyPlatformAdapter(blueprint) }

  constructor (blueprint) { this.blueprint = blueprint }

  async run (kernel) {
    // 1. Capture: listen for the platform's raw cause
    platform.on('request', async (raw) => {
      // 2. Normalise: cause -> intention
      const event = this.toIncomingEvent(raw)

      // 3. Resolve: apply the domain via the kernel (fresh container per event)
      const response = await kernel.handle(event)

      // 4. Emit: resolution -> native effect
      raw.respond(this.fromResponse(response))
    })
  }
}`}</Code>

        <Aphorism>Capture the cause. Collapse it to an intention. Emit the effect. That is a context, in three verbs.</Aphorism>

        <H2>Register it as a blueprint</H2>
        <p>
          Adapters graft onto the kernel through a blueprint, never the other way around. Publish a
          decorator and a blueprint, and your adapter stacks alongside the first-party ones exactly
          like they stack with each other.
        </p>
        <Code file='app/my-adapter.blueprint.ts'>{`export const myPlatformAdapterBlueprint = {
  stone: { adapters: [{ name: 'my-platform', adapter: MyPlatformAdapter }] }
}`}</Code>

        <Callout kind='future' title='This is how the ecosystem grows'>
          The core never grows to accommodate a new platform; an adapter does, at the edge, without
          a change to the kernel. The next runtime the industry invents is a package someone writes,
          not a release you wait for. That is the point of a platform-agnostic core.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
