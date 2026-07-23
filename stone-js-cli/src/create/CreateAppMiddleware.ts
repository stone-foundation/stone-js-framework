import fsExtra from 'fs-extra'
import { join } from 'node:path'
import simpleGit from 'simple-git'
import { CliError } from '../errors/CliError'
import { execFileSync } from 'node:child_process'
import { MetaPipe, NextPipe } from '@stone-js/pipeline'
import { IBlueprint, isNotEmpty } from '@stone-js/core'
import { basePath } from '@stone-js/filesystem'
import { CreateAppConfig } from '../options/CreateAppConfig'
import { ConsoleContext, PackageJson } from '../declarations'
import { deriveVanilla } from './vanilla'
import { getAvailableStarters, materializeStarter } from './StarterContract'

const { pathExistsSync, existsSync, renameSync, removeSync, readJsonSync, writeJsonSync } = fsExtra

/**
 * Materialise the selected starter into the destination directory.
 *
 * Resolves the starter from the registered providers (the default official provider or any
 * third-party provider declared under `stone.createApp.starters`) and copies its files using
 * the starter's own source (git/local/custom). Nothing about the starter set is hard-coded here.
 *
 * @param context - Input data to transform via middleware.
 * @param next - Function to pass to the next middleware.
 * @returns A promise resolving with the context object.
 */
export const CloneStarterMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const {
    overwrite = false,
    projectName = 'stone-project',
    template = 'basic-service-declarative'
  } = context.blueprint.get<CreateAppConfig>('stone.createApp', {} as any)

  const destDir = basePath(projectName)

  if (!overwrite && pathExistsSync(destDir)) {
    throw new CliError(`Target directory (${destDir}) is not empty. Remove existing files and continue.`)
  }

  const starters = await getAvailableStarters(context.blueprint, {
    cwd: basePath(),
    output: { info: (message: string) => context.commandOutput.info(message) }
  })
  const starter = starters.find((s) => s.value === template) ?? starters[0]

  if (starter === undefined) {
    throw new CliError('No starter available. Pass one with `--starters <link>` or install a starter package.')
  }

  context.commandOutput.info(`Creating project in ${destDir}`)

  existsSync(destDir) && removeSync(destDir)

  materializeStarter(starter, destDir)

  const packageJson = readJsonSync(join(destDir, 'package.json'))

  context.blueprint.add('stone.createApp', { destDir, packageJson })

  return await next(context)
}

/**
 * Install dependencies.
 *
 * @param context - Input data to transform via middleware.
 * @param next - Function to pass to the next middleware.
 * @returns A promise resolving with the context object.
 */
export const InstallDependenciesMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const {
    testing,
    destDir,
    modules = [],
    packageManager
  } = context.blueprint.get<CreateAppConfig>('stone.createApp', {} as any)

  const allowedManagers = ['npm', 'yarn', 'pnpm']

  if (!allowedManagers.includes(packageManager)) {
    throw new CliError(`Unsupported package manager: ${packageManager}`)
  }

  const installCmd = packageManager === 'yarn' ? 'add' : 'install'
  const testingDeps = testing === 'vitest' ? ['@vitest/coverage-v8'] : []

  context.commandOutput.info('Installing packages. This might take a while...')

  const packages = [modules, testing, testingDeps].flat()

  execFileSync(packageManager, [installCmd, ...packages], {
    cwd: destDir,
    shell: false,
    stdio: 'inherit'
  })

  // The package manager just rewrote package.json on disk with the chosen modules in
  // `dependencies`. Re-read it so the finalize step writes THAT manifest, not the stale copy
  // captured before install (which would silently drop every module the user selected).
  if (destDir !== undefined) {
    context.blueprint.add('stone.createApp', { packageJson: readJsonSync(join(destDir, 'package.json')) })
  }

  return await next(context)
}

/**
 * Convert the scaffolded project to vanilla JavaScript when `typing === 'vanilla'`.
 *
 * Stone.js is a TypeScript AND JavaScript framework: the templates are authored once in TS and
 * the JS variant is DERIVED (types stripped, stage-3 decorators preserved), so both the
 * declarative and imperative APIs are available 1:1 in TS and JS without a second template set.
 *
 * @param context - Input data to transform via middleware.
 * @param next - Function to pass to the next middleware.
 * @returns A promise resolving with the context object.
 */
export const ConvertToVanillaMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const { typing, destDir = '' } = context.blueprint.get<CreateAppConfig>('stone.createApp', {} as any)

  if (typing === 'vanilla' && destDir.length > 0) {
    const generated = deriveVanilla(join(destDir, 'app'))
    context.commandOutput.info(`Converted ${generated.length} file(s) to vanilla JavaScript.`)
  }

  return await next(context)
}

/**
 * Configure testing.
 *
 * @param context - Input data to transform via middleware.
 * @param next - Function to pass to the next middleware.
 * @returns A promise resolving with the context object.
 */
export const ConfigureTestingMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const {
    typing,
    testing,
    packageJson,
    destDir = ''
  } = context.blueprint.get<CreateAppConfig>('stone.createApp', {} as any)

  if (testing !== 'vitest') {
    if (isNotEmpty<PackageJson>(packageJson)) {
      delete packageJson.scripts.test
      delete packageJson.scripts['test:cvg']
    }
    removeSync(join(destDir, 'vitest.config.ts'))
  } else if (typing === 'vanilla') {
    renameSync(join(destDir, 'vitest.config.ts'), join(destDir, 'vitest.config.js'))
  }

  return await next(context)
}

/**
 * Finalize setup.
 *
 * @param context - Input data to transform via middleware.
 * @param next - Function to pass to the next middleware.
 * @returns A promise resolving with the context object.
 */
export const FinalizeMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const {
    packageJson,
    destDir = '',
    packageManager,
    initGit = false,
    projectName: changeDir = ''
  } = context.blueprint.get<CreateAppConfig>('stone.createApp', {} as any)
  const projectName = destDir.split('/').pop()
  const scriptPrefix = packageManager === 'yarn' ? 'yarn' : `${packageManager} run`

  writeJsonSync(join(destDir, 'package.json'), packageJson, { spaces: 2 })

  if (initGit) {
    const git = simpleGit(destDir)
    await git.init()
    await git.add('.')
    await git.commit('Initial commit')
  }

  context.commandOutput.breakLine(1)
  context.commandOutput.succeed(`Successfully created Stone's project "${String(projectName)}"`)
  context.commandOutput.show(`
  🎉 Happy coding!

  To get started:

    cd ${String(changeDir)}/
    ${scriptPrefix} dev

  To build for production:

    ${scriptPrefix} build

  To preview production build:

    ${scriptPrefix} preview

  Documentation:

    Check https://stonejs.dev
  `)

  return await next(context)
}

/**
 * Array of builder pipes with their priorities.
 */
export const CreateAppMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { priority: 0, module: CloneStarterMiddleware },
  { priority: 1, module: ConvertToVanillaMiddleware },
  { priority: 2, module: InstallDependenciesMiddleware },
  { priority: 3, module: ConfigureTestingMiddleware },
  { priority: 4, module: FinalizeMiddleware }
]
