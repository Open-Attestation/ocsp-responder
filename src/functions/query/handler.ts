import createError from "http-errors";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { client } from "@services/dynamoDb";

const query: ValidatedEventAPIGatewayProxyEvent<void> = async (event) => {
  const { documentHash } = event.pathParameters;

  if (!documentHash) {
    throw new createError.BadRequest(`documentHash (string) required`);
  }

  const data = await client
    .get({
      TableName: process.env.REVOCATION_TABLE,
      Key: { documentHash },
    })
    .promise()
    .catch((e) => {
      throw new createError.InternalServerError(e);
    });

  if (
    // When no entry is found, an empty object is returned (E.g. `{}`)
    Object.keys(data).length === 0 &&
    Object.getPrototypeOf(data) === Object.prototype
  ) {
    return formatJSONResponse({ revoked: false, documentHash });
  } else if (data.Item && data.Item.documentHash && data.Item.reasonCode) {
    return formatJSONResponse({
      revoked: true,
      documentHash: data.Item.documentHash,
      reasonCode: data.Item.reasonCode,
    });
  } else {
    throw new createError.InternalServerError(
      "Entry in revocation table does not include documentHash (string) or reasonCode (number)"
    );
  }
};

export const main = middyfy(query);
