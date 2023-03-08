import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { verifyKey, InteractionType, InteractionResponseType } from 'discord-interactions';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const { PUBLIC_KEY = '' } = process.env;

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log(JSON.stringify(event));
  const {
    body: rawBody = '',
    headers: { 'x-signature-ed25519': signature = '', 'x-signature-timestamp': timestamp = '' },
  } = event;
  const isVerified = verifyKey(rawBody ?? '', signature, timestamp, PUBLIC_KEY);
  if (rawBody && isVerified) {
    const body = JSON.parse(rawBody);
    if (body.type === InteractionType.PING) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionResponseType.PONG,
        }),
      };
    }
    if (body.type === InteractionType.APPLICATION_COMMAND) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'Well hello there' },
        }),
      };
    }
  }
  return {
    statusCode: 401,
    body: 'invalid request signature',
  };
}
