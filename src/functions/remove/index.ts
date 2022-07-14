import type { AWS } from "@serverless/typescript";

import { handlerPath } from "@libs/handler-resolver";

export default <AWS["functions"][string]>{
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "delete",
        path: "/{documentHash}",
        cors: true,
        private: true,
      },
    },
  ],
};
