[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [introspection](../README.md) / createIntrospectionTools

# Function: createIntrospectionTools()

> **createIntrospectionTools**(`blueprint`): [`McpToolDef`](../../declarations/interfaces/McpToolDef.md)[]

Build the read-only introspection tools bound to the app's resolved blueprint.

These expose what the app actually declares (routes, commands, adapters, providers, kernel
pipeline, config) so a coding agent understands *this* app, not just the framework. They read
only, never mutate, and redact secret-looking config values.

## Parameters

### blueprint

`IBlueprint`

The resolved application blueprint.

## Returns

[`McpToolDef`](../../declarations/interfaces/McpToolDef.md)[]

The introspection tools.
