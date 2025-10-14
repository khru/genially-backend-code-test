import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import type { AppConfig } from "@configuration/app-config";
import { createConfiguredApp } from "@api/create-configured-app";

let agent: ReturnType<typeof request.agent> | undefined;
let mongodb: MongoMemoryServer | null = null;
let dispose: (() => Promise<void>) | null = null;

export async function getAgent() {
  if (agent) return agent;

  mongodb = await MongoMemoryServer.create();
  const appConfig: AppConfig = {
    database: {
      uri: mongodb.getUri(),
      dbName: "acceptance-tests",
      collection: "geniallies",
    },
  };

  const { app, close } = await createConfiguredApp(appConfig);
  dispose = close;
  agent = request.agent(app);
  return agent;
}

export async function stopAgent() {
  try {
    if (dispose) await dispose();
  } finally {
    dispose = null;
    agent = undefined;
    if (mongodb) {
      await mongodb.stop();
      mongodb = null;
    }
  }
}
