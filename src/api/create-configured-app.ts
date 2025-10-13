import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
import lusca from "lusca";
import swaggerUi from "swagger-ui-express";

import * as healthController from "@controllers/health";
import { openApiDocument } from "@api/docs/openapi";

import { AppConfig } from "@configuration/app-config";
import { buildContainer } from "@api/container";

export async function createConfiguredApp(config?: AppConfig) {
  const {container, dispose} = await buildContainer(config);

  const app = express();
  app.set("port", process.env.PORT || 3000);
  app.use(compression());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(lusca.xframe("SAMEORIGIN"));
  app.use(lusca.xssProtection(true));

  // routes
  app.get("/", healthController.check);
  app.post("/genially", container.resolve("createGeniallyController"));
  app.delete("/genially/:id", container.resolve("deleteGeniallyController"));
  app.patch("/genially/:id", container.resolve("renameGeniallyController"));

  // docs
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  return {app, close: dispose};
}
