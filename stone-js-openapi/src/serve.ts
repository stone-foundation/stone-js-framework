/**
 * Options for {@link swaggerUiHtml}.
 */
export interface SwaggerUiOptions {
  /** Document title. */
  title?: string
  /** `swagger-ui-dist` major version served from the CDN (default `'5'`). */
  version?: string
}

/**
 * Renders a self-contained Swagger UI HTML page that loads a spec from `specUrl`.
 *
 * Return it from an HTML route (e.g. `GET /docs`) while another route serves the JSON document
 * (`OpenApiGenerator.build()`), for a zero-build API explorer.
 *
 * @param specUrl - The URL of the OpenAPI JSON document.
 * @param options - Rendering options.
 * @returns The HTML page.
 */
export function swaggerUiHtml (specUrl: string, options: SwaggerUiOptions = {}): string {
  const title = options.title ?? 'API Documentation'
  const version = options.version ?? '5'
  const base = `https://unpkg.com/swagger-ui-dist@${version}`

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${base}/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${base}/swagger-ui-bundle.js" crossorigin></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: ${JSON.stringify(specUrl)},
      dom_id: '#swagger-ui',
      deepLinking: true
    })
  </script>
</body>
</html>`
}

/**
 * Escapes a string for safe HTML interpolation.
 *
 * @param value - The value.
 * @returns The escaped string.
 */
function escapeHtml (value: string): string {
  /* v8 ignore next -- the `?? c` fallback is unreachable: the regex only matches mapped chars. */
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c))
}
