/**
 * The platform identifier for the AWS API Gateway WebSocket adapter.
 */
export const AWS_APIGW_WS_PLATFORM = 'aws_apigw_ws'

/** API Gateway WebSocket lifecycle event types (`requestContext.eventType`). */
export const CONNECT = 'CONNECT'
export const DISCONNECT = 'DISCONNECT'
export const MESSAGE = 'MESSAGE'
