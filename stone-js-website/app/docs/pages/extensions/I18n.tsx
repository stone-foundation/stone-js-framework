import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/i18n'

const LAYOUT = `app/i18n/
  en/
    common.json     { "hello": "Hello {{name}}!" }
    cart.json       { "items_one": "{{count}} item", "items_other": "{{count}} items" }
  fr/
    common.json     { "hello": "Bonjour {{name}} !" }
    cart.json       { "items_one": "{{count}} article", "items_other": "{{count}} articles" }`

const PLUGIN = `import { i18nCliPlugin } from '@stone-js/i18n/cli'

// stone.config.mjs
export default defineConfig({ plugins: [i18nCliPlugin()] })`

const LAZY = `// Lazy is the default. To bundle every locale eagerly instead:
export default defineConfig({ plugins: [i18nCliPlugin({ lazy: false })] })`

const MANUAL = `import { defineConfig } from '@stone-js/core'
import { loadTranslations } from '@stone-js/i18n'

export const AppConfig = defineConfig((blueprint) => {
  blueprint.set('stone.i18n.locales', ['en', 'fr'])
  blueprint.set(
    'stone.i18n.resources',
    loadTranslations(import.meta.glob('/app/i18n/**/*.{json,ts,js,yaml,yml}', { eager: true }))
  )
})`

const USAGE = `import { translatorFor } from '@stone-js/i18n'
import { EventHandler, Get } from '@stone-js/router'

@EventHandler('/greet')
export class GreetController {
  @Get('/')
  greet (event) {
    const t = translatorFor(event)              // bound to the request locale, concurrency-safe
    return {
      message: t.t('hello', { name: 'Ada' }),   // "Bonjour Ada !" for a fr request
      items: t.t('items', { ns: 'cart', count: 3 }), // ICU pluralization
      price: t.currency(19.9, 'EUR'),           // "19,90 €"
      reach: t.compact(1_500_000)               // "1,5 M"
    }
  }
}`

const FRONTEND = `// A locale switcher in the browser
await i18n.setLocale('fr')                      // re-renders in French
document.documentElement.dir = i18n.dir()       // 'ltr' | 'rtl' for the <html> element`

const CONFIG = `export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.i18n', {
  locale: 'en',                    // active locale
  locales: ['en', 'fr', 'ar'],     // negotiated set (fr-CA -> fr)
  fallbackLocale: 'en',            // used for missing keys
  defaultNamespace: 'translation',
  timeZone: 'America/New_York',    // default for date formatting, per-call overridable
  param: 'lang',                   // resolve the locale from a :lang route param
  onMissingKey: (key, locale, ns) => console.warn('missing', locale, ns, key)
}))`

/**
 * Extensions: internationalization (i18n).
 */
@Page(PATH, { layout: 'docs' })
export class I18n implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'i18n',
      description: 'Isomorphic, cloud-native internationalization: zero-config catalogs, per-request locale, native Intl formatting, and lazy loading with no FOUC.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Internationalization (i18n)' />
        <Lead>
          One i18n layer for the backend and the frontend. Drop your catalogs in <code>app/i18n</code>,
          and the request locale is resolved and scoped for you: on the server every request gets its
          own translator, concurrency-safe; in the browser you switch the active locale in one call.
          Translation runs on <a href='https://www.i18next.com'>i18next</a>; numbers, dates and lists
          use the native <code>Intl</code> APIs.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/i18n`}</Code>
        <p>
          Then add one decorator. That is the whole setup: it registers the service provider (so
          <code> constructor ({'{'} i18n {'}'})</code> injects it anywhere), installs the middleware that
          resolves the request locale, and lets the build discover <code>app/i18n</code> on its own.
          Everything below is optional.
        </p>
        <Code file='app/Application.ts'>{`import { I18n } from '@stone-js/i18n'
import { StoneApp } from '@stone-js/core'

