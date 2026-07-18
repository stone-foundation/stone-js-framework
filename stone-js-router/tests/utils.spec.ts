import { RouteOptions } from '../src/Route'
import { RouteSegmentConstraint } from '../src/declarations'
import { uriRegex, pathRegex, domainRegex, buildDomainPattern, buildSegmentPattern, uriConstraints, getDomainConstraints, getSegmentsConstraints, isMetaComponentModule } from '../src/utils'

describe('Utils Tests', () => {
  let mockOptions: RouteOptions

  beforeEach(() => {
    mockOptions = {
      strict: false,
      method: 'GET',
      path: '/user/:id/',
      domain: '{sub}.example.com',
      rules: {
        id: /\d+/
      },
      defaults: {
        id: '1'
      }
    } as any
  })

  describe('isMetaComponentModule', () => {
    it('should check if the provided value is meta component or not', () => {
      expect(isMetaComponentModule({})).toBe(false)
      expect(isMetaComponentModule({ isComponent: true })).toBe(true)
    })
  })

  describe('uriRegex', () => {
    it('should generate a valid URI regex with strict mode disabled', () => {
      const regex = uriRegex(mockOptions)
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex.test('sub.example.com/user/123')).toBe(true)
      expect(regex.test('sub.example.com/user/123/')).toBe(true)
    })

    it('should handle strict mode', () => {
      mockOptions.strict = true
      const regex = uriRegex({ ...mockOptions })
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex.test('test.example.com/user/123')).toBe(false)
      expect(regex.test('test.example.com/user/123/')).toBe(true)

      const regex2 = uriRegex({ ...mockOptions, domain: undefined, path: '/user/:id' })
      expect(regex2.test('/user/123')).toBe(true)
      expect(regex2.test('/user/123/')).toBe(false)
    })
  })

  describe('pathRegex', () => {
    it('should generate a valid path regex', () => {
      const regex = pathRegex(mockOptions)
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex.test('/user/123')).toBe(true)
      expect(regex.test('/user/123/')).toBe(true)
    })

    it('should handle strict mode', () => {
      mockOptions.strict = true
      const regex = pathRegex(mockOptions)
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex.test('/user/123')).toBe(false)
      expect(regex.test('/user/123/')).toBe(true)

      const regex2 = pathRegex({ ...mockOptions, path: '/user/:id' })
      expect(regex2.test('/user/123')).toBe(true)
      expect(regex2.test('/user/123/')).toBe(false)
    })
  })

  describe('domainRegex', () => {
    it('should generate a valid domain regex', () => {
      const regex = domainRegex(mockOptions)
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex?.test('sub.example.com')).toBe(true)
      expect(regex?.test('SUB.example.com')).toBe(true)
    })

    it('should handle strict mode', () => {
      mockOptions.strict = true
      mockOptions.domain = '{sub@domain([A-Z]+)}.example.com'
      const regex = domainRegex(mockOptions)
      expect(regex).toBeInstanceOf(RegExp)
      expect(regex?.test('DOMAIN.example.com')).toBe(true)
      expect(regex?.test('domain.example.com')).toBe(false)
    })

    it('should return undefined if no domain is set', () => {
      mockOptions.domain = undefined
      const regex = domainRegex(mockOptions)
      expect(regex).toBeUndefined()
    })
  })

  describe('buildDomainPattern', () => {
    it('should build a valid optional domain pattern', () => {
      const constraint: Partial<RouteSegmentConstraint> = {
        param: 'sub',
        rule: /\w+/,
        suffix: '.example.com',
        optional: true
      }
      const pattern = buildDomainPattern(constraint)
      expect(pattern).toBe('(\\w+)?.example.com')
    })

    it('should return suffix if param is undefined', () => {
      const constraint: Partial<RouteSegmentConstraint> = {
        suffix: '.example.com'
      }
      const pattern = buildDomainPattern(constraint)
      expect(pattern).toBe('.example.com')
    })
  })

  describe('buildSegmentPattern', () => {
    it('should build a segment pattern with prefix and quantifier', () => {
      const constraint: Partial<RouteSegmentConstraint> = {
        param: 'id',
        prefix: 'user'
      }
      expect(buildSegmentPattern({ ...constraint, rule: /\d/ })).toBe('/user(\\d)')
      expect(buildSegmentPattern({ ...constraint, rule: /\d?/, quantifier: '?' })).toBe('/user(\\d?)?')
      expect(buildSegmentPattern({ ...constraint, rule: /\d+/, quantifier: '+' })).toBe('/user((?:\\d+)(?:/(?:\\d+))*)')
      expect(buildSegmentPattern({ ...constraint, rule: /\d*/, quantifier: '*' })).toBe('/user((?:\\d*)(?:/(?:\\d*))*)?')
    })

    it('should build a segment pattern without prefix and with quantifier', () => {
      const constraint: Partial<RouteSegmentConstraint> = {
        param: 'id'
      }
      expect(buildSegmentPattern({ ...constraint, rule: /\d/ })).toBe('/(\\d)')
      expect(buildSegmentPattern({ ...constraint, rule: /\d?/, quantifier: '?' })).toBe('(?:/(\\d?))?')
      expect(buildSegmentPattern({ ...constraint, rule: /\d+/, quantifier: '+' })).toBe('/((?:\\d+)(?:/(?:\\d+))*)')
      expect(buildSegmentPattern({ ...constraint, rule: /\d*/, quantifier: '*' })).toBe('(?:/((?:\\d*)(?:/(?:\\d*))*))?')
    })

    it('should return static segment if param is undefined', () => {
      const constraint: Partial<RouteSegmentConstraint> = {
        match: 'static'
      }
      const pattern = buildSegmentPattern(constraint)
      expect(pattern).toBe('/static')
    })

    it('should return default segment pattern', () => {
      const pattern = buildSegmentPattern()
      expect(pattern).toBe('/')
    })
  })

  describe('uriConstraints', () => {
    it('should return an array of constraints', () => {
      const constraints = uriConstraints(mockOptions)
      expect(constraints).toBeInstanceOf(Array)
      expect(constraints.length).toBeGreaterThan(0)
    })
  })

  describe('getDomainConstraints', () => {
    it('should extract optional domain constraints from options', () => {
      mockOptions.domain = '{sub@domain(\\w+)?=test}.example.com'
      const constraint = getDomainConstraints(mockOptions)
      expect(constraint).toBeDefined()
      expect(constraint?.rule).toBe('\\w+')
      expect(constraint?.param).toBe('sub')
      expect(constraint?.optional).toBe(true)
      expect(constraint?.alias).toBe('domain')
      expect(constraint?.default).toBe('test')
      expect(constraint?.suffix).toBe('.example.com')
    })

    it('should extract mandatory domain constraints from options', () => {
      mockOptions.domain = '{sub@domain(\\w+)+=test}.example.com'
      const constraint2 = getDomainConstraints(mockOptions)
      expect(constraint2).toBeDefined()
      expect(constraint2?.rule).toBe('\\w+')
      expect(constraint2?.param).toBe('sub')
      expect(constraint2?.optional).toBe(false)
      expect(constraint2?.alias).toBe('domain')
      expect(constraint2?.default).toBe('test')
      expect(constraint2?.suffix).toBe('.example.com')
    })

    it('should return undefined if domain is not set', () => {
      mockOptions.domain = undefined
      const constraint = getDomainConstraints(mockOptions)
      expect(constraint).toBeUndefined()
    })
  })

  describe('getSegmentsConstraints', () => {
    it('should extract optional segment constraints from path', () => {
      mockOptions.path = '/user/user-:id@username(\\w+)?=unknown'
      const constraints = getSegmentsConstraints(mockOptions)
      expect(constraints).toBeInstanceOf(Array)
      expect(constraints.length).toBe(2)
      expect(constraints[1].param).toBe('id')
      expect(constraints[1]?.rule).toBe('\\w+')
      expect(constraints[1]?.optional).toBe(true)
      expect(constraints[1]?.prefix).toBe('user-')
      expect(constraints[1]?.alias).toBe('username')
      expect(constraints[1]?.default).toBe('unknown')
    })

    it('should extract required segment constraints from path', () => {
      mockOptions.path = '/user/user-{id@username(\\w+)=unknown}'
      const constraints = getSegmentsConstraints(mockOptions)
      expect(constraints).toBeInstanceOf(Array)
      expect(constraints.length).toBe(2)
      expect(constraints[1].param).toBe('id')
      expect(constraints[1]?.rule).toBe('\\w+')
      expect(constraints[1]?.optional).toBe(false)
      expect(constraints[1]?.prefix).toBe('user-')
      expect(constraints[1]?.alias).toBe('username')
      expect(constraints[1]?.default).toBe('unknown')
    })

    it('should return an array with the second index undefined when dynamic path is invalid', () => {
      mockOptions.path = '/user/user-id@username(\\w+)=unknown}'
      const constraints = getSegmentsConstraints(mockOptions)
      expect(constraints).toBeInstanceOf(Array)
      expect(constraints.length).toBe(1)
    })

    it('should return an empty array for an empty path', () => {
      mockOptions.path = ''
      const constraints = getSegmentsConstraints(mockOptions)
      expect(constraints).toBeInstanceOf(Array)
      expect(constraints.length).toBe(0)
    })
  })
})
