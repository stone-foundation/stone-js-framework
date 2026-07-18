#!/usr/bin/env node
import spawn from 'cross-spawn'
import { argv, exit } from 'node:process'

/**
 * Automatically invoke `stone init` from the `@stone-js/cli` entry point.
 * This script forwards CLI arguments, inherits stdio, and exits with the proper code.
 */
const child = spawn('stone', ['init', ...argv.slice(2)], {
  stdio: 'inherit',
  shell: false
})

child.on('error', (error) => {
  console.error(`Failed to run "stone init": ${error.message}`)
  exit(1)
})

child.on('close', (code) => {
  exit(code ?? 1)
})
