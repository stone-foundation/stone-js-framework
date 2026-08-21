import { NativeScreen } from '../declarations'

/**
 * Whether a screen leaving the navigator should also leave Stone's stack.
 *
 * This is the whole difficulty of putting a native navigator in front of the framework, and it is
 * one comparison. There are two stacks and one truth: the router owns navigation, so Stone's stack
 * is the truth, and the navigator shows it. A screen can then disappear for two different reasons,
 * and only one of them needs answering.
 *
 * - **The user swiped back**, or pressed the hardware button. The navigator removed the screen and
 *   Stone knows nothing about it, so Stone's stack still has it on top. Pop it, and the two agree.
 * - **Stone popped it already**, through `useGoBack` or a `reset`. The navigator is only catching up
 *   with a render it was given. Popping again here would eat the screen underneath.
 *
 * Comparing the departing screen's key with what Stone now has on top separates the two cases
 * exactly, with no flag to keep and no window in which a fast double-back does the wrong thing.
 *
 * @param departing - The key of the screen the navigator is removing.
 * @param screens - Stone's stack, as it is now.
 * @returns True when Stone still has to be told.
 */
export function shouldPopStone (departing: string, screens: NativeScreen[]): boolean {
  return screens[screens.length - 1]?.key === departing
}
