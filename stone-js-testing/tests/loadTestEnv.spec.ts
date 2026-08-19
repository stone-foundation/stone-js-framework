import { loadTestEnv } from '../src/loadTestEnv'

describe('loadTestEnv', () => {
  const saved = { ...process.env }

  afterEach(() => {
    process.env = { ...saved }
  })

  it('loads the file into the environment', async () => {
    const loaded = loadTestEnv('tests/fixtures/.env.test')

    expect(loaded).toMatchObject({ STONE_TESTING_FIXTURE: 'from-file' })
    expect(process.env.STONE_TESTING_FIXTURE).toBe('from-file')
  })

  it('never overrides a value the environment already has', async () => {
    // `FOO=bar pnpm test` and CI secrets have to keep winning: a committed file must not be able to
    // silently replace them.
    process.env.STONE_TESTING_ALREADY_SET = 'from-shell'

    loadTestEnv('tests/fixtures/.env.test')

    expect(process.env.STONE_TESTING_ALREADY_SET).toBe('from-shell')
  })

  it('treats a missing file as the normal case, not a failure', async () => {
    // Most projects need no env file at all; booting must not depend on one existing.
    expect(loadTestEnv('tests/fixtures/.env.does-not-exist')).toEqual({})
  })
})

describe('loadTestEnv, on an empty file', () => {
  it('contributes nothing without failing', () => {
    // An `.env.test` that exists but is empty is a normal state of a growing project.
    expect(loadTestEnv('tests/fixtures/.env.empty')).toEqual({})
  })
})

describe('loadTestEnv, on a path it cannot read', () => {
  it('contributes nothing rather than failing the whole run', () => {
    // A path that exists but is not a readable file (here, a directory bearing the name). Booting a
    // test app must not die on it: the env file is an input, not a prerequisite.
    expect(loadTestEnv('tests/fixtures')).toEqual({})
  })
})
