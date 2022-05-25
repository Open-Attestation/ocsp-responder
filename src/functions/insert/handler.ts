import createError from "http-errors";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { client } from "@services/dynamoDb";

import schema from "./schema";

const REASON_CODES = [...Array(11).keys()];

const insert: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { documentHash, reasonCode } = event.body;

  if (!documentHash || !reasonCode) {
    throw new createError.BadRequest(
      `documentHash (string) and reasonCode (number) required`
    );
  } else if (!REASON_CODES.includes(reasonCode)) {
    throw new createError.BadRequest(
      `Invalid reasonCode. Please use one of the following values: ${REASON_CODES}`
    );
  }

  await client
    .put({
      TableName: process.env.REVOCATION_TABLE,
      Item: { documentHash, reasonCode },
    })
    .promise()
    .catch((e) => {
      throw new createError.InternalServerError(e);
    });

  return formatJSONResponse({
    success: true,
    documentHash,
    message: "documentHash inserted into revocation table",
  });
};

export const main = middyfy(insert);
