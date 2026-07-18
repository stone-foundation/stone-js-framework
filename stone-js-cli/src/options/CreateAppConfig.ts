import { PackageJson } from '../declarations'

/**
 * Configuration for creating a new Stone.js Application.
 * Used internally by the `init` command.
 */
export interface CreateAppConfig {
  typing: string
  testing: string
  linting: string
  srcDir?: string
  initGit: boolean
  template: string
  destDir?: string
  modules: string[]
  overwrite: boolean
  projectName: string
  startersRepo: string
  packageManager: string
  packageJson?: PackageJson
  /**
   * Starter links (git/npm/local) to fetch, e.g. `github:owner/repo`, `@acme/stone-starters`,
   * `./my-starter`. Also set via `--starters link1,link2`. Empty = the built-in default link.
   * The CLI stays agnostic: each linked package declares its own starters via `stone.starters`
   * in its package.json. Installed starter packages are additionally auto-detected (0-config).
   */
  starters?: string[]
}

/**
 * Default configuration for creating a new Stone.js Application.
 */
export const createApp: CreateAppConfig = {
  modules: [],
  initGit: true,
  testing: 'vitest',
  overwrite: false,
  typing: 'typescript',
  template: 'basic-service-declarative',
  linting: 'standard',
  packageManager: 'npm',
  projectName: 'stone-app',
  startersRepo: 'https://github.com/stone-foundation/stone-js-starters.git'
}
