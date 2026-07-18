import type { PromptObject, Choice } from 'prompts'
import { CommandInput } from '../../src/command/CommandInput'

describe('CommandInput', () => {
  let mockPrompts: ReturnType<typeof vi.fn>
  let input: CommandInput

  beforeEach(() => {
    mockPrompts = vi.fn()
    // @ts-expect-error: force inject mock
    input = CommandInput.create({ prompts: mockPrompts })
  })

  it('should return raw prompt value for generic prompt()', async () => {
    mockPrompts.mockResolvedValue({ value: 'hello' })
    const result = await input.prompt<string>({ message: 'Say hi', type: 'text' } as unknown as PromptObject)
    expect(mockPrompts).toHaveBeenCalledWith({ message: 'Say hi', type: 'text', name: 'value' })
    expect(result).toBe('hello')
  })

  it('should ask for a string', async () => {
    mockPrompts.mockResolvedValue({ value: 'stone' })
    const result = await input.ask('Your name?')
    expect(result).toBe('stone')
    expect(mockPrompts).toHaveBeenCalledWith({
      message: 'Your name?',
      type: 'text',
      initial: undefined,
      name: 'value'
    })
  })

  it('should ask for a string with fallback', async () => {
    mockPrompts.mockResolvedValue({ value: 'fallback-name' })
    const result = await input.ask('Your name?', 'fallback-name')
    expect(result).toBe('fallback-name')
  })

  it('should ask for a number', async () => {
    mockPrompts.mockResolvedValue({ value: 42 })
    const result = await input.askNumber('Your age?')
    expect(result).toBe(42)
  })

  it('should ask for a number with fallback', async () => {
    mockPrompts.mockResolvedValue({ value: 99 })
    const result = await input.askNumber('Your age?', 99)
    expect(result).toBe(99)
  })

  it('should ask for a secret (password)', async () => {
    mockPrompts.mockResolvedValue({ value: 'secret!' })
    const result = await input.secret('Enter password')
    expect(result).toBe('secret!')
  })

  it('should confirm (true)', async () => {
    mockPrompts.mockResolvedValue({ value: true })
    const result = await input.confirm('Are you sure?')
    expect(result).toBe(true)
  })

  it('should confirm (false fallback)', async () => {
    mockPrompts.mockResolvedValue({ value: false })
    const result = await input.confirm('Are you sure?', false)
    expect(result).toBe(false)
  })

  it('should select from choices (single)', async () => {
    mockPrompts.mockResolvedValue({ value: 'B' })
    const choices: Choice[] = [
      { title: 'Option A', value: 'A' },
      { title: 'Option B', value: 'B' }
    ]
    const result = await input.choice('Pick one', choices)
    expect(result).toBe('B')
    expect(mockPrompts).toHaveBeenCalledWith({
      message: 'Pick one',
      choices,
      initial: 0,
      type: 'select',
      name: 'value'
    })
  })

  it('should select from choices (multi)', async () => {
    mockPrompts.mockResolvedValue({ value: ['A', 'C'] })
    const choices: Choice[] = [
      { title: 'Option A', value: 'A' },
      { title: 'Option B', value: 'B' },
      { title: 'Option C', value: 'C' }
    ]
    const result = await input.choice('Pick many', choices, [0], true)
    expect(result).toEqual(['A', 'C'])
    expect(mockPrompts).toHaveBeenCalledWith({
      message: 'Pick many',
      choices,
      initial: 0,
      type: 'multiselect',
      name: 'value'
    })
  })

  it('should simulate an editor prompt', async () => {
    mockPrompts.mockResolvedValue({ value: 'multi\nline\ntext' })
    const result = await input.editor('Describe')
    expect(result).toBe('multi\nline\ntext')
    expect(mockPrompts).toHaveBeenCalledWith({
      type: 'text',
      message: 'Describe (You can copy/paste multi-line input)',
      initial: undefined,
      name: 'value'
    })
  })

  it('should simulate editor with fallback', async () => {
    mockPrompts.mockResolvedValue({ value: 'fallback content' })
    const result = await input.editor('Describe', 'fallback content')
    expect(result).toBe('fallback content')
  })
})
