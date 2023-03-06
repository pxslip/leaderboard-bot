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
  const {
    body: rawBody = '',
    headers: { 'X-Signature-Ed25519': signature = '', 'X-Signature-Timestamp': timestamp = '' },
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
  }
  return {
    statusCode: 401,
    body: 'invalid request signature',
  };
}
