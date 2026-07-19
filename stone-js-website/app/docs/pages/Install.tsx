import { JSX } from 'react'
import { Code, CodeGroup } from '../components/Code'
import { siblings } from '../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, Pager } from '../components/content'

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
        <Code lang='bash' file='terminal'>{`node -v   # v20.x or newer`}</Code>
        <p>
          Managing several Node versions? <a href='https://github.com/nvm-sh/nvm' target='_blank' rel='noopener noreferrer'>nvm</a> makes
          switching painless.
        </p>

        <H2>Create a project</H2>
        <p>
          One command scaffolds a working app with your package manager of choice. It is interactive
          by default; the tabs below use each manager's <code>create</code> command.
        </p>
        <CodeGroup files={[
          { name: 'npm', lang: 'bash', code: 'npm create @stone-js@latest my-app\ncd my-app && npm install' },
          { name: 'pnpm', lang: 'bash', code: 'pnpm create @stone-js@latest my-app\ncd my-app && pnpm install' },
          { name: 'yarn', lang: 'bash', code: 'yarn create @stone-js my-app\ncd my-app && yarn' }
        ]} />
        <p>
          The scaffolder asks what you are building. Every answer is an adapter it adds to a working
          app; none of them locks the domain to a platform. Two shortcuts:
        </p>
        <PropsTable nameHeader='Shortcut' rows={[
          { name: '-- -y', type: 'flag', desc: 'Skip the prompts and accept sensible defaults (yarn/pnpm: -y).' },
          { name: 'create @stone-js .', type: 'in place', desc: 'Scaffold into the current directory instead of a new one.' }
        ]} />

        <H2>Run it</H2>
        <Code lang='bash' file='terminal'>{`npm run dev      # local dev server, hot reload
npm run build    # production build for your target
npm run preview  # serve the production build`}</Code>
        <p>
          <code>build</code> emits a single, self-contained artifact in <code>dist/</code>, no
          <code> node_modules</code> to ship, ready to drop onto any JavaScript runtime. Where it goes
          is the deploy step, which the next page is about.
        </p>

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
