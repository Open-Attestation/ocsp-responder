/**
 *
 */
export interface LambdaEvent {
  body: string;
  pathParameters: { [key: string]: string };
  headers: { [key: string]: string };
}

export type CertificateStatus = "good" | "revoked" | "unknown";

export enum ReasonCode {
  UNSPECIFIED = 0,
  KEY_COMPROMISE = 1,
  CA_COMPROMISE = 2,
  AFFILIATION_CHANGED = 3,
  SUPERSEDED = 4,
  CESSATION_OF_OPERATION = 5,
  CERTIFICATE_HOLD = 6,
  REMOVE_FROM_CRL = 8,
  PRIVILEGE_WITHDRAWN = 9,
  A_A_COMPROMISE = 10,
}
