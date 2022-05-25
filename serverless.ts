import type { AWS } from "@serverless/typescript";

import { getArgumentValuesOrDefault } from "@libs/utils";
import { insert, query, remove } from "@functions/index";

const STAGE = getArgumentValuesOrDefault({
  flag: "stage",
  defaultValue: "dev",
});

const serverlessConfiguration: AWS = {
  service: "ocsp-responder",
  frameworkVersion: "3",
  plugins: [
    "serverless-bundle",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    deploymentBucket: "notarise-serverless-deployment"
    name: "aws",
    runtime: "nodejs14.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      metrics: true,
      apiKeys: []
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      REVOCATION_TABLE: `ocsp-revocation-table-${STAGE}`,
    },
    tracing: {
      lambda: true
    },
  },
  // import the function via paths
  functions: { insert, query, remove },
  package: { individually: true },
  custom: {
    bundle: {
      esbuild: true,
      forceExclude:
        - "aws-sdk"
    },
    dynamodb: {
      stages: ["dev"],
      start: {
        port: 7000,
        inMemory: true,
        migrate: true,
      },
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
            KMSMasterKeyId: {
              "Fn::GetAtt": ["CertificateTableKey", "Arn"],
            },
            SSEEnabled: true,
            SSEType: "KMS"
          }
        },
      },
      CertificateTableKey: {
        Type: "AWS::KMS::Key",
        Properties: {
            EnableKeyRotation: true,
            KeyPolicy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            AWS: "arn:aws:iam::${self:custom.aws.accountId}:root"
                        },
                        Action: "kms:*",
                        Resource: "*"
                    },
                    {
                        Effect: "Allow",
                        Principal: {
                            AWS: "*"
                        },
                        Action: [
                            "kms:Encrypt",
                            "kms:Decrypt"
                        ],
                        Resource: "*",
                        Condition: {
                            StringEquals: {
                                "kms:CallerAccount": "${self:custom.aws.accountId}",
                                "kms:ViaService": "dynamodb.${self:custom.aws.region}.amazonaws.com"
                            }
                        }
                    }
                ]
            }
        }
    },
    },
  },
};

module.exports = serverlessConfiguration;
