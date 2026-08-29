import { decoratorSemantics } from '../src/vitest'

describe('the decorator semantics a runner has to be told', () => {
  it('turns the flag off, and defines class fields', () => {
    // The two options that decide which decorator form esbuild emits, and nothing else: everything
    // else keeps coming from the project's own tsconfig, so JSX, target and paths behave as usual.
    expect(decoratorSemantics).toEqual({
      tsconfigRaw: { compilerOptions: { experimentalDecorators: false, useDefineForClassFields: true } }
    })
  })

  it('is the same value `stone test` generates, so a project gets one answer', () => {
    // The CLI writes these two options into the config it generates. Published here for a project
    // that keeps its own runner config, and asserted so the two cannot drift into two answers.
    const generated = { experimentalDecorators: false, useDefineForClassFields: true }

    expect(decoratorSemantics.tsconfigRaw.compilerOptions).toEqual(generated)
  })
})
