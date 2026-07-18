import { Pipeline } from '../src/Pipeline'
import { PipelineError } from '../src/PipelineError'
import { PipeExecutor, PipeResolver, Promiseable } from '../src/declarations'

describe('Pipeline Class', () => {
  let mockResolver: PipeResolver<number>

  beforeEach(() => {
    mockResolver = vi.fn()
  })

  it('should create a pipeline instance using the static create method', () => {
    const pipeline = Pipeline.create({ resolver: mockResolver })
    expect(pipeline).toBeInstanceOf(Pipeline)
  })

  it('should set the default priority', () => {
    const pipeline = Pipeline.create()
    pipeline.defaultPriority(20)
    // @ts-expect-error - access private member for test purposes
    expect(pipeline._defaultPriority).toBe(20)
  })

  it('should set the passable objects', () => {
    const pipeline = Pipeline.create<number>()
    pipeline.send(1)
    // @ts-expect-error - access private member for test purposes
    expect(pipeline.passable).toBe(1)
  })

  it('should set the pipes with a default priority', () => {
    const pipeline = Pipeline.create<number>()
    const pipe = vi.fn()
    pipeline.through(pipe)
    // @ts-expect-error - access private member for test purposes
    expect(pipeline.sortedMetaPipes.length).toBe(1)
    // @ts-expect-error - access private member for test purposes
    expect(pipeline.sortedMetaPipes[0].module).toBe(pipe)
  })

  it('should add additional pipes to the pipeline', () => {
    const pipeline = Pipeline.create<number>()
    const pipe1 = vi.fn()
    const pipe2 = vi.fn()
    pipeline.through(pipe1)
    pipeline.pipe(pipe2)
    // @ts-expect-error - access private member for test purposes
    expect(pipeline.sortedMetaPipes.length).toBe(2)
  })

  it('should set the method to call on each pipe', () => {
    const pipeline = Pipeline.create<number>()
    pipeline.via('customMethod')
    // @ts-expect-error - access private member for test purposes
    expect(pipeline.method).toBe('customMethod')
  })

  it('should configure the pipeline to run synchronously or asynchronously', () => {
    const pipeline = Pipeline.create<number>()
    pipeline.sync(false)
    // @ts-expect-error - access private member for test purposes
    expect(pipeline.isSync).toBe(false)
  })

  it('should execute pipes in sequence and return the final result (sync)', () => {
    const pipe1 = (value: number, next: PipeExecutor<number, number>): number | Promise<number> => next(Number(value) + 1)
    const pipe2 = (value: number, next: PipeExecutor<number, number>, param1: number): number | Promise<number> => next(Number(value) * (2 + Number(param1)))
    const pipeline = Pipeline.create<number, number>().send(1).through(pipe1, { module: pipe2, params: [1] }).sync()
    const result = pipeline.then((value) => value)
    expect(result).toBe(6) // (1 + 1) * (2 + 1)
  })

  it('should execute pipes in sequence and return the final result (sync) with many passable', () => {
    const pipe1 = (value: number, next: PipeExecutor<number, string>): string | Promise<string> => next(Number(value) + 1)
    const pipe2 = () => (value: number, next: PipeExecutor<number, string>): string | Promise<string> => next(Number(value) + 1)
    const pipe3 = (value: number, next: PipeExecutor<number, string>, param1: number): string | Promise<string> => next(Number(value) * (2 + Number(param1)))
    const pipeline = Pipeline.create<number, string>().send(1).through(pipe1, { module: pipe2, isFactory: true }, { module: pipe3, params: [1] }).sync()
    const result = pipeline.then((value) => `The result is: ${value}`)
    expect(result).toBe('The result is: 9') // ((1 + 1) + (2 + 1)) * (2 + 1)
  })

  it('should execute pipes in sequence and return the final result (async)', async () => {
    const pipe1 = async (value: number, next: PipeExecutor<number>): Promise<number> => await next(Number(value) + 1)
    const pipe2 = class {
      value = 2
      handle = async (value: number, next: PipeExecutor<number, number>): Promise<number> => await next(Number(value) * this.value)
    }
    const pipeline = Pipeline.create<number>().send(1).pipe(pipe1, { module: pipe2, isClass: true })
    const result = await pipeline.thenReturn()
    expect(result).toBe(4) // (1 + 1) * 2
  })

  it('should throw an error if a pipe cannot be resolved', async () => {
    const pipeline = Pipeline.create<number>()
    await expect(async () => {
      await pipeline.send(1).through('invalidPipe').thenReturn()
    }).rejects.toThrow(PipelineError)
  })

  it('should throw an error if no passable is defined', async () => {
    const pipe1 = (value: number, next: PipeExecutor<number, number>): number | Promise<number> => next(Number(value) + 1)
    const pipeline = Pipeline.create<number>()
    pipeline.through(pipe1)
    await expect(async () => {
      await pipeline.thenReturn()
    }).rejects.toThrow(PipelineError)
  })

  it('should throw an error if the method is missing on the pipe', async () => {
    const invalidPipe = { someOtherMethod: vi.fn() }
    const mockResolver = vi.fn().mockReturnValue(invalidPipe)
    const pipeline = Pipeline.create<number>({ resolver: mockResolver })
    pipeline.send(1).through('invalidPipe')
    await expect(async () => {
      await pipeline.thenReturn()
    }).rejects.toThrow(PipelineError)
  })

  it('parses an alias pipe with coerced params (string/number/boolean/null)', async () => {
    const captured: any[] = []
    const resolver = vi.fn().mockReturnValue({
      handle: async (value: number, next: PipeExecutor<number, number>, ...params: any[]) => { captured.push(...params); return await next(value) }
    })
    const pipeline = Pipeline.create<number>({ resolver }).via('handle')
    await pipeline.send(1).through('greet:hello,42,1.5,true,false,null').thenReturn()
    expect(captured).toEqual(['hello', 42, 1.5, true, false, null])
  })

  it('reports the class name when a resolved pipe is missing the method', async () => {
    class MissingMethodPipe { other (): void {} }
    const resolver = vi.fn().mockReturnValue(new MissingMethodPipe())
    const pipeline = Pipeline.create<number>({ resolver }).via('handle')
    await expect(
      pipeline.send(1).through({ module: MissingMethodPipe, isClass: true }).thenReturn()
    ).rejects.toThrow(/MissingMethodPipe/)
  })

  it('reports "anonymous" when a nameless pipe is missing the method', async () => {
    const anon: any = function () {}
    Object.defineProperty(anon, 'name', { value: '' })
    const resolver = vi.fn().mockReturnValue({ other: vi.fn() })
    const pipeline = Pipeline.create<number>({ resolver }).via('handle')
    await expect(
      pipeline.send(1).through({ module: anon, isClass: true }).thenReturn()
    ).rejects.toThrow(/anonymous/)
  })

  it('parses an alias pipe with a colon but no params', async () => {
    const resolver = vi.fn().mockReturnValue({
      handle: async (value: number, next: PipeExecutor<number, number>) => await next(value + 1)
    })
    const pipeline = Pipeline.create<number>({ resolver }).via('handle')
    const result = await pipeline.send(1).through('bare:').thenReturn()
    expect(result).toBe(2)
  })

  it('should call the container to resolve pipes when a container is provided', async () => {
    const Pipe = class {
      name (_value: number, _next: PipeExecutor<number, number>): number | Promise<number> { return 1 }
    }
    const mockResolver = vi.fn().mockReturnValue(new Pipe())
    const pipeline = Pipeline.create<number>({ resolver: mockResolver })
    await pipeline.send(1).via('name').through({ module: Pipe, isClass: true }).thenReturn()
    expect(mockResolver).toHaveBeenCalledWith({ module: Pipe, priority: 10, isClass: true })
  })

  it('should filter out duplicate pipes and sort them by priority descending', () => {
    const pipe1 = vi.fn()
    const pipe2 = vi.fn()
    const pipeline = Pipeline.create<number>()
    pipeline
      .defaultPriority(5)
      .through(
        { module: pipe1, priority: 1 },
        { module: pipe2, priority: 10 },
        { module: pipe1, priority: 1 } // duplicate
      )

    // @ts-expect-error
    const modules = pipeline.sortedMetaPipes.map(p => p.module)
    expect(modules).toEqual([pipe2, pipe1])
  })

  it('should append new pipes via .pipe() without losing previous ones', () => {
    const pipe1 = vi.fn()
    const pipe2 = vi.fn()
    const pipe3 = vi.fn()
    const pipeline = Pipeline.create<number>()
    pipeline.through(pipe1, pipe2)
    pipeline.pipe(pipe3)

    // @ts-expect-error
    const modules = pipeline.sortedMetaPipes.map(p => p.module)
    expect(modules).toContain(pipe1)
    expect(modules).toContain(pipe2)
    expect(modules).toContain(pipe3)
  })

  it('should wrap a resolver-returned function in an object with correct method', async () => {
    const fnPipe = vi.fn().mockImplementation((v: number) => v + 1)
    const resolver = vi.fn().mockReturnValue(fnPipe)
    const pipeline = Pipeline.create<number>({ resolver }).send(1).through('some-pipe').sync()
    const result = pipeline.thenReturn()
    expect(result).toBe(2)
  })

  it('should execute hook listeners before and after each pipe', async () => {
    const beforeHook = vi.fn()
    const afterHook = vi.fn()

    const pipe = (v: number, next: PipeExecutor<number>): Promiseable<number> => next(v + 1)

    const pipeline = Pipeline
      .create<number>({
      hooks: {
        onProcessingPipe: [beforeHook],
        onPipeProcessed: [afterHook]
      }
    })
      .send(1)
      .through(pipe)
      .sync()

    const result = pipeline.thenReturn()
    expect(result).toBe(2)
    expect(beforeHook).toHaveBeenCalled()
    expect(afterHook).toHaveBeenCalled()
  })

  it('should execute hook listeners before and after each pipe (async)', async () => {
    const beforeHook = vi.fn()
    const afterHook = vi.fn()

    const module = async (v: number, next: PipeExecutor<number>): Promise<number> => await next(v + 1)
    const module2 = async (v: number, next: PipeExecutor<number>): Promise<number> => await next(v + 1)

    const pipeline = Pipeline
      .create<number>()
      .on('onProcessingPipe', beforeHook)
      .on('onPipeProcessed', afterHook)
      .send(1)
      .through({ module, priority: undefined }, { module: module2 })
      .sync(false)

    const result = await pipeline.thenReturn()
    expect(result).toBe(3)
    expect(beforeHook).toHaveBeenCalled()
    expect(afterHook).toHaveBeenCalled()
  })
})

