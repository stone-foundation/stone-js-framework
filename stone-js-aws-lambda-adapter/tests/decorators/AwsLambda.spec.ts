import { Mock } from 'vitest'
import { addBlueprint } from '@stone-js/core'
import { AwsLambda, AwsLambdaOptions } from '../../src/decorators/AwsLambda'
import { awsLambdaAdapterBlueprint } from '../../src/options/AwsLambdaAdapterBlueprint'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock @stone-js/core
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => {
      fn()
      return fn
    }
  }
})

describe('AwsLambda', () => {
  it('should call addBlueprint with correct parameters', () => {
    (addBlueprint as Mock).mockReturnValueOnce(() => {})
    const options: AwsLambdaOptions = awsLambdaAdapterBlueprint.stone.adapters?.[0] ?? {}
    AwsLambda(options)(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })

  it('should call addBlueprint with default options if none are provided', () => {
    vi.mocked(addBlueprint).mockImplementation(() => {})
    AwsLambda()(class {})
    expect(addBlueprint).toHaveBeenCalled()
  })
})
