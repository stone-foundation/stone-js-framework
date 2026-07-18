import fsExtra from 'fs-extra'
import { buildPath } from '@stone-js/filesystem'
import { viteDevServerTemplate } from '../../src/react/stubs'
import { ReactPreviewMiddleware } from '../../src/react/ReactPreviewMiddleware'

const { outputFileSync } = fsExtra

vi.mock('fs-extra', async () => ({
  default: {
    outputFileSync: vi.fn()
  }
}))

vi.mock('@stone-js/filesystem', async () => ({
  buildPath: vi.fn(() => '/dist/preview.mjs')
}))

vi.mock('../../src/react/stubs', async () => ({
  viteDevServerTemplate: vi.fn(() => '// vite server stub')
}))

describe('ReactPreviewMiddleware', () => {
  const blueprint = { get: vi.fn() } as any
  const context = { blueprint }
  const next = vi.fn(async (ctx) => ctx.blueprint)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should generate preview.mjs using viteDevServerTemplate', async () => {
    const middlewareFn: any = ReactPreviewMiddleware[0].module
    const result = await middlewareFn(context, next)

    expect(buildPath).toHaveBeenCalledWith('preview.mjs')
    expect(viteDevServerTemplate).toHaveBeenCalledWith('runPreviewServer')
    expect(outputFileSync).toHaveBeenCalledWith(
      '/dist/preview.mjs',
      '// vite server stub',
      'utf-8'
    )
    expect(next).toHaveBeenCalledWith(context)
    expect(result).toBe(blueprint)
  })
})
