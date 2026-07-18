# Changelog

All notable changes to the "Stone.js Filesystem" extension will be documented in this file.

## Unreleased

## [0.1.1](https://github.com/stone-foundation/stone-js-filesystem/compare/v0.1.0...v0.1.1) (2025-06-12)


### Miscellaneous Chores

* migrate to stone-foundation, integrate sonar cloud and add security policy ([#11](https://github.com/stone-foundation/stone-js-filesystem/issues/11)) ([d9fba47](https://github.com/stone-foundation/stone-js-filesystem/commit/d9fba47afc23924107bee18cba844d18dcf77a0e))

## 0.1.0 (2025-06-04)


### Features

* initial implementation of filesystem module ([#1](https://github.com/stone-foundation/stone-js-filesystem/issues/1)) ([2597a7c](https://github.com/stone-foundation/stone-js-filesystem/commit/2597a7c743f8663979108758523e59426774e034))

Introduces the @stone-js/filesystem package with the following core features:

- File and UploadedFile classes for safe, contextual file operations
- Utilities for resolving project paths (basePath, tmpPath, appPath, etc.)
- Helpers for MIME detection, file hashing, and dynamic import
- Full ESM support with type safety
- Integrated with Stone.js error system via FilesystemError

This module is designed to abstract common filesystem logic across CLI tools, runtimes, and adapters in Stone.js applications.

### Documentation

* fix typo in package.json ([#3](https://github.com/stone-foundation/stone-js-filesystem/issues/3)) ([76ccb55](https://github.com/stone-foundation/stone-js-filesystem/commit/76ccb555f2a899950af2c8199f807b65b22613fc))
