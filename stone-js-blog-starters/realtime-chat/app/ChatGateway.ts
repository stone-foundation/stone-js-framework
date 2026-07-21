import { IncomingEvent } from '@stone-js/core'
import { RealtimeGateway, OnConnect, OnDisconnect, OnEvent, connectionOf, Broadcaster } from '@stone-js/realtime'

/** A chat message on a channel. */
export interface ChatMessage {
  from: string
  text: string
}

/**
 * ChatGateway
 *
 * A realtime gateway: its `@On*` methods react to socket lifecycle and channel events, routed
 * through the kernel by the light key-router. Every handler receives `(payload, event)`; reach the
 * originating connection with `connectionOf(event)`.
 */
@RealtimeGateway()
export class ChatGateway {
  private readonly realtime: Broadcaster

  /**
   * @param realtime - The default broadcaster, injected from the container.
   */
  constructor ({ realtime }: { realtime: Broadcaster }) {
    this.realtime = realtime
  }

  /** A socket connected: greet it on the room. */
  @OnConnect()
  async onConnect (_payload: unknown, event: IncomingEvent): Promise<void> {
    const connection = connectionOf(event)
    await this.realtime.to('room:general').emit('presence', { joined: connection?.id })
  }

  /** A socket left. */
  @OnDisconnect()
  async onDisconnect (_payload: unknown, event: IncomingEvent): Promise<void> {
    const connection = connectionOf(event)
    await this.realtime.to('room:general').emit('presence', { left: connection?.id })
  }

  /** A message was sent on the room: fan it out to every subscriber. */
  @OnEvent('room:general', 'message')
  async onMessage (payload: ChatMessage): Promise<void> {
    await this.realtime.to('room:general').emit('message', payload)
  }
}
