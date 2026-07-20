import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/providers'

const DECL = `
import { Provider } from '@stone-js/core'

@Provider()
export class TasksProvider {
  constructor ({ container, blueprint }) {
    this.container = container
    this.blueprint = blueprint
  }

  // Bind services into the container.
  register () {
    this.container.singleton('tasks', () => new TaskService(this.container))
  }

  // Run setup that needs other services to exist first.
  async boot () {
    await this.container.resolve('tasks').warmUp()
  }
}
`

const IMP = `
import { defineServiceProvider } from '@stone-js/core'

const TasksProvider = ({ container }) => ({
  register () {
    container.singleton('tasks', () => new TaskService(container))
  },
  async boot () {
    await container.resolve('tasks').warmUp()
  }
})

export const providers = [defineServiceProvider(TasksProvider, {}, true)]
`

/**
 * Foundations: service providers.
 */
@Page(PATH, { layout: 'docs' })
export class Providers implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Service providers',
      description: 'Providers register services into the container and boot them in order: the seam every module plugs into, from adapters to your own code.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Service providers' />
        <Lead>
          A provider is how capability enters the application. It has two jobs: register bindings
          into the container, and then boot them once everything is registered. Every adapter and
          extension is, at heart, a provider, and so can your own modules be.
        </Lead>

        <H2>Register, then boot</H2>
        <Principle
          principle={
            <p>
              Wiring has two phases that must not be mixed: declaring what exists, and starting what
              has been declared. If a component boots before its dependencies are registered, order
              becomes fragile. Splitting the two makes assembly deterministic.
            </p>
          }
          incarnation={
            <p>
              A provider's <code>register()</code> only binds services; it must not resolve them. Once
              every provider has registered, the kernel calls each <code>boot()</code>, where
              resolving is safe because the whole graph now exists. An optional
              <code> mustSkip()</code> lets a provider opt out of a context it does not apply to.
            </p>
          }
        />
        <CodeTabs file='app/TasksProvider.ts' decl={DECL} imp={IMP} />
        <Aphorism>register() says what exists. boot() starts it. Never resolve in register().</Aphorism>

        <H2>Providers forbid the function form</H2>
        <p>
          A provider always needs the container, to register into it. The plain function form never
          receives the container, so providers must be a class or a factory. This is the one place
          the three forms are deliberately restricted, and the restriction follows directly from what
          a provider is for.
        </p>

        <Callout kind='future' title='This is how the ecosystem attaches'>
          Adapters and extensions ship providers. When you stack <code>@NodeHttp()</code> or add
          <code> @stone-js/auth</code>, you are adding providers that register their services and boot
          them, through the same seam your own providers use. The core needs no knowledge of any of
          them.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
