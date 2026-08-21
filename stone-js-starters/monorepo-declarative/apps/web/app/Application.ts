import { domainBlueprint } from '@acme/domain'
import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { LogLevel, StoneApp } from '@stone-js/core'
import { Browser } from '@stone-js/browser-adapter'

/**
 * The web application.
 *
 * Four decorators and one blueprint. `@Browser()` says where events come from, `@UseReact()` says
 * what a resolved route becomes, and `domainBlueprint` brings in the shared domain, which is the
 * only line here that has anything to do with what the application is *about*.
 *
 * Compare with `apps/mobile/app/Application.ts`: the same file with two decorators swapped. That is
 * the whole difference between a website and a native application in this repository.
 *
 * Pages live in their own files, one route each. See `app/TaskListPage.tsx`.
 */
@Routing()
@Browser()
@UseReact()
@StoneApp({ name: 'acme-web', logger: { level: LogLevel.INFO } }, [domainBlueprint])
export class Application {}
