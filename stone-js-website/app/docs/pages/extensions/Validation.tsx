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

        <H2>Enabling it</H2>
        <p>
          Enabled the way every Stone.js module is, with its decorator or with its blueprint. Either
          one registers the validation provider, so the validator is injectable and the route decorators have something to resolve.
        </p>
        <CodeTabs
          file='app/Application.ts'
          decl={`import { Validation } from '@stone-js/validation'
import { StoneApp } from '@stone-js/core'

@Validation()
@StoneApp({ name: 'my-app' })
export class Application {}`}
          imp={`import { defineStoneApp } from '@stone-js/core'
import { validationBlueprint } from '@stone-js/validation'

export const Application = defineStoneApp({ name: 'my-app' }, [validationBlueprint])`}
        />

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

        <H2>Declaring it where the route is</H2>
        <p>
          A route can say what it accepts, once, next to itself. The middleware reads that, validates
          before the handler runs, and publishes each <strong>parsed</strong> source in the event's
          metadata under a predictable name.
        </p>
        <Code file='app/TasksController.ts'>{`@Post('/tasks', { validation: CreateTaskSchema })   // one schema means the body
create (event: IncomingHttpEvent): Task {
  // The parsed value, not the raw one: a schema coerces and strips, and re-reading the raw body is
  // how an application validates one thing and uses another.
  const task = event.get<CreateTask>('validatedBody')
  return this.tasks.create(task)
}`}</Code>
        <p>
          <code>validatedBody</code>, <code>validatedQuery</code>, <code>validatedParams</code>: the
          name follows the source, so a handler needs no import and nothing to remember.
        </p>

        <H3>Without a router, and without the route</H3>
        <p>
          The same thing said on the handler, for a single-handler service, a CLI command or a browser
          event, anything with no route to hang it on. <code>@Validate</code> owns its own key, so the
          module works with a router and without one.
        </p>
        <Code file='app/CreateTask.ts'>{`@Validate({ body: CreateTaskSchema, query: ListQuerySchema })
handle (event: IncomingEvent): Task { … }`}</Code>

        <H3>Schemas as classes, registered by name</H3>
        <p>
          A schema that needs services (translated messages, a repository to check uniqueness against)
          is a class the container resolves, so its <code>rules()</code> can use what it was given.
          Register it once and refer to it by name from anywhere: the route stops importing schemas,
          and a shared query filter is declared in exactly one place.
        </p>
        <Code file='app/schemas/ListQuerySchema.ts'>{`@ValidationSchema('listQuery')
export class ListQuerySchema implements IValidationSchema {
  constructor ({ i18n }) { this.i18n = i18n }

  rules () {
    return { query: z.object({ page: z.coerce.number().default(1) }) }
  }
}

// Anywhere: @Get('/tasks', { validation: 'listQuery' }) or @Validate('listQuery')`}</Code>
        <Callout kind='note' title='Why rules() and not messages()'>
          A schema declares its rules, and its messages come from the schema library it already uses.
          One method keeps the contract discoverable: <code>@stone-js/openapi</code> reads
          {' '}<code>rules()</code> to publish the request shape, so the route stays the single
          description of itself and nothing is said twice.
        </Callout>

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

        <H3>Bring any schema</H3>
        <p>
          Validation speaks the Standard Schema interface, so Zod, Valibot, ArkType and others work as
          is. For a library that is not yet Standard Schema, adapt it explicitly with
          <code> fromZod</code> or <code>fromStandard</code>; the rest of your code stays the same.
        </p>
        <Code file='app/schemas.ts'>{`import { fromZod, fromStandard } from '@stone-js/validation'

const NewTask = fromZod(zodSchema)          // wrap a Zod schema
const Filter = fromStandard(anyStandard)    // wrap any Standard Schema`}</Code>

        <H3>The failure shape</H3>
        <p>
          A failed check throws a <code>ValidationError</code> the kernel maps to <code>422</code>, with
          the issues attached, so clients get a precise, structured error without you writing the
          plumbing. Need it inline instead of as middleware? <code>validateEvent</code> throws the same
          error; or resolve the <code>Validator</code> service to validate arbitrary values.
        </p>
        <Code file='app/Tasks.ts'>{`constructor ({ validator }) { this.validator = validator }

parse (input: unknown) {
  return this.validator.validate(input, NewTask)   // throws ValidationError (422) on mismatch
}`}</Code>

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
