import { defineBuilderConfig } from '@stone-js/cli'

/**
 * The build configuration.
 *
 * Lazy views are off, deliberately. This starter is one file on purpose: the application, its head
 * and its view live in the same class, which is what makes it readable on the first day. Lazy views
 * need the application-level configuration to be eagerly loaded, so they need it in a `.ts` without
 * JSX, and splitting this starter in two to satisfy a build mode would cost exactly the thing it is
 * here to show.
 *
 * Auto-detection turns them on as soon as the router is used, which is why this says so out loud
 * rather than leaving a scaffolded application failing its first `stone build`.
 */
export default defineBuilderConfig({
  lazy: false
})
