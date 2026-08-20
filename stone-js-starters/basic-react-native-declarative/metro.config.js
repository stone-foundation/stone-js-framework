const { getDefaultConfig } = require('expo/metro-config')

/**
 * Pinning the project root keeps Metro scoped to this starter, even when the
 * starter lives inside a larger workspace (as it does in the Stone.js monorepo).
 */
module.exports = getDefaultConfig(__dirname)
