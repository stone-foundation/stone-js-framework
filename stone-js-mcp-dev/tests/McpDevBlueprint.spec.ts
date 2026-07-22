import { mcpDevBlueprint, defineMcpDev } from '../src/options/McpDevBlueprint'
import { metaMcpDevBlueprintMiddleware } from '../src/middleware/BlueprintMiddleware'

describe('McpDevBlueprint', () => {
  it('wires the blueprint middleware and an empty tools bucket', () => {
    expect(mcpDevBlueprint.stone.blueprint?.middleware).toBe(metaMcpDevBlueprintMiddleware)
    expect(mcpDevBlueprint.stone.mcpDev.tools).toEqual([])
  })

  it('defineMcpDev carries the given options', () => {
    const bp = defineMcpDev({ name: 'x', quiet: true })
    expect(bp.stone.mcpDev).toEqual({ name: 'x', quiet: true })
    expect(bp.stone.blueprint?.middleware).toBe(metaMcpDevBlueprintMiddleware)
  })

  it('defineMcpDev defaults to empty options', () => {
    expect(defineMcpDev().stone.mcpDev).toEqual({})
  })
})
