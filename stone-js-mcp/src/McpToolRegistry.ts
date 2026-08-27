import { DECLARATION_KEYS } from './constants'
import { McpConfigurationError } from './errors/McpError'
import { TOOL_KEY } from './decorators/constants'
import { ClassType, getMetadata, hasMetadata, IBlueprint, IContainer, ILogger } from '@stone-js/core'
import { JsonSchema, McpConfig, McpInput, McpTool, McpToolDeclaration, McpToolRoute, RouteLike, RouterLike } from './declarations'

/** What a handler's `@Tool` decorator records. */
interface ToolDeclarationEntry {
  action?: string | symbol
  mcp: McpInput
}

/**
 * Turns the routes an application already has into the tools an agent can call.
 *
 * The whole design in one sentence: **a tool is a route that said so.** Nothing is registered twice,
 * nothing is described twice, and the permission that guards the route is the permission that guards
 * the tool, because the tool call is dispatched to that route.
 *
 * Everything else is derivation, and every source of it is optional. A route that declares a
 * validation schema gets an input schema for free. One that carries an `openapi` summary gets a
 * description for free. An application using neither still gets tools, built from what a route
 * always has: a path, a method, and its parameters. That degradation is the point, not a fallback:
 * this module must not require a stack to be useful.
 *
 * The registry holds no state. Deriving is a pure read of the router, and the router belongs to the
 * container, which is rebuilt for every event: a registry that cached would be caching something
 * whose lifetime it does not own.
 */
