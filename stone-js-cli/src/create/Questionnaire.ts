import fsExtra from 'fs-extra'
import { CliError } from '../errors/CliError'
import { basePath } from '@stone-js/filesystem'
import { ConsoleContext } from '../declarations'
import { getAvailableStarters } from './StarterContract'

const { pathExistsSync } = fsExtra

/**
 * Represents a Questionnaire to guide users in creating a Stone.js application.
 */
export class Questionnaire {
  /**
   * Factory method to create a new Questionnaire instance.
   *
   * @param context - The service container to manage dependencies.
   * @returns A new instance of Questionnaire.
   */
  static create (context: ConsoleContext): Questionnaire {
    return new this(context)
  }

  /**
   * Initializes a new Questionnaire instance.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Returns the available starters: those from the configured/default links plus any
   * auto-detected installed starter packages. The CLI knows nothing about specific starters —
   * titles come from each starter's own manifest.
   */
  private async getTemplates (): Promise<Array<Record<'value' | 'title', string>>> {
    const starters = await getAvailableStarters(this.context.blueprint, {
      cwd: basePath(),
      output: { info: (message: string) => this.context.commandOutput.info(message) }
    })
    return starters.map(({ value, title }) => ({ value, title: title ?? value }))
  }

  /**
   * Returns the available typing options.
   */
  private get typings (): Array<Record<'value' | 'title', string>> {
    return [
      { value: 'typescript', title: 'TypeScript' },
      { value: 'vanilla', title: 'None (Vanilla)' }
    ]
  }

  /**
   * Returns the available package managers.
   */
  private get packageManagers (): Array<Record<'value' | 'title', string>> {
    return [
      { value: 'npm', title: 'Npm' },
      { value: 'yarn', title: 'Yarn' },
      { value: 'pnpm', title: 'Pnpm' }
    ]
  }

  /**
   * Returns the available Stone.js modules.
   */
  private get stoneModules (): Array<Record<'value' | 'title', string>> {
    return [
      // Core
      { value: '@stone-js/router', title: 'Router (universal routing)' },
      { value: '@stone-js/env', title: 'Dotenv (environment variables)' },
      // Frontend
      { value: '@stone-js/use-react', title: 'React (SSR / SSG / SPA)' },
      { value: '@stone-js/use-view', title: 'View engine (framework-agnostic)' },
      { value: '@stone-js/browser-adapter', title: 'Browser Adapter (SPA)' },
      // Node runtimes
      { value: '@stone-js/node-http-adapter', title: 'Node HTTP Adapter (server)' },
      { value: '@stone-js/node-cli-adapter', title: 'Node Console Adapter (CLI)' },
      { value: '@stone-js/node-ws-adapter', title: 'Node WebSocket Adapter' },
      // Edge / Web-standard
      { value: '@stone-js/fetch-adapter', title: 'Fetch Adapter (Web-standard Request)' },
      { value: '@stone-js/edge-adapter', title: 'Edge Adapter (edge runtimes)' },
      // AWS
      { value: '@stone-js/aws-lambda-http-adapter', title: 'AWS Lambda HTTP Adapter' },
      { value: '@stone-js/aws-lambda-adapter', title: 'AWS Lambda Adapter (generic events)' },
      { value: '@stone-js/aws-apigw-ws-adapter', title: 'AWS API Gateway WebSocket Adapter' },
      // Azure
      { value: '@stone-js/azure-functions-http-adapter', title: 'Azure Functions HTTP Adapter' },
      { value: '@stone-js/azure-functions-adapter', title: 'Azure Functions Adapter (generic)' },
      // GCP
      { value: '@stone-js/gcp-cloud-functions-http-adapter', title: 'GCP Cloud Functions HTTP Adapter' },
      { value: '@stone-js/gcp-cloud-functions-adapter', title: 'GCP Cloud Functions Adapter (generic)' },
      // Tencent
      { value: '@stone-js/tencent-scf-http-adapter', title: 'Tencent SCF HTTP Adapter' },
      { value: '@stone-js/tencent-scf-adapter', title: 'Tencent SCF Adapter (generic)' },
      // Alibaba
      { value: '@stone-js/alibaba-fc-http-adapter', title: 'Alibaba FC HTTP Adapter' },
      { value: '@stone-js/alibaba-fc-adapter', title: 'Alibaba FC Adapter (generic)' }
    ]
  }

  /**
   * Returns the available testing frameworks.
   */
  private get testingFrameworks (): Array<Record<'value' | 'title', string>> {
    return [
      { value: '', title: 'None' },
      { value: 'vitest', title: 'Vitest' }
    ]
  }

  /**
   * Returns the messages for prompts.
   */
  private get messages (): Record<string, string> {
    return {
      projectName: 'Project name: ',
      template: 'Starter template: ',
      typing: 'Static type checker: ',
      packageManager: 'Package manager: ',
      modules: 'Stone modules: ',
      testing: 'Testing framework: ',
      initGit: 'Initialize Git repository? ',
      overwrite: 'Overwrite directory: '
    }
  }

  /**
   * Runs the questionnaire and collects user answers.
   *
   * @returns A promise that resolves with the user's answers.
   */
  async getAnswers (): Promise<Record<string, unknown>> {
    const answers: Record<string, string | boolean | string[]> = {}
    const overwrite = this.context.blueprint.get<boolean>('stone.createApp.overwrite')
    const projectName = this.context.blueprint.get<string>('stone.createApp.projectName')

    answers.projectName = projectName ??
      await this.context.commandInput.ask(this.messages.projectName, 'stone-project')

    const projectPath = basePath(answers.projectName)

    if (pathExistsSync(projectPath)) {
      answers.overwrite = overwrite ?? await this.context.commandInput.confirm(
        this.getOverwriteMessage(answers.projectName)
      )

      if (!answers.overwrite) {
        throw new CliError('Operation cancelled by the user.')
      }
    }

    answers.typing = await this.context.commandInput.choice(
      this.messages.typing,
      this.typings,
      [0]
    )

    answers.template = await this.context.commandInput.choice(
      this.messages.template,
      await this.getTemplates(),
      [0]
    )

    answers.packageManager = await this.context.commandInput.choice(
      this.messages.packageManager,
      this.packageManagers,
      [0]
    )

    answers.modules = await this.context.commandInput.choice(
      this.messages.modules,
      this.stoneModules,
      [],
      true
    )

    answers.testing = await this.context.commandInput.choice(
      this.messages.testing,
      this.testingFrameworks,
      [0]
    )

    answers.initGit = await this.context.commandInput.confirm(
      this.messages.initGit
    )

    answers.confirmation = await this.context.commandInput.confirm(
      this.getConfirmationMessage(answers)
    )

    if (!answers.confirmation) {
      throw new CliError('Operation cancelled by the user.')
    }

    return answers
  }

  /**
   * Generates a message to confirm overwriting a directory.
   *
   * @param projectName - The project name.
   * @returns The confirmation message.
   */
  private getOverwriteMessage (projectName: string): string {
    return `Target directory (${basePath(projectName)}) is not empty. Remove existing files and continue?`
  }

  /**
   * Generates a summary of the user's answers for confirmation.
   *
   * @param answers - The user's answers.
   * @returns The confirmation message.
   */
  private getConfirmationMessage (answers: Record<string, any>): string {
    const message = Object.entries(answers)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${String(this.messages[key])}${this.context.commandOutput.format.blue(value)}`)
      .join('\n')

    return `Project will be generated with the following configurations:\n${message}\nDo you confirm?`
  }
}
