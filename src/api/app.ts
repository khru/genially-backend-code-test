import bodyParser from "body-parser";
import compression from "compression";
import express from "express";
import lusca from "lusca";
import swaggerUi from "swagger-ui-express";
import { openApiDocument } from "./docs/openapi";

// Controllers (route handlers)
import * as healthController from "@controllers/health";
import {
  createGeniallyController,
  deleteGeniallyController,
  renameGeniallyController
} from "@api/dependency-injection";

// Create Express server
const app = express();

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

// Primary app routes
app.get("/", healthController.check);
app.post("/genially", createGeniallyController);
app.delete("/genially/:id", deleteGeniallyController);
app.patch("/genially/:id", renameGeniallyController);

// OpenAPI routes
app.get("/openapi.json", (_request, response) => response.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

export default app;
