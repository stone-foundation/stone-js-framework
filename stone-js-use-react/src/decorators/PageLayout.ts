import { PageLayoutOptions } from '../declarations'
import { REACT_PAGE_LAYOUT_KEY } from './constants'
import { setMetadata, classDecoratorLegacyWrapper, ClassType } from '@stone-js/core'

/**
 * A class decorator for defining a class as a React Page layout.
 *
 * @param options - Configuration options for the layout definition.
 * @returns A method decorator to be applied to a class method.
 *
 * @example
 * ```typescript
 * import { PageLayout } from '@stone-js/use-react';
 *
 * @PageLayout({ name: 'UserPageLayout' })
 * class UserPageLayout {
 *   render({ data }) {
 *     return <h1>User name: {data.name}</h1>;
 *   }
 * }
 * ```
 */
export const PageLayout = <T extends ClassType = ClassType>(options: PageLayoutOptions): ClassDecorator => {
  return classDecoratorLegacyWrapper((_target: T, context: ClassDecoratorContext<T>): undefined => {
    setMetadata(context, REACT_PAGE_LAYOUT_KEY, { ...options, isClass: true })
  })
}
