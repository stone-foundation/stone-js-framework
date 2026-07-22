import { Configuration, IBlueprint } from '@stone-js/core'

/**
 * Single source of truth for the site's configuration.
 *
 * Following the framework's best practice, site-wide values are declared here and published to
 * the Blueprint by the `@Configuration()` class below, so components read them through the
 * container/hooks (`useBlueprint()`) instead of hard-coding them. Non-component code with no hook
 * access (head builders, the RSS script) imports this object directly: one source either way.
 *
 * The Algolia key is the search-only key and is safe to ship to the client; the GA id is public.
 */
export const appConfig = {
  /** The published `@stone-js/*` version. Bump this one line per release. */
  version: '0.8.2',
  name: 'Stone.js',
  tagline: 'The Continuum framework',
  description: 'Write your domain once; it runs in every context: server, edge, browser, agents.',
  /** Canonical site origin (see public/CNAME). Used for absolute share/OG/RSS URLs. */
  siteUrl: 'https://stonejs.dev',
  githubUrl: 'https://github.com/stone-foundation',
  manifestoUrl: 'https://evens-stone.github.io/continuum-manifesto/manifesto',
  analytics: { ga: 'G-F368Y4JRZR' },
  algolia: { appId: 'B8ZTXIHIAP', apiKey: '65a6a180473de963344f97d15302da4d', indexName: 'stonejs' }
} as const

/**
 * Imperative application configuration: publishes {@link appConfig} onto the Blueprint under the
 * `app.*` namespace, reachable via `useBlueprint().get('app.version')` and friends.
 *
 * `@Configuration` classes are instantiated argument-less and receive the blueprint through the
 * `configure(blueprint)` method (classes injected by the container instead receive it via
 * `constructor({ blueprint })`).
 */
@Configuration()
export class AppConfig {
  /**
   * Configure the application Blueprint.
   *
   * @param blueprint - The application blueprint.
   */
  configure (blueprint: IBlueprint): void {
    blueprint.set('app', appConfig)
  }
}
