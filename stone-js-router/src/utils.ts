import { RegexPatternOptions, RouteSegmentConstraint } from './declarations'

/**
 * Check if the provided value is a meta Component module.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a meta Component module, otherwise `false`.
*/
export const isMetaComponentModule = <ComponentModuleType>(value: any): value is Record<'module', ComponentModuleType> => {
  return value?.isComponent === true
}

/**
 * Regular expression for extracting path constraints from route segments.
 */
const pathConstraintRegex = /^(.+?)?[:{](.+?)(?:@(.+?))?(?:\((.+?)\))?([?*+]?)(?:=(.+?))?\}?$/

/**
 * Regular expression for extracting domain constraints from route options.
 */
const domainConstraintRegex = /^(?:\{(.+?)(?:@(.+?))?(?:\((.+?)\))?([?*+]?)(?:=(.+?))?\})?(.+)$/

/**
 * Default matching rule for a path segment parameter.
 *
 * A single URL path segment cannot contain a `/`, so the default rule is bounded
 * to non-slash characters. This is intentional and security-critical: it keeps the
 * generated regex **linear** (no nested unbounded quantifiers) and immune to the
 * catastrophic backtracking (ReDoS) that a greedy `.+` default caused on `*`/`+`
 * segments.
 */
const SEGMENT_DEFAULT_RULE = '[^/]+'

/**
 * Default matching rule for a domain (sub-domain) parameter.
 *
 * A sub-domain label is delimited by dots (and never contains a slash), so the
 * default rule is bounded to non-dot, non-slash characters. Like the segment
 * default, this keeps the domain regex linear and non-ambiguous.
 */
const DOMAIN_DEFAULT_RULE = '[^./]+'

/**
 * Builds a regular expression for matching a full URI based on route options.
 *
 * The URI regex covers the (optional) domain followed by the path and is the one
 * used to **extract** parameter values (see `Route.bind`). Every parameter is
 * emitted as a uniquely named capture group (`p0`, `p1`, ...) in constraint order,
 * so parameter binding is done by name and is immune to extra capture groups that
 * a user-supplied rule might introduce.
 *
 * @param options - The route options to build the regex from.
 * @param flags - Regular expression flags, defaults to 'i' (case insensitive).
 * @returns A regular expression for matching URIs.
 *
 * @example
 * ```typescript
 * const regex = uriRegex({ path: '/users/:id', strict: false });
 * console.log(regex.test('/users/123')); // true
 * ```
 */
export const uriRegex = (options: RegexPatternOptions, flags: string = 'i'): RegExp => {
  flags = options.strict === true ? '' : flags
  const counter = { value: 0 }
  const domainConstraint = getDomainConstraints(options)
  /* v8 ignore next -- `buildDomainPattern` always yields a string for a parsed domain (suffix is mandatory); the `?? ''` is a type guard. */
  const domain = domainConstraint === undefined ? '' : (buildDomainPattern(domainConstraint, nextGroupName(domainConstraint, counter)) ?? '')
  const strictTrailingSlash = options.path.endsWith('/') ? '/' : ''
  const trailingSlash = options.strict === true ? strictTrailingSlash : '/?'
  const path = getSegmentsConstraints(options)
    .reduce((prev, curr) => `${prev}${buildSegmentPattern(curr, nextGroupName(curr, counter))}`, '')
  return new RegExp(`^${domain}${path}${trailingSlash}$`, flags)
}

/**
 * Builds a regular expression for matching route paths based on route options.
 *
 * The path regex is used purely as a matching predicate (`uriMatcher`); it does not
 * need to preserve parameter names for extraction, so it names its groups locally.
 *
 * @param options - The route options to build the regex from.
 * @param flags - Regular expression flags, defaults to 'i' (case insensitive).
 * @returns A regular expression for matching route paths.
 *
 * @example
 * ```typescript
 * const regex = pathRegex({ path: '/users/:id', strict: false });
 * console.log(regex.test('/users/123')); // true
 * ```
 */
export const pathRegex = (options: RegexPatternOptions, flags: string = 'i'): RegExp => {
  flags = options.strict === true ? '' : flags
  const counter = { value: 0 }
  const strictTrailingSlash = options.path.endsWith('/') ? '/' : ''
  const trailingSlash = options.strict === true ? strictTrailingSlash : '/?'
  const pattern = getSegmentsConstraints(options)
    .reduce((prev, curr) => `${prev}${buildSegmentPattern(curr, nextGroupName(curr, counter))}`, '')
  return new RegExp(`^${pattern}${trailingSlash}$`, flags)
}

