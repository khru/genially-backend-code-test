import { asClass, asFunction, asValue, AwilixContainer, createContainer, InjectionMode } from "awilix";

import type { AppConfig } from "@configuration/app-config";
import { configFromEnv } from "@configuration/config-from-env";
import MongoGeniallyRepository from "@infrastructure/MongoGeniallyRepository";
import { SystemClock } from "@infrastructure/SystemClock";

import CreateGeniallyService from "@application/CreateGeniallyService";
import DeleteGeniallyService from "@application/DeleteGeniallyService";
import RenameGeniallyService from "@application/RenameGeniallyService";

import { createGeniallyControllerFactory } from "@controllers/create-genially";
import { deleteGeniallyControllerFactory } from "@controllers/delete-genially";
import { renameGeniallyControllerFactory } from "@controllers/rename-genially";
import GeniallyCreatedCountService from "@application/GeniallyCreatedCountService";
import { getGeniallyCreatedCountControllerFactory } from "@controllers/get-genially-created-count";

type MongoClientT = import("mongodb").MongoClient;
type DbT = import("mongodb").Db;

function assertDb(db?: DbT): DbT {
  if (!db) {
    throw new Error("[DI] Mongo persistence selected but database connection isn't initialized");
  }
  return db;
}

export async function buildContainer(config?: AppConfig): Promise<{
  container: AwilixContainer;
  dispose: () => Promise<void>;
}> {
  const appConfig = config ?? configFromEnv();
  const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

  const { MongoClient } = await import("mongodb");
  const client: MongoClientT = new MongoClient(appConfig.database.uri);
  await client.connect();
  const db: DbT = client.db(appConfig.database.dbName);

  await db.command({ ping: 1 });

  const clock = new SystemClock();
  const repository = new MongoGeniallyRepository(assertDb(db), clock, appConfig.database.collection);

  container.register({
    // Values
    appConfig: asValue(appConfig),
    dbClient: asValue(client),
    db: asValue(db),
    geniallyRepository: asValue(repository),
    clock: asValue(clock),

    // Services
    createGeniallyService: asClass(CreateGeniallyService).scoped(),
    deleteGeniallyService: asClass(DeleteGeniallyService).scoped(),
    renameGeniallyService: asClass(RenameGeniallyService).scoped(),
    geniallyCreatedCountService: asClass(GeniallyCreatedCountService).scoped(),

    // Controllers
    createGeniallyController: asFunction(createGeniallyControllerFactory).scoped(),
    deleteGeniallyController: asFunction(deleteGeniallyControllerFactory).scoped(),
    renameGeniallyController: asFunction(renameGeniallyControllerFactory).scoped(),
    getGeniallyCreatedCountController: asFunction(getGeniallyCreatedCountControllerFactory).scoped(),
  });

  const dispose = async () => {
    try {
      await client?.close();
    } catch (unknownError) {
      console.error(`[DI] Error closing MongoDB client: ${unknownError}`);
    }
  };

  return { container, dispose };
}
