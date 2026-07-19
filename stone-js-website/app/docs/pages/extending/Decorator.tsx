import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extending/decorator'

/**
 * Extending: create a decorator.
 */
@Page(PATH, { layout: 'docs' })
export class Decorator implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Create a decorator',
      description: 'Author a Stone.js decorator with TC39 stage-3 decorators and Symbol.metadata: write metadata, add a blueprint, never reflect-metadata.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extending' title='Create a decorator' />
        <Lead>
          A Stone.js decorator does one thing: it records intent as metadata on a class, which the
          build phase later reads into the Blueprint. It is built on TC39 stage-3 decorators and
          <code> Symbol.metadata</code>, never the legacy experimental decorators and never
          reflect-metadata.
        </Lead>

        <H2>Metadata, not behaviour</H2>
        <Principle
          principle={
            <p>
              A decorator that mutates a class at define time hides behaviour where it is hard to find.
              A decorator that only <em>annotates</em> keeps the class plain and defers all wiring to a
              single, inspectable phase. Declaration and effect stay separate.
            </p>
          }
          incarnation={
            <p>
              Use <code>addMetadata(context, key, value)</code> to record intent, or
              <code> addBlueprint(Class, context, ...blueprints)</code> to contribute Blueprint keys
              directly. The build phase reads it; your decorator itself does nothing at runtime.
            </p>
          }
        />

        <H2>A metadata decorator</H2>
        <Code file='src/decorators/Feature.ts'>{`import { addMetadata } from '@stone-js/core'

export interface FeatureOptions { flag: string }

// A class decorator (TC39 stage-3): (target, context) => void
export const Feature = (options: FeatureOptions) => (target: unknown, context: ClassDecoratorContext) => {
  addMetadata(context, 'feature', options)   // records onto context.metadata (Symbol.metadata)
}

// usage:
@Feature({ flag: 'beta-tasks' })
export class TaskController {}`}</Code>

        <H3>A blueprint decorator</H3>
        <p>
          When a decorator should contribute configuration, hand blueprint fragments to
          <code> addBlueprint</code>. This is how the framework's own <code>@Routing()</code>,
          <code> @NodeHttp()</code> and friends enable a capability with one annotation.
        </p>
        <Code file='src/decorators/Cache.ts'>{`import { addBlueprint } from '@stone-js/core'
import { cacheBlueprint } from '../blueprint'

export const Cache = (options: { driver?: string } = {}) =>
  (target: ClassType, context: ClassDecoratorContext) => {
    addBlueprint(target, context, cacheBlueprint, { stone: { cache: options } })
  }

// @Cache({ driver: 'redis' }) @StoneApp() class Application {}`}</Code>

        <H2>Reading it back</H2>
        <p>
          Metadata is read during the build phase (a blueprint middleware) or wherever the framework
          introspects your classes. The <code>isMeta*</code> guards and the metadata key help you find
          and interpret what decorators recorded.
        </p>
        <PropsTable nameHeader='Helper' rows={[
          { name: 'addMetadata(ctx, key, value)', type: 'write', desc: 'Record a value on the class metadata (Symbol.metadata).' },
          { name: 'addBlueprint(Class, ctx, ...bp)', type: 'write', desc: 'Contribute Blueprint fragments from a decorator.' },
          { name: 'hasMetadata / getMetadata', type: 'read', desc: 'Read metadata back during the build phase.' },
          { name: 'isMetaModule / isMetaClassModule …', type: 'guards', desc: 'Classify meta-modules when processing them.' }
        ]} />

        <Callout kind='important' title='Stage-3, and only stage-3'>
          Configure TC39 stage-3 decorators with <code>Symbol.metadata</code> (the scaffold does this).
          Do not enable <code>experimentalDecorators</code> and do not use reflect-metadata; the whole
          model, including alias-based injection, depends on the modern semantics.
        </Callout>

        <SeeAlso links={[
          { title: 'The two paradigms', path: '/docs/foundations/paradigms' },
          { title: 'Meta-modules & define*', path: '/docs/blueprint/meta-modules' },
          { title: 'Blueprint middleware', path: '/docs/blueprint/middleware' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
