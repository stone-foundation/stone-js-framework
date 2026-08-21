/**
 * What `@react-navigation/native` is under a Node test runner: absent.
 *
 * The component imports it at module scope, so the specifier has to resolve for the file to load at
 * all. It resolves here, and each test replaces this with a `vi.mock` factory that records what the
 * component asked for. One stub per specifier, deliberately: aliasing both React Navigation modules
 * to a single file makes Vitest treat them as one module, and two `vi.mock` factories then overwrite
 * each other.
 */
export const NavigationContainer = ({ children }: any): any => children