export class McpToolRegistry {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
  }

  /**
   * Every tool this application exposes, with the route each one leads to.
   *
   * @returns The tools, in the order the router holds their routes.
   */
  async tools (): Promise<McpToolRoute[]> {
    const options = this.options()
    const found: McpToolRoute[] = []
    const claimed = new Map<string, string>()

    for (const route of this.routes()) {
      const declaration = this.declarationOn(route)

      if (declaration === undefined) { continue }

      const tool = await this.toolFrom(route, declaration)

      if (tool === undefined) { continue }
      if (options.filter?.(tool, route) === false) { continue }

      const path = this.pathOf(route)
      const already = claimed.get(tool.name)

      if (already !== undefined) {
        // A declared `GET` is mapped to a `GET` and a `HEAD`, so one declaration arrives twice and
        // the same tool would be listed twice. Same path, same declaration: the router's own
        // pairing, and nothing to report. A different path is two routes claiming one name, which
        // is a mistake an agent would experience as a tool that sometimes does something else.
        if (already !== path) {
          this.logger()?.warn(
            `[@stone-js/mcp] two routes claim the tool name '${tool.name}'. The first is kept.`,
            { kept: already, ignored: path }
          )
        }
        continue
      }

      claimed.set(tool.name, path)
      found.push({ tool, route })
    }

    return found
  }

  /** The path a route declared, which is not the path it is serving. */
  private pathOf (route: RouteLike): string {
    return route.getOption<string>('path') ?? ''
  }

  /**
   * The tool an agent named, or nothing.
   *
   * @param name - The tool's name.
   * @returns The tool and its route.
   */
  async find (name: string): Promise<McpToolRoute | undefined> {
    return (await this.tools()).find(({ tool }) => tool.name === name)
  }

  /**
   * What a route declared, on itself or on its handler.
   *
   * The route's own option comes first, because when a router is in play a route is the single
   * description of itself. Failing that, the handler's `@Tool` is read, which is the form a
   * controller-first application writes.
   *
   * @param route - The route.
   * @returns The declaration, or nothing when the route is not a tool.
   */
  private declarationOn (route: RouteLike): McpToolDeclaration | undefined {
    const onRoute = route.getOption<McpInput>('mcp')

    if (onRoute !== undefined) { return this.normalize(onRoute) }

    const handler = route.getOption<{ module?: ClassType, action?: string | symbol }>('handler')
    const module = handler?.module

    if (module === undefined || !hasMetadata(module, TOOL_KEY)) { return undefined }

    const declarations = getMetadata<ClassType, ToolDeclarationEntry[]>(module, TOOL_KEY, [])
    const action = handler?.action
    const entry = action === undefined ? declarations[0] : declarations.find((d) => d.action === action)

    return entry === undefined ? undefined : this.normalize(entry.mcp)
  }

  /** The short form and the long form say the same thing; this is where they become one. */
  private normalize (input: McpInput): McpToolDeclaration {
    return typeof input === 'string' ? { name: input } : input
  }

  /**
   * One tool, from what the route declared and what the rest of the application already knows.
   *
   * @param route - The route.
   * @param declaration - What it declared.
   * @returns The tool, or nothing when it cannot honestly be exposed.
   */
  private async toolFrom (route: RouteLike, declaration: McpToolDeclaration): Promise<McpTool | undefined> {
    const name = declaration.name ?? route.getOption<string>('name')

    if (name === undefined || name === '') {
      // A tool is called by name, so a nameless one cannot be called at all. Naming the route in the
      // log is the only way the author finds it, since nothing else will fail.
      this.logger()?.warn(
        '[@stone-js/mcp] a route declares `mcp` but has no name, so it cannot be exposed as a tool. ' +
        'Name the tool (`mcp: \'create-note\'`) or the route (`name: \'notes.create\'`).',
        { method: route.getOption('method'), path: this.pathOf(route) }
      )
      return undefined
    }

    const description = declaration.description ?? this.describedBy(route)

    if (description === undefined) {
      const message =
        `[@stone-js/mcp] the tool '${name}' has no description. An agent reading a bare name will ` +
        'guess what it does. Write `mcp: { name, description }`, or an `openapi` summary on the route.'

      if (this.options().requireDescription === true) {
        this.logger()?.warn(`${message} It is left out, because \`stone.mcp.requireDescription\` is on.`)
        return undefined
      }

      this.logger()?.warn(message)
    }

    return {
      name,
      ...(description !== undefined ? { description } : {}),
      inputSchema: declaration.inputSchema ?? await this.inputSchemaFor(route),
      ...(declaration.outputSchema !== undefined ? { outputSchema: declaration.outputSchema } : {}),
      ...(declaration.annotations !== undefined ? { annotations: declaration.annotations } : {})
    }
  }

  /**
   * What the route says about itself elsewhere, when the tool declaration says nothing.
   *
   * `openapi` is read as a plain route option rather than through the package: a route carrying a
   * summary has documented itself for a reader, and a model is a reader.
   *
   * @param route - The route.
   * @returns A description, or nothing.
   */
  private describedBy (route: RouteLike): string | undefined {
    const openapi = route.getOption<{ summary?: string, description?: string }>('openapi')

    return openapi?.description ?? openapi?.summary
  }

  /**
   * The arguments a tool takes.
   *
   * In order: the schema the route validates against, converted to JSON Schema, because an
   * application that already says what a request must contain should not say it twice. Failing
   * that, the parameters the path itself declares, which every route has. The result is always an
   * object schema, since MCP arguments are named.
   *
   * @param route - The route.
   * @returns The input schema.
   */
  private async inputSchemaFor (route: RouteLike): Promise<JsonSchema> {
    const fromValidation = await this.fromValidation(route)

    return fromValidation ?? this.fromPathParams(route)
  }

  /**
   * The route's validation schema as JSON Schema, when there is one and something can convert it.
   *
   * The conversion is `@stone-js/openapi`'s, imported lazily and optional: it already knows how to
   * turn what this framework validates with into JSON Schema, and duplicating that here would be a
   * second implementation to keep in step. Without the package, the derivation simply does not
   * happen and the path parameters are used instead.
   *
   * @param route - The route.
   * @returns The schema, or nothing.
   */
  private async fromValidation (route: RouteLike): Promise<JsonSchema | undefined> {
    const declared = this.declaredOn(route, 'validation')

    if (declared === undefined) { return undefined }

    const schema = this.resolveSchema(declared)

    if (schema === undefined) { return undefined }

    const toJsonSchema = await this.converter()

    if (toJsonSchema === undefined) {
      this.logger()?.debug(
        '[@stone-js/mcp] a route declares a validation schema, but `@stone-js/openapi` is not ' +
        'installed to convert it. The tool takes its path parameters instead.',
        { method: route.getOption('method'), path: this.pathOf(route) }
      )
      return undefined
    }

    try {
      const converted = toJsonSchema(schema, 'input') as JsonSchema
      return converted?.type === 'object' ? converted : undefined
    } catch (error: any) {
      // A schema that cannot be described leaves the tool with a poorer one, which is recoverable.
      // Letting the throw out would take down `tools/list` entirely, which is not.
      this.logger()?.warn(
        `[@stone-js/mcp] a validation schema could not be described: ${String(error?.message)}`,
        { method: route.getOption('method'), path: this.pathOf(route) }
      )
      return undefined
    }
  }

  /**
   * What a route declares for one concern, on itself or on its handler.
   *
   * The same two places `@stone-js/openapi` reads, by the same string keys, so a handler decorated
   * with `@Validate` is understood as well as a route option is.
   *
   * @param route - The route.
   * @param concern - What to look for.
   * @returns What was declared, or nothing.
   */
  private declaredOn (route: RouteLike, concern: keyof typeof DECLARATION_KEYS): unknown {
    const onRoute = route.getOption(concern)

    if (onRoute !== undefined) { return onRoute }

    const handler = route.getOption<{ module?: ClassType, action?: string | symbol }>('handler')
    const module = handler?.module
    const key = DECLARATION_KEYS[concern]

    if (module === undefined || !hasMetadata(module, key)) { return undefined }

    const declarations = getMetadata<ClassType, Array<Record<string, unknown>>>(module, key, [])
    const action = handler?.action
    const entry = action === undefined
      ? declarations[0]
      : declarations.find((d) => d.action === action)

    return entry?.[concern]
  }

  /**
   * A declaration turned into the schema it names.
   *
   * A route may state a schema outright or name one the application registered. A class is built
   * through the container, so a schema whose rules need a service gets that service.
   *
   * @param declared - What the route declared.
   * @returns The schema, or nothing when it cannot be read.
   */
  private resolveSchema (declared: unknown): unknown {
    const registry = this.blueprint.get<Record<string, unknown>>('stone.validation.schemas', {})
    const named = typeof declared === 'string' ? registry[declared] : declared

    if (named === undefined) { return undefined }

    // A schema class is built through the container, so one whose `rules()` needs a service gets
    // that service. Without a container it cannot be read at all, and the tool falls back to its
    // path: a poorer tool is recoverable, a wrong one is not.
    const instance = typeof named === 'function' ? this.build(named) : named

    if (instance === undefined) { return undefined }

    // What a schema class holds is what `rules()` answers, which is the same unwrapping the contract
    // generator does. Converting the instance itself describes the class, not the shape.
    return typeof (instance as { rules?: unknown }).rules === 'function'
      ? (instance as { rules: () => unknown }).rules()
      : instance
  }

  /**
   * A schema class, built.
   *
   * @param target - The class.
   * @returns The instance, or nothing when it cannot be built.
   */
  private build (target: unknown): unknown {
    try {
      return this.container?.resolve?.(target as any, true) ?? undefined
    } catch {
      return undefined
    }
  }

  /** `@stone-js/openapi`'s converter, when the package is installed. */
  private async converter (): Promise<((schema: unknown, direction: string) => unknown) | undefined> {
    try {
      const mod: any = await import('@stone-js/openapi')
      return typeof mod?.toJsonSchema === 'function' ? mod.toJsonSchema : undefined
    } catch {
      return undefined
    }
  }

  /**
   * The parameters the path declares, as an object schema.
   *
   * What every route has, whatever else it does not. A tool whose arguments are only its path
   * parameters is still a useful tool, and it is what an application with no validation layer gets.
   *
   * @param route - The route.
   * @returns The schema.
   */
  private fromPathParams (route: RouteLike): JsonSchema {
    const properties: Record<string, unknown> = {}
    const required: string[] = []

    for (const [, name, optional] of this.pathOf(route).matchAll(/:(\w+)(\?)?/g)) {
      properties[name] = { type: 'string', description: `The ${name} in the path.` }
      if (optional === undefined) { required.push(name) }
    }

    return {
      type: 'object',
      properties,
      ...(required.length > 0 ? { required } : {})
    }
  }

  /** Every route the application declared. */
  private routes (): RouteLike[] {
    return this.router().getRoutes().getRoutes()
  }

  /** The router, or a setup error saying why there are no tools. */
  private router (): RouterLike {
    const router = this.container?.has?.('router') === true
      ? this.container.make<RouterLike>('router')
      : undefined

    if (router?.getRoutes === undefined) {
      throw new McpConfigurationError(
        'Cannot expose tools without a router: a tool is a route that said so, and there are no ' +
        'routes. Enable the router with `@Routing()`, or with `routerBlueprint` on the manifest.'
      )
    }

    return router
  }

  /** The `stone.mcp` bucket. */
  private options (): McpConfig {
    return this.blueprint.get<McpConfig>('stone.mcp', {})
  }

  /** The logger, when one is bound. */
  private logger (): ILogger | undefined {
    return this.container?.has?.('logger') === true ? this.container.make<ILogger>('logger') : undefined
  }
}
