import type { Application } from "express";
import * as healthController from "@controllers/health";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "@api/docs/openapi";

export function registerCommonRoutes(app: Application): void {
  // Health
  app.get("/", healthController.check);

  // OpenAPI + Swagger UI
  app.get("/openapi.json", (_req, res) => res.json(openApiDocument));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
}
