import { IBlueprint, IContainer } from '@stone-js/core'
import { NotificationConfigurationError } from './errors/NotificationError'
import { NoticeDeclaration, NoticeInstance, NotificationsConfig } from './declarations'

/**
 * Finds the notice a name or an event refers to, and builds it.
 *
 * Built for one event, like everything else in the container: it is a lookup over what the blueprint
 * declared, and holds nothing between events. A notice class is built through the container, so it
 * gets its services, and it is the container that decides whether that instance is shared.
 */
export class NoticeRegistry {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
  }

  /** Every notice this application declared, from `@Notice` and from configuration alike. */
  all (): NoticeDeclaration[] {
    return this.blueprint.get<NotificationsConfig>('stone.notifications', {}).notices ?? []
  }

  /**
   * What was declared under this name.
   *
   * @param name - The notice's name.
   * @returns The declaration, or nothing.
   */
  declaration (name: string): NoticeDeclaration | undefined {
    return this.all().find((notice) => notice.name === name)
  }

  /**
   * What reacts to this event.
   *
   * @param event - The domain event's name.
   * @returns The declaration, or nothing.
   */
  forEvent (event: string): NoticeDeclaration | undefined {
    return this.all().find((notice) => notice.on === event)
  }

  /**
   * The notice itself, built.
   *
   * @param declaration - What was declared.
   * @returns The notice.
   * @throws {NotificationConfigurationError} When it cannot be built, or does not answer `notify`.
   */
  build (declaration: NoticeDeclaration): NoticeInstance {
    const module = declaration.module

    if (module === undefined) {
      throw new NotificationConfigurationError(
        `The notice '${declaration.name}' declares no module, so there is nothing to say. Declare a ` +
        'class with `@Notice`, or pass one to `defineNotice`.'
      )
    }

    const built = declaration.isClass === false || typeof module !== 'function'
      ? module as NoticeInstance
      : this.container?.resolve?.<NoticeInstance>(module as any, true)

    if (built === undefined || typeof built.notify !== 'function') {
      throw new NotificationConfigurationError(
        `The notice '${declaration.name}' does not answer \`notify(event, context)\`. A notice is a ` +
        'class that says what it says: the decorator carries the metadata, the class carries the ' +
        'content.'
      )
    }

    return built
  }
}
