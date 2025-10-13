import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import Genially from "@domain/Genially";
import { getAsyncError } from "@tests/shared/ErrorHandler";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { GeniallyCount } from "@domain/GeniallyCount";

describe("InMemoryGeniallyRepository", () => {
  let repository: InMemoryGeniallyRepository;

  beforeEach(() => {
    repository = new InMemoryGeniallyRepository();
  });

  describe("save", () => {
    it("should update existing genially when saving with same id", async () => {
      // Arrange
      const id = "1";
      const genially1 = new Genially(id, "First Genially");
      const genially2 = new Genially(id, "Updated Genially");

      // Act
      expect(await repository.save(genially1));
      expect(await repository.save(genially2));

      // Assert
      expect(await repository.find(id)).toEqual(genially2);
    });
  });

  describe("find", () => {
    it("should return a throw an error when id is not found", async () => {
      // Act
      const error = await getAsyncError<GeniallyNotExist>(async () => await repository.find("an-unexistent-id"));

      // Assert
      expect(error.message).toContain("an-unexistent-id");
    });
  });


  describe("find", () => {
    it("should return a throw an error when id is not found", async () => {
      // Act
      const error = await getAsyncError<GeniallyNotExist>(async () => await repository.find("an-unexistent-id"));

      // Assert
      expect(error.message).toContain("an-unexistent-id");
    });
  });

  describe("delete", () => {
    it("should delete an existing Genially", async () => {
      // Arrange
      const id = "delete-success-id";
      const genially = new Genially(id, "Name");
      await repository.save(genially);

      // Act
      await repository.delete(id);
      const deletedGenially: Genially = await repository.find(id);

      // Assert
      expect(deletedGenially.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw and exception when trying to erase an unknown genially", async () => {
      // Arrange
      const id = "unknown-genially-id";

      // Act
      const error = await getAsyncError<GeniallyNotExist>(async () => await repository.delete(id));

      // Assert
      expect(error.message).toContain(id);
    });
  });

  describe("countCreated", () => {
    it("should return 0 when repository is empty", async () => {
      expect(await repository.countCreated()).toEqual(new GeniallyCount(0));
    });

    it("should return the number of saved geniallys (distinct ids)", async () => {
      await repository.save(new Genially("first-id", "first-name"));
      await repository.save(new Genially("second-id", "second-name"));

      expect(await repository.countCreated()).toEqual(new GeniallyCount(2));
    });

    it("does not decrease after a soft delete", async () => {
      const id = "id-soft-delete";
      await repository.save(new Genially(id, "name to delete"));

      const before = await repository.countCreated();
      await repository.delete(id);
      const after = await repository.countCreated();

      expect(after).toEqual(before);
    });

    it("should not increase the counter when updating the same genially", async () => {
      const id = "id-upsert";
      await repository.save(new Genially(id, "first-name"));
      const before = await repository.countCreated();

      await repository.save(new Genially(id, "updated-name"));
      const after = await repository.countCreated();

      expect(after).toEqual(before);
    });
  });

  describe("find with non-empty collection", () => {
    it("throws NotExist if the id is missing even when other items exist", async () => {
      // Arrange
      const unknownId = "c";
      await repository.save(new Genially("first-id", "first-name"));
      await repository.save(new Genially("second-id", "second-name"));

      // Act
      const error = await getAsyncError<GeniallyNotExist>(async () => {
        return await repository.find(unknownId);
      });

      // Assert
      expect(error.message).toContain(unknownId);
    });

    it("returns the item whose id matches", async () => {
      // Arrange
      const firstGenially = new Genially("first-id", "first-name");
      const secondGenially = new Genially("second-id", "second-name");
      await repository.save(firstGenially);
      await repository.save(secondGenially);

      // Act
      const found = await repository.find("second-id");

      // Assert
      expect(found).toEqual(secondGenially);
    });
  });
});
