import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeTabs } from '../../components/Code'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/store'

const DECL = `
import { Store } from '@stone-js/store'

@Store({ name: 'tasks', state: { items: [], filter: 'all' } })
export class TasksStore {}
`

const IMP = `
import { defineStore } from '@stone-js/store'

export const TasksStore = defineStore({
  name: 'tasks',
  state: { items: [], filter: 'all' }
})
`

const READ = `
import { useContainer } from '@stone-js/use-react'

export function TaskList () {
  const store = useContainer().make('store.tasks')
  const items = store.select((state) => state.items)

  return <ul>{items.map((item) => <li key={item.id}>{item.title}</li>)}</ul>
}
`

const WRITE = `
// Anywhere the container reaches: a handler, a service, a page.
constructor ({ 'store.tasks': tasks }) {
  this.tasks = tasks
}

addTask (task) {
  this.tasks.setState((state) => ({ items: [...state.items, task] }))
}
`

/**
 * Extensions: the universal store.
 */
@Page(PATH, { layout: 'docs' })
export class Store implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Store: universal state',
      description: 'State that survives the server-to-browser boundary: per-request on the server, a singleton in the browser, hydrated from the render snapshot before the first paint.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Store: universal state' />
        <Lead>
          A store holds state your pages and services read. What makes this one worth having in the
          framework is not the API, which is small on purpose. It is that state has to cross the
          server-to-browser boundary, and crossing it correctly is not something a store can do from
          the outside.
        </Lead>

        <H2>Install and enable</H2>
        <Code file='terminal' lang='bash'>{'npm i @stone-js/store'}</Code>
        <p>
          Then declare a store, in either paradigm. The name is how it is resolved:
          {' '}<code>store.tasks</code> in the container.
        </p>
        <CodeTabs file='app/stores/TasksStore.ts' decl={DECL} imp={IMP} />

        <H2>A feature's store, as a class</H2>
        <p>
          A data declaration is state with no behaviour. A feature usually wants more: the
          {' '}<code>competition</code> module has its client, its service and its store, and the
          store's actions call the client. Write it as a class extending <code>StateStore</code> and
          the container builds it, so its constructor is auto-wired like any other class:
        </p>
        <CodeTabs
          file='app/competition/CompetitionStore.ts'
          decl={`import { FeatureStore, StateStore } from '@stone-js/store'

interface CompetitionState {
  list: Competition[]
  selected?: Competition
}

@FeatureStore('competition')
export class CompetitionStore extends StateStore<CompetitionState> {
  private readonly client: CompetitionClient

  constructor ({ competitionClient }: { competitionClient: CompetitionClient }) {
    super({ list: [] })
    this.client = competitionClient
  }

  async load (): Promise<void> {
    this.setState({ list: await this.client.list() })
  }

  select (id: string): void {
    this.setState((state) => ({ selected: state.list.find((c) => c.id === id) }))
  }
}`}
          imp={`import { defineStore, StateStore } from '@stone-js/store'

// The same class, registered imperatively: neither paradigm can do what the other cannot.
export const competitionStore = defineStore(CompetitionStore, { name: 'competition' })

// Or a factory, for full control with the container in hand.
export const liveStore = defineStore(
  (container) => StateStore.create({ scores: container.make('feed').initial() }),
  { name: 'live', isFactory: true }
)`}
        />
        <p>
          Everything a data store gets, a class store gets too: resolved under{' '}
          <code>store.competition</code>, hydrated from the snapshot before the first render, and
          per-request on the server by default. Declaring it is the whole setup, because the decorator
          carries the module's blueprint with it.
        </p>
        <Callout kind='note' title='Actions live with the state they move'>
          The alternative is a service that reaches into a bag of state it does not own. A class store
          keeps the transition next to the data and gives it the dependencies it needs, which is what
          makes <code>store.load()</code> from a page both testable and honest: the store is the only
          writer of its own state.
        </Callout>

        <H2>Reading and writing</H2>
        <p>
          The store is a container binding like any other, so a page reaches it through
          {' '}<code>useContainer()</code> and a service receives it in its constructor. There is no
          provider to wrap your tree in, and no import that only works on one side of the boundary.
        </p>
        <Code file='app/components/TaskList.tsx' lang='tsx'>{READ.trim()}</Code>
        <Code file='app/TaskService.ts'>{WRITE.trim()}</Code>

        <H2>Why this belongs to the framework</H2>
        <Principle
          principle={
            <p>
              State that outlives one runtime has to cross the boundary between them, and whoever owns
              the boundary owns the crossing. A store bolted on from outside cannot see the channel,
              so the crossing becomes glue written by hand in every application.
            </p>
          }
          incarnation={
            <p>
              Server rendering already serialises a page's data into the HTML: keyed per request,
              escaped against injection, read before anything renders. A solved channel. This store
              does not invent one, it <em>uses</em> that one, which is exactly what a store outside
              the framework cannot do, because it cannot write into a snapshot it does not know exists.
            </p>
          }
        />

        <H3>Hydration happens at registration, before the first render</H3>
        <p>
          The store is filled from the snapshot when it is registered in the container, not in an
          effect after the tree has mounted. That ordering is the difference between a page that
          renders its real state immediately and one that renders empty, then flashes. The flash is
          not a styling problem; it is what hydrating too late looks like.
        </p>

        <H3>One declaration, isolated per request on the server</H3>
        <p>
          A store that is a module-level singleton leaks state between requests during server
          rendering: one visitor's data reaching another's page. It is the single most common failure
          in universal state, and it is invisible until it is not.
        </p>
        <p>
          The kernel already creates an ephemeral container per event, so the store resolves
          {' '}<strong>per request on the server</strong> and as a{' '}<strong>singleton in the
          browser</strong>, from the same declaration. You do not choose, and you cannot get it wrong
          by forgetting which side you are on.
        </p>
        <Code file='app/stores/TasksStore.ts'>{`@Store({
  name: 'tasks',
  state: { items: [] },
  perRequest: true      // the default: fresh per request on the server, shared in the browser
})
export class TasksStore {}`}</Code>

        <H3>Serialisation is stated, not guessed</H3>
        <p>
          A snapshot carries JSON. A store holding a <code>Map</code>, a <code>Date</code> or a class
          instance therefore either says how it serialises, or is told that it cannot, because the
          alternative is <code>[object Object]</code> appearing after hydration, in a place far from
          the declaration that caused it. <code>dehydrate</code> and <code>hydrate</code> are where
          that conversion lives when the state is not plain data.
        </p>

        <H3>Selector equality, documented rather than folklore</H3>
        <p>
          A selector that builds a fresh object on every call compares unequal to itself, and a
          component subscribed to it re-renders forever. <code>watch</code> compares before it
          notifies, so the core does not amplify the mistake, and the rule stays written down here
          rather than passed around: select values, or memoise what you build.
        </p>
        <Aphorism>State crosses the boundary once, and arrives before the first paint.</Aphorism>

        <H2>The API</H2>
        <PropsTable nameHeader='Member' rows={[
          { name: 'getState()', type: '() => State', desc: 'The current state, as a copy.' },
          { name: 'setState(patch)', type: '(patch | fn) => void', desc: 'Merge a patch, or map the current state.' },
          { name: 'replaceState(state)', type: '(state) => void', desc: 'Replace it wholesale.' },
          { name: 'select(selector)', type: '(fn) => Value', desc: 'Read a value out of the state.' },
          { name: 'watch(selector, fn)', type: '(fn, fn) => stop', desc: 'React to one value changing; compares before notifying.' },
          { name: 'subscribe(fn)', type: '(fn) => stop', desc: 'React to any change.' },
          { name: 'reset()', type: '() => void', desc: 'Back to the declared initial state.' },
          { name: 'dehydrate() / hydrate(v)', type: '() => JSON / (JSON) => void', desc: 'How the state crosses the boundary when it is not plain data.' }
        ]} />

        <Callout kind='note' title='No view library required'>
          The store is agnostic: it holds state and notifies listeners, and knows nothing about React.
          A React binding is a thin layer on top of <code>watch</code>; the same store serves a view
          layer that is not React at all, which is the point of keeping it here rather than inside one.
        </Callout>

        <SeeAlso links={[
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' },
          { title: 'Data fetching', path: '/docs/frontend/data' },
          { title: 'Service container', path: '/docs/foundations/container' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
