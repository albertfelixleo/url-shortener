import type { AWS } from '@serverless/typescript';

import create_short_id from '@functions/create_short_id';
import get_url from '@functions/get_url';

const SERVICE_NAME = 'url-shortener'
const DYNAMODB_TABLE = `${SERVICE_NAME}-dev`

const serverlessConfiguration: AWS = {
  service: SERVICE_NAME,
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      DYNAMODB_TABLE
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: [
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:GetItem',
          'dynamodb:PutItem'
        ],
        Resource: `arn:aws:dynamodb:us-east-1:*:table/${DYNAMODB_TABLE}`
      }
    ]
  },
  // import the function via paths
  functions: { 
    create_short_id,
    get_url
  },
  resources: {
    Resources: {
      UrlShortenerDynamoDbTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: 'Retain',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'shortId',
              AttributeType: 'S'
            },
            {
              AttributeName: 'url',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'shortId',
              KeyType: 'HASH'
            }
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1
          },
          TableName: DYNAMODB_TABLE
        }
      }
    }
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
