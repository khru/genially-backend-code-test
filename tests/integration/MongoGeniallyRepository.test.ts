import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Db, MongoClient } from "mongodb";

import Genially from "@domain/Genially";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import MongoGeniallyRepository from "@infrastructure/MongoGeniallyRepository";

describe("MongoGeniallyRepository", () => {
  let container: StartedTestContainer;
  let client: MongoClient;
  let db: Db;

  const collectionName = "geniallies";
  let mongoGeniallyRepository: MongoGeniallyRepository;

  beforeAll(async () => {
    const port = 27017;
    container = await new GenericContainer("mongo:8").withExposedPorts(port).start();

    const host = container.getHost();
    const mappedPort = container.getMappedPort(port);
    const uri = `mongodb://${host}:${mappedPort}`;

    client = await MongoClient.connect(uri);
    db = client.db("genially-tests");
    mongoGeniallyRepository = new MongoGeniallyRepository(db, collectionName);
  });

  afterAll(async () => {
    await client?.close();
    await container?.stop();
  });

  beforeEach(async () => {
    await db.collection(collectionName).deleteMany({});
  });

  describe("save", () => {
    it("should store a genially", async () => {
      const aRandomId = "dbf75809-4e8d-4bf3-8110-f98275f26cd6";
      const genially = new Genially(aRandomId, "Name One", "Some description");
      await mongoGeniallyRepository.save(genially);

      const found = await mongoGeniallyRepository.find(aRandomId);

      expect(found).toEqual(genially);
    });

    it("should update a genially when call more than one time with the same id", async () => {
      const genially1 = new Genially("same-id", "First Name", "v1");
      const genially2 = new Genially("same-id", "Updated Name", "v2");

      await mongoGeniallyRepository.save(genially1);
      await mongoGeniallyRepository.save(genially2);

      const geniallyFound = await mongoGeniallyRepository.find("same-id");
      expect(geniallyFound).toEqual(genially2);
    });
  });

  it("find should throw GeniallyNotExist when id is unknown", async () => {
    await expect(mongoGeniallyRepository.find("missing-id")).rejects.toThrow(GeniallyNotExist);
  });

  describe("delete", () => {
    it("should only update the deletedAt", async () => {
      const id = "an-id-to-delete";
      await mongoGeniallyRepository.save(new Genially(id, "to delete", "ok"));

      await mongoGeniallyRepository.delete(id);

      const genially = await mongoGeniallyRepository.find(id);
      expect(genially.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw GeniallyNotExist when trying to delete an unknown id", async () => {
      await expect(mongoGeniallyRepository.delete("unknown-id")).rejects.toThrow(GeniallyNotExist);
    });

    it("should throw a GeniallyAlreadyDeleted when deleted twice", async () => {
      const id = "id-to-delete-twice";
      const genially = new Genially(id, "to delete twice");
      await mongoGeniallyRepository.save(genially);

      await mongoGeniallyRepository.delete(id);
      await expect(mongoGeniallyRepository.delete(id)).rejects.toThrow(GeniallyAlreadyDeleted);

      const geniallyFound = await mongoGeniallyRepository.find(id);
      expect(geniallyFound!.deletedAt).toBeInstanceOf(Date);
    });
  });
});
