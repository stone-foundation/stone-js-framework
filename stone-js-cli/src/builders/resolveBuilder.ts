import { IncomingEvent } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { CliError } from '../errors/CliError'
import { StoneBuilder, StoneBuilderDefinition } from './declarations'

/**
 * The registered build targets, ordered.
 *
 * @param context - The console context.
 * @returns The definitions, lowest priority first.
 */
export const getBuilderDefinitions = (context: ConsoleContext): StoneBuilderDefinition[] => {
  const registry = context.blueprint.get<Record<string, StoneBuilderDefinition>>('stone.builder.builders', {})

  return Object
    .values(registry)
    .filter((definition) => definition?.target !== undefined)
    .sort((a, b) => (a.priority ?? 10) - (b.priority ?? 10))
}

/**
 * Find the target for this run.
 *
 * Precedence, and the reason for each step: the `--target` flag wins, because it is the most
 * explicit thing anyone can say; then `stone.builder.target`, because a project that only ever
 * builds one way should not repeat it; then detection, so a fresh application needs no
 * configuration at all. Exactly the order the CLI used when the two targets were hard-coded.
 *
 * @param context - The console context.
 * @param event - The console event, carrying the flags.
 * @returns The definition to drive.
 * @throws {CliError} When the requested target is not registered, or nothing matches.
 */
export const resolveBuilderDefinition = (context: ConsoleContext, event: IncomingEvent): StoneBuilderDefinition => {
  const definitions = getBuilderDefinitions(context)
  // An empty value means nothing was named: yargs can hand back an empty positional, and a
  // configuration can carry an empty string, neither of which is a target anyone asked for.
  const named = [event.get<string>('target'), context.blueprint.get<string>('stone.builder.target')]
    .find((value) => typeof value === 'string' && value.length > 0)
  const requested = named

  if (definitions.length === 0) {
    throw new CliError('No build target is registered. Check that `stone.builder.builders` was not emptied by a configuration.')
  }

  if (requested !== undefined) {
    const named = definitions.find((definition) => definition.target === requested)

    if (named === undefined) {
      throw new CliError(
        `Unknown build target "${requested}". Registered targets: ${definitions.map((d) => d.target).join(', ')}.`
      )
    }

    return named
  }

  const matched = definitions.find((definition) => definition.match(context.blueprint, event))

  if (matched === undefined) {
    throw new CliError(
      `No build target matched this application. Name one with --target, or set stone.builder.target. Registered targets: ${definitions.map((d) => d.target).join(', ')}.`
    )
  }

  return matched
}

/**
 * Find the builder for this run.
 *
 * @param context - The console context.
 * @param event - The console event, carrying the flags.
 * @returns The builder to drive.
 * @throws {CliError} When the requested target is not registered, or nothing matches.
 */
export const resolveBuilder = (context: ConsoleContext, event: IncomingEvent): StoneBuilder => {
  return resolveBuilderDefinition(context, event).resolver(context)
}

/**
 * Run one step of a builder.
 *
 * A target that does not implement a step says so by name, rather than failing on an
 * undefined call: a native application has no `preview`, and that is worth a sentence.
 *
 * @param context - The console context.
 * @param event - The console event.
 * @param step - The step to run.
 * @param args - Extra arguments for the step.
 * @throws {CliError} When the resolved target does not support the step.
 */
export const runBuilderStep = async (
  context: ConsoleContext,
  event: IncomingEvent,
  step: keyof StoneBuilder,
  ...args: unknown[]
): Promise<void> => {
  const builder = resolveBuilder(context, event)
  const handler = builder[step]

  if (typeof handler !== 'function') {
    const target = event.get<string>('target') ?? context.blueprint.get<string>('stone.builder.target') ?? 'the resolved target'
    throw new CliError(`The "${String(step)}" step is not supported by ${String(target)}.`)
  }

  await (handler as (...params: unknown[]) => Promise<void>).call(builder, event, ...args)
}
