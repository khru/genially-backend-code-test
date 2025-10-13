import { MongoMemoryServer } from "mongodb-memory-server";
import Genially from "@domain/Genially";
import { AppConfig } from "@configuration/app-config";
import { AppConfigurator } from "@configuration/app-configurator";
import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import MongoGeniallyRepository from "@infrastructure/MongoGeniallyRepository";

describe("AppConfigurator", () => {
  describe("InMemory configuration", () => {
    let configurationObject: AppConfig;
    let appConfiguration: AppConfigurator;

    beforeEach(async () => {
      configurationObject = {
        persistence: "memory",
        database: { uri: "", dbName: "", collection: "" },
      };
      appConfiguration = new AppConfigurator(configurationObject);
      await appConfiguration.init();
    });

    afterEach(async () => {
      await appConfiguration.close();
    });

    it("returns InMemory when persistence=memory", async () => {
      const geniallyRepository = appConfiguration.getGeniallyRepository();

      expect(geniallyRepository).toBeInstanceOf(InMemoryGeniallyRepository);
    });

    it("should be only one instance when calling multiple times", async () => {
      const repositoryOne = appConfiguration.getGeniallyRepository();
      const repositoryTwo = appConfiguration.getGeniallyRepository();

      expect(repositoryOne).toBe(repositoryTwo);
    });

    it("should be safe to exit without client to connect", async () => {
      await expect(appConfiguration.close()).resolves.toBeUndefined();
    });
  });

  describe("mongo configuration", () => {
    let mongoServer: MongoMemoryServer;
    let configurationObject: AppConfig;
    let appConfiguration: AppConfigurator;

    beforeEach(async () => {
      mongoServer = await MongoMemoryServer.create();

      configurationObject = {
        persistence: "mongo",
        database: { uri: mongoServer.getUri(), dbName: "appConfiguration-tests", collection: "geniallies" },
      };

      appConfiguration = new AppConfigurator(configurationObject);
      await appConfiguration.init();
    });

    afterEach(async () => {
      await mongoServer.stop();
      await appConfiguration.close();
    });

    it("should connect to mongo when persistence=mongo", async () => {
      const geniallyRepository = appConfiguration.getGeniallyRepository();
      expect(geniallyRepository).toBeInstanceOf(MongoGeniallyRepository);
    });

    it("should throw and error when calling getGeniallyRepository after closing", async () => {
      await appConfiguration.close();

      expect(() => appConfiguration.getGeniallyRepository()).toThrow(/init/i);
    });

    it("should fail when invalid URI is pass on init()", async () => {
      const configurator = new AppConfigurator({
        persistence: "mongo",
        database: { uri: "mongodb://randomurl:1/?serverSelectionTimeoutMS=200", dbName: "x", collection: "y" },
      });

      await expect(configurator.init()).rejects.toThrow();
      await mongoServer.stop();
      await configurator.close();
    });

    it("should be able to persist on mongo and recover it from it", async () => {
      const geniallyRepository = appConfiguration.getGeniallyRepository();
      const id = "appConfiguration-mongo-1";
      const genially = new Genially(id, "mongo config test");

      await geniallyRepository.save(genially);
      const found = await geniallyRepository.find(id);
      expect(found).toEqual(genially);
    });
  });
});
