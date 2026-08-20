/**
 * Stone.js runs on TC39 stage-3 decorators (2023-11) with `Symbol.metadata`.
 *
 * `babel-preset-expo` applies `@babel/plugin-proposal-decorators` itself (in
 * legacy mode by default): the decorator semantics are configured through the
 * preset's `decorators` option, never by adding the plugin separately, so the
 * preset keeps its ordering guarantees against the class-field transforms.
 */
module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { decorators: { version: '2023-11' } }]
    ]
  }
}
