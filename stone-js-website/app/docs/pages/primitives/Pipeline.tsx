import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/primitives/pipeline'

/**
 * Primitives: pipeline.
 */
@Page(PATH, { layout: 'docs' })
export class Pipeline implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Pipeline',
      description: '@stone-js/pipeline: a small chain-of-responsibility that sends a value through ordered pipes. It runs the build phase and middleware alike.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Primitives' title='Pipeline' />
        <Lead>
          <code>@stone-js/pipeline</code> is the chain of responsibility, distilled: send a value
          through an ordered list of pipes, each free to transform it, pass it on, or stop. It is the
          single control-flow idea behind the build phase and the middleware chain.
        </Lead>

        <H2>Send, through, then</H2>
        <p>
          Create a pipeline, send a passable value <em>through</em> a list of pipes, and read the
          result with <em>then</em>. Each pipe receives the value and a <code>next</code>; call it to
          continue, or return early to short-circuit.
        </p>
        <Code file='example.ts'>{`import { Pipeline } from '@stone-js/pipeline'

const result = await Pipeline
  .create<number, number>()
  .send(1)
  .through([
    (n, next) => next(n + 1),         // 2
    (n, next) => next(n * 10),        // 20
    (n, next) => n > 15 ? 15 : next(n) // clamps, may short-circuit
  ])
  .then((n) => n)

// result === 15`}</Code>
        <Aphorism>A value goes in, flows through ordered pipes, and comes out. Every control flow in the framework is this.</Aphorism>

        <H2>The three forms of a pipe</H2>
        <p>
          A pipe can be a function, a class (with a <code>handle</code> method), or a factory, and can
          be referenced by alias. Guards like <code>isFunctionPipe</code> and <code>isClassPipe</code>
          classify them when a pipeline processes a mixed list.
        </p>
        <PropsTable nameHeader='Member' rows={[
          { name: 'Pipeline.create()', type: '<T, R>() => Pipeline', desc: 'Start a pipeline.' },
          { name: '.send(passable)', type: '(value) => this', desc: 'The value to push through.' },
          { name: '.through(pipes)', type: '(pipes) => this', desc: 'The ordered pipes.' },
          { name: '.via(method)', type: '(name) => this', desc: 'The method to call on class pipes (default handle).' },
          { name: '.then(fn)', type: '(fn) => R', desc: 'Finalise and read the result.' },
          { name: '.sync(...)', type: 'sync variant', desc: 'Run synchronously when no pipe is async.' }
        ]} />

        <H3>Why it matters</H3>
        <p>
          Middleware is a pipeline over events; the build phase is a pipeline over the manifest;
          adapters normalise causes with pipelines. Learn this one primitive and you have read the
          framework's control flow, from setup to response.
        </p>

        <Callout kind='note' title='Sync when you can'>
          The pipeline offers a synchronous path for chains with no async pipe, which avoids a
          microtask per step, worth it on hot, latency-sensitive paths like the edge.
        </Callout>

        <SeeAlso links={[
          { title: 'Middleware', path: '/docs/middleware' },
          { title: 'Blueprint middleware', path: '/docs/blueprint/middleware' },
          { title: 'Middleware & the pipeline (concept)', path: '/docs/foundations/middleware' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
