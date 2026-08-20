import { NativeScreen, ScreenStackListener, ScreenTransition } from './declarations'

/**
 * The navigation stack, as plain state.
 *
 * This is the seam of the whole native renderer. A browser has one document and replaces
 * its contents; a phone has a stack of screens, each keeping its own state, with a back
 * gesture that pops the top one. So the renderer does not render: it puts what it resolved
 * onto this stack, and whatever displays screens reacts.
 *
 * Keeping it as plain state, with no React and no navigation library in sight, is what lets
 * you choose the display: {@link StoneNativeApp} renders the top screen with no extra
 * dependency, and a native navigator (`@react-navigation/native-stack`, for the real
 * gestures and transitions) drives itself from the same object. It also means the navigation
 * semantics are testable without a device.
 */
export class ScreenStack {
  private counter = 0
  private screens: NativeScreen[] = []
  private readonly listeners = new Set<ScreenStackListener>()

  /**
   * Create a screen stack.
   *
   * @returns A new screen stack.
   */
  static create (): ScreenStack {
    return new this()
  }

  /**
   * The current screens, oldest first.
   *
   * @returns A copy of the stack, so a consumer cannot mutate it by accident.
   */
  all (): NativeScreen[] {
    return [...this.screens]
  }

  /**
   * The screen currently on top, the one a user sees.
   *
   * @returns The top screen, or `undefined` when nothing has been resolved yet.
   */
  top (): NativeScreen | undefined {
    return this.screens[this.screens.length - 1]
  }

  /**
   * How deep the stack is.
   *
   * @returns The number of screens.
   */
  size (): number {
    return this.screens.length
  }

  /**
   * Subscribe to stack changes.
   *
   * @param listener - Called with the new stack on every change.
   * @returns A function removing the listener.
   */
  subscribe (listener: ScreenStackListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /**
   * Put a resolved route on the stack.
   *
   * Navigating to the path that is already on top replaces it rather than stacking a
   * duplicate: re-resolving the current route (a reload, fresh data) must not give the user
   * two identical screens to walk back through.
   *
   * @param screen - The screen to add, without its key.
   * @param transition - How it should enter. Defaults to `push`.
   * @returns The screen as it was added, key included.
   */
  navigate (screen: Omit<NativeScreen, 'key'>, transition: ScreenTransition = 'push'): NativeScreen {
    const entry: NativeScreen = { ...screen, key: `${screen.path}#${++this.counter}` }

    if (transition === 'reset') {
      this.screens = [entry]
    } else if (transition === 'replace' || this.top()?.path === entry.path) {
      this.screens = [...this.screens.slice(0, -1), entry]
    } else {
      this.screens = [...this.screens, entry]
    }

    this.emit()

    return entry
  }

  /**
   * Go back one screen.
   *
   * The last screen is never popped: an application always displays something, and a back
   * gesture on the first screen is the platform's business (leaving the app), not ours.
   *
   * @returns The screen now on top, or `undefined` when the stack was empty.
   */
  pop (): NativeScreen | undefined {
    if (this.screens.length > 1) {
      this.screens = this.screens.slice(0, -1)
      this.emit()
    }

    return this.top()
  }

  /**
   * Whether going back would stay inside the application.
   *
   * @returns True when there is more than one screen.
   */
  canGoBack (): boolean {
    return this.screens.length > 1
  }

  /**
   * Set the title of the screen on top.
   *
   * A page's head has nowhere to go on a phone: there is no document to apply it to. Its
   * title is the one part that means something, and it means the screen's title.
   *
   * @param title - The title to set.
   */
  setTitle (title?: string): void {
    const top = this.top()

    if (top === undefined || title === undefined || top.title === title) { return }

    this.screens = [...this.screens.slice(0, -1), { ...top, title }]
    this.emit()
  }

  /**
   * Empty the stack. Used on teardown.
   */
  clear (): void {
    this.screens = []
    this.emit()
  }

  /**
   * Notify every listener with the current stack.
   */
  private emit (): void {
    const screens = this.all()
    this.listeners.forEach((listener) => listener(screens))
  }
}
