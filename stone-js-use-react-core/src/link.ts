import { useMemo } from 'react'
import { IContainer, ILogger } from '@stone-js/core'
import { GenerateOptions } from '@stone-js/router'
import { useContainer, useEvent, useRoute, useRouter } from './hooks'

/**
 * Where a link points.
 *
 * A **name** is the form to prefer: the router owns the shape of every path, so a component that
 * names a route and hands over its parameters cannot go stale when the path changes. A raw `href`
 * stays available for what has no route, an external address above all.
 *
 * The named fields are `GenerateOptions` flattened into props, so anything `router.generate()`
 * accepts can be written on a link: parameters, query, hash, protocol, and whether the result
 * carries the domain.
 */
export interface LinkTarget {
  /** The route's name. */
  name?: string
  /** The path parameters, by name. */
  params?: Record<string, string | number | boolean>
  /** The query string, by key. */
  query?: Record<string, string | number | boolean>
  /** The fragment, without its `#`. */
  hash?: string
  /** The protocol, when the link must carry one. */
  protocol?: string
  /** Whether the generated address carries the domain. */
  withDomain?: boolean
  /** A raw address, for what no route describes. */
  href?: string
}

/** A link, resolved. */
export interface Link {
  /** The address to render, or to open. */
  href: string
  /** Whether this link points at what is currently displayed. */
  isCurrent: boolean
  /** Navigate to it through the router, without leaving the application. */
  navigate: (replace?: boolean) => void
}

/**
 * Resolve a link from a route name, or from a raw address.
 *
 * The platform-independent half of a link, and the reason it lives here rather than in
 * `@stone-js/use-react`: **an anchor is a browser element and a route name is not.** A React Native
 * application has no `<a>`, and needs exactly what this returns, so the calculation belongs to the
 * shared layer and only the rendering belongs to each platform's package.
 *
 * @param target - Where the link points.
 * @returns The resolved address, whether it is current, and how to navigate to it.
 *
 * @example
 * ```tsx
 * const { href, isCurrent, navigate } = useLink({ name: 'notes.show', params: { id } })
 * ```
 */
export function useLink (target: LinkTarget): Link {
  const router = useRouter()
  const route = useRoute()
  const event = useEvent()
  const container = useContainer()
  const { name, params, query, hash, protocol, withDomain, href } = target

  const generated = useMemo(() => {
    if (name === undefined) { return href ?? '#' }

    try {
      const options: GenerateOptions = { name, params, query, hash, protocol, withDomain }

      return router.generate(options)
    } catch (error: any) {
      // A mistyped name must not take the page down with it. The link renders inert and says which
      // name could not be resolved, which is what someone reading the console needs.
      //
      // The bound logger when there is one, `console` otherwise, and never the static `Logger`: that
      // one throws when it has not been initialised, which would replace a broken link with a broken
      // page, in the one code path whose whole job is to survive a mistake.
      warn(
        container,
        `useLink: no route is named '${name}', so the link points nowhere (${String(error?.message)})`
      )
      return '#'
    }
  }, [router, name, params, query, hash, protocol, withDomain, href])

  return {
    href: generated,
    isCurrent: isCurrent(target, generated, route, event),
    navigate: (replace?: boolean) => {
      // `replace` is forwarded only when it was given: calling `navigate(path, undefined)` and
      // `navigate(path)` mean the same thing to the router, and the second is what the caller said.
      const to = name === undefined ? generated : { name, params, query, hash }

      replace === undefined ? router.navigate(to) : router.navigate(to, replace)
    }
  }
}

/**
 * Whether a link points at what is currently displayed.
 *
 * A named link is compared **by name**, then by the parameters it named: the route is what a link
 * points at, and comparing a generated path against the current route's pattern is what made this
 * wrong before, since `/notes/1` never equals `/notes/:id`. A link naming no parameter is current
 * for every value of them, which is what a navigation highlight wants from `notes.show`.
 *
 * A raw address is compared against the current path, because there is nothing else to compare.
 *
 * @param target - Where the link points.
 * @param generated - The resolved address.
 * @param route - The current route.
 * @param event - The current event.
 * @returns True when the link is the current one.
 */
function isCurrent (
  target: LinkTarget,
  generated: string,
  route: { getOption: <T>(key: any) => T | undefined, params: Record<string, unknown> } | undefined,
  event: { pathname?: string } | undefined
): boolean {
  if (target.name === undefined) {
    return generated === event?.pathname
  }

  if (route?.getOption<string>('name') !== target.name) { return false }

  return Object.entries(target.params ?? {}).every(
    ([key, value]) => String(route?.params?.[key]) === String(value)
  )
}

/**
 * Report something a developer needs to see, through whatever is available.
 *
 * @param container - The request's container.
 * @param message - What to report.
 */
function warn (container: IContainer, message: string): void {
  const logger = container.has('logger') ? container.make<ILogger>('logger') : undefined

  typeof logger?.warn === 'function' ? logger.warn(message) : console.warn(message)
}
