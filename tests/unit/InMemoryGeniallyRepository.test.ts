import InMemoryGeniallyRepository from "../../src/contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import Genially from "../../src/contexts/core/genially/domain/Genially";
import { getAsyncError } from "../helpers/ErrorHandler";
import GeniallyNotExist from "../../src/contexts/core/genially/domain/exception/GeniallyNotExist";

describe("InMemoryGeniallyRepository", () => {
  let repository: InMemoryGeniallyRepository;

  beforeEach(() => {
    repository = new InMemoryGeniallyRepository();
  });

  describe("save", () => {
    it("should update existing genially when saving with same id", async () => {
      const genially1 = new Genially("1", "First Genially");
      const genially2 = new Genially("1", "Updated Genially");

      expect(await repository.save(genially1));
      expect(await repository.save(genially2));
      expect(await repository.find("1")).toEqual(genially2);
    });
  });

  describe("find", () => {
    it("should return a throw an error when id is not found", async () => {
      const error = await getAsyncError<GeniallyNotExist>(async () => await repository.find("an-unexistent-id"));

      expect(error.message).toContain("an-unexistent-id");
    });
  });

  describe("find", () => {
    it("should return a throw an error when id is not found", async () => {
      const error = await getAsyncError<GeniallyNotExist>(async () => await repository.find("an-unexistent-id"));

      expect(error.message).toContain("an-unexistent-id");
    });
  });

  describe("delete", () => {
    it("should delete an existing Genially", async () => {
      const id = "delete-success-id";
      const genially = new Genially(id, "Name");
      await repository.save(genially);
      await repository.delete(id);
      const deletedGenially: Genially = await repository.find(id);

      expect(deletedGenially.deletedAt).toBeInstanceOf(Date);
    });

    it("should throw and exception when trying to erase an unknown genially", async () => {
      const id = "unknown-genially-id";
      const error = await getAsyncError<GeniallyNotExist>(async () => await repository.delete(id));

      expect(error.message).toContain(id);
    });
  });
});
