import { MetaPipe, PipeType, PipeAlias, PipeClass, FactoryPipe, FunctionalPipe } from './declarations'

/**
 * Define a new middleware for the pipeline.
 *
 * @param module - The pipe module to add to the pipeline.
 * @param options - Additional options for the middleware.
 * @returns The metadata for the middleware.
 */
export const defineMiddleware = <T = unknown, R = T, Args extends any[] = any[]>(
  module: PipeType<T, R, Args>, options: Omit<MetaPipe<T, R, Args>, 'module'> = {}
): MetaPipe<T, R, Args> => {
  return { ...options, module }
}

/**
 * Check if the value is a string.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an string, otherwise `false`.
 */
export const isString = (value: unknown): value is string => typeof value === 'string'

/**
 * Check if the value is a function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a function, otherwise `false`.
 */
export const isFunction = <ClassType = Function>(value: unknown): value is ClassType => typeof value === 'function'

/**
 * Checks if the given value is a constructor function.
 *
 * @param value - The value to be checked.
 * @returns True if the value is a constructor function, false otherwise.
 */
export const isConstructor = <ClassType = any>(value: unknown): value is new (...args: any[]) => ClassType => {
  return isFunction(value) && Object.prototype.hasOwnProperty.call(value, 'prototype')
}

/**
 * Check if the meta pipe is a function pipe.
 *
 * @param metaPipe - The meta pipe to check.
 * @returns `true` if the meta pipe is a function pipe, otherwise `false`.
 */
export const isFunctionPipe = <T = unknown, R = T, Args extends any[] = any[]>(
  metaPipe: MetaPipe<T, R, Args>
): metaPipe is { module: FunctionalPipe<T, R> } => {
  return !isAliasPipe(metaPipe) && !isClassPipe(metaPipe) && !isFactoryPipe(metaPipe)
}

/**
 * Check if the meta pipe is an alias pipe.
 *
 * @param metaPipe - The meta pipe to check.
 * @returns `true` if the meta pipe is an alias pipe, otherwise `false`.
 */
export const isAliasPipe = <T = unknown, R = T, Args extends any[] = any[]>(
  metaPipe: MetaPipe<T, R, Args>
): metaPipe is { module: PipeAlias } => {
  return metaPipe.isAlias === true || isString(metaPipe.module)
}

/**
 * Checks whether a value is a class rather than a plain function.
 *
 * A class declaration's `prototype` property is non-writable, and a function's is writable. That is
 * the only reliable distinction at runtime, and it is exact for the ES2022 output these packages
 * publish. An arrow function has no `prototype` at all.
 *
 * @param value - The value to be checked.
 * @returns True when the value is a class.
 */
export const isClassLike = (value: unknown): boolean => {
  if (!isFunction(value)) { return false }

  return Object.getOwnPropertyDescriptor(value, 'prototype')?.writable === false
}

/**
 * Check if the meta pipe is a class pipe.
 *
 * A class is recognised **with or without** the `isClass` marker, because `PipeType` names
 * `PipeClass` as one of the four shapes a pipe may take, and `defineMiddleware(SomeClass)` does not
 * add the marker either. Without this, a class arriving unmarked was treated as a function and
 * called: `TypeError: Class constructor cannot be invoked without 'new'`, at the first request, on
 * something the type accepted and the module's own helper produced.
 *
 * The marker still wins where detection cannot see: a class transpiled down to a function is a
 * function at runtime, and `isClass: true` says what it is. And a class deliberately declared as a
 * factory or an alias is left to those, since an explicit intent outranks an inferred one.
 *
 * @param metaPipe - The meta pipe to check.
 * @returns `true` if the meta pipe is a class pipe, otherwise `false`.
 */
export const isClassPipe = <T = unknown, R = T, Args extends any[] = any[]>(
  metaPipe: MetaPipe<T, R, Args>
): metaPipe is { module: PipeClass<T, R, Args> } => {
  const declared = metaPipe.isClass === true
  const inferred = metaPipe.isFactory !== true && metaPipe.isAlias !== true && isClassLike(metaPipe.module)

  return (declared || inferred) && isFunction(metaPipe.module) && isConstructor(metaPipe.module)
}

/**
 * Check if the meta pipe is a factory pipe.
 *
 * @param metaPipe - The meta pipe to check.
 * @returns `true` if the meta pipe is a factory pipe, otherwise `false`.
 */
export const isFactoryPipe = <T = unknown, R = T, Args extends any[] = any[]>(
  metaPipe: MetaPipe<T, R, Args>
): metaPipe is { module: FactoryPipe<T, R, Args> } => {
  return metaPipe.isFactory === true && isFunction(metaPipe.module)
}
