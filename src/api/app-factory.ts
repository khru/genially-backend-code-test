import bodyParser from "body-parser";
import compression from "compression";
import express, { Application } from "express";
import lusca from "lusca";
import { correlationId } from "@api/middleware/correlation-id";

export function createExpressApp(): Application {
  const app = express();

  app.set("port", process.env.PORT || 3000);

  // Middlewares
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(lusca.xframe("SAMEORIGIN"));
  app.use(lusca.xssProtection(true));
  app.use(correlationId);

  return app;
}
