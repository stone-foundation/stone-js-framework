import chalk from 'chalk'

/**
 * Render the Stone.js CLI signature banner:
 *
 * ```
 * ◆ Stone.js
 *   ───────────────────────────
 *   The continuum framework
 * ```
 *
 * Printed by the adapter on every command, to **stderr**, so it never pollutes a command's stdout
 * (data, JSON, or the MCP protocol). `chalk` applies the ember brand accent when the terminal
 * supports colour and stays plain otherwise (respecting `NO_COLOR`).
 *
 * @param subtitle - The tagline under the rule.
 * @returns The banner string (no trailing newline).
 */
export function renderStoneBanner (subtitle: string = 'The continuum framework'): string {
  const rule = '─'.repeat(27)
  return [
    `${chalk.hex('#e2571e')('◆')} ${chalk.bold('Stone.js')}`,
    `  ${chalk.dim(rule)}`,
    `  ${chalk.dim(subtitle)}`
  ].join('\n')
}
