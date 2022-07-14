import middy, { MiddyfiedHandler } from "@middy/core";
import middyCors from "@middy/http-cors";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import middyErrorHandler from "@middy/http-error-handler";

import { Context, Handler } from "aws-lambda";

export const middyfy = <TEvent, TContext = Context>(
  handler: Handler<TEvent, TContext>
): MiddyfiedHandler<TEvent, TContext> => middy(handler).use([middyJsonBodyParser(), middyErrorHandler(), middyCors()]);
