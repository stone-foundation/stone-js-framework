// Mock every entry decorator to a no-op so importing the app under test stays lightweight.
vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), StoneApp: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), Routing: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/cloud-file'), async (importOriginal) => ({ ...(await importOriginal()), CloudFile: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/node-cli-adapter'), async (importOriginal) => ({ ...(await importOriginal()), NodeConsole: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/node-http-adapter'), async (importOriginal) => ({ ...(await importOriginal()), NodeHttp: vi.fn(() => vi.fn()) }))

const { Application } = await import('../app/Application')

describe('Application', () => {
  it('is defined', () => {
    expect(Application).toBeInstanceOf(Function)
  })
})
