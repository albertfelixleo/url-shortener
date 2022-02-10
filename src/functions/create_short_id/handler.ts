import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse, getErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';
import ShortUniqueId from 'short-unique-id';

import schema from './schema';

const dynamoDB = new DynamoDB.DocumentClient();

const createShortId: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {

  const url: string = event.body.url;
  const uid: ShortUniqueId = new ShortUniqueId({length: 10})
  const shortId: string = uid()

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Item: {
        shortId,
        url
      }
    }
    await dynamoDB.put(params).promise();
    return formatJSONResponse({
      message: 'Successfully created short id !',
      shortId,
      url
    });
  } catch(err){
    console.log(err)
    getErrorResponse(err)
  }

};

export const main = middyfy(createShortId);
