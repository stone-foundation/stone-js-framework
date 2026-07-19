import { JSX } from 'react'
import { Code } from '../components/Code'
import { siblings } from '../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Pager } from '../components/content'

const PATH = '/docs/start/install'

/**
 * Start here: install and scaffold.
 */
@Page(PATH, { layout: 'docs' })
export class Install implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Install & create',
      description: 'Scaffold a Stone.js application in one command, then run it locally.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Start here' title='Install & create' />
        <Lead>
          One command scaffolds a working application: a domain, a context to run it locally, and
          the build tooling wired up. You will write logic within minutes, and choose where it
          deploys later.
        </Lead>

        <H2>Requirements</H2>
        <p>
          Node.js 20 or newer, and a package manager. Stone.js is ESM-only and ships modern
          TypeScript. Nothing else is required to start; adapters are added per context, not upfront.
        </p>

        <H2>Create a project</H2>
        <Code lang='bash' file='terminal'>{`npm create @stone-js@latest my-app
cd my-app
npm install`}</Code>
        <p>
          The scaffolder asks what you are building. Every answer is an adapter it adds to a
          working app; none of them locks the domain to a platform.
        </p>

        <H2>Run it</H2>
        <Code lang='bash' file='terminal'>{`npm run dev      # local dev server, hot reload
npm run build    # production build for your target
npm run preview  # serve the production build`}</Code>

        <H3>Project shape</H3>
        <Code file='my-app/' lang='text'>{`app/            your domain: handlers, services, pages
  Application.ts  the app manifest (adapters live here)
assets/         styles and static files
stone.config.mjs  build and rendering config`}</Code>

        <Callout kind='note' title='Decorators, the modern way'>
          Stone.js uses TC39 stage-3 decorators with Symbol.metadata, not the legacy
          experimentalDecorators. The scaffold configures this for you. If you wire a project by
          hand, do not enable experimentalDecorators.
        </Callout>

        <Callout kind='future' title='You have not chosen a runtime'>
          Notice what did not happen: you never picked "a server project" or "an edge project".
          You made an application. Which context it collapses into is a decision you still hold,
          and can change without touching the domain.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