/**
 * Builds a regular expression for matching domains based on route options.
 *
 * @param options - The route options to build the regex from.
 * @param flags - Regular expression flags, defaults to 'i' (case insensitive).
 * @returns A regular expression for matching domains or undefined if no domain is specified.
 *
 * @example
 * ```typescript
 * const regex = domainRegex({ domain: '{subdomain}.example.com' });
 * console.log(regex?.test('api.example.com')); // true
 * ```
 */
export const domainRegex = (options: RegexPatternOptions, flags: string = 'i'): RegExp | undefined => {
  flags = options.strict === true ? '' : flags
  if (options.domain === undefined) {
    return undefined
  }
  const constraint = getDomainConstraints(options)
  /* v8 ignore next 2 -- with `options.domain` defined, `getDomainConstraints` always returns a constraint and `buildDomainPattern` always a string; both guards are unreachable in practice. */
  const pattern = constraint === undefined ? undefined : buildDomainPattern(constraint, nextGroupName(constraint, { value: 0 }))
  return pattern !== undefined ? new RegExp(`^${pattern}$`, flags) : undefined
}

/**
 * Allocates the next sequential capture-group name for a parameter-bearing constraint.
 *
 * Non parameter constraints (static segments, bare domains) do not consume a name.
 *
 * @param constraint - The constraint about to be compiled.
 * @param counter - A mutable counter shared across the constraints of a single regex.
 * @returns The group name (e.g. `p0`) or `undefined` when the constraint has no parameter.
 */
const nextGroupName = (constraint: Partial<RouteSegmentConstraint> | undefined, counter: { value: number }): string | undefined => {
  return constraint?.param !== undefined ? `p${counter.value++}` : undefined
}

/**
 * Builds a domain pattern based on a route segment constraint.
 *
 * @param constraint - Partial route segment constraint for domain matching.
 * @param name - The capture-group name to assign to the parameter (if any).
 * @returns A string representing the domain pattern or undefined.
 */
export const buildDomainPattern = (constraint?: Partial<RouteSegmentConstraint>, name?: string): string | undefined => {
  if (constraint?.param === undefined) {
    return constraint?.suffix
  }
  const group = capture(stringifyRegex(constraint.rule, DOMAIN_DEFAULT_RULE), name)
  return constraint.optional === true
    ? `${group}?${String(constraint.suffix)}`
    : `${group}${String(constraint.suffix)}`
}

/**
 * Builds a path segment pattern based on a route segment constraint.
 *
 * All repetition quantifiers (`*`, `+`) expand to a **linear**, non-ambiguous form
 * (`segment(?:/segment)*`) so the resulting regex cannot backtrack catastrophically.
 *
 * @param constraint - Partial route segment constraint for path matching.
 * @param name - The capture-group name to assign to the parameter (if any).
 * @returns A string representing the path pattern.
 */
export const buildSegmentPattern = (constraint?: Partial<RouteSegmentConstraint>, name?: string): string => {
  if (constraint === undefined) {
    return '/'
  } else if (constraint.param === undefined) {
    return `/${String(constraint.match)}`
  }

  const rule = stringifyRegex(constraint.rule, SEGMENT_DEFAULT_RULE)
  const repeated = `(?:${rule})(?:/(?:${rule}))*`

  if (constraint.prefix !== undefined) {
    switch (constraint.quantifier) {
      case '?':
        return `/${String(constraint.prefix)}${capture(rule, name)}?`
      case '+':
        return `/${String(constraint.prefix)}${capture(repeated, name)}`
      case '*':
        return `/${String(constraint.prefix)}${capture(repeated, name)}?`
      default:
        return `/${String(constraint.prefix)}${capture(rule, name)}`
    }
  } else {
    switch (constraint.quantifier) {
      case '?':
        return `(?:/${capture(rule, name)})?`
      case '+':
        return `/${capture(repeated, name)}`
      case '*':
        return `(?:/${capture(repeated, name)})?`
      default:
        return `/${capture(rule, name)}`
    }
  }
}

/**
 * Wraps a rule body in a capture group, named when a name is provided.
 *
 * @param body - The (already sanitised) rule source.
 * @param name - The capture-group name, or `undefined` for an anonymous group.
 * @returns The capture-group source.
 */
const capture = (body: string, name?: string): string => {
  return name !== undefined ? `(?<${name}>${body})` : `(${body})`
}

/**
 * Generates an array of URI constraints based on route options.
 *
 * @param options - The route options to extract constraints from.
 * @returns An array of partial route segment constraints.
 */
export const uriConstraints = (options: RegexPatternOptions): Array<Partial<RouteSegmentConstraint>> => {
  return [getDomainConstraints(options), getSegmentsConstraints(options)].flat().filter(v => v !== undefined)
}

/**
 * Extracts domain constraints from route options.
 *
 * @param options - The route options to extract domain constraints from.
 * @returns Partial route segment constraint for the domain or undefined.
 */
