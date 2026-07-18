import chalk from 'chalk'
import ora, { Ora } from 'ora'
import ProgressBar from 'progress'
import { CommandOutput } from '../../src/command/CommandOutput'

describe('CommandOutput', () => {
  let mockSpinner: Ora
  let mockStdConsole: Console
  let mockSmartConsole: typeof ora
  let commandOutput: CommandOutput

  beforeEach(() => {
    // Mock standard console methods
    mockStdConsole = {
      ...console,
      log: vi.fn(),
      table: vi.fn()
    } as unknown as Console

    // Mock Ora spinner
    mockSpinner = {
      start: vi.fn().mockReturnThis(),
      info: vi.fn().mockReturnThis(),
      fail: vi.fn().mockReturnThis(),
      warn: vi.fn().mockReturnThis(),
      succeed: vi.fn().mockReturnThis()
    } as unknown as Ora

    // Mock smart console (ora)
    mockSmartConsole = vi.fn().mockReturnValue(mockSpinner)

    // Create CommandOutput instance
    commandOutput = CommandOutput.create({ stdConsole: mockStdConsole, smartConsole: mockSmartConsole, format: chalk })
  })

  it('should create a CommandOutput instance', () => {
    expect(commandOutput).toBeInstanceOf(CommandOutput)
    expect(commandOutput.format).toBe(chalk)
  })

  it('should display uncolored text with show()', () => {
    commandOutput.show('Hello, World!')
    expect(mockStdConsole.log).toHaveBeenCalledWith('Hello, World!')
  })

  it('should display a table with table()', () => {
    const data = { key: 'value' }
    commandOutput.table(data)
    expect(mockStdConsole.table).toHaveBeenCalledWith(data, undefined)
  })

  it('should output a line break with breakLine()', () => {
    commandOutput.breakLine(2)
    expect(mockStdConsole.log).toHaveBeenCalledWith('\n')
  })

  it('should display info-colored text with info()', () => {
    commandOutput.info('Information', true)
    expect(mockSmartConsole).toHaveBeenCalledWith(chalk.blueBright('Information'))
    expect(mockSpinner.info).toHaveBeenCalled()
  })

  it('should display uncolored info text with info()', () => {
    commandOutput.info('Information', false)
    expect(mockSmartConsole).toHaveBeenCalledWith('Information')
    expect(mockSpinner.info).toHaveBeenCalled()
  })

  it('should display error-colored text with error()', () => {
    commandOutput.error('Error message', true)
    expect(mockSmartConsole).toHaveBeenCalledWith(chalk.redBright('Error message'))
    expect(mockSpinner.fail).toHaveBeenCalled()
  })

  it('should display uncolored error text with error()', () => {
    commandOutput.error('Error message', false)
    expect(mockSmartConsole).toHaveBeenCalledWith('Error message')
    expect(mockSpinner.fail).toHaveBeenCalled()
  })

  it('should display warn-colored text with warn()', () => {
    commandOutput.warn('Warning message', true)
    expect(mockSmartConsole).toHaveBeenCalledWith(chalk.yellowBright('Warning message'))
    expect(mockSpinner.warn).toHaveBeenCalled()
  })

  it('should display uncolored warn text with warn()', () => {
    commandOutput.warn('Warning message', false)
    expect(mockSmartConsole).toHaveBeenCalledWith('Warning message')
    expect(mockSpinner.warn).toHaveBeenCalled()
  })

  it('should display success-colored text with succeed()', () => {
    commandOutput.succeed('Success message', true)
    expect(mockSmartConsole).toHaveBeenCalledWith(chalk.greenBright('Success message'))
    expect(mockSpinner.succeed).toHaveBeenCalled()
  })

  it('should display uncolored success text with succeed()', () => {
    commandOutput.succeed('Success message', false)
    expect(mockSmartConsole).toHaveBeenCalledWith('Success message')
    expect(mockSpinner.succeed).toHaveBeenCalled()
  })

  it('should create and start a spinner with spin()', () => {
    const spinner = commandOutput.spin('Loading...')
    expect(mockSmartConsole).toHaveBeenCalledWith('Loading...')
    expect(mockSpinner.start).toHaveBeenCalled()
    expect(spinner).toBe(mockSpinner)
  })

  it('should create a spinner instance with spinner()', () => {
    const spinner = commandOutput.spinner('Loading...')
    expect(mockSmartConsole).toHaveBeenCalledWith('Loading...')
    expect(spinner).toBe(mockSpinner)
  })

  it('should create a progress bar with progressBar()', () => {
    vi.spyOn(ProgressBar.prototype, 'tick').mockImplementation(() => {})
    const progressBar = commandOutput.progressBar(':bar', { total: 100 })
    expect(progressBar).toBeInstanceOf(ProgressBar)
    expect(progressBar).toHaveProperty('tick')
  })
})
