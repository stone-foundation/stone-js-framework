import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/validation'

const DECL = `
import { z } from 'zod'
import { validate } from '@stone-js/validation'
import { EventHandler, Post } from '@stone-js/router'

export const NewTask = z.object({ title: z.string().min(1).max(120) })

@EventHandler('/tasks')
export class TaskController {
  @Post('/', { middleware: [validate({ body: NewTask })] })
  create (event) {
    return this.tasks.add(event.get('body'))   // reaches here only if body matched NewTask
  }
}
`

const IMP = `
import { z } from 'zod'
import { validateEvent } from '@stone-js/validation'

export const NewTask = z.object({ title: z.string().min(1).max(120) })

const create = ({ tasks }) => (event) => {
  validateEvent(event, { body: NewTask })       // throws ValidationError (422) on mismatch
  return tasks.add(event.get('body'))
}
`

/**
 * Extensions: validation.
 */
@Page(PATH, { layout: 'docs' })
export class Validation implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Validation',
      description: 'One schema, enforced on the API and the frontend form. Standard Schema and Zod supported out of the box.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Validation' />
        <Lead>
          Validation is where backend and frontend stop duplicating work. Write the shape of the data
          once; enforce it on the route that accepts it and on the form that produces it. Drift becomes
          impossible because there is only one schema.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/validation`}</Code>

        <H2>Validate at the boundary</H2>
        <Principle
          principle={
            <p>
              A boundary should reject malformed input before it reaches the domain, so the domain can
              assume its inputs are well-formed. Validation belongs at the edge, as a gate, not
              scattered through business logic.
            </p>
          }
          incarnation={
            <p>
              <code>validate(rules)</code> is middleware: it checks the event against a schema and
              rejects with a <code>422</code> before your handler runs. <code>validateEvent(event,
              rules)</code> does the same inline. Both accept any Standard Schema or Zod-like schema.
            </p>
          }
        />
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H2>The same schema on the frontend</H2>
        <p>
          Because the schema is a plain value, the form that creates a task validates against the exact
          object the API enforces.
        </p>
        <Code file='app/pages/NewTaskPage.tsx' lang='tsx'>{`import { NewTask } from '../Tasks'

const result = NewTask.safeParse(formValues)
if (!result.success) setErrors(result.error.issues)`}</Code>
        <Aphorism>One schema. It guards the route and shapes the form. They can never disagree.</Aphorism>

        <H3>Rules and sources</H3>
        <p>
          Rules are a map from a source (<code>body</code>, <code>query</code>, <code>params</code>) to
          a schema, so one middleware can validate several parts of an event at once.
        </p>
        <Code file='app/Tasks.ts'>{`validate({
  params: z.object({ id: z.string().uuid() }),
  query: z.object({ page: z.coerce.number().default(1) }),
  body: NewTask
})`}</Code>

        <Callout kind='note' title='Standard Schema, not a lock-in'>
          Validation speaks the Standard Schema interface, so Zod is one option, not a requirement.
          Bring the schema library you already use; the middleware does not care which.
        </Callout>

        <SeeAlso links={[
          { title: 'Route middleware', path: '/docs/routing/middleware' },
          { title: 'Incoming event', path: '/docs/essentials/incoming-event' },
          { title: 'Resources', path: '/docs/extensions/resources' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
