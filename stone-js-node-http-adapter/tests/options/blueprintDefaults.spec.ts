import { Pipeline } from '@stone-js/pipeline'
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

  it('appears exactly once, and a duplicate collapses in the pipeline', async () => {
    // Apps written before this default (the official starters among them) pass the middleware
    // themselves. Reading a Node request stream twice would hang or yield an empty body, so what
    // matters is that the duplicate collapses: the pipeline dedupes by module identity.
    const [adapter] = (nodeHttpAdapterBlueprint.stone as any).adapters
    const occurrences = adapter.middleware.filter((m: unknown) => m === MetaBodyEventMiddleware)
    expect(occurrences).toHaveLength(1)

    let runs = 0
    const spy = {
      module: class {
        async handle (context: unknown, next: (c: unknown) => Promise<unknown>): Promise<unknown> {
          runs++
          return await next(context)
        }
      },
      isClass: true
    }

    await Pipeline
      .create<any, any>({ resolver: (meta: any) => new meta.module() })
      .send({})
      .through(spy, spy)
      .then((v: unknown) => v)

    expect(runs).toBe(1)
  })
})
