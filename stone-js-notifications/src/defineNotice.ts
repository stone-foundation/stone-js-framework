import { NoticeDeclaration } from './declarations'

/**
 * Declare a notice imperatively.
 *
 * The imperative half of `@Notice`, and it says exactly the same thing: metadata here, content in
 * the module. Put the result on `stone.notifications.notices`.
 *
 * @param module - The notice: a class, or an object answering `notify`.
 * @param options - The notice's metadata.
 * @param isClass - Whether `module` is a class the container should build. Defaults to true.
 * @returns The declaration.
 *
 * @example
 * ```ts
 * blueprint.set('stone.notifications.notices', [
 *   defineNotice(ConsentNeeded, { name: 'guardianship.consent_needed', on: 'identity.guardian.invited.v1' })
 * ])
 * ```
 */
export function defineNotice (
  module: unknown,
  options: { name: string, on?: string, channels?: string[] },
  isClass: boolean = true
): NoticeDeclaration {
  return { ...options, module, isClass }
}
