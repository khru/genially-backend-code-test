import { GenericContainer, StartedTestContainer } from "testcontainers";
import { Db, MongoClient } from "mongodb";

import Genially from "@domain/Genially";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import MongoGeniallyRepository from "@infrastructure/MongoGeniallyRepository";
import { GeniallyCount } from "@domain/GeniallyCount";
import { SystemClock } from "@infrastructure/SystemClock";

describe("MongoGeniallyRepository", () => {
  let container: StartedTestContainer;
  let client: MongoClient;
  let db: Db;

  const collectionName = "geniallies";
  let mongoGeniallyRepository: MongoGeniallyRepository;
  let clock: SystemClock;

  beforeAll(async () => {
    const port = 27017;
    container = await new GenericContainer("mongo:8").withExposedPorts(port).start();

    const host = container.getHost();
    const mappedPort = container.getMappedPort(port);
    const uri = `mongodb://${host}:${mappedPort}`;

    client = await MongoClient.connect(uri);
    db = client.db("genially-tests");
    clock = new SystemClock();
    mongoGeniallyRepository = new MongoGeniallyRepository(db, clock, collectionName);
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
      // Arrange
      const aRandomId = "dbf75809-4e8d-4bf3-8110-f98275f26cd6";
      const genially = new Genially(clock, aRandomId, "Name One", "Some description");

      // Act
      await mongoGeniallyRepository.save(genially);

      // Assert
      const found = await mongoGeniallyRepository.find(aRandomId);
      expect(found).toEqual(genially);
    });

    it("should update a genially when call more than one time with the same id", async () => {
      // Arrange
      const genially1 = new Genially(clock, "same-id", "First Name", "v1");
      const genially2 = new Genially(clock, "same-id", "Updated Name", "v2");

      // Act
      await mongoGeniallyRepository.save(genially1);
      await mongoGeniallyRepository.save(genially2);

      // Assert
      const geniallyFound = await mongoGeniallyRepository.find("same-id");
      expect(geniallyFound).toEqual(genially2);
    });

    it("persists modifiedAt as null when absent and maps back to undefined on read", async () => {
      // Arrange
      const id = "no-modified-at-id";
      await mongoGeniallyRepository.save(new Genially(clock, id, "Name"));

      // Assert
      const found = await mongoGeniallyRepository.find(id);
      expect(found.modifiedAt).toBeUndefined();
    });
  });

  it("find should throw GeniallyNotExist when id is unknown", async () => {
    await expect(mongoGeniallyRepository.find("missing-id")).rejects.toThrow(GeniallyNotExist);
  });

  describe("delete", () => {
    it("should only update the deletedAt", async () => {
      const id = "an-id-to-delete";
      await mongoGeniallyRepository.save(new Genially(clock, id, "to delete", "ok"));

      await mongoGeniallyRepository.delete(id);

      const genially = await mongoGeniallyRepository.find(id);
      expect(genially.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw GeniallyNotExist when trying to delete an unknown id", async () => {
      await expect(mongoGeniallyRepository.delete("unknown-id")).rejects.toThrow(GeniallyNotExist);
    });

    it("should throw a GeniallyAlreadyDeleted when deleted twice", async () => {
      const id = "id-to-delete-twice";
      const genially = new Genially(clock, id, "to delete twice");
      await mongoGeniallyRepository.save(genially);

      await mongoGeniallyRepository.delete(id);
      await expect(mongoGeniallyRepository.delete(id)).rejects.toThrow(GeniallyAlreadyDeleted);

      const geniallyFound = await mongoGeniallyRepository.find(id);
      expect(geniallyFound!.deletedAt).toBeInstanceOf(Date);
    });

    describe("countCreated", () => {
      it("returns 0 when collection is empty", async () => {
        expect(await mongoGeniallyRepository.countCreated()).toEqual(new GeniallyCount(0));
      });

      it("returns the number of documents after saving distinct ids", async () => {
        await mongoGeniallyRepository.save(new Genially(clock, "fist-id", "first-name"));
        await mongoGeniallyRepository.save(new Genially(clock, "second-id", "second-name"));

        expect(await mongoGeniallyRepository.countCreated()).toEqual(new GeniallyCount(2));
      });

      it("does not decrease after a soft delete", async () => {
        const id = "to-soft-delete";
        await mongoGeniallyRepository.save(new Genially(clock, id, "will be deleted"));

        const before = await mongoGeniallyRepository.countCreated();
        await mongoGeniallyRepository.delete(id);
        const after = await mongoGeniallyRepository.countCreated();

        expect(after).toEqual(before);
      });

      it("does not increase the count when updating the same id", async () => {
        await mongoGeniallyRepository.save(new Genially(clock, "fist-id", "first-name"));
        const before = await mongoGeniallyRepository.countCreated();

        await mongoGeniallyRepository.save(new Genially(clock, "fist-id", "updated-name"));
        const after = await mongoGeniallyRepository.countCreated();

        expect(after).toEqual(before);
      });
    });
  });

  // New: default collection name used when none is provided
  it("uses the default collection name when none is provided", async () => {
    // Arrange
    const repoWithDefault = new MongoGeniallyRepository(db, clock); // no collectionName
    const id = "default-collection-id";

    // Act
    await repoWithDefault.save(new Genially(clock, id, "Default Col"));

    // Assert
    const found = await repoWithDefault.find(id);
    expect(found.id).toBe(id);
  });
});
