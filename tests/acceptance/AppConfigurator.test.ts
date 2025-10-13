import request from "supertest";
import { createConfiguredApp } from "@api/create-configured-app";
import type { AppConfig } from "@configuration/app-config";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("AppConfiguration", () => {
  type Row = {
    title: string;
    build: () => Promise<{ config: AppConfig; cleanup: () => Promise<void> }>;
  };

  it.each<Row>([
    {
      title: "InMemory",
      build: async () => ({
        config: { persistence: "memory", database: { uri: "", dbName: "", collection: "" } },
        cleanup: async () => {},
      }),
    },
    {
      title: "Mongo",
      build: async () => {
        const mongod = await MongoMemoryServer.create();
        return {
          config: {
            persistence: "mongo",
            database: { uri: mongod.getUri(), dbName: "app-factory-tests", collection: "geniallies" },
          },
          cleanup: async () => {
            await mongod.stop();
          },
        };
      },
    },
  ])("$title → wires routes and CRUD journey", async ({ build }) => {
    const { config, cleanup } = await build();
    const { app, close } = await createConfiguredApp(config);
    const id = `journey-${Date.now()}`;

    try {
      await request(app).post("/genially").send({ id, name: "a genially" }).expect(201);

      await request(app).patch(`/genially/${id}`).send({ name: "updated-name" }).expect(200);

      await request(app).delete(`/genially/${id}`).expect(204);
    } finally {
      await close();
      await cleanup();
    }
  });
});
