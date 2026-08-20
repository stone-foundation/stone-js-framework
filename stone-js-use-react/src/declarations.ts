/* c8 ignore next */
import { AdapterContext } from '@stone-js/core'
import { BrowserContext, BrowserEvent, BrowserResponse } from '@stone-js/browser-adapter'
import { IncomingBrowserEvent, IncomingBrowserEventOptions, OutgoingBrowserResponse } from '@stone-js/browser-core'

/**
 * Browser Adapter Context for React.
 *
 * The only declaration this package still owns: `BrowserContext` is `typeof window`, so
 * this type cannot follow the others into `@stone-js/use-react-core`, which has to stay
 * loadable on a platform that has no window. Everything else lives there and is
 * re-exported from `./core`.
 */
export type ReactBrowserAdapterContext = AdapterContext<
BrowserEvent,
BrowserResponse,
BrowserContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse
>
