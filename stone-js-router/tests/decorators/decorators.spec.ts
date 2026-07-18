import { Put } from '../../src/decorators/Put'
import { Get } from '../../src/decorators/Get'
import { Any } from '../../src/decorators/Any'
import { Post } from '../../src/decorators/Post'
import { Page } from '../../src/decorators/Page'
import { Match } from '../../src/decorators/Match'
import { Patch } from '../../src/decorators/Patch'
import { Delete } from '../../src/decorators/Delete'
import { Options } from '../../src/decorators/Options'
import { Fallback } from '../../src/decorators/Fallback'
import { Controller } from '../../src/decorators/Controller'
import { EventHandler } from '../../src/decorators/EventHandler'
import { GROUP_KEY, MATCH_KEY } from '../../src/decorators/constants'
import { Routing, RoutingOptions } from '../../src/decorators/Routing'
import { DELETE, GET, OPTIONS, PATCH, POST, PUT } from '../../src/constants'
import { addBlueprint, addMetadata, SERVICE_KEY, setMetadata } from '@stone-js/core'

/* eslint-disable @typescript-eslint/no-extraneous-class */

// Mock @stone-js/core
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    setMetadata: vi.fn(() => {}),
    addMetadata: vi.fn(() => {}),
    addBlueprint: vi.fn(() => {}),
    classDecoratorLegacyWrapper: (fn: Function) => {
      fn()
      return fn
    },
    methodDecoratorLegacyWrapper: (fn: Function) => {
      fn(() => {}, {})
      return fn
    }
  }
})

describe('Decorators', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Controller', () => {
    it('should call setMetadata with default options if none are provided', () => {
      Controller('/users')(class {})
      expect(setMetadata).toHaveBeenCalledWith(
        undefined,
        GROUP_KEY,
        expect.objectContaining({ path: '/users' })
      )
      expect(setMetadata).toHaveBeenCalledWith(
        undefined,
        SERVICE_KEY,
        expect.objectContaining({ singleton: true })
      )
    })
  })

  describe('EventHandler', () => {
    it('should call setMetadata with default options if none are provided', () => {
      EventHandler('/users')(class {})
      expect(setMetadata).toHaveBeenCalledWith(
        undefined,
        GROUP_KEY,
        expect.objectContaining({ path: '/users' })
      )
    })
  })

  describe('Match', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Match('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', handler: { action: 'save' } })
      )
    })
  })

  describe('Any', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Any('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [GET, POST, PUT, PATCH, DELETE, OPTIONS], handler: { action: 'save' } })
      )
    })
  })

  describe('Post', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Post('/users')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users', methods: [POST], handler: { action: 'save' } })
      )
    })
  })

  describe('Get', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Get('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [GET], handler: { action: 'save' } })
      )
    })
  })

  describe('Page', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Page('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [GET], handler: { action: 'save' } })
      )
    })
  })

  describe('Fallback', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Fallback()(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/:__fallback__(.*)*', fallback: true, methods: [GET], handler: { action: 'save' } })
      )
    })
  })

  describe('Options', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Options('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [OPTIONS], handler: { action: 'save' } })
      )
    })
  })

  describe('Put', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Put('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [PUT], handler: { action: 'save' } })
      )
    })
  })

  describe('Patch', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Patch('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [PATCH], handler: { action: 'save' } })
      )
    })
  })

  describe('Delete', () => {
    it('should call addMetadata with default options if none are provided', () => {
      Delete('/users/:id')(() => {}, { name: 'save', kind: 'method' } as any, {})
      expect(addMetadata).toHaveBeenCalledWith(
        expect.objectContaining({ kind: 'method' }),
        MATCH_KEY,
        expect.objectContaining({ path: '/users/:id', methods: [DELETE], handler: { action: 'save' } })
      )
    })
  })

  describe('Routing', () => {
    it('should call addBlueprint with correct parameters', () => {
      const options: RoutingOptions = { definitions: [] }
      Routing(options)(class {})
      expect(addBlueprint).toHaveBeenCalled()
    })

    it('should call addBlueprint with default options if none are provided', () => {
      Routing({})(class {})
      expect(addBlueprint).toHaveBeenCalled()
    })
  })
})
