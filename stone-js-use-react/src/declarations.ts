/* c8 ignore next */
import { ReactNode } from 'react'
import { Config } from '@stone-js/config'
import { BrowserContext, BrowserEvent, BrowserResponse } from '@stone-js/browser-adapter'
import { HeadContext as BaseHeadContext } from '@stone-js/use-view'
import { DecoratorPageRouteDefinition, FunctionalEventHandler, Route, Router } from '@stone-js/router'
import { IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, OutgoingHttpResponseOptions, RedirectResponse, RedirectResponseOptions } from '@stone-js/http-core'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse, OutgoingBrowserResponseOptions, RedirectBrowserResponse, RedirectBrowserResponseOptions } from '@stone-js/browser-core'
import { OutgoingResponseOptions, IContainer, AdapterContext, Promiseable, FunctionalErrorHandler, HookName as BaseHookName, IBlueprint, ErrorHandlerOptions, AdapterErrorHandlerOptions, FunctionalAdapterErrorHandler, Laziable, LifecycleHookType } from '@stone-js/core'

/**
 * The Head Context for React pages — the agnostic `@stone-js/use-view` head context
 * (title, description, metas, links, scripts, styles, base, jsonLd, html/body attributes).
 * Build it fluently with `createHead()` (see `./head`) or return a plain object.
*/
export type HeadContext = BaseHeadContext

/**
 * The type representing a Snapshot.
 * An object that represents the state of the application at a given time.
*/
export type ISnapshot = Config

/**
 * Route for React.
*/
export type IRoute = Route<ReactIncomingEvent, ReactOutgoingResponse>

/**
 * Router for React.
*/
export type IRouter = Router<ReactIncomingEvent, ReactOutgoingResponse>

/**
 * Headers type for React.
 */
export type HeadersType = Headers | Map<string, string | string[]> | Record<string, string | string[]>

/**
 * Incoming event for React.
*/
export type ReactIncomingEvent = IncomingHttpEvent | IncomingBrowserEvent

/**
 * Incoming event options for React.
*/
export type ReactIncomingEventOptions = IncomingBrowserEventOptions | IncomingHttpEventOptions

/**
 * Redirect response options for React.
*/
export type ReactRedirectResponseOptions =
  | RedirectResponseOptions
  | RedirectBrowserResponseOptions

/**
 * Outgoing response options for React.
*/
export type ReactResponseOptions =
  | OutgoingHttpResponseOptions
  | ReactOutgoingResponseOptions
  | ReactRedirectResponseOptions
  | OutgoingBrowserResponseOptions

/**
 * Outgoing response for React.
*/
export type ReactOutgoingResponse = (
  | OutgoingHttpResponse
  | OutgoingBrowserResponse
  | RedirectResponse
  | RedirectBrowserResponse)
& { content: any }

/**
 * Options for creating a React Outgoing Response.
*/
export interface ReactOutgoingResponseOptions extends OutgoingResponseOptions {
  headers?: HeadersType
}

/**
 * UseReactHookName Type.
 */
export type UseReactHookName = 'onPreparingPage'

/**
 * HookName Type.
 *
 * extends Core HookName.
 */
export type HookName = BaseHookName | UseReactHookName

/**
 * Use React Hook Listener Context.
 */
export interface UseReactHookListenerContext {
  data: any
  error?: any
  head?: HeadContext
  container: IContainer
  componentType: unknown
  event: ReactIncomingEvent
  snapshot: ResponseSnapshotType
  response: ReactOutgoingResponse
}

/**
 * UseReactHookListener Type.
 *
 * Represents a listener hook that can either be synchronous or asynchronous.
 */
export type UseReactHookListener = (context: UseReactHookListenerContext) => Promiseable<void>

/**
 * UseReactHook Type.
 */
export interface UseReactHookType {
  onPreparingPage?: UseReactHookListener[]
}

/**
 * ReactLifecycleHookType Type.
 */
