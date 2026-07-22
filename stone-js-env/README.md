# Stone.js - Env

[![npm license](https://img.shields.io/npm/l/@stone-js/env)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/env)](https://www.npmjs.com/package/@stone-js/env)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/env)](https://www.npmjs.com/package/@stone-js/env)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

Fluent and simple API to deal with .env file and env variables for both browser and node.js.

---

## Overview

The `@stone-js/env` library provides utility functions for managing environment variables in JavaScript and TypeScript applications. It helps developers retrieve, validate, and transform environment variables, supporting different data types such as strings, numbers, booleans, arrays, objects, and more. This ensures that the environment configuration is reliable and meets the expected requirements. This library is compatible with both vanilla JavaScript and TypeScript.

## Installation

```bash
npm i @stone-js/env
# or
yarn add @stone-js/env
# or
pnpm add @stone-js/env
```

> \[!IMPORTANT]
> This package is **pure ESM**. Ensure your `package.json` includes `"type": "module"` or configure your bundler appropriately.

```ts
import { getNumber, getEmail } from '@stone-js/env'
```

## Getting Started

To start using the `@stone-js/env` library, you need to import the functions you want to use in your project. Below is a simple example of how to use the library to retrieve environment variables and ensure they meet the necessary validation requirements.

```typescript
import { get, getString, getNumber, getBoolean } from '@stone-js/env';

// Retrieving an environment variable as a string
const apiUrl = getString('API_URL');

// Retrieving an environment variable as a number
const port = getNumber('PORT', { default: 3000 });

// Retrieving a boolean environment variable
const isProduction = getBoolean('IS_PRODUCTION', { default: false });
```

## Usage

The `@stone-js/env` library provides multiple functions to retrieve environment variables in different formats, allowing for strong validation and type safety. Below are the available functions and their descriptions:

### Options Interface

The `Options` interface provides configuration options for retrieving environment variables. Below are the properties available in the `Options` interface:

- **`type`** (`'number' | 'boolean' | 'array' | 'object' | 'json' | 'enum' | 'email' | 'host' | 'url' | 'string'`): Specifies the expected type of the environment variable.
- **`format`** (`'url' | 'host' | 'email'`): Specifies the format of the value if it is a string.
- **`enums`** (`string[]`): An array of possible values for enum validation.
- **`optional`** (`boolean`): Indicates if the environment variable is optional.
- **`default`** (`any`): The default value if the environment variable is not set.
- **`separator`** (`string`): Separator for parsing array or object values (default is `','`).
- **`tld`** (`boolean`): Indicates if a top-level domain is required for URLs or emails.
- **`protocol`** (`boolean`): Indicates if a protocol is required for URLs.
- **`version`** (`IPVersion`): Specifies the IP version if the type is `'host'`.

### `get<T>(key: string, options?: Options | any): T`

Retrieves the value of a specified environment variable.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options | any): Options for retrieving the value.
- **Returns**: The value of the environment variable, with the expected type `T`.

### `getString(key: string, options?: Options | string): string`

Retrieves the specified environment variable value as a string.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options | string): Options for retrieving the value.
- **Returns**: The value as a string.

### `getNumber(key: string, options?: Options): number`

Retrieves the specified environment variable value as a number.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as a number.

### `getBoolean(key: string, options?: Options): boolean`

Retrieves the specified environment variable value as a boolean.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as a boolean.

### `getArray(key: string, options?: Options): string[]`

Retrieves the specified environment variable value as an array of strings.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as an array of strings.

### `getObject(key: string, options?: Options): Record<string, any>`

Retrieves the specified environment variable value as an object.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as an object.

### `getJson(key: string, options?: Options): unknown`

Retrieves the specified environment variable value as a JSON object.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as a JSON object.

### `getEnum(key: string, enums: string[] | Options = [], defaultValue?: string, options?: Options): string`

Retrieves the specified environment variable value as an enum.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `enums` (string[] | Options): Array of possible enum values or options.
  - `defaultValue` (string, optional): Default value if not set.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as an enum.

### `getEmail(key: string, options?: Options): string`

Retrieves the specified environment variable value as an email address.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as an email address.

### `getUrl(key: string, options?: Options): string`

Retrieves the specified environment variable value as a URL.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as a URL.

### `getHost(key: string, options?: Options): string`

Retrieves the specified environment variable value as a host (IP or URL).

- **Parameters**:
  - `key` (string): The environment variable key.
  - `options` (Options): Options for retrieving the value.
- **Returns**: The value as a host.

### `custom(key: string, validator: (key: string, value: any, options: Options) => any, options?: Options | any): any`

Retrieves and validates the value of the specified environment variable using a custom validator function.

- **Parameters**:
  - `key` (string): The environment variable key.
  - `validator` (function): A custom validation function.
  - `options` (Options | any): Options for retrieving the value.
- **Returns**: The validated value of the environment variable.

### `clearCache(): void`

Clears the environment variable cache.

- **Returns**: Nothing.

### `is(env: string): boolean`

Determines if the current environment matches the given value.

- **Parameters**:
  - `env` (string): The environment to check.
- **Returns**: `true` if the current environment matches the given value, otherwise `false`.

### `isProduction(): boolean`

Determines if the current environment is production.

- **Returns**: `true` if in a production environment, otherwise `false`.

### `isNotProduction(): boolean`

Determines if the current environment is not production.

- **Returns**: `true` if not in a production environment, otherwise `false`.

### `isProd(): boolean`

Determines if the current environment is prod.

- **Returns**: `true` if in a prod environment, otherwise `false`.

### `isNotProd(): boolean`

Determines if the current environment is not prod.

- **Returns**: `true` if not in a prod environment, otherwise `false`.

### `isTesting(): boolean`

Determines if the current environment is testing.

- **Returns**: `true` if in a testing environment, otherwise `false`.

### `getEnv(key: string): string | undefined`

Retrieves the value of a system environment variable. Works for both Node.js and browser environments.

- **Parameters**:
  - `key` (string): The environment variable key.
- **Returns**: The value of the environment variable or `undefined` if not found.

## Summary

The `@stone-js/env` library is a versatile tool for managing environment variables in both JavaScript and TypeScript projects. It provides robust validation and transformation capabilities for different data types, making it easy to ensure that environment configuration values are reliable and properly formatted. With support for custom validation, caching, and multiple data formats, this library simplifies environment management for modern web and server-side applications.

## Learn More

This package is part of the Stone.js ecosystem, a modern JavaScript framework built around the Continuum Architecture.

Explore the full documentation: [https://stonejs.dev](https://stonejs.dev)

## API documentation

- [API](https://github.com/stone-foundation/stone-js-env/blob/main/docs/modules.md)

## Contributing

See [Contributing Guide](https://github.com/stone-foundation/stone-js-env/blob/main/CONTRIBUTING.md).

## Credits

Thanks to [valibot](https://valibot.dev) for the validation library used in this project.