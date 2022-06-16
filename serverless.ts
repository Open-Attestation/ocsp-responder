import type { AWS } from "@serverless/typescript";

import { getArgumentValuesOrDefault } from "@libs/utils";
import { insert, query, remove } from "@functions/index";
import "dotenv/config";

const stage = getArgumentValuesOrDefault({
  flag: "stage",
  defaultValue: "dev",
});

const serverlessConfiguration = async (): Promise<AWS> => {
  const service = `ocsp-responder`;

  let config : AWS = {
    frameworkVersion: '3',
    configValidationMode: 'error',
    useDotenv: true,
    service,
    plugins: [
      "serverless-bundle",
      "serverless-dynamodb-local",
      "serverless-domain-manager",
      "serverless-offline",
    ],
    provider: {
      stage,
      name: "aws",
      runtime: "nodejs14.x",
      region: "ap-southeast-1",
      apiGateway: {
        minimumCompressionSize: 1024,
        shouldStartNameWithService: true,
        metrics: true,
        apiKeys: [`${service}-${stage}`],
      },
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
        REVOCATION_TABLE: "ocsp-revocation-table-${self:provider.stage}",
      },
      iam: {
        role: {
          statements: [
            {
              Effect: "Allow",
              Action: [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
              ],
              Resource: [
                {
                  "Fn::GetAtt": ["CertificateTable", "Arn"],
                },
              ],
            },
          ],
        },
      },
      tracing: {
        lambda: true,
        apiGateway: true,
      },
      versionFunctions: false,
      logRetentionInDays: 365,
      memorySize: 256,
    },
    // import the function via paths
    functions: { insert, query, remove },
    custom: {
      bundle: {
        esbuild: true,
        // forceExclude: [
        //   "aws-sdk"
        // ]
      },
      dynamodb: {
        stages: ["dev"],
        start: {
          port: 7000,
          inMemory: true,
          migrate: true,
        },
      },
      customDomain: {
        domainName: "${env:DOMAIN, 'oa.com'}",
        stage: "${self:provider.stage}",
        createRoute53Record: "${env:CREATE_ROUTE53, false}",
        endpointType: "regional",
        autoDomain: "${env:AUTO_DOMAIN, false}",
        enabled: "${env:DOMAIN_ENABLED, false}"
      },
    },
    resources: {
      Resources: {
        CertificateTable: {
          Type: "AWS::DynamoDB::Table",
          Properties: {
            TableName: "${self:provider.environment.REVOCATION_TABLE}",
            AttributeDefinitions: [
              {
                AttributeName: "documentHash",
                AttributeType: "S",
              },
            ],
            KeySchema: [
              {
                AttributeName: "documentHash",
                KeyType: "HASH",
              },
            ],
            BillingMode: "PAY_PER_REQUEST",
            SSESpecification: {
              SSEEnabled: true,
              SSEType: "KMS",
            },
          },
        },
      },
    },
  };

  if (process.env.ROLE_PERMISSIONS_BOUNDARY) {
    config.provider.iam.role["permissionsBoundary"] = process.env.ROLE_PERMISSIONS_BOUNDARY; 
  }

  if (process.env.DEPLOYMENT_BUCKET) {
    config.provider.deploymentBucket = process.env.DEPLOYMENT_BUCKET; 
  }

  return config;
};

module.exports = serverlessConfiguration();