export type ReactLifecycleHookType = LifecycleHookType<IBlueprint, any, any, ReactIncomingEvent, any> & UseReactHookType

/**
 * Options for configuring the `Page` decorator.
 * Extends `PageRouteDefinition` but excludes the `methods` property,
 * as it is predefined as `'GET'` by the decorator.
 */
export interface PageOptions extends DecoratorPageRouteDefinition {
  layout?: string
  headers?: HeadersType
}

/**
 * Options for configuring the `PageLayout` decorator.
 */
export interface PageLayoutOptions {
  name?: 'default' | (string & {})
}

/**
 * Options for configuring the `ErrorPage` decorator.
 */
export interface ErrorPageOptions extends ErrorHandlerOptions {
  layout?: string
}

/**
 * Options for configuring the `AdapterErrorPage` decorator.
 */
export interface AdapterErrorPageOptions extends AdapterErrorHandlerOptions {
  layout?: string
}

/**
 * Browser Adapter Context for React.
 */
export type ReactBrowserAdapterContext = AdapterContext<
BrowserEvent,
BrowserResponse,
BrowserContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse
>

/**
 * Stone data snapshot type.
 */
export interface ResponseSnapshotType {
  data?: any
  error?: any
  ssr: boolean
  layout?: unknown
  statusCode?: number
}

/**
 * Browser response content for React.
 */
export interface BrowserResponseContent {
  ssr?: boolean
  app?: ReactNode
  head?: HeadContext
  fullRender?: boolean
  component?: ReactNode
  targetUrl?: string | URL
}

/**
 * Context for React.
 */
export interface StoneContextType {
  data: any
  container: IContainer
  event: ReactIncomingEvent
}

/**
 * React page render context.
 */
export interface PageRenderContext<TData = any> {
  data?: TData
  statusCode?: number
  container: IContainer
  event: ReactIncomingEvent
}

/**
 * React page head context.
 */
export interface PageHeadContext<TData = any> {
  data?: TData
  statusCode?: number
  event: ReactIncomingEvent
}

/**
 * Represents a page class.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type PageClass<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> = new (...args: any[]) => IPage<IncomingEventType, OutgoingResponseType>

/**
 * Represents a page.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export interface IPage<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> {
  render: (context: PageRenderContext<any>) => ReactNode
  handle?: FunctionalEventHandler<IncomingEventType, OutgoingResponseType>
  head?: (context: PageHeadContext<any>) => Promiseable<HeadContext>
}

/**
 * Represents a factory page.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type FactoryPage<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> = (container?: any) => IPage<IncomingEventType, OutgoingResponseType>

/**
 * Represents a page type.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type PageType<IncomingEventType extends ReactIncomingEvent, OutgoingResponseType = unknown> =
  | PageClass<IncomingEventType, OutgoingResponseType>
  | FactoryPage<IncomingEventType, OutgoingResponseType>

/**
 * Represents a meta page.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export interface MetaPage<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> {
  lazy?: boolean
  layout?: unknown
  isClass?: boolean
  isFactory?: boolean
  isComponent?: boolean
  module: PageType<IncomingEventType, OutgoingResponseType> | Laziable<PageType<IncomingEventType, OutgoingResponseType>>
}

/**
 * React render page layout options.
 */
export interface PageLayoutRenderContext {
  children: ReactNode
  container: IContainer
}

/**
 * React render page layout options.
 */
export interface AdapterPageLayoutRenderContext {
  children: ReactNode
  blueprint: IBlueprint
}

/**
 * Represents a Page layout class.
*/
export type PageLayoutClass = new (...args: any[]) => IPageLayout

/**
 * Represents a Page layout.
*/
export interface IPageLayout {
  head?: () => Promiseable<HeadContext>
  render: (context: any) => ReactNode
}

/**
 * Represents a factory page layout.
*/
export type FactoryPageLayout = (container?: any) => IPageLayout

/**
 * Represents a page layout type.
 */
export type PageLayoutType = PageLayoutClass | FactoryPageLayout

