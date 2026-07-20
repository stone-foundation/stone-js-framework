import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Architecture } from '../components/Architecture'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'isomorphic-validation'

/**
 * Blog: One schema, validated on the backend and the form (@stone-js/validation).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class IsomorphicValidation implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          Almost every app validates the same data twice: once in the form, so the user gets fast
          feedback, and once in the API, because the form cannot be trusted. Two copies of the same
          rules, in two languages, maintained by two habits. They drift, and the drift is where the bugs
          live.
        </p>

        <h2>The two rulesets always diverge</h2>
        <p>
          Someone tightens the title to 120 characters on the server for a database column, and forgets
          the form. Someone adds a client-side check for a new field, and the API never learns about it.
          Each divergence is either a confusing rejection the user cannot see coming, or a bad row the
          API let through. The root cause is not carelessness: it is that there are two sources of truth
          for one fact.
        </p>

        <h2>Write the shape once</h2>
        <p>
          Because Stone.js runs one language across backend and frontend, the schema can be a single
          plain value that both sides import. <code>@stone-js/validation</code> enforces it at the API
          boundary with the <code>validate</code> middleware; the same schema shapes the form. There is
          only one description of the data, so the two can never disagree.
        </p>

        <Architecture
          caption='One schema, two consumers: the route that accepts the data and the form that produces it.'
          nodes={[
            { label: 'One schema', sub: 'Zod or Standard Schema', tone: 'domain' },
            { label: 'validate() at the API', sub: '422 before the handler', tone: 'context' },
            { label: 'safeParse() in the form', sub: 'the same rules, in the UI', tone: 'client' }
          ]}
        />

        <h2>Guard the route</h2>
        <p>
          <code>validate(rules)</code> is middleware. It checks the event against the schema and rejects
          malformed input with a <code>422</code> before your handler runs, so the handler can assume its
          input is already well-formed.
        </p>
        <Code file='app/Tasks.ts'>{`import { z } from 'zod'
import { validate } from '@stone-js/validation'
import { EventHandler, Post } from '@stone-js/router'

export const NewTask = z.object({ title: z.string().min(1).max(120) })

@EventHandler('/tasks')
export class TaskController {
  @Post('/', { middleware: [validate({ body: NewTask })] })
  create (event) {
    return this.tasks.add(event.get('body'))   // reaches here only if body matched NewTask
  }
}`}</Code>

        <h2>Reuse it in the form</h2>
        <p>
          The form imports the exact same <code>NewTask</code> and validates the values the user is
          typing. Because it is the same object the API enforces, a value the form accepts is a value the
          API accepts.
        </p>
        <Code file='app/pages/NewTaskPage.tsx' lang='tsx'>{`import { NewTask } from '../Tasks'

const result = NewTask.safeParse(formValues)
if (!result.success) setErrors(result.error.issues)`}</Code>

        <h2>A precise failure, for free</h2>
        <p>
          A failed check throws a <code>ValidationError</code> the kernel maps to a <code>422</code> with
          the issues attached, so clients receive a structured error and you write no plumbing. Rules are
          a map from a source (<code>body</code>, <code>query</code>, <code>params</code>) to a schema, so
          one middleware can validate several parts of an event at once.
        </p>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>Drift is impossible.</strong> There is one schema, not two, so the form and the API cannot disagree about what is valid.</li>
          <li><strong>No lock-in.</strong> Validation speaks the Standard Schema interface, so Zod, Valibot and ArkType all work as they are.</li>
          <li><strong>The boundary stays a boundary.</strong> Malformed input is rejected at the edge, and the domain keeps its assumption that inputs are clean.</li>
        </ul>

        <p>
          The full API, including <code>validateEvent</code> for inline checks and the
          <code> Validator</code> service, is in
          <StoneLink to='/docs/extensions/validation'> Validation</StoneLink>. It also feeds
          <StoneLink to='/docs/extensions/openapi'> OpenAPI</StoneLink>: the same schemas become your
          public contract, so the document cannot drift from what you validate either.
        </p>
      </ArticleLayout>
    )
  }
}
