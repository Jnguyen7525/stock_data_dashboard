// import { defineBackend } from "@aws-amplify/backend";
// import { alpacaNews } from "./functions/alpacaNews/resource";
// import { bars } from "./functions/bars/resource";

// defineBackend({
//   alpacaNews,
//   bars,
// });

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import {
  Cors,
  LambdaIntegration,
  AuthorizationType,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { defineBackend } from "@aws-amplify/backend";
import { alpacaNews } from "./functions/alpacaNews/resource";
import { bars } from "./functions/bars/resource";

const backend = defineBackend({
  alpacaNews,
  bars,
});

// Create an API stack
const apiStack = backend.createStack("api-stack");

// Create a REST API
const stockApi = new apigateway.RestApi(apiStack, "StockApi", {
  restApiName: "StockApi",
  deployOptions: { stageName: "dev" },
  defaultCorsPreflightOptions: {
    allowOrigins: Cors.ALL_ORIGINS,
    allowMethods: Cors.ALL_METHODS,
    allowHeaders: Cors.DEFAULT_HEADERS,
  },
});

// Attach /alpacaNews
stockApi.root
  .addResource("alpacaNews")
  .addMethod(
    "GET",
    new LambdaIntegration(backend.alpacaNews.resources.lambda),
    { authorizationType: AuthorizationType.NONE }
  );

// Attach /bars
stockApi.root
  .addResource("bars")
  .addMethod("GET", new LambdaIntegration(backend.bars.resources.lambda), {
    authorizationType: AuthorizationType.NONE,
  });

// Output the API endpoint
backend.addOutput({
  custom: {
    API: {
      [stockApi.restApiName]: {
        endpoint: stockApi.url,
      },
    },
  },
});
