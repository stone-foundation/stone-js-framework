import { jsonHttpResponse } from '@stone-js/http-core'

// A discovered module: the blueprint fragment an app's manifest would contribute.
export const appBlueprint = {
  stone: {
    name: 'DiscoveredApp',
    kernel: { eventHandler: () => jsonHttpResponse({ discovered: true }, 200) }
  }
}
