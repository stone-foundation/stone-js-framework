# Changelog

## 0.8.9

## 0.8.8

## 0.8.7

## 0.8.6

## 0.8.5

### Patch Changes

- 64518fa: Premium, brand-aligned, bug-free starters. React starters greet the user with a polished welcome
  hero (the Portal logo, ember-gradient title, tagline and links) on a theme-aware ground; service
  starters return a branded welcome payload. Also fixes a 500 ContainerError when scaffolding the
  `continuum-showcase` starter (object `@Page` path + a layout missing `<StoneOutlet>`). Every starter
  is verified end to end: build, real SSR render for HTTP apps, and tests.

## 0.8.4

### Patch Changes

- 01db442: Make every starter production-ready. All 13 starters now build (`stone build`), pass real
  behavioral tests (`npm test`), and the React/showcase starters render the real Stone.js logo
  ("Le Portail"). Notable fixes: rebuilt the `continuum-showcase` starter (missing app entry, config
  and asset), fixed `vitest/config` imports in the service starters, added real tests where they were
  missing, and replaced an SSR-unsafe dependency in `full-react-imperative` with an in-app component.

## 0.8.3

All notable changes to the "Stone.js Starters" extension will be documented in this file.

## Unreleased
