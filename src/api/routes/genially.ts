import type { Application } from "express";
import type { AwilixContainer } from "awilix";

export function registerGeniallyRoutes(app: Application, container: AwilixContainer): void {
  app.post("/genially", container.resolve("createGeniallyController"));
  app.patch("/genially/:id", container.resolve("renameGeniallyController"));
  app.delete("/genially/:id", container.resolve("deleteGeniallyController"));
}
