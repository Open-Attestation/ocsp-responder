import type { AWS } from "@serverless/typescript";

import { getArgumentValuesOrDefault } from "@libs/utils";
import { insert, query, remove } from "@functions/index";

const STAGE = getArgumentValuesOrDefault({
  flag: "stage",
  defaultValue: "dev",
});

const serverlessConfiguration = async (): Promise<AWS> => {
  const service = `ocsp-responder`;
  const enableCustomDomain = process.env.DOMAIN ? true : false;

  return {
    useDotenv: true,
    service,
    plugins: [
      "serverless-bundle",
      "serverless-dynamodb-local",
      "serverless-domain-manager",
      "serverless-offline",
    ],
    provider: {
      deploymentBucket: "${env:DEPLOYMENT_BUCKET}",
      name: "aws",
      runtime: "nodejs14.x",
      region: "ap-southeast-1",
      apiGateway: {
        minimumCompressionSize: 1024,
        shouldStartNameWithService: true,
        metrics: true,
        apiKeys: [`${service}-${STAGE}`],
      },
      environment: {
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
        NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
        REVOCATION_TABLE: `ocsp-revocation-table-${STAGE}`,
      },
      iam: {
        role: {
          permissionsBoundary: "${env:ROLE_PERMISSIONS_BOUNDARY,''}",
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
        domainName: "${env:DOMAIN, ''}",
        stage: `${STAGE}`,
        createRoute53Record: enableCustomDomain,
        endpointType: "regional",
        autoDomain: enableCustomDomain,
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
};

module.exports = serverlessConfiguration();
