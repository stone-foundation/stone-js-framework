import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/forms'

/**
 * Foundations: the three forms.
 */
@Page(PATH, { layout: 'docs' })
export class Forms implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The three forms',
      description: 'Class, factory and function: three shapes any module can take. The function form never receives the container; providers forbid it.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='The three forms' />
        <Lead>
          Nearly everything in Stone.js, handlers, services, middleware, listeners, can be written in
          three shapes: a class, a factory, or a plain function. The three are interchangeable, with
          one deliberate rule about the container that follows from what each shape is.
        </Lead>

        <H2>Class, factory, function</H2>
        <Principle
          principle={
            <p>
              Teams and tasks differ: some reach for classes and structure, some for functions and
              composition. A framework that supports only one imposes a style. Supporting all three,
              equivalently, lets the code match the problem instead of the framework.
            </p>
          }
          incarnation={
            <p>
              The <strong>class</strong> form is instantiated and receives its bindings in the
              constructor. The <strong>factory</strong> is a function that receives the container and
              returns the working object. The <strong>function</strong> is the bare logic, and it
              receives no container.
            </p>
          }
        />
        <Code file='app/forms.ts'>{`// Class: bindings arrive in the constructor.
@Service({ alias: 'tasks' })
class TaskService { constructor ({ config }) { /* ... */ } }

// Factory: receives the container, returns the object.
const TaskService = ({ config }) => ({ list: () => [/* ... */] })

// Function: bare logic, no container. Great for pure handlers.
const ping = (event) => ({ pong: event.get('n', 1) })`}</Code>

        <H2>The one rule</H2>
        <Aphorism>The function form never receives the container. If you need dependencies, use a class or a factory.</Aphorism>
        <p>
          This is not an arbitrary limit; it is the definition. A plain function that took the
          container would just be a factory. So the function form is precisely the shape for logic
          that needs nothing injected, and it stays the simplest thing that can possibly work.
        </p>

        <H2>Where the rule bites</H2>
        <p>
          <strong>Providers</strong> always need the container, to register into it, so they forbid
          the function form: a provider is a class or a factory, never a plain function. Everywhere
          else, pick the form that fits, and switch freely as a piece of code grows from a pure
          function into something that needs a dependency.
        </p>

        <Callout kind='future' title='Forms and paradigms are orthogonal'>
          The two paradigms are about how you register (decorator vs <code>define*</code>); the three
          forms are about how you shape a module (class, factory, function). They combine freely: a
          factory registered declaratively, a class registered imperatively, whatever reads best.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
