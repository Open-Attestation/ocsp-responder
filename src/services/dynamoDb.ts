import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const options =
  process.env.STAGE === "dev"
    ? {
        region: "localhost",
        endpoint: "http://localhost:7000",
        accessKeyId: "DEFAULT_ACCESS_KEY",
        secretAccessKey: "DEFAULT_SECRET",
      }
    : {};

const dynamoDocumentDb = DynamoDBDocumentClient.from(new DynamoDBClient(options), {
  marshallOptions: {
    convertEmptyValues: true
  }
});

export const putItem = async (params: any) => {
  await dynamoDocumentDb.send(new PutCommand(params));
  return true;
};

export const deleteItem = async (params: any) => {
  await dynamoDocumentDb.send(new DeleteCommand(params));
  return true;
};

export const getItem = async (params: any): Promise<Record<string, any>> => {
  const result = await dynamoDocumentDb.send(new GetCommand(params));

  if (result && result.Item) {
    return result.Item;
  }
  return {};
};

export const queryItems = async (params: any) => {
  const result = await dynamoDocumentDb.send(new QueryCommand(params));
  if (result && result.Items) {
    return result.Items;
  }
  return [];
};
