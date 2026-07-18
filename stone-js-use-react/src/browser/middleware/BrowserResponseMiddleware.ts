import { ReactNode } from 'react'
import { STONE_PAGE_EVENT_OUTLET } from '../../constants'
import { UseReactError } from '../../errors/UseReactError'
import { HeadContext, applyHeadToDocument } from '@stone-js/use-view'
import { NAVIGATION_EVENT } from '@stone-js/router'
import { BrowserAdapterResponseBuilder } from '@stone-js/browser-adapter'
import { hydrateReactApp, renderReactApp } from '../../UseReactPageInternals'
import { IBlueprint, isEmpty, isNotEmpty, NextMiddleware } from '@stone-js/core'
import { BrowserResponseContent, ReactBrowserAdapterContext } from '../../declarations'
import { OutgoingBrowserResponse, RedirectBrowserResponse } from '@stone-js/browser-core'

/**
 * Adapter Middleware for handling outgoing responses and rendering them in the browser.
 */
export class BrowserResponseMiddleware {
  private readonly isRendered: boolean
  private readonly blueprint: IBlueprint

  /**
   * Create a BrowserResponseMiddleware.
   *
   * @param {blueprint} options - Options for creating the BrowserResponseMiddleware.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
    this.isRendered = blueprint.has('stone.useReact.reactRoot')
  }

  /**
   * Handles the outgoing response, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise resolving to the processed context.
   * @throws {NodeHttpAdapterError} If required components are missing in the context.
   */
  async handle (
    context: ReactBrowserAdapterContext,
    next: NextMiddleware<ReactBrowserAdapterContext, BrowserAdapterResponseBuilder>
  ): Promise<BrowserAdapterResponseBuilder> {
    const rawResponseBuilder = await next(context)

    this.ensureValidContext(context, rawResponseBuilder)

    return rawResponseBuilder.add('render', async () => await this.renderComponent(context.outgoingResponse))
  }

  /**
   * Ensures the context and response builder have the required components.
   */
  private ensureValidContext (
    context: ReactBrowserAdapterContext,
    rawResponseBuilder?: BrowserAdapterResponseBuilder
  ): void {
    if (
      context.rawEvent === undefined ||
      context.incomingEvent === undefined ||
      context.outgoingResponse === undefined ||
      rawResponseBuilder?.add === undefined
    ) {
      throw new UseReactError('The context is missing required components.')
    }
  }

  /**
   * Renders the provided React content.
   *
   * @param response - The response object.
   */
  private async renderComponent (response?: OutgoingBrowserResponse): Promise<void> {
    if (isEmpty(response)) {
      throw new UseReactError('No response provided for rendering.')
    }

    const content = response.content as BrowserResponseContent
    const targetUrl = (response as RedirectBrowserResponse).targetUrl

    if (isNotEmpty<string | URL>(targetUrl)) {
      return this.handleRedirect(targetUrl)
    }

    if (isNotEmpty<HeadContext>(content?.head)) {
      applyHeadToDocument(document, content.head)
    }

    if (content?.ssr === true && !this.isRendered && isNotEmpty(content?.app)) {
      return this.hydrateReactApp(content.app)
    }

    if (isNotEmpty(content?.app) && (!this.isRendered || content?.fullRender === true)) {
      return this.renderReactApp(content.app)
    }

    if (isNotEmpty(content?.component)) {
      return await this.dispatchComponentToOutlet(content.component)
    }

    throw new UseReactError('Invalid content provided for rendering.')
  }

  /**
   * Handles navigation redirection.
   *
   * @param path - The path to redirect to.
   */
  private handleRedirect (path: string | URL): void {
    window.history.pushState({ path }, '', path)
    window.dispatchEvent(new Event(NAVIGATION_EVENT))
  }

  /**
   * Hydrates the React app when SSR is enabled.
   *
   * @param app - The React app to hydrate.
   */
  private hydrateReactApp (app: ReactNode): void {
    hydrateReactApp(app, this.blueprint)
  }

  /**
   * Renders the React app.
   *
   * @param app - The React app to render.
   */
  private renderReactApp (app: ReactNode): void {
    renderReactApp(app, this.blueprint)
  }

  /**
   * Dispatches a component to the layout outlet when no layout is defined.
   *
   * @param component - The component to dispatch.
   */
  private async dispatchComponentToOutlet (component: ReactNode): Promise<void> {
    window.dispatchEvent(new CustomEvent(STONE_PAGE_EVENT_OUTLET, { detail: component }))
  }
}

/**
 * Meta Middleware for processing browser responses.
 */
export const MetaBrowserResponseMiddleware = { module: BrowserResponseMiddleware, isClass: true }
