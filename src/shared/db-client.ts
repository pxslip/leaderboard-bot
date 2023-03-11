import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const dbClient = new DynamoDBClient({});
export default dbClient;
export const TABLE_NAME = process.env.DB_TABLE_NAME;
