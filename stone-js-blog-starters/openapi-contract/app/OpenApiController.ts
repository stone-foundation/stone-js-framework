import { spec } from './openapi'
import { swaggerUiHtml, OpenApiDocument } from '@stone-js/openapi'
import { EventHandler, Get } from '@stone-js/router'
import { HtmlHttpResponse } from '@stone-js/http-core'

/**
 * OpenApiController
 *
 * Serves the generated contract two ways: the raw document for tools, machines and agents, and a
 * Swagger UI page for humans. No separate docs site to keep in sync.
 */
@EventHandler('/')
export class OpenApiController {
  /** The generated OpenAPI document, as JSON. */
  @Get('/openapi.json')
  document (): OpenApiDocument {
    return spec
  }

  /** A human-friendly, interactive explorer pointed at the JSON document. */
  @Get('/docs')
  @HtmlHttpResponse()
  docs (): string {
    return swaggerUiHtml('/openapi.json', { title: 'Tasks API' })
  }
}
