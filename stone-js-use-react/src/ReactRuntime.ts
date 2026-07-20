import { HeadContext, applyHeadToDocument } from '@stone-js/use-view'
import { IErrorPage, ISnapshot, MetaErrorPage, ReactIncomingEvent } from './declarations'
import { IBlueprint, IContainer, isEmpty, isObjectLikeModule, Promiseable, type MetaService } from '@stone-js/core'
import { buildAppComponent, isServer, renderReactApp, resolveComponent } from './UseReactPageInternals'

/**
 * ReactRuntimeOptions
*/
export interface ReactRuntimeOptions {
  snapshot: ISnapshot
  blueprint: IBlueprint
  container: IContainer
}

/**
 * Class representing a ReactRuntime.
 *
 * This class is responsible for handling the React runtime environment,
 * including create snapshots and managing errors.
*/
export class ReactRuntime {
  private readonly _snapshot: ISnapshot
  private readonly container: IContainer
  private readonly blueprint: IBlueprint

  /**
   * The ReactRuntime instance.
   *
   * @type {ReactRuntime}
   */
  public static instance?: ReactRuntime

  /**
   * Create a ReactRuntime.
   *
   * @param options - ReactRuntime options.
  */
  constructor ({ container, blueprint, snapshot }: ReactRuntimeOptions) {
    this._snapshot = snapshot
    this.container = container
    this.blueprint = blueprint
  }

  /**
   * Create a snapshot.
   *
   * This method will create a snapshot of the current event.
   * If the environment is server, it will create a snapshot.
   * If the environment is client, it will return the snapshot.
   *
   * @param key - The key to store the snapshot.
   * @param handler - The handler to create the snapshot.
   * @returns The snapshot value.
  */
  async snapshot<T>(key: string, handler: (container?: IContainer) => Promiseable<T>): Promise<T> {
    const event = this.container.make<ReactIncomingEvent>('event')
    const snapshotKey = `${event.fingerprint()}.${key}`

    if (isServer()) {
      const value = await handler(this.container)
      this._snapshot.set(snapshotKey, value)
      return value
    } else {
      return this._snapshot.get<T>(snapshotKey) ?? await handler(this.container)
    }
  }

  /**
   * Set html head tags.
   *
   * This method will set the head elements in the document.
   *
   * @param value - The head context to set.
   */
  head (value: HeadContext): void {
    applyHeadToDocument(document, value)
  }

  /**
   * Throw an error.
   *
   * This method will handle the error and render the error component.
   * If no error handler is found, the error will be thrown.
   *
   * @param error - The error to throw.
   * @param statusCode - The status code to return.
   * @returns void
   * @throws error
  */
  async throwError (error: any, statusCode: number = 500): Promise<void> {
    const metavalue = this.blueprint.get<MetaErrorPage<ReactIncomingEvent>>(
      `stone.useReact.errorPages.${String(error.name)}`,
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
   * Render an error component.
   *
   * This method will render the error component.
   *
   * @param error - The error to render.
   * @param metavalue - The meta value to render.
   * @param statusCode - The status code to return.
   * @returns void
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

    // Render the component
    renderReactApp(appComponent, this.blueprint)
  }
}

/**
 * MetaReactRuntime
*/
export const MetaReactRuntime: MetaService = { module: ReactRuntime, isClass: true, alias: 'reactRuntime', singleton: true }
