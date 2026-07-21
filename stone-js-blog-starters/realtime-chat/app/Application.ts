import { Realtime } from '@stone-js/realtime'
import { NodeWs } from '@stone-js/node-ws-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application
 *
 * The realtime chat app entry point.
 *
 * @NodeWs()     runs a WebSocket server and bridges sockets to @stone-js/realtime.
 * @Realtime()   enables the broadcaster (memory driver; switch to redis to scale out).
 * @StoneApp()   enables the Stone application, it is required.
 *
 * The chat logic lives in the `@RealtimeGateway` (see ./ChatGateway).
 */
@NodeWs({ url: 'ws://localhost:8080' })
@NodeConsole()
@NodeHttp({ default: true })
@Realtime({ driver: 'memory' })
@StoneApp({ logger: { level: LogLevel.INFO } })
export class Application {}
