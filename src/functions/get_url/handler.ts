import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONRedirect, getErrorResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { DynamoDB } from 'aws-sdk';


const dynamoDB = new DynamoDB.DocumentClient();

const getUrl: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {

    const shortId: string = event.pathParameters.id

    try {
        const params = {
          TableName: process.env.DYNAMODB_TABLE,
          Key: {
            shortId          
          }
        }
        const data = await dynamoDB.get(params).promise();

        return formatJSONRedirect(
          { message: 'Successfully redirected'},
          { Location: data.Item.url }
        );

      } catch(err){
        console.log(err)
        getErrorResponse(err)
      }

};

export const main = middyfy(getUrl);
