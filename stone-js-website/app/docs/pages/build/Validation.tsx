import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/build/validation'

const DECL = `
import { z } from 'zod'
import { validate } from '@stone-js/validation'
import { EventHandler, Post } from '@stone-js/router'

const NewTask = z.object({ title: z.string().min(1).max(120) })

@EventHandler('/tasks')
export class Tasks {
  @Post('/', { middleware: [validate({ body: NewTask })] })
  create (event) {
    // reaches here only if the body already matched NewTask
    return this.tasks.add(event.get('body'))
  }
}
`

const IMP = `
import { z } from 'zod'
import { validateEvent } from '@stone-js/validation'

const NewTask = z.object({ title: z.string().min(1).max(120) })

const create = (event) => {
  validateEvent(event, { body: NewTask })   // throws ValidationError (422) on mismatch
  return tasks.add(event.get('body'))
}
`

/**
 * Build: validation, one schema across contexts.
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
        <ArticleTop eyebrow='Build' title='Validation' />
        <Lead>
          Validation is where the entanglement of backend and frontend stops being a theory and
          starts saving you from double work. Write the shape of the data once; enforce it on the
          route that accepts it and on the form that produces it.
        </Lead>

        <H2>Validate an incoming event</H2>
        <Principle
          principle={
            <p>
              A boundary should reject malformed input before it reaches the domain, so the domain
              can assume its inputs are well-formed. Validation belongs at the edge, as a gate, not
              scattered through business logic.
            </p>
          }
          incarnation={
            <p>
              <code>validate(rules)</code> is middleware: it checks the event against a schema and
              rejects with a <code>422</code> before your method runs. The imperative twin,
              <code> validateEvent(event, rules)</code>, does the same inline. Both accept any
              Standard Schema or Zod-like schema.
            </p>
          }
        />
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H2>The same schema on the frontend</H2>
        <p>
          Because the schema is a plain value, the form that creates a task validates against the
          exact object the API enforces. Measure one side and the other is already correct.
        </p>
        <Code file='app/pages/NewTaskPage.tsx'>{`import { NewTask } from '../Tasks'

const result = NewTask.safeParse(formValues)
if (!result.success) setErrors(result.error.issues)`}</Code>

        <Aphorism>One schema. It guards the route and shapes the form. Drift becomes impossible.</Aphorism>

        <Callout kind='note' title='Standard Schema, not a lock-in'>
          Validation speaks the Standard Schema interface, so Zod is one option, not a requirement.
          Bring the schema library you already use; the middleware does not care which.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
