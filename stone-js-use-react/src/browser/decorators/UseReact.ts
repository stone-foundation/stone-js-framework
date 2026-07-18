
import { UseReactConfig } from '../../options/UseReactBlueprint'
import { STONE_REACT_APP_KEY } from '../../decorators/constants'
import { useReactBlueprint } from '../options/BrowserUseReactBlueprint'
import { addBlueprint, classDecoratorLegacyWrapper, ClassType, setMetadata } from '@stone-js/core'

/**
 * UseReact decorator options.
 */
export interface UseReactOptions extends Partial<UseReactConfig> {}

/**
 * UseReact decorator.
 *
 * UseReact is a class decorator that allows you to use React components in your Stone application.
 * The decorator is used to define the React configuration for the class.
 *
 * @param options - UseReactOptions
 * @returns ClassDecorator
 */
export const UseReact = <T extends ClassType = ClassType>(options: UseReactOptions = {}): ClassDecorator => {
  return classDecoratorLegacyWrapper<T>((target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, STONE_REACT_APP_KEY, { isComponent: true, isClass: true })
    addBlueprint(target, context, useReactBlueprint, { stone: { useReact: options } })
  })
}
