import { LambdaEvent } from "../types";
import { DynamoDB } from "aws-sdk";
import { getHeaders } from "../utils";

const documentClient = new DynamoDB.DocumentClient();
const CertificateTable = process.env.certificateTable as string;

exports.handler = async (event: LambdaEvent) => {
  const response = (
    data: {
      message: string;
    },
    statusCode: number = 200
  ) => {
    return {
      headers: getHeaders(event.headers.origin || event.headers.Origin),
      statusCode,
      body: JSON.stringify(data),
    };
  };

  if (!event.pathParameters || !event.pathParameters.certificateId) {
    return response({ message: "certificateId is required" });
  }

  const { certificateId } = event.pathParameters;
  const res = await documentClient
    .delete({
      TableName: CertificateTable,
      Key: {
        certificateId,
      },
    })
    .promise();

  if (!res) {
    return response({ message: `error deleting certificate ${certificateId}` });
  }

  return response({
    message: `succesfully removed certificate ${certificateId} from the revocation list`,
  });
};
