/**
 * Platform identifier for the Azure Functions HTTP adapter.
 *
 * Used to key the adapter in the blueprint and to tag the event source, so the rest of the
 * framework can recognise an Azure Functions HTTP-triggered request.
 */
export const AZURE_FUNCTIONS_HTTP_PLATFORM = 'azure_functions_http'

/**
 * The headers the Azure front end writes the client address into, most trusted first.
 *
 * `x-forwarded-for` first, because that is the one Azure's own front end sets. The order is this
 * platform's to know, which is why it is passed to the shared normaliser rather than baked into it.
 */
export const IP_HEADERS: readonly string[] = ['x-forwarded-for', 'x-real-ip', 'x-client-ip']