describe('Pipeline — priority resolution hardening', () => {
  it('applies defaultPriority set AFTER through() (order-independent)', () => {
    const p1: any = { module: () => {}, isFunction: true }
    const p2: any = { module: () => {}, isFunction: true }
    const a = Pipeline.create().through(p1, p2).defaultPriority(100) as any
    expect(a.sortedMetaPipes.every((m: any) => m.priority === 100)).toBe(true)

    const b = Pipeline.create().defaultPriority(100).through(p1, p2) as any
    expect(b.sortedMetaPipes.every((m: any) => m.priority === 100)).toBe(true)
  })

  it('does not let an explicit priority:undefined override the default', () => {
    const p: any = { module: () => {}, isFunction: true, priority: undefined }
    const pipeline = Pipeline.create().defaultPriority(42).through(p) as any
    expect(pipeline.sortedMetaPipes[0].priority).toBe(42)
  })

  it('orders by priority (higher first)', () => {
    const low: any = { module: () => {}, isFunction: true, priority: 1 }
    const high: any = { module: () => {}, isFunction: true, priority: 9 }
    const pipeline = Pipeline.create().through(low, high) as any
    expect(pipeline.sortedMetaPipes[0].priority).toBe(9)
    expect(pipeline.sortedMetaPipes[1].priority).toBe(1)
  })
})

describe('Pipeline — string alias with inline params', () => {
  it('parses "alias:param1,param2" into a meta pipe with coerced params', () => {
    const p: any = Pipeline.create().through('throttle:60,100,true,beta') as any
    const meta = p.sortedMetaPipes[0]
    expect(meta.module).toBe('throttle')
    expect(meta.isAlias).toBe(true)
    expect(meta.params).toEqual([60, 100, true, 'beta'])
  })

  it('parses a bare alias with no params', () => {
    const p: any = Pipeline.create().through('auth') as any
    expect(p.sortedMetaPipes[0].module).toBe('auth')
    expect(p.sortedMetaPipes[0].params).toBeUndefined()
  })

  it('coerces null and negative/decimal numbers', () => {
    const p: any = Pipeline.create().through('x:null,-3,1.5,hello') as any
    expect(p.sortedMetaPipes[0].params).toEqual([null, -3, 1.5, 'hello'])
  })
})
