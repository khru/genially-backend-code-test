import request from "supertest";
import type { AppConfig } from "@configuration/app-config";
import { MongoMemoryServer } from "mongodb-memory-server";
import { buildContainer } from "@api/container";

describe("DI Container bootstrap", () => {
  it("wires controllers with Mongo (ephemeral)", async () => {
    const mongodb = await MongoMemoryServer.create();
    const appConfig: AppConfig = {
      database: { uri: mongodb.getUri(), dbName: "di-tests", collection: "geniallies" },
    };

    const { container, dispose } = await buildContainer(appConfig);
    const appFactory = async () => {
      const express = (await import("express")).default;
      const app = express();
      app.use((await import("body-parser")).json());
      app.post("/genially", container.resolve("createGeniallyController"));
      app.patch("/genially/:id", container.resolve("renameGeniallyController"));
      app.delete("/genially/:id", container.resolve("deleteGeniallyController"));
      return app;
    };

    const app = await appFactory();
    const id = `journey-${Date.now()}`;
    await request(app).post("/genially").send({ id, name: "a genially" }).expect(201);

    await request(app).patch(`/genially/${id}`).send({ name: "updated" }).expect(200);

    await request(app).delete(`/genially/${id}`).expect(204);

    await dispose();
    await mongodb.stop();
  });

  it("throws when persistence=mongo and connect fails", async () => {
    const appConfig: AppConfig = {
      database: {
        uri: "mongodb://bad-host:1/?serverSelectionTimeoutMS=200",
        dbName: "x",
        collection: "geniallies",
      },
    };
    await expect(buildContainer(appConfig)).rejects.toThrow(/server|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|getaddrinfo/i);
  });
});
