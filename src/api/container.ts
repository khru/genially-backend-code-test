import { asClass, asFunction, asValue, AwilixContainer, createContainer, InjectionMode, } from "awilix";

import type { AppConfig } from "@configuration/app-config";
import { configFromEnv } from "@configuration/config-from-env";
import { PersistenceTypes } from "@configuration/persistence-types";

import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import MongoGeniallyRepository from "@infrastructure/MongoGeniallyRepository";

import CreateGeniallyService from "@application/CreateGeniallyService";
import DeleteGeniallyService from "@application/DeleteGeniallyService";
import RenameGeniallyService from "@application/RenameGeniallyService";

import { createGeniallyControllerFactory } from "@controllers/create-genially";
import { deleteGeniallyControllerFactory } from "@controllers/delete-genially";
import { renameGeniallyControllerFactory } from "@controllers/rename-genially";

type MongoClientT = import("mongodb").MongoClient;
type DbT = import("mongodb").Db;

function assertDb(db?: DbT): DbT {
  if (!db) {
    throw new Error(
      "[DI] Mongo persistence selected but database connection isn't initialized"
    );
  }
  return db;
}

export async function buildContainer(config?: AppConfig): Promise<{
  container: AwilixContainer;
  dispose: () => Promise<void>;
}> {
  const appConfig = config ?? configFromEnv();

  const container = createContainer({injectionMode: InjectionMode.CLASSIC});

  let client: MongoClientT | undefined;
  let db: DbT | undefined;

  if (appConfig.persistence === PersistenceTypes.MONGO) {
    const {MongoClient} = await import("mongodb");
    client = new MongoClient(appConfig.database.uri);
    await client.connect();
    db = client.db(appConfig.database.dbName);
  }

  const repository =
    appConfig.persistence === PersistenceTypes.MONGO
      ? new MongoGeniallyRepository(assertDb(db), appConfig.database.collection)
      : new InMemoryGeniallyRepository();

  container.register({
    // Values
    appConfig: asValue(appConfig),
    dbClient: asValue(client),
    db: asValue(db),
    geniallyRepository: asValue(repository),

    // Services
    createGeniallyService: asClass(CreateGeniallyService).scoped(),
    deleteGeniallyService: asClass(DeleteGeniallyService).scoped(),
    renameGeniallyService: asClass(RenameGeniallyService).scoped(),

    // Controllers
    createGeniallyController: asFunction(createGeniallyControllerFactory).scoped(),
    deleteGeniallyController: asFunction(deleteGeniallyControllerFactory).scoped(),
    renameGeniallyController: asFunction(renameGeniallyControllerFactory).scoped(),
  });

  const dispose = async () => {
    try {
      await client?.close();
    } catch (unknownError) {
      console.error(`[DI] Error closing MongoDB client: ${unknownError}`);
    }
  };

  return {container, dispose};
}
