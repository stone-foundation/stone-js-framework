import {
  ReactNode,
  MouseEvent,
  FunctionComponent,
  AnchorHTMLAttributes
} from 'react'
import { isEmpty, isNotEmpty, Logger } from '@stone-js/core'
import { NavigateOptions } from '@stone-js/router'
import { LinkTarget, useLink } from '@stone-js/use-react-core'

interface BaseProps extends AnchorHTMLAttributes<HTMLAnchorElement>, LinkTarget {
  /** The older way of pointing a link: a path, or a named route with its parameters. */
  to?: string | NavigateOptions
  noRel?: boolean
  external?: boolean
  children: ReactNode
  defaultNav?: boolean
  selectedClass?: string
  ariaCurrentValue?: 'time' | 'location' | 'page' | 'step' | 'date' | 'true' | 'false'
}

/**
 * What a link must point at: a route's name, a raw address, or the legacy `to`.
 *
 * Written as a union so the compiler asks for one of the three, rather than letting a link render
 * with nothing to point at and warn about it at run time.
 */
export type StoneLinkOptions =
  | (BaseProps & { name: string })
  | (BaseProps & { href: string })
  | (BaseProps & { to: string | NavigateOptions })

/**
 * A link, rendered as an anchor, pointing at a **named route** or at a raw address.
 *
 * ```tsx
 * <StoneLink name='notes.show' params={{ id: note.id }}>Read it</StoneLink>
 * <StoneLink name='notes.index' query={{ page: 2 }} hash='top'>Page 2</StoneLink>
 * <StoneLink href='https://stonejs.dev' external>The site</StoneLink>
 * ```
 *
 * **Prefer the name.** The router owns the shape of every path, so a link that names a route and
 * hands over its parameters cannot go stale the day that path changes, and a name that does not
 * exist says so in the console instead of rendering a broken address that looks fine.
 *
 * Everything `router.generate()` accepts is a prop: `params`, `query`, `hash`, `protocol` and
 * `withDomain`. The generation itself is the router's, called through `useLink`, so a link and a
 * redirect built from the same name cannot disagree.
 *
 * `to` still works, and still accepts either a path or `NavigateOptions`. It is the older way of
 * saying the same thing, kept so nothing breaks; `name` is the one to write now.
 */
export const StoneLink: FunctionComponent<StoneLinkOptions> = ({
  to,
  name,
  href,
  params,
  query,
  hash,
  protocol,
  withDomain,
  noRel,
  external,
  children,
  ariaCurrentValue = 'page',
  selectedClass = 'selected',
  ...rest
}) => {
  const isExternal = external === true
  const target = legacyTarget({ name, href, params, query, hash, protocol, withDomain }, to)
  const { href: path, isCurrent, navigate } = useLink(target)
  const shouldHandleNav = !isExternal && (isNotEmpty(target.name) || isNotEmpty(to))
  const selectedClassName = isCurrent ? selectedClass : undefined
  const elemClassName = [rest.className, selectedClassName].filter(Boolean).join(' ').trim()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    rest.onClick?.(event)

    // Let the browser handle the click natively (real <a href> fallback) for external
    // links, already-handled clicks, modified clicks (Ctrl/Cmd/Shift/Alt), non-left
    // clicks, and `target="_blank"` — so "open in new tab/window" keeps working.
    if (
      event.defaultPrevented ||
      isExternal ||
      event.button !== 0 ||
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
      (isNotEmpty(rest.target) && rest.target !== '_self')
    ) {
      return
    }

    event.preventDefault()
    navigate()
  }

  if (isEmpty(name) && isEmpty(href) && isEmpty(to)) {
    Logger.warn('StoneLink: missing "name", "href" or "to"')
  }

  let relValue = rest.rel
  if (noRel === true) {
    relValue = undefined
  } else if (isExternal) {
    relValue = 'noopener noreferrer'
  }

  return (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a
      {...rest}
      href={path}
      className={elemClassName}
      target={isExternal ? '_blank' : rest.target}
      aria-current={isNotEmpty(selectedClassName) ? ariaCurrentValue : undefined}
      rel={relValue}
      onClick={shouldHandleNav ? handleClick : rest.onClick}
    >
      {children}
    </a>
  )
}

/**
 * The target, with `to` folded into it.
 *
 * `to` said two things at once: a string was a raw path, an object was a named route with its
 * parameters. Both become the one shape `useLink` reads, so the older prop keeps working without a
 * second code path deciding what a link points at.
 *
 * @param target - What the explicit props said.
 * @param to - The legacy prop.
 * @returns The target to resolve.
 */
function legacyTarget (target: LinkTarget, to?: string | NavigateOptions): LinkTarget {
  if (isEmpty(to)) { return target }
  if (typeof to === 'string') { return { ...target, href: target.href ?? to } }

  return { ...to, ...Object.fromEntries(Object.entries(target).filter(([, value]) => value !== undefined)) }
}
