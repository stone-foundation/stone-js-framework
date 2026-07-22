import { NODE_CONSOLE_PLATFORM } from '../src/constants'
import { SetMcpCommandsMiddleware, metaMcpDevBlueprintMiddleware } from '../src/middleware/BlueprintMiddleware'

const makeCtx = (platform?: string): any => ({
  blueprint: { get: vi.fn(() => platform), add: vi.fn() }
})

describe('SetMcpCommandsMiddleware', () => {
  it('registers the mcp command on the node console platform', async () => {
    const ctx = makeCtx(NODE_CONSOLE_PLATFORM)
    const next = vi.fn(async () => ctx.blueprint)

    await SetMcpCommandsMiddleware(ctx, next)

    expect(ctx.blueprint.add).toHaveBeenCalledWith(
      'stone.adapter.commands',
      expect.arrayContaining([expect.objectContaining({ isClass: true })])
    )
    expect(next).toHaveBeenCalledWith(ctx)
  })

  it('does nothing off the console platform', async () => {
    const ctx = makeCtx('http')
    const next = vi.fn(async () => ctx.blueprint)

    await SetMcpCommandsMiddleware(ctx, next)

    expect(ctx.blueprint.add).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalled()
  })

  it('exposes the middleware meta at priority 5', () => {
    expect(metaMcpDevBlueprintMiddleware[0].priority).toBe(5)
  })
})
