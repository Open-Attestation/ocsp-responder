import { DynamoDB } from "aws-sdk";

const options =
  process.env.STAGE === "dev"
    ? {
        region: "localhost",
        endpoint: "http://localhost:7000",
        accessKeyId: "DEFAULT_ACCESS_KEY",
        secretAccessKey: "DEFAULT_SECRET",
      }
    : {};

export const client = new DynamoDB.DocumentClient(options);
