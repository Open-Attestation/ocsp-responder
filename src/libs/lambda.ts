import middy from "@middy/core";
import middyCors from "@middy/http-cors";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import middyErrorHandler from "@middy/http-error-handler";

export const middyfy = (handler) => {
  return middy(handler).use([
    middyJsonBodyParser(),
    middyErrorHandler(),
    middyCors(),
  ]);
};
