import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/resources'

/**
 * Extensions: resources.
 */
@Page(PATH, { layout: 'docs' })
export class Resources implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Resources',
      description: 'Declare what leaves your API as a schema: the same declaration projects the response, validates it before it is sent, and documents it in the published contract.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Resources' />
        <Lead>
          Your internal model and your public representation are not the same thing. A resource is the
          deliberate projection between them, declared as a <strong>schema</strong>, which is what lets
          one declaration project the response, hold it against its own promise before sending, and
          document it in the published contract.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/resources`}</Code>

        <H2>Declare what leaves</H2>
        <Principle
          principle={
            <p>
              A projection written as code answers "what does this endpoint return?" only to someone
              who reads it and trusts it. Nothing checks it, nothing documents it, and a field added to
              the model later leaks because a mapping was not updated.
            </p>
          }
          incarnation={
            <p>
              A resource declares a schema instead. The schema <em>is</em> the projection: what it does
              not describe is not exposed, and the same declaration validates the response before it is
              sent and gives <code>@stone-js/openapi</code> the exact output contract.
            </p>
          }
        />
        <Code file='app/resources/TaskResource.ts'>{`import { ApiResource, Resource } from '@stone-js/resources'
import { z } from 'zod'

@ApiResource('task')
export class TaskResource extends Resource<Task> {
  schema () {
    return z.object({
      id: z.number(),
      title: z.string(),
      done: z.boolean()
      // no ownerId, no internal flags: the schema is the contract, in both directions.
    })
  }
}`}</Code>
        <p>
          The imperative form declares exactly the same things, because neither paradigm may do
          something the other cannot:
        </p>
        <Code file='app/resources/task.ts'>{`export const taskResource = defineResource<Task>({
  schema: z.object({ id: z.number(), title: z.string(), done: z.boolean() })
})`}</Code>

        <H3>Completing the model first</H3>
        <p>
          A projection often needs more than the model it was handed: a relation to fetch, a label to
          translate, a total to compute. <code>data()</code> is that step, and it is asynchronous and
          resolved from the container, so it may reach any service. Whatever it returns is what the
          schema then validates.
        </p>
        <Code file='app/resources/TaskResource.ts'>{`constructor ({ comments }) {
  super()
  this.comments = comments
}

async data (task: Task) {
  return { ...task, commentCount: await this.comments.countFor(task.id) }
}`}</Code>
        <Callout kind='note' title='A resource is a service, which is why that constructor works'>
          <code>@ApiResource</code> declares three things at once: the class is a singleton service, so
          the container builds it and auto-wires whatever its constructor destructures; it is bound
          under <code>resource:task</code>, prefixed so a resource named after a domain concept never
          competes with your own <code>task</code> binding; and it activates the module, so declaring it
          is the whole setup. <code>@ValidationSchema</code> and <code>@Policy</code> work the same way,
          which is how a rule set or a policy can depend on a repository.
        </Callout>

        <H3>When your payloads travel in an envelope</H3>
        <p>
          An endpoint answering a page returns something like <code>{'{ items, meta }'}</code>, and
          <code> items</code> and <code>meta</code> are not fields of a model: shaping that object would
          publish the wrapper as if it were the thing. Name your envelope once and the payload inside it
          is what gets shaped, with counts and cursors left exactly as they were.
        </p>
        <Code file='stone.config.mjs'>{`blueprint.set('stone.resources.envelope', { payload: 'items' })