/**
 * Represents a meta page layout.
 */
export interface MetaPageLayout {
  lazy?: boolean
  isClass?: boolean
  isFactory?: boolean
  module: PageLayoutType | Laziable<PageLayoutType>
}

/**
 * React error page render context.
 */
export interface ErrorPageRenderContext<TError = any, UData = any> extends PageRenderContext<UData> {
  error: TError
}

/**
 * React error page head context.
 */
export interface ErrorPageHeadContext<TError = any, UData = any> extends PageHeadContext<UData> {
  error: TError
}

/**
 * Represents an error page class.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type ErrorPageClass<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> = new (...args: any[]) => IErrorPage<IncomingEventType, OutgoingResponseType>

/**
 * Represents an error page.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export interface IErrorPage<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> {
  handle?: FunctionalErrorHandler<IncomingEventType, OutgoingResponseType>
  render: (context: ErrorPageRenderContext<any, any>) => ReactNode
  head?: (context: ErrorPageHeadContext<any, any>) => Promiseable<HeadContext>
}

/**
 * Represents a factory error page.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
*/
export type FactoryErrorPage<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> = (container?: any) => IErrorPage<IncomingEventType, OutgoingResponseType>

/**
 * Represents an error page type.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export type ErrorPageType<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> = ErrorPageClass<IncomingEventType, OutgoingResponseType> | FactoryErrorPage<IncomingEventType, OutgoingResponseType>

/**
 * Represents a meta error page.
 *
 * @template IncomingEventType - The type representing the incoming event.
 * @template OutgoingResponseType - The type representing the outgoing response.
 */
export interface MetaErrorPage<
  IncomingEventType extends ReactIncomingEvent,
  OutgoingResponseType = unknown
> {
  error?: any
  lazy?: boolean
  layout?: unknown
  isClass?: boolean
  isFactory?: boolean
  module: ErrorPageType<IncomingEventType, OutgoingResponseType> | Laziable<ErrorPageType<IncomingEventType, OutgoingResponseType>>
}

/** ****** Adapter Error page *************/
/**
 * React Adapter render page error options.
 */
export interface AdapterErrorPageRenderContext<TError = any> {
  error: TError
  statusCode: number
  blueprint: IBlueprint
}

/**
 * Represents an Adapter component error handler class.
*/
export type AdapterErrorPageClass<
  RawEventType, RawResponseType, ExecutionContextType
> = new (...args: any[]) => IAdapterErrorPage<RawEventType, RawResponseType, ExecutionContextType>

/**
 * Represents an Adapter component error handler.
*/
export interface IAdapterErrorPage<
  RawEventType, RawResponseType, ExecutionContextType
> {
  handle?: FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>
  render: (context: AdapterErrorPageRenderContext<any>) => ReactNode
}

/**
 * Represents an Adapter factory component error handler.
*/
export type FactoryAdapterErrorPage<
  RawEventType, RawResponseType, ExecutionContextType
> = (container?: any) => IAdapterErrorPage<RawEventType, RawResponseType, ExecutionContextType>

/**
 * Represents an Adapter component error handler type.
 */
export type AdapterErrorPageType<
  RawEventType, RawResponseType, ExecutionContextType
> =
  | AdapterErrorPageClass<RawEventType, RawResponseType, ExecutionContextType>
  | FactoryAdapterErrorPage<RawEventType, RawResponseType, ExecutionContextType>

/**
 * Represents an Adapter meta component error handler.
 */
export interface MetaAdapterErrorPage<
  RawEventType, RawResponseType, ExecutionContextType
> {
  error?: any
  lazy?: boolean
  layout?: unknown
  platform?: string
  isClass?: boolean
  isFactory?: boolean
  adapterAlias?: string
  module:
  | AdapterErrorPageType<RawEventType, RawResponseType, ExecutionContextType>
  | Laziable<AdapterErrorPageType<RawEventType, RawResponseType, ExecutionContextType>>
}
