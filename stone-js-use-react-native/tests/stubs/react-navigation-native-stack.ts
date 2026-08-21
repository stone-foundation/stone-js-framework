/**
 * What `@react-navigation/native-stack` is under a Node test runner: absent.
 *
 * See `react-navigation-native.ts` for why each specifier gets its own file.
 */
export const createNativeStackNavigator = (): any => ({
  Navigator: ({ children }: any) => children,
  Screen: () => null
})
