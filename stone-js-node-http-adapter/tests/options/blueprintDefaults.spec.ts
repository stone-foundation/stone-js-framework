import { nodeHttpAdapterBlueprint } from '../../src/options/NodeHttpAdapterBlueprint'
import { MetaBodyEventMiddleware } from '../../src/middleware/BodyEventMiddleware'
import { MetaIncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../../src/middleware/ServerResponseMiddleware'

describe('nodeHttpAdapterBlueprint defaults', () => {
  it('parses the request body without any middleware configuration', () => {
    // Leaving this opt-in meant an app worked locally and received an empty body in production the
    // day one of its adapters was missing the line, with no error anywhere.
    const [adapter] = (nodeHttpAdapterBlueprint.stone as any).adapters

    expect(adapter.middleware).toContain(MetaBodyEventMiddleware)
    expect(adapter.middleware).toEqual([
      MetaIncomingEventMiddleware,
      MetaBodyEventMiddleware,
      MetaServerResponseMiddleware
    ])
  })

  it('appears exactly once in the defaults', () => {
    // Apps written before this default (the official starters among them) pass the middleware
    // themselves, and reading a Node request stream twice would hang or yield an empty body. What
    // makes that safe is that the pipeline runs a duplicated module once, which is asserted where it
    // belongs, in `@stone-js/pipeline` ("runs a module once when it is registered twice"). All this
    // package has to guarantee is that it does not ship the duplicate itself.
    const [adapter] = (nodeHttpAdapterBlueprint.stone as any).adapters
    const occurrences = adapter.middleware.filter((m: unknown) => m === MetaBodyEventMiddleware)

    expect(occurrences).toHaveLength(1)
  })
})
