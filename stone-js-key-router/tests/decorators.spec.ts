/* eslint-disable @typescript-eslint/no-extraneous-class */
import { addMetadata, getMetadata } from '@stone-js/core'
import { createKeyDecorator, collectKeyHandlers, defineKeyHandler } from '../src/decorators'

vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addMetadata: vi.fn(() => {}),
    getMetadata: vi.fn(() => [{ key: 'a', action: 'onA' }]),
    methodDecoratorLegacyWrapper: vi.fn((fn: Function) => fn)
  }
})

const META = Symbol('test.key')

describe('key-router decorators', () => {
  it('createKeyDecorator annotates the method with { key, action } under the metadata key', () => {
    const OnKey = createKeyDecorator(META)
    const decorator = OnKey('send') as any
    decorator(() => {}, { kind: 'method', name: 'handleSend', metadata: {} })
    expect(addMetadata).toHaveBeenCalledWith(expect.objectContaining({ name: 'handleSend' }), META, { key: 'send', action: 'handleSend' })
  })

  it('collectKeyHandlers reads the declared method handlers from a class', () => {
    class Gateway {}
    expect(collectKeyHandlers(Gateway, META)).toEqual([{ key: 'a', action: 'onA' }])
    expect(getMetadata).toHaveBeenCalledWith(Gateway, META, [])
  })

  it('defineKeyHandler builds a meta-module', () => {
    const fn = (): void => {}
    class Job {}
    expect(defineKeyHandler('ping', fn)).toEqual({ key: 'ping', module: fn })
    expect(defineKeyHandler('send', Job, { isClass: true, action: 'run' })).toEqual({ key: 'send', module: Job, isClass: true, action: 'run' })
  })
})