@I18n({ locales: ['en', 'fr'], fallbackLocale: 'en' })
@StoneApp({ name: 'my-app' })
export class Application {}`}</Code>
        <p>
          The imperative equivalent is the <code>i18nBlueprint</code> constant:
          <code> blueprint.set(i18nBlueprint)</code>.
        </p>

        <H2>Zero-config layout</H2>
        <p>
          Lay out catalogs as <code>app/i18n/&lt;locale&gt;/&lt;namespace&gt;.json</code>. The locale and
          namespace are read from the path, so no manifest is needed.
        </p>
        <Code file='project' lang='text'>{LAYOUT}</Code>

        <H2>Loading catalogs</H2>
        <p>
          The recommended path is the CLI plugin: it scans <code>app/i18n</code> at build time and
          generates the wiring with plain imports, so the same setup works on a backend service
          (Rollup), a browser SPA and SSR (Vite) alike. No wiring line in your code.
        </p>
        <Code file='stone.config.mjs' lang='ts'>{PLUGIN}</Code>
        <p>
          Because <code>@stone-js/i18n</code> is first-party, it is also auto-discovered from your
          direct dependencies (announced on every build). Opt out with{' '}
          <code>autoDiscoverPlugins: false</code>. See{' '}
          <a href='/docs/extending/cli-plugins'>Participate in the build</a> for how the plugin system works.
        </p>

        <H3>Lazy by default, no FOUC</H3>
        <p>
          Catalogs are lazy by default: only the active locale's catalog is imported, code-split per
          file, for a lighter payload. The locale is resolved in a kernel middleware that runs before
          your handler, and it awaits the catalog import, so the first render already has its
          translations: there is no flash of untranslated keys and no layout shift. Pass{' '}
          <code>lazy: false</code> to bundle every locale eagerly instead.
        </p>
        <Code file='stone.config.mjs' lang='ts'>{LAZY}</Code>
        <Callout kind='note' title='Why there is no FOUC'>
          Locale resolution and catalog loading happen in <code>SetLocaleMiddleware</code>, an async
          kernel middleware that runs and is awaited before the handler renders. The catalog is present
          at first paint, and the fallback locale is loaded alongside it so missing keys still resolve.
        </Callout>

        <H3>By hand</H3>
        <p>
          Prefer to wire it yourself? Set <code>stone.i18n.resources</code>. On Vite targets (SPA, SSR),
          <code>import.meta.glob</code> autoloads them, isomorphic and tree-shaking. For a plain backend
          service, prefer the plugin: it emits static imports rather than <code>import.meta.glob</code>,
          which only Vite understands.
        </p>
        <Code file='app/AppConfig.ts' lang='ts'>{MANUAL}</Code>

        <H2>Per-request locale</H2>
        <p>
          The locale is resolved automatically, in order (first match wins), each candidate negotiated
          against <code>locales</code> (<code>fr-CA</code> becomes <code>fr</code>):
        </p>
        <PropsTable nameHeader='Order' rows={[
          { name: '1. resolver', type: 'custom', desc: 'A custom resolver function, if you provide one.' },
          { name: '2. route param', type: ':lang', desc: 'A path-based locale when `param` is set and the router is available (isomorphic).' },
          { name: '3. headers', type: 'x-locale', desc: 'Custom headers x-locale, then x-lang, then x-language.' },
          { name: '4. query', type: '?lang=', desc: 'The lang query parameter.' },
          { name: '5. cookie', type: 'locale', desc: 'The locale cookie.' },
          { name: '6. Accept-Language', type: 'header', desc: 'The standard Accept-Language header.' },
          { name: '7. fallback', type: 'default', desc: "The event's own locale, then fallbackLocale." }
        ]} />

        <H2>Translate and format</H2>
        <p>
          On the server, read the request-bound translator from the event with <code>translatorFor</code>
          (never mutates shared state, so it is safe under concurrency). Or inject the service
          (<code>constructor (&#123; i18n &#125;)</code>) and bind a locale with <code>i18n.forLocale(locale)</code>.
        </p>
        <Code file='app/GreetController.ts' lang='ts'>{USAGE}</Code>
        <p>Formatting is native <code>Intl</code>, locale-aware:</p>
        <PropsTable nameHeader='Helper' rows={[
          { name: 't(key, opts)', type: 'string', desc: 'Interpolation, ICU pluralization (count), namespaces, per-call locale.' },
          { name: 'number / compact', type: 'string', desc: '1500000 becomes "1,500,000" or the compact "1.5M".' },
          { name: 'currency / percent', type: 'string', desc: 'currency(19.9, "EUR") and percent(0.25).' },
          { name: 'date / relativeTime', type: 'string', desc: 'Time-zone aware dates and "in 3 days".' },
          { name: 'list', type: 'string', desc: '"a, b and c" for the active locale.' },
          { name: 'dir(locale?)', type: 'ltr | rtl', desc: 'Writing direction, for the <html dir> attribute.' }
        ]} />

        <H2>On the frontend</H2>
        <p>
          The same API runs in the browser. Switch the active locale in one call, and set the document
          direction from <code>dir()</code>. For React components, <code>i18n.raw</code> exposes the
          underlying i18next instance, so you can wire <code>react-i18next</code> directly if you want.
        </p>
        <Code file='app/LocaleSwitcher.tsx' lang='ts'>{FRONTEND}</Code>

        <H2>Configure</H2>
        <p>Everything is optional, under <code>stone.i18n.*</code>:</p>
        <Code file='app/AppConfig.ts' lang='ts'>{CONFIG}</Code>

        <Callout kind='future' title='One layer, every runtime'>
          The exact same i18n code runs on Node, in a serverless function, in the browser SPA and in SSR.
          The catalog loading adapts to the target (static imports for a service, lazy code-split chunks
          for the frontend), but your domain never changes.
        </Callout>

        <SeeAlso links={[
          { title: 'Participate in the build', path: '/docs/extending/cli-plugins' },
          { title: 'Routing', path: '/docs/routing' },
          { title: 'The Blueprint', path: '/docs/blueprint' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
