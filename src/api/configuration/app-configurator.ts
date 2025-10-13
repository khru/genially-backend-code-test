import GeniallyRepository from "@domain/GeniallyRepository";
import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";

import MongoGeniallyRepository from "@infrastructure/MongoGeniallyRepository";
import { AppConfig } from "@configuration/app-config";
import { PersistenceTypes } from "@configuration/persistence-types";

type MongoClient = import("mongodb").MongoClient;
type Db = import("mongodb").Db;

export class AppConfigurator {
  private readonly config: AppConfig;
  private client?: MongoClient;
  private db?: Db;
  private initialized = false;
  private geniallyRepository?: GeniallyRepository;

  constructor(config: AppConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    if (this.config.persistence !== PersistenceTypes.MONGO) {
      return;
    }

    const { MongoClient } = await import("mongodb");
    this.client = new MongoClient(this.config.database.uri);
    await this.client.connect();
    this.db = this.client.db(this.config.database.dbName);
  }

  getGeniallyRepository(): GeniallyRepository {
    if (this.geniallyRepository) return this.geniallyRepository;

    if (this.isMongoConfigured()) {
      if (!this.db) throw new Error("Mongo not initialized. Call init() first.");
      this.geniallyRepository = new MongoGeniallyRepository(this.db, this.config.database.collection);
      return this.geniallyRepository;
    }

    this.geniallyRepository = new InMemoryGeniallyRepository();
    return this.geniallyRepository;
  }

  private isMongoConfigured() {
    return this.config.persistence === PersistenceTypes.MONGO;
  }

  async close(): Promise<void> {
    if (!this.client) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await this.client.close().catch(() => undefined);
    this.client = undefined;
    this.db = undefined;
    this.geniallyRepository = undefined;
  }
}
