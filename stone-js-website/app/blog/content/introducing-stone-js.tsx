import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Architecture } from '../components/Architecture'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'introducing-stone-js'

/**
 * Blog: Introducing Stone.js (the launch article, the Continuum thesis).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class IntroducingStoneJs implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          Most frameworks treat an application as an object: a thing bound to a runtime, wired to HTTP,
          to a server, to one place it can live. Change the place and you rewrite the thing. Stone.js
          starts from the opposite idea. An application is not an object. It is an <strong>act</strong>.
        </p>

        <h2>An application is an act</h2>
        <p>
          An act has a shape: <code>Application = Domain × Context → Resolution</code>. Your
          <strong> domain</strong> is what your software means: its rules, its entities, its use cases.
          The <strong>context</strong> is everything the domain does not control: the runtime, the
          protocol, the shape of the input and the output. The <strong>resolution</strong> is the
          concrete response produced when the two meet, once per event.
        </p>
        <p>
          The mistake the industry made was welding the domain to one context. Stone.js keeps them
          apart: you write the domain once, and the context applies to it, not the other way around.
        </p>

        <Architecture
          caption='You write the domain. Adapters supply the context. The two resolve, once per event.'
          nodes={[
            { label: 'Domain', sub: 'what it means, written once', tone: 'domain' },
            { label: 'Context', sub: 'runtime + protocol, from an adapter', tone: 'context' },
            { label: 'Resolution', sub: 'the response, per event', tone: 'store' }
          ]}
        />

        <h2>Write the domain once</h2>
        <p>
          A handler in Stone.js names no runtime. It does not know whether the request came over HTTP,
          from the CLI, from the browser, or from an AI agent. It reads a normalised intention and
          returns a value.
        </p>
        <Code file='app/TaskController.ts'>{`import { EventHandler, Get, Post } from '@stone-js/router'

@EventHandler('/tasks')
export class TaskController {
  constructor ({ tasks }) { this.tasks = tasks }

  @Get('/')
  list () { return this.tasks.all() }

  @Post('/')
  create (event) { return this.tasks.add(event.get('title')) }
}`}</Code>
        <p>
          There is no <code>req</code>, no <code>res</code>, no framework object tying this to a server.
          It is your domain, and nothing else.
        </p>

        <h2>The context collapses at run time</h2>
        <p>
          You add adapters to the manifest, one per platform, and they coexist: server, edge, browser,
          agents, stacked on the same domain. Nothing is chosen yet. When the app <em>runs</em>,
          Stone.js resolves exactly one, the contextual collapse. Deploy the same artifact to Node and
          it collapses to the Node adapter; deploy it to Lambda and it collapses to the Lambda one. The
          domain never changes.
        </p>
        <p>
          That is what "build once, deploy anywhere" means when it is mechanical rather than marketing:
          one codebase, every runtime the industry has, and the ones it invents next arrive as a package
          someone writes, not a release you wait for.
        </p>

        <h2>Where to start</h2>
        <p>
          Read the <StoneLink to='/docs'>documentation</StoneLink>, which doubles as a short course in
          architecture, or scaffold a working app in one command from the
          <StoneLink to='/starters'> starters</StoneLink>. This blog will keep showing real cloud-native
          problems solved end to end, each with a diagram, the modules that carry it, and a starter you
          can run today.
        </p>
      </ArticleLayout>
    )
  }
}
