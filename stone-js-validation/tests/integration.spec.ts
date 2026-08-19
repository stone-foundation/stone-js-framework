import { Validator } from '../src/Validator'
import { ValidationError } from '../src/errors/ValidationError'
import { validationBlueprint } from '../src/options/ValidationBlueprint'
import { ValidationServiceProvider } from '../src/ValidationServiceProvider'

describe('ValidationError', () => {
  it('carries issues and exposes an issues record', () => {
    const error = new ValidationError('bad', {
      issues: [
        { path: ['user', 'email'], message: 'invalid' },
        { path: ['user', 'email'], message: 'required' },
        { path: [], message: 'root problem' }
      ]
    })
    expect(error.name).toBe('ValidationError')
    expect(error.issues).toHaveLength(3)
    expect(error.toIssuesRecord()).toEqual({
      'user.email': ['invalid', 'required'],
      _: ['root problem']
    })
  })
})

const makeContainer = (validation: Record<string, unknown> = {}): any => ({
  singletonIf: vi.fn().mockReturnThis(),
  alias: vi.fn().mockReturnThis(),
  instanceIf: vi.fn().mockReturnThis(),
  make: () => ({ get: (_key: string, fallback: unknown) => (Object.keys(validation).length > 0 ? validation : fallback) })
})

describe('ValidationServiceProvider', () => {
  it('registers the Validator singleton with aliases', () => {
    const container = makeContainer()
    new ValidationServiceProvider(container).register()

    expect(container.singletonIf).toHaveBeenCalledWith(Validator, expect.any(Function))
    expect(container.alias).toHaveBeenCalledWith(Validator, ['validator', 'Validator'])

    // The registered factory yields a Validator.
    const factory = container.singletonIf.mock.calls[0][1]
    expect(factory()).toBeInstanceOf(Validator)
  })

  it('binds the schema engines the application declared, and none of its own', () => {
    // The elegant part: a schema class then takes `constructor ({ zod })`, which a test can fake.
    // The module names no engine, so it stays agnostic across Zod, Valibot, ArkType and native.
    const zod = { object: () => {} }
    const container = makeContainer({ engines: { zod } })

    new ValidationServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith('zod', zod)
  })

  it('binds nothing when the application declared no engine', () => {
    const container = makeContainer()

    new ValidationServiceProvider(container).register()

    expect(container.instanceIf).not.toHaveBeenCalled()
  })
})

describe('validationBlueprint', () => {
  it('contributes the validation provider', () => {
    expect(validationBlueprint.stone.providers).toContain(ValidationServiceProvider)
    expect(validationBlueprint.stone.validation).toBeDefined()
  })
})
