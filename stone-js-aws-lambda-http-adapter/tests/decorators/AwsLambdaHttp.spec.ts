import { addBlueprint, classDecoratorLegacyWrapper } from '@stone-js/core'
import { AwsLambdaHttp, AwsLambdaHttpOptions } from '../../src/decorators/AwsLambdaHttp'
import { awsLambdaHttpAdapterBlueprint } from '../../src/options/AwsLambdaHttpAdapterBlueprint'
import { AwsLambdaHttp as BrowserAwsLambdaHttp } from '../../src/browser/decorators/AwsLambdaHttp'
import { awsLambdaHttpAdapterBlueprint as browserAwsLambdaHttpAdapterBlueprint } from '../../src/browser/options/NodeHttpAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock @stone-js/core
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: vi.fn((fn: Function) => {
      fn()
      return fn
    })
  }
})

describe('AwsLambdaHttp', () => {
  it('should call addBlueprint with correct parameters', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    const options: AwsLambdaHttpOptions = awsLambdaHttpAdapterBlueprint.stone.adapters?.[0] ?? {}
    AwsLambdaHttp(options)(class {})
    BrowserAwsLambdaHttp()(class {})
    expect(addBlueprint).toHaveBeenCalled()
    expect(classDecoratorLegacyWrapper).toHaveBeenCalledTimes(2)
    expect(addBlueprint).not.toHaveBeenCalledWith(expect.any(Function), expect.any(Object), browserAwsLambdaHttpAdapterBlueprint)
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    AwsLambdaHttp()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
