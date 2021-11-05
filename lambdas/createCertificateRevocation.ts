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

  const { certificateId, reasonCode } = JSON.parse(event.body);

  if (!certificateId || !reasonCode) {
    return response({ message: "certificateId and reasonCode required" }, 400);
  }

  const revokedCertificate = {
    certificateId,
    reasonCode,
  };

  const res = await documentClient
    .put({
      TableName: CertificateTable,
      Item: revokedCertificate,
    })
    .promise();

  if (!res) {
    return response({ message: "error adding certificate revocation" }, 400);
  }

  return response({
    message: `certificate ${certificateId} added to revocation list`,
  });
};
