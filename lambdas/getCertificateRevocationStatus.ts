import { CertificateStatus, LambdaEvent, ReasonCode } from "../types";
import { DynamoDB } from "aws-sdk";
import { getHeaders } from "../utils";

const documentClient = new DynamoDB.DocumentClient();
const CertificateTable = process.env.certificateTable as string;

exports.handler = async (event: LambdaEvent) => {
  const response = (
    data: {
      certificateStatus: CertificateStatus;
      reasonCode?: ReasonCode;
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
    return response({ certificateStatus: "unknown" });
  }

  const { certificateId } = event.pathParameters;
  const data = await documentClient
    .get({
      TableName: CertificateTable,
      Key: {
        certificateId,
      },
    })
    .promise();

  if (!data || !data.Item) {
    return response({ certificateStatus: "unknown" });
  }

  const revokedCertificate = data.Item;

  if (!revokedCertificate) {
    return response({ certificateStatus: "good" });
  }

  return response({
    certificateStatus: "revoked",
    reasonCode: revokedCertificate.reasonCode,
  });
};
