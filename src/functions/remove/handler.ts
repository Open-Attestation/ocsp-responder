import createError from "http-errors";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { deleteItem } from "@services/dynamoDb";

const remove: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  const { documentHash } = event.pathParameters;

  if (!documentHash) {
    throw new createError.BadRequest(`documentHash (string) required`);
  }

  try {
    await deleteItem({
      TableName: process.env.REVOCATION_TABLE,
      Key: { documentHash },
    }); 
  } catch (e) {
    throw new createError.InternalServerError(e);
  }

  return formatJSONResponse({
    success: true,
    documentHash,
    message: "documentHash removed from revocation table",
  });
};

export const main = middyfy(remove);
