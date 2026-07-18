#!/usr/bin/env node

/**
 * Entry Point for the Stone.js CLI Application
 * 
 * This script serves as the main entry point for running a Stone.js application in a CLI environment.
 * It initializes the necessary configuration, resolves the current adapter, and executes the CLI application.
 * 
 * @see {@link https://stonejs.dev/docs Stone.js Documentation}
 */
import { stoneCliBlueprint } from '../dist/index.js'
import { stoneBlueprint, stoneApp } from '@stone-js/core'
import { MetaCommandRouterEventHandler, nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'

try {
  // Handle exit signals gracefully
  process.on('SIGINT', () => process.exit(0))
  process.on('SIGTERM', () => process.exit(0))
  
  /**
   * Execute the CLI application.
   * 
   * Initializes the Stone.js application using the resolved blueprint and executes the CLI commands.
   */
  await stoneApp()
    .configure((blueprint) => {
      blueprint
        .set(stoneBlueprint)
        .set(nodeConsoleAdapterBlueprint)
        .set(stoneCliBlueprint)
        .set('stone.kernel.eventHandler', MetaCommandRouterEventHandler)
    })
    .run();
} catch (error) {
  console.error('Error running Stone commands:\n', error)
  process.exit(1)
}
