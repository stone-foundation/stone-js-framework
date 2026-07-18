import prompts, { Choice, PromptObject } from 'prompts'

/**
 * CommandInputOptions
 */
export interface CommandInputOptions {
  prompts: typeof prompts
}

/**
 * Class representing a CommandInput Facade.
 * Provides a simplified and consistent API for prompting users in the terminal
 * using the `prompts` library. Supports a variety of question types,
 * such as text, number, confirm, password, select, multiselect, and more.
 */
export class CommandInput {
  /**
   * A reference to the `prompts` function used to interact with users.
   */
  private readonly _prompts: typeof prompts

  /**
   * Factory method to create a new CommandInput instance.
   *
   * @param options - The options to configure the CommandInput instance.
   * @returns A new instance of CommandInput.
   */
  static create (options: CommandInputOptions): CommandInput {
    return new this(options)
  }

  /**
   * Constructor for creating a CommandInput instance.
   *
   * @param options - The configuration for the instance.
   */
  private constructor ({ prompts }: CommandInputOptions) {
    this._prompts = prompts
  }

  /**
   * Prompts the user with a single question and returns the response.
   *
   * @param question - A prompt object without a `name`, which will be set to 'value'.
   * @returns The user's input cast to the specified type.
   */
  async prompt<T>(question: Omit<PromptObject, 'name'>): Promise<T> {
    const result = await this._prompts({
      ...question,
      name: 'value'
    })
    return result.value
  }

  /**
   * Asks the user for a string input.
   *
   * @param message - The question to display to the user.
   * @param fallback - An optional default value.
   * @returns The user's response as a string.
   */
  async ask (message: string, fallback?: string): Promise<string> {
    return await this.prompt<string>({
      message,
      type: 'text',
      initial: fallback
    })
  }

  /**
   * Asks the user for a numeric input.
   *
   * @param message - The question to display to the user.
   * @param fallback - An optional default numeric value.
   * @returns The user's response as a number.
   */
  async askNumber (message: string, fallback?: number): Promise<number> {
    return await this.prompt<number>({
      message,
      type: 'number',
      initial: fallback
    })
  }

  /**
   * Asks the user for a hidden (secret) input such as a password.
   *
   * @param message - The message to display to the user.
   * @returns The user's input as a string.
   */
  async secret (message: string): Promise<string> {
    return await this.prompt<string>({
      message,
      type: 'password'
    })
  }

  /**
   * Asks the user for a yes/no confirmation.
   *
   * @param message - The confirmation message to show.
   * @param fallback - The default value if the user provides no response (defaults to false).
   * @returns The user's response as a boolean.
   */
  async confirm (message: string, fallback = false): Promise<boolean> {
    return await this.prompt<boolean>({
      message,
      type: 'confirm',
      initial: fallback
    })
  }

  /**
   * Asks the user to choose from a list of options.
   *
   * @param message - The message to display to the user.
   * @param choices - A list of string options to choose from.
   * @param fallbackIndex - An array of fallback selected indices (default is first).
   * @param multiple - Whether to allow multiple selections (checkbox style).
   * @returns The user's selection(s) as a string or array of strings.
   */
  async choice (
    message: string,
    choices: Choice[],
    fallbackIndex: number[] = [0],
    multiple = false
  ): Promise<string | string[]> {
    return await this.prompt<string | string[]>({
      message,
      choices,
      initial: fallbackIndex[0],
      type: multiple ? 'multiselect' : 'select'
    })
  }

  /**
   * Opens a pseudo-editor by asking the user to input a multi-line value in the terminal.
   * (Note: actual editor support is limited in `prompts`, so this simulates one via text input).
   *
   * @param message - The message to display to the user.
   * @param fallback - An optional default value.
   * @returns The user's response as a string.
   */
  async editor (message: string, fallback?: string): Promise<string> {
    return await this.prompt<string>({
      type: 'text',
      initial: fallback,
      message: `${message} (You can copy/paste multi-line input)`
    })
  }
}
