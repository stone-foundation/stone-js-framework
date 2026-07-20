import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/paradigms'

const DECL = `
import { Service } from '@stone-js/core'
import { Get, EventHandler } from '@stone-js/router'

@Service({ alias: 'tasks' })
export class TaskService {
  list () { return [/* ... */] }
}

@EventHandler('/tasks')
export class TaskController {
  constructor ({ tasks }) { this.tasks = tasks }

  @Get('/')
  list () { return this.tasks.list() }
}
`

const IMP = `
import { defineService } from '@stone-js/core'
import { defineEventHandler, defineRoutes } from '@stone-js/router'

const TaskService = () => ({ list: () => [/* ... */] })

const TaskController = ({ tasks }) => ({ list: () => tasks.list() })

export const services = [defineService(TaskService, { alias: 'tasks' }, true)]
export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'), { path: '/tasks', method: 'GET' }]
])
`

/**
 * Foundations: the two paradigms.
 */
@Page(PATH, { layout: 'docs' })
export class Paradigms implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The two paradigms',
      description: 'Declarative decorators and imperative define* helpers, at strict parity: two ways to write the same app, producing the same Blueprint.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='The two paradigms' />
        <Lead>
          Stone.js supports two ways to write everything, declarative decorators and imperative
          <code> define*</code> helpers, and holds them at strict parity. Neither is a second-class
          citizen; neither can do something the other cannot. You choose the one that fits how you
          think.
        </Lead>

        <H2>Two syntaxes, one manifest</H2>
        <Principle
          principle={
            <p>
              A framework that favours one authoring style forces a whole team into it. If two styles
              compile to the exact same internal representation, the choice becomes ergonomic rather
              than architectural, and no capability is lost either way.
            </p>
          }
          incarnation={
            <p>
              A decorator writes <code>stone.*</code> keys by introspection; a <code>define*</code>
              meta-module writes the same keys explicitly. Both feed the one Blueprint. Downstream,
              the kernel cannot tell which you used, because there is nothing left to tell apart.
            </p>
          }
        />
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />
        <Aphorism>Decorators or define*. Superposed, until you choose. The Blueprint they produce is identical.</Aphorism>

        <H2>When each shines</H2>
        <ul>
          <li><strong>Declarative</strong>: classes, annotations, introspection. Reads well when the shape of the app is static and you like structure near the code it configures.</li>
          <li><strong>Imperative</strong>: plain values and <code>define*</code> calls. Shines for dynamic construction, conditional wiring, and factory-heavy or functional codebases.</li>
        </ul>
        <p>
          The switch at the top of this site is the same idea applied to the docs: pick a paradigm and
          every example follows you. Nothing about the framework changes; only the pen does.
        </p>

        <Callout kind='future' title='Decorators without the baggage'>
          The declarative side uses TC39 stage-3 decorators with <code>Symbol.metadata</code>, never
          the legacy experimental decorators and never reflect-metadata. That is why injection is by
          alias, not by type, and why the two paradigms can stay truly equivalent.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
