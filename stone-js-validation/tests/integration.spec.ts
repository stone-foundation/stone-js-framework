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

describe('ValidationServiceProvider', () => {
  it('registers the Validator singleton with aliases', () => {
    const container: any = {
      singletonIf: vi.fn().mockReturnThis(),
      alias: vi.fn().mockReturnThis()
    }
    const provider = new ValidationServiceProvider(container)
    provider.register()
    expect(container.singletonIf).toHaveBeenCalledWith(Validator, expect.any(Function))
    expect(container.alias).toHaveBeenCalledWith(Validator, ['validator', 'Validator'])

    // The registered factory yields a Validator.
    const factory = container.singletonIf.mock.calls[0][1]
    expect(factory()).toBeInstanceOf(Validator)
  })
})

describe('validationBlueprint', () => {
  it('contributes the validation provider', () => {
    expect(validationBlueprint.stone.providers).toContain(ValidationServiceProvider)
    expect(validationBlueprint.stone.validation).toBeDefined()
  })
})
