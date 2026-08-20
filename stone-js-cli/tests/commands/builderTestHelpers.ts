import { IncomingEvent } from '@stone-js/core'
import { StoneBuilderDefinition } from '../../src/builders/declarations'

/**
 * A console context whose builder registry is whatever a test declares.
 *
 * Registering fake targets rather than mocking the builder classes is the point: it exercises
 * the mechanism a module or a third-party library actually uses, so these tests would catch a
 * change that broke it.
 */
export const makeContext = (
  definitions: Record<string, Partial<StoneBuilderDefinition>>,
  values: Record<string, unknown> = {}
): any => {
  const config: Record<string, unknown> = { 'stone.builder.builders': definitions, ...values }

  return {
    blueprint: {
      get: vi.fn((key: string, fallback?: unknown) => config[key] ?? fallback),
      set: vi.fn((key: string, value: unknown) => { config[key] = value }),
      has: vi.fn((key: string) => key in config),
      is: vi.fn((key: string, value: unknown) => config[key] === value)
    },
    commandInput: { confirm: vi.fn() },
    commandOutput: {
      show: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      format: {
        gray: (v: string) => v,
        yellow: (v: string) => v,
        redBright: (v: string) => v,
        greenBright: (v: string) => v
      }
    }
  }
}

export const makeEvent = (payload: Record<string, unknown> = {}): IncomingEvent => ({
  get: vi.fn((key: string, fallback?: unknown) => payload[key] ?? fallback),
  is: vi.fn((key: string, value: unknown) => payload[key] === value)
} as unknown as IncomingEvent)
