/**
 * Platform identifier for the Azure Functions HTTP adapter.
 *
 * Used to key the adapter in the blueprint and to tag the event source, so the rest of the
 * framework can recognise an Azure Functions HTTP-triggered request.
 */
export const AZURE_FUNCTIONS_HTTP_PLATFORM = 'azure_functions_http'
