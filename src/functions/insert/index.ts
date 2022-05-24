import type { AWS } from "@serverless/typescript";

import schema from "./schema";
import { handlerPath } from "@libs/handler-resolver";

export default <AWS["functions"][string]>{
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "post",
        path: "/",
        cors: true,
        request: {
          schemas: {
            "application/json": {
              schema, // FIXME: Validation by schema doesn't seem to be working (manual validation is now performed)
              name: "InsertDocumentHash",
              description: "Insert an entry into the revocation table",
            },
          },
        },
      },
    },
  ],
};
