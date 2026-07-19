import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/assets'

/**
 * Frontend: assets.
 */
@Page(PATH, { layout: 'docs' })
export class Assets implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Assets',
      description: 'Stylesheets, images and static files: the entry CSS, import aliases for component assets, and the public directory for verbatim files.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Assets' />
        <Lead>
          Three kinds of asset, three clear homes: one entry stylesheet that is linked for you,
          component-local assets imported through short aliases, and a public directory copied to the
          build root untouched.
        </Lead>

        <H2>The entry stylesheet</H2>
        <p>
          The main stylesheet is auto-linked into the document, so a single import point styles the
          whole app. Its path is a config key; the default is <code>/assets/css/index.css</code>.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`export default defineConfig({
  builder: { input: { mainCSS: '/assets/css/index.css' } }   // auto-linked
})`}</Code>

        <H2>Component assets via aliases</H2>
        <p>
          Import images and other assets in components through stable aliases instead of brittle
          relative paths. Each alias maps to a subfolder of the assets directory, resolved for both the
          client and the SSR build.
        </p>
        <Code file='app/pages/Logo.tsx' lang='tsx'>{`import mark from '@img/logo.svg'      // resolves to assets/img/logo.svg

export function Logo () {
  return <img src={mark} alt='Tasks' width={32} height={32} />
}`}</Code>

        <H2>The public directory</H2>
        <p>
          Files that must ship verbatim at the site root, <code>robots.txt</code>, <code>llms.txt</code>,
          a <code>CNAME</code>, favicons, go in <code>public/</code>. It is copied as-is to the build
          output; nothing processes it.
        </p>
        <PropsTable nameHeader='Location' rows={[
          { name: 'assets/css/index.css', type: 'entry CSS', desc: 'Auto-linked application stylesheet.' },
          { name: '@img, @fonts, ...', type: 'import aliases', desc: 'Component asset imports, mapped to assets/ subfolders.' },
          { name: 'public/', type: 'verbatim', desc: 'Copied to the build root untouched (robots.txt, llms.txt, favicons).' }
        ]} />

        <Callout kind='note' title='Import for hashing, public for fixed URLs'>
          Import an asset when you want it bundled, hashed and cache-busted. Put it in
          <code> public/</code> when it needs a fixed, predictable URL. Choose by whether the URL must
          stay stable.
        </Callout>

        <SeeAlso links={[
          { title: 'The build & targets', path: '/docs/blueprint/build' },
          { title: 'Project anatomy', path: '/docs/start/anatomy' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
