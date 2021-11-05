import { ALLOWED_ORIGINS } from "./constants";

export const getHeaders = (origin: string) => {
  let headers;

  if (ALLOWED_ORIGINS.includes(origin)) {
    headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Methods": "GET, POST, DELETE",
    };
  } else {
    headers = {
      "Access-Control-Allow-Credentials": false,
    };
  }

  return headers;
};