// or several words, if your API has more than one: { payload: ['items', 'data'] }`}</Code>
        <Callout kind='note' title='Undeclared by default, and deliberately'>
          Guessing which key holds the payload would quietly mangle a model that happens to have a
          field by that name. Without a declaration an envelope is treated as a model, and the contract
          check refuses the answer, which is the loud failure this module exists to produce.
        </Callout>

        <H3>Typing who is asking</H3>
        <p>
          Deciding what a caller may see is the most common reason two callers get different shapes, so a
          resource can say what its event and its principal are. The type parameters travel down into
          every signature you write, and nothing needs a cast:
        </p>
        <Code file='app/resources/MyAccountResource.ts'>{`class MyAccountResource extends Resource<Account, ResourceOutput, IncomingHttpEvent, Actor> {
  schema (context: ResourceContext<IncomingHttpEvent, Actor>) {
    return context.principal?.isSelf === true ? fullSchema : publicSchema   // typed, not unknown
  }

  async data (account: Account, context: ResourceContext<IncomingHttpEvent, Actor>) {
    return { ...account, email: context.principal?.actorId === account.id ? account.email : undefined }
  }
}`}</Code>
        <p>
          Both are <code>unknown</code> by default, so a resource that does not care writes nothing.
          <code> data()</code> and <code>fragments()</code> can be written as methods or as arrow
          properties; both forms are accepted deliberately, because the natural way to write an override
          in a class is a method, and a strict application must still be able to narrow the context.
        </p>

        <H3>The contract is protected, not merely published</H3>
        <p>
          Data that breaks the schema does not go out. A caller cannot detect a broken contract, and a
          client generated from it breaks on the field that was supposed to be there, so a breach raises
          {' '}<code>ResourceContractError</code> carrying which field failed.
        </p>
        <p>
          It fires on a genuine breach, not on a difference: a schema strips what it does not describe,
          so extra fields are simply not exposed. An application that would rather answer than be
          correct can say so, explicitly, with{' '}<code>onViolation: 'warn'</code>. The breach then
          reaches the log instead of the caller.
        </p>

        <H3>Fragments a caller may ask for</H3>
        <p>
          A named subset is a contract of its own, with its own schema, which is what makes exposing one
          safe. Declare them and a caller selects one with a query parameter; the contract names them
          too, so nothing is discovered by guessing.
        </p>
        <Code file='app/resources/TaskResource.ts'>{`fragments () {
  return { summary: z.object({ id: z.number(), title: z.string() }) }
}

// GET /tasks?view=summary`}</Code>
        <p>
          The parameter names are configuration, not convention: an API that already answers
          {' '}<code>?only=</code> keeps its vocabulary:
        </p>
        <Code file='app/Application.ts'>{`@Resources({ params: { fragment: 'only' }, onViolation: 'throw' })
export class Application {}`}</Code>

        <H2>Using it directly</H2>
        <p>
          Every projection is asynchronous, because completing a model may reach a service and pretending
          otherwise is how a promise ends up serialised as an empty object.
        </p>
        <Code file='app/Tasks.ts'>{`const one = await taskResource.item(task)
const many = await taskResource.collection(tasks)
const page = await taskResource.response(tasks, {}, { total: 120 })   // { data, meta }`}</Code>

        <H2>Declaring it instead of calling it</H2>
        <p>
          A handler that returns its domain model and lets the route say how it is shaped keeps the
          projection out of the business logic. The middleware applies it to whatever the handler
          returned, so the handler goes back to answering the question it was asked.
        </p>
        <Code file='app/TasksController.ts'>{`@Get('/', { resource: TaskResource })
list (): Task[] {
  return this.tasks.list()        // the model, whole; the route decides what leaves
}

@Returns(TaskResource)            // the same thing, with no route to hang it on
handle (): Task[] { … }`}</Code>
        <p>
          Sparse fieldsets still work from the request (<code>?fields=id,title</code>), and a resource
          registered by name is referred to as a string, so a route imports nothing:
        </p>
        <Code file='app/resources/TaskResource.ts'>{`@ApiResource('task')
export class TaskResource { … }

// @Get('/', { resource: 'task' })`}</Code>
        <Callout kind='note' title='Input is checked before output is shaped'>
          Validation runs at priority 5 and this at 4, so a request is rejected before a response is
          ever projected. The two modules do not know about each other: each owns its own key on the
          route, which is also why either works without the router at all.
        </Callout>

        <H3>The API</H3>
        <PropsTable nameHeader='Member' rows={[
          { name: 'schema(ctx)', type: 'contract', desc: 'What this resource exposes. Required: it is the projection, the validation and the documentation.' },
          { name: 'fragments(ctx)', type: 'contracts', desc: 'Named subsets a caller may select, each with its own schema.' },
          { name: 'data(model, ctx)', type: 'async', desc: 'Optional: complete or reshape the model before it meets the schema. May reach any service.' },
          { name: 'item / collection / response', type: 'async', desc: 'Project one, many, or into a { data, meta } envelope.' },
          { name: 'when / whenIncluded', type: 'conditional', desc: 'Drop a field unless a condition holds, or unless the caller asked for the relation.' }
        ]} />
        <Callout kind='note' title='What the context carries'>
          <code>fields</code> and <code>include</code> from the request, the <code>fragment</code> the
          caller selected, and the authenticated <code>principal</code>, because deciding what a caller
          may see is the most common reason two callers get different shapes, and a resource that cannot
          see who is asking has to be told by the handler.
        </Callout>

        <Callout kind='note' title='It reads schemas; it does not depend on a validator'>
          This module carries its own reader, so exposing data never requires enabling a validation
          module. The dialects it accepts are public specifications rather than one library's API:
          Standard Schema first (Zod, Valibot, ArkType and others), then <code>safeParse</code>,
          {' '}<code>parse</code> or <code>validate</code>. Supply your own <code>checker</code> to
          teach it a dialect of your own.
        </Callout>

        <Callout kind='future' title='One declaration, three consumers'>
          The schema serves the response that leaves your API, the OpenAPI contract derived from it, and
          the resource itself, which holds the response against it before sending. Written once, it
          cannot drift from itself, which is the failure mode of every hand-written contract.
        </Callout>

        <SeeAlso links={[
          { title: 'OpenAPI', path: '/docs/extensions/openapi' },
          { title: 'Validation', path: '/docs/extensions/validation' },
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
