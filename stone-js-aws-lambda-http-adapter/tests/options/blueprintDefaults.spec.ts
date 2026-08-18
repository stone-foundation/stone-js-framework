import { awsLambdaHttpAdapterBlueprint } from '../../src/options/AwsLambdaHttpAdapterBlueprint'
import { MetaBodyEventMiddleware } from '../../src/middleware/BodyEventMiddleware'
import { MetaIncomingEventMiddleware } from '../../src/middleware/IncomingEventMiddleware'
import { MetaServerResponseMiddleware } from '../../src/middleware/ServerResponseMiddleware'

describe('awsLambdaHttpAdapterBlueprint defaults', () => {
  it('parses the request body without any middleware configuration', () => {
    // The reported production trap: this adapter's body middleware was the one forgotten, so the
    // app answered correctly in dev on Node and received an empty body once deployed.
    const [adapter] = (awsLambdaHttpAdapterBlueprint.stone as any).adapters

    expect(adapter.middleware).toContain(MetaBodyEventMiddleware)
    expect(adapter.middleware).toEqual([
      MetaIncomingEventMiddleware,
      MetaBodyEventMiddleware,
      MetaServerResponseMiddleware
    ])
  })
})
