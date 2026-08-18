/**
 * Stone.js runs on TC39 stage-3 decorators (2023-11) with `Symbol.metadata`.
 *
 * The decorators plugin lives in `plugins` (not in a preset) because Babel runs
 * plugins before presets: decorators must be transformed before the class-field
 * and private-method transforms bundled in `babel-preset-expo`.
 */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { version: '2023-11' }]
    ]
  }
}
