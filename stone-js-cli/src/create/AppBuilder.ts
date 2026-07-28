import { Questionnaire } from './Questionnaire'
import { ConsoleContext } from '../declarations'
import { MetaPipe, Pipeline } from '@stone-js/pipeline'
import { IBlueprint, IncomingEvent } from '@stone-js/core'
import { CreateAppMiddleware } from './CreateAppMiddleware'

/**
 * The App builder options.
 */
export interface AppBuilderOptions {
  blueprint: IBlueprint
}

/**
 * The App builder class.
 */
export class AppBuilder {
  /**
   * Creates a new App builder instance.
   *
   * @param context - The service container to manage dependencies.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Builds the application.
   *
   * @param event The incoming event.
   */
  async build (event: IncomingEvent): Promise<void> {
    this.setUserOptions(event)

    if (!event.get<boolean>('yes', false)) {
      const answers = await Questionnaire.create(this.context).getAnswers()
      // `add` merges, `set` on a string key replaces the whole bucket: setting here would erase
      // the options captured above (`starters` above all), so the starter links would be lost and
      // the materialisation step would silently resolve a different starter from the default pack.
      this.context.blueprint.add('stone.createApp', answers)
    }

    await this.executeThroughPipeline(CreateAppMiddleware)
  }

  private setUserOptions (event: IncomingEvent): void {
    this.context.blueprint.set('stone.createApp.overwrite', event.get<boolean>('force'))
    this.context.blueprint.set('stone.createApp.projectName', event.get<string>('project-name'))

    const starters = event.get<string>('starters', '')
      ?.split(',')
      .map((link) => link.trim())
      .filter((link) => link.length > 0)

    if (starters !== undefined && starters.length > 0) {
      this.context.blueprint.set('stone.createApp.starters', starters)
    }

    // `--starter <id>` names one entry inside the linked packages. Flagging the choice as explicit
    // lets the materialisation step fail loudly on a typo instead of scaffolding another starter.
    const starter = event.get<string>('starter', '')?.trim()

    if (starter !== undefined && starter.length > 0) {
      this.context.blueprint.set('stone.createApp.template', starter)
      this.context.blueprint.set('stone.createApp.templateExplicit', true)
    }
  }

  /**
   * Execute the pipeline.
   *
   * @param pipes - The pipeline to execute.
   */
  private async executeThroughPipeline (pipes: Array<MetaPipe<ConsoleContext, IBlueprint>>): Promise<void> {
    await Pipeline
      .create<ConsoleContext, IBlueprint>()
      .send(this.context)
      .through(...pipes)
      .then(context => context.blueprint)
  }
}