export const getDomainConstraints = (options: RegexPatternOptions): Partial<RouteSegmentConstraint> | undefined => {
  if (options.domain === undefined) {
    return undefined
  }

  const keys = ['match', 'param', 'alias', 'rule', 'quantifier', 'default', 'suffix']

  const domainConstraints = options
    .domain
    .match(domainConstraintRegex)
    ?.filter((_, i) => i < keys.length)
    .reduce<Partial<RouteSegmentConstraint>>((prev, curr, i) => ({ ...prev, [keys[i]]: curr }), {})

  if (domainConstraints?.param !== undefined) {
    return {
      ...domainConstraints,
      rule: domainConstraints.rule ?? options.rules?.[domainConstraints.param],
      default: domainConstraints.default ?? options.defaults?.[domainConstraints.param],
      optional: /^[?*]$/.test(String(domainConstraints.quantifier))
    }
  }

  return domainConstraints
}

/**
 * Extracts path segment constraints from route options.
 *
 * The returned constraints are freshly built objects (no shared/mutated state), so
 * the caller can safely cache or transform them.
 *
 * @param options - The route options to extract constraints from.
 * @returns An array of partial segment constraints for the path.
 */
export const getSegmentsConstraints = (options: RegexPatternOptions): Array<Partial<RouteSegmentConstraint>> => {
  return options
    .path
    .split('/')
    .filter(segment => segment.trim().length > 0)
    .map((segment): Partial<RouteSegmentConstraint> | undefined => {
      if (/[:}]/.test(segment)) {
        const keys = ['match', 'prefix', 'param', 'alias', 'rule', 'quantifier', 'default']
        return segment
          .match(pathConstraintRegex)
          ?.filter((_, i) => i < keys.length)
          ?.reduce((prev, curr, i) => ({ ...prev, [keys[i]]: curr }), {})
      } else {
        return { match: segment }
      }
    })
    .filter(segment => segment !== undefined)
    .map((segment) => {
      if (segment?.param !== undefined) {
        return {
          ...segment,
          rule: segment.rule ?? options.rules?.[segment.param],
          default: segment.default ?? options.defaults?.[segment.param],
          optional: /^[?*]$/.test(String(segment.quantifier))
        }
      }
      return segment
    })
}

/**
 * Normalises a user-supplied rule into a safe regex source fragment.
 *
 * - `undefined`/empty rules fall back to the (linear, bounded) default rule.
 * - Every capturing group inside a user rule — numbered `( … )` or named
 *   `(?<name> … )` — is rewritten as a non-capturing group `(?: … )`. This keeps
 *   the router's own named groups the sole source of parameter values (fixing the
 *   positional-binding corruption that user capture groups used to cause) and
 *   prevents a user rule from clashing with the `p0`, `p1`, … group names.
 *
 * @param pattern - The user rule (string or RegExp) or undefined.
 * @param defaultRule - The bounded default to use when no rule is provided.
 * @returns A sanitised regex source fragment.
 */
const stringifyRegex = (pattern: string | RegExp | undefined, defaultRule: string): string => {
  const source = pattern instanceof RegExp ? pattern.source : pattern
  if (source === undefined || source === null || source === '') {
    return defaultRule
  }
  return toNonCapturingSource(source)
}

/**
 * Rewrites every capturing group in a regex source as a non-capturing group.
 *
 * Escapes (`\(`), character classes (`[...]`) and lookaround assertions
 * (`(?=`, `(?!`, `(?<=`, `(?<!`) are preserved untouched.
 *
 * @param source - The regex source to transform.
 * @returns The source with all capturing groups made non-capturing.
 */
export const toNonCapturingSource = (source: string): string => {
  let out = ''
  let inClass = false

  for (let i = 0; i < source.length; i++) {
    const ch = source[i]

    if (ch === '\\') {
      out += ch + (source[i + 1] ?? '')
      i++
      continue
    }

    if (inClass) {
      out += ch
      if (ch === ']') { inClass = false }
      continue
    }

    if (ch === '[') {
      inClass = true
      out += ch
      continue
    }

    if (ch === '(') {
      if (source[i + 1] === '?') {
        // Named capture group `(?<name>` (but not lookbehind `(?<=` / `(?<!`) -> non-capturing.
        if (source[i + 2] === '<' && source[i + 3] !== '=' && source[i + 3] !== '!') {
          const end = source.indexOf('>', i + 3)
          if (end !== -1) {
            out += '(?:'
            i = end
            continue
          }
        }
        // Any other `(?…)` construct (non-capturing, lookahead, lookbehind) is kept as-is.
        out += ch
        continue
      }
      // Plain capturing group -> non-capturing.
      out += '(?:'
      continue
    }

    out += ch
  }

  return out
}
