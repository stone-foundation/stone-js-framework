import {
  useMemo,
  useState,
  ReactNode,
  useEffect,
  useContext,
  MouseEvent,
  FunctionComponent,
  AnchorHTMLAttributes
} from 'react'
import { StoneContext } from '../StoneContext'
import { IRouter, IRoute } from '../declarations'
import { NavigateOptions, RouteEvent, Router } from '@stone-js/router'
import { isEmpty, isNotEmpty, isObjectLikeModule, Logger } from '@stone-js/core'

interface BaseProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  noRel?: boolean
  external?: boolean
  children: ReactNode
  defaultNav?: boolean
  selectedClass?: string
  ariaCurrentValue?: 'time' | 'location' | 'page' | 'step' | 'date' | 'true' | 'false'
}

export type StoneLinkOptions =
  | (BaseProps & { href: string, to?: string | NavigateOptions })
  | (BaseProps & { href?: string, to: string | NavigateOptions })

/**
 * Internal link component using Stone.js router.
 */
export const StoneLink: FunctionComponent<StoneLinkOptions> = ({
  to,
  href,
  noRel,
  external,
  children,
  ariaCurrentValue = 'page',
  selectedClass = 'selected',
  ...rest
}) => {
  const isExternal = external === true
  const shouldHandleNav = !isExternal && isNotEmpty(to)
  const router = useContext(StoneContext).container.resolve<IRouter>(Router)
  const path = useMemo(() => {
    return isObjectLikeModule<NavigateOptions>(to) ? router.generate(to) : to ?? href ?? '#'
  }, [to, href, router])
  const [currentRoute, setCurrentRoute] = useState<IRoute | undefined>(router.getCurrentRoute())
  const selectedClassName = currentRoute?.path === path ? selectedClass : undefined
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
    isNotEmpty<string | NavigateOptions>(to) && router.navigate(to)
  }

  if (isEmpty(to) && isEmpty(href)) {
    Logger.warn('StoneLink: missing "to" or "href"')
  }

  useEffect(() => {
    const routerEventHandler = (event: RouteEvent): void => {
      setCurrentRoute(event.get<IRoute>('route'))
    }

    router.on(RouteEvent.ROUTED, routerEventHandler)

    return () => {
      router.off(RouteEvent.ROUTED, routerEventHandler)
    }
  }, [router])

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
