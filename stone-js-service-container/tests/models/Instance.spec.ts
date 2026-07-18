import { Container } from '../../src/Container'
import { Instance } from '../../src/models/Instance'
import { BindingValue } from '../../src/declarations'

describe('Instance', () => {
  let instanceValue: BindingValue
  let instanceBinding: Instance<BindingValue>

  beforeEach(() => {
    instanceValue = 'testInstanceValue'
    instanceBinding = new Instance(instanceValue)
  })

  it('should store the value passed during instantiation', () => {
    expect(instanceBinding.resolve(Container.create())).toBe(instanceValue)
  })

  it('should resolve the same value each time', () => {
    const container = Container.create()
    const firstResolvedValue = instanceBinding.resolve(container)
    const secondResolvedValue = instanceBinding.resolve(container)
    expect(firstResolvedValue).toBe(secondResolvedValue)
  })
})
