import { ScreenStack } from './ScreenStack'
import { HeadContext } from '@stone-js/use-view'
import { IBlueprint, IContainer, isEmpty, isObjectLikeModule, Promiseable, type MetaService } from '@stone-js/core'
import { IErrorPage, ISnapshot, MetaErrorPage, ReactIncomingEvent, buildAppComponent, resolveComponent } from '@stone-js/use-react-core'

/**
 * NativeRuntime options.
 */
export interface NativeRuntimeOptions {
  snapshot: ISnapshot
  blueprint: IBlueprint
  container: IContainer
  screenStack: ScreenStack
}

/**
 * The runtime a component reaches for on a phone.
 *
 * Registered under the same `reactRuntime` alias the web runtime uses, so a service or a
 * component that asks for the runtime gets the one belonging to the platform it is running
 * on. Same three abilities, each meaning what it can mean natively: remember a value across
 * a render, set the screen's title, and show an error page.
 */
export class NativeRuntime {
  private readonly _snapshot: ISnapshot
  private readonly container: IContainer
  private readonly blueprint: IBlueprint
  private readonly screenStack: ScreenStack

  /**
   * The runtime the application booted.
   *
   * Held privately with one named writer, because a public mutable field means any code at all can
   * rebind the runtime the whole application is talking to.
   */
  private static currentRuntime?: NativeRuntime

  /**
   * The booted runtime, for code that runs outside the container: a screen, the native entry.
   *
   * @returns The runtime, once the application has booted.
   */
  static current (): NativeRuntime | undefined {
    return NativeRuntime.currentRuntime
  }

  /**
   * Share the booted runtime. Called by the provider that booted it, and by nothing else.
   *
   * @param runtime - The runtime.
   */
  static share (runtime: NativeRuntime): void {
    NativeRuntime.currentRuntime = runtime
  }

  /**
   * Create a NativeRuntime.
   *
   * @param options - NativeRuntime options.
   */
  constructor ({ container, blueprint, snapshot, screenStack }: NativeRuntimeOptions) {
    this._snapshot = snapshot
    this.container = container
    this.blueprint = blueprint
    this.screenStack = screenStack
  }

  /**
   * Remember a value for the current event.
   *
   * The web runtime uses this to carry state from a server render into hydration. There is
   * no server here, so it is a per-event cache: asked twice for the same key during one
   * navigation, the handler runs once.
   *
   * @param key - The key to store the value under.
   * @param handler - Produces the value when it is not already known.
   * @returns The value.
   */
  async snapshot<T>(key: string, handler: (container?: IContainer) => Promiseable<T>): Promise<T> {
    const event = this.container.make<ReactIncomingEvent>('event')
    const snapshotKey = `${event.fingerprint()}.${key}`

    if (this._snapshot.has(snapshotKey)) {
      return this._snapshot.get<T>(snapshotKey) as T
    }

    const value = await handler(this.container)

    this._snapshot.set(snapshotKey, value)

    return value
  }

  /**
   * Apply a head context.
   *
   * A phone has no document, so most of a head has nowhere to go. The title does: it is the
   * screen's title, which a navigator shows in its header.
   *
   * @param value - The head context to apply.
   */
  head (value: HeadContext): void {
    this.screenStack.setTitle(value?.title)
  }

  /**
   * Show an error page for an error raised while rendering.
   *
   * @param error - The error to show.
   * @param statusCode - The status to render it with.
   * @throws The original error when the application declared no error page for it.
   */
  async throwError (error: any, statusCode: number = 500): Promise<void> {
    const metavalue = this.blueprint.get<MetaErrorPage<ReactIncomingEvent>>(
      `stone.useReact.errorPages.${String(error?.name)}`,
      this.blueprint.get<MetaErrorPage<ReactIncomingEvent>>(
        'stone.useReact.errorPages.default',
        {} as any
      )
    )

    if (isEmpty(metavalue)) {
      throw error
    }

    await this.renderErrorComponent(error, metavalue, statusCode)
  }

  /**
   * Resolve the declared error page and put it on the stack.
   *
   * It replaces the current screen rather than stacking one: an error is not somewhere the
   * user navigated to, and a back gesture should not walk through it.
   *
   * @param error - The error to render.
   * @param metavalue - The declared error page.
   * @param statusCode - The status to render it with.
   */
  private async renderErrorComponent (
    error: Error,
    metavalue: MetaErrorPage<ReactIncomingEvent>,
    statusCode: number = 500
  ): Promise<void> {
    let data: any
    const event = this.container.make<ReactIncomingEvent>('event')
    const handler = await resolveComponent(this.container, { ...metavalue, error })

    if (isObjectLikeModule<IErrorPage<ReactIncomingEvent>>(handler)) {
      const response: any = await handler.handle?.(error, event)
      data = response?.content ?? response
      statusCode = response?.statusCode ?? statusCode
    }

    const componentType = handler?.render.bind(handler)
    const appComponent = await buildAppComponent(
      event,
      this.container,
      componentType,
      metavalue.layout,
      data,
      statusCode,
      error
    )

    this.screenStack.navigate({ path: event.pathname, element: appComponent }, 'replace')
  }
}

/**
 * MetaNativeRuntime
 */
export const MetaNativeRuntime: MetaService = { module: NativeRuntime, isClass: true, alias: 'reactRuntime', singleton: true }
