import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/aws-apigw-ws'

const ENABLE = `import { StoneApp } from '@stone-js/core'
import { Realtime } from '@stone-js/realtime'
import { ApiGatewayWs } from '@stone-js/aws-apigw-ws-adapter'

@ApiGatewayWs()
@Realtime({ driver: 'memory' })   // bootstraps the RealtimeManager
@StoneApp({ name: 'chat' })
export class Application {}`

/**
 * Adapters: AWS API Gateway WebSocket.
 */
@Page(PATH, { layout: 'docs' })
export class AwsApigwWs implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'AWS API Gateway WebSocket adapter',
      description: 'Run your realtime app serverlessly on API Gateway WebSocket APIs: $connect/$disconnect/messages map onto @stone-js/realtime, with DynamoDB presence and Management API fan-out.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='AWS API Gateway WebSocket' />
        <Lead>
          Realtime, serverless. An API Gateway WebSocket API invokes a fresh Lambda per socket event,
          so <code>@stone-js/aws-apigw-ws-adapter</code> maps <code>$connect</code>,
          <code> $disconnect</code> and messages onto <code>@stone-js/realtime</code>: presence lives
          in DynamoDB, your <code>@On*</code> gateways fire, and replies go out through the API Gateway
          Management API. The exact gateway code you run on the Node <code>ws</code> adapter runs here
          unchanged, the context collapses the difference.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/aws-apigw-ws-adapter @stone-js/realtime
npm i @aws-sdk/client-apigatewaymanagementapi @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb`}</Code>

        <H2>Enable it</H2>
        <p>
          Add the adapter to the manifest, on top of <code>@stone-js/realtime</code>. The adapter is
          the default in a Lambda environment.
        </p>
        <Code file='app/Application.ts'>{ENABLE}</Code>

        <H3>Use the serverless broadcaster</H3>
        <p>
          With no held socket, presence must be shared across invocations. Register the
          DynamoDB-backed broadcaster as the realtime default; the adapter resolves it and points it
          at each event's management endpoint.
        </p>
        <Code file='app/ApiGatewayWsRealtimeProvider.ts'>{`import { RealtimeManager } from '@stone-js/realtime'
import { ApiGatewayWsBroadcaster, DynamoDbConnectionStore } from '@stone-js/aws-apigw-ws-adapter'

export class ApiGatewayWsRealtimeProvider {
  register () {
    RealtimeManager.getInstance()
      ?.register('apigw-ws', ApiGatewayWsBroadcaster.create({
        store: DynamoDbConnectionStore.create({ table: 'ws_connections' })
      }))
      .setDefaultConnection('apigw-ws')
  }
}`}</Code>

        <H3>Register the handler</H3>
        <p>
          <code>run()</code> returns the <code>(event, context)</code> Lambda handler; wire it to your
          API's routes (<code>$connect</code>, <code>$disconnect</code>, <code>$default</code>).
        </p>
        <Code file='index.js'>{`export const handler = await stoneApp.run()`}</Code>

        <H2>Gateways</H2>
        <p>The same gateway API as everywhere else, one method per event:</p>
        <Code file='app/Chat.ts'>{`import { RealtimeGateway, OnConnect, OnEvent } from '@stone-js/realtime'

@RealtimeGateway()
export class Chat {
  constructor (private readonly realtime) {}

  @OnConnect() onConnect (connection) { /* … */ }

  @OnEvent('room:1', 'message')
  async onMessage (payload, connection) {
    await this.realtime.to('room:1').emit('message', payload)   // fans out via postToConnection
  }
}`}</Code>

        <Callout kind='note' title='Presence is DynamoDB, replies are the Management API'>
          A single table keeps connections and channel memberships across invocations. A
          <code> broadcast</code> reads the channel's members and posts to each connection via
          <code> postToConnection</code>; a stale (410 Gone) connection is skipped. Both AWS SDKs are
          optional peers, imported lazily.
        </Callout>

        <H2>Configuration</H2>
        <PropsTable nameHeader='key' rows={[
          { name: 'stone.adapter.dispatchToKernel', type: 'false', desc: 'Also route each data frame through the kernel (middleware, routing, handlers).' },
          { name: 'DynamoDbConnectionStore.table', type: 'stone_ws_connections', desc: 'The DynamoDB table holding connections and channel memberships.' }
        ]} />

        <Callout kind='future' title='Same code, any transport'>
          Swap <code>@ApiGatewayWs()</code> for <code>@NodeWs()</code> and the identical gateways run
          on a long-lived Node <code>ws</code> server; the runtime that receives the socket collapses
          the choice.
        </Callout>

        <SeeAlso links={[
          { title: 'Realtime', path: '/docs/extensions/realtime' },
          { title: 'Node WebSocket adapter', path: '/docs/adapters/node-ws' },
          { title: 'AWS Lambda adapter', path: '/docs/adapters/aws-lambda' },
          { title: 'Edge & Serverless context', path: '/docs/contexts/edge' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
