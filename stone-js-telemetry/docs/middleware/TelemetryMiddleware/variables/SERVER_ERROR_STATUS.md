[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [middleware/TelemetryMiddleware](../README.md) / SERVER\_ERROR\_STATUS

# Variable: SERVER\_ERROR\_STATUS

> `const` **SERVER\_ERROR\_STATUS**: `500` = `500`

HTTP status code at or above which a *server* response is considered an error.

Follows the OpenTelemetry HTTP semantic conventions: for a server span, only 5xx responses set
the span status to error; 4xx are client errors and leave the status `ok`. Responses without a
status code (e.g. CLI/other adapters) are treated as `ok` unless the handler throws.
