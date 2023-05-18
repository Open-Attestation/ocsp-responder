import createError from "http-errors";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { getItem } from "@services/dynamoDb";

const query: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  const { documentHash } = event.pathParameters;

  if (!documentHash) {
    throw new createError.BadRequest(`documentHash (string) required`);
  }

  let data: Record<string, any>;

  try{
    data = await getItem({
      TableName: process.env.REVOCATION_TABLE,
      Key: { documentHash },
    });
  } catch (e){
    throw new createError.InternalServerError(e);
  }

  if (
    // When no entry is found, an empty object is returned (E.g. `{}`)
    Object.keys(data).length === 0 &&
    Object.getPrototypeOf(data) === Object.prototype
  ) {
    return formatJSONResponse({ revoked: false, documentHash });
  } else if (data && data.documentHash && data.reasonCode !== undefined) {
    return formatJSONResponse({
      revoked: true,
      documentHash: data.documentHash,
      reasonCode: data.reasonCode,
    });
  } else {
    throw new createError.InternalServerError(
      "Entry in revocation table does not include documentHash (string) or reasonCode (number)"
    );
  }
};

export const main = middyfy(query);
