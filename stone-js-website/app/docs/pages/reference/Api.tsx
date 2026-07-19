import { JSX } from 'react'
import { siblings } from '../../nav'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../../components/content'

const PATH = '/docs/reference/api'

const ENTRIES = [
  { pkg: '@stone-js/core', api: '@StoneApp, defineStoneApp, the kernel, blueprint builder, hooks.' },
  { pkg: '@stone-js/router', api: '@EventHandler, @Get/@Post/@Put/@Patch/@Delete, defineRoutes, defineEventHandler.' },
  { pkg: '@stone-js/use-react', api: '@Page, @PageLayout, StoneLink, StoneOutlet, useRoute, useData, useHead.' },
  { pkg: '@stone-js/validation', api: 'validate, validateEvent, fromZod, fromStandard.' },
  { pkg: '@stone-js/auth', api: 'requireAuth, requireScopes, Authenticator.' },
  { pkg: '@stone-js/authz', api: 'authorize, defineAbility, Authorizer.' },
  { pkg: '@stone-js/resources', api: 'defineResource, only, except.' },
  { pkg: '@stone-js/openapi', api: 'OpenApiGenerator.' },
  { pkg: '@stone-js/testing', api: 'createTestApp, TestClient.' },
  { pkg: '@stone-js/env', api: 'getString, getNumber, getBoolean, getUrl, getEnum, getJson.' }
]

/**
 * Reference: API overview.
 */
@Page(PATH, { layout: 'docs' })
export class Api implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'API reference',
      description: 'How the API is organised, the primary entry point of each package, and where the full generated reference lives.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Reference' title='API reference' />
        <Lead>
          Every package is small and focused, and exports a single, predictable surface. This page
          is the map: the primary entry points per package, and where each concept is taught in
          full.
        </Lead>

        <H2>How to read the API</H2>
        <p>
          Two rules make the whole surface predictable. Every declarative decorator has an
          imperative <code>define*</code> twin at strict parity. And every module offers its three
          forms, class, factory, function, except providers, which forbid the function form. Learn
          the shape once and it repeats across every package.
        </p>

        <H2>Primary entry points</H2>
        <div className='table-wrap'>
          <table>
            <thead><tr><th>Package</th><th>Primary API</th></tr></thead>
            <tbody>
              {ENTRIES.map((e) => <tr key={e.pkg}><td>{e.pkg}</td><td>{e.api}</td></tr>)}
            </tbody>
          </table>
        </div>

        <H2>The full generated reference</H2>
        <p>
          Every exported symbol of all 28 packages, with its types, is in the consolidated TypeDoc
          reference: one cross-linked site, generated from the source at build time and exhaustive
          by construction.
        </p>
        <p>
          <a className='btn btn-primary' href='/api/' style={{ marginTop: 4 }}>Open the API reference →</a>
        </p>

        <H2>Where the details live</H2>
        <p>
          Each capability is also taught, with runnable examples, on its own page:
          {' '}<StoneLink to='/docs/build/routing'>Routing</StoneLink>,{' '}
          <StoneLink to='/docs/build/validation'>Validation</StoneLink>,{' '}
          <StoneLink to='/docs/build/auth'>Auth</StoneLink>,{' '}
          <StoneLink to='/docs/build/resources'>Resources & OpenAPI</StoneLink>,{' '}
          <StoneLink to='/docs/build/testing'>Testing</StoneLink>. The vocabulary is fixed in the{' '}
          <StoneLink to='/docs/reference/glossary'>Glossary</StoneLink>.
        </p>

        <Callout kind='note' title='Curated first, generated underneath'>
          This page stays curated, so you always have a human entry point; the generated TypeDoc
          reference underneath is the exhaustive depth when you need a specific signature.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
