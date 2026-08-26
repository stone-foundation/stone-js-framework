/**
 * Where a class declares itself a notification channel.
 *
 * A string rather than a symbol, by the convention every first-party module follows: another package
 * can read it without importing this one.
 */
export const CHANNEL_KEY: string = '@stone-js/notifications/channel'
