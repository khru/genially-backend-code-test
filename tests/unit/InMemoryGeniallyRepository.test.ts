import InMemoryGeniallyRepository from "../../src/contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import Genially from "../../src/contexts/core/genially/domain/Genially";


describe("InMemoryGeniallyRepository", () => {
  let repository: InMemoryGeniallyRepository;

  beforeEach(() => {
    repository = new InMemoryGeniallyRepository();
  });

  // catching a bug on the fake implementation of the InMemoryGeniallyRepository
  // because it was not throwing an error when saving a genially because it was not initialized
  describe("save", () => {
    it("should save a new genially", async () => {
      const genially = new Genially("1", "Test Genially", "Test description");

      await expect(repository.save(genially)).rejects.toThrow();
    });

    it("should update existing genially when saving with same id", async () => {
      const genially1 = new Genially("1", "First Genially");
      const genially2 = new Genially("1", "Updated Genially");

      expect(await repository.save(genially1));
      expect(await repository.save(genially2)).toBe(genially2);
    });
  });

  describe("when geniallys array is not initialized", () => {
    it("should throw error when trying to delete from uninitialized array", async () => {
      expect(await repository.delete("non-existent-id")).toThrow();
    });

    it("should throw error when trying to save to uninitialized array", async () => {
      const genially = new Genially("1", "Test Genially", "Test description");

      await expect(repository.save(genially)).rejects.toThrow();
    });
  });


  describe("delete", () => {
    it("should throw error when deleting from uninitialized repository", async () => {
      await expect(repository.delete("non-existent-id")).rejects.toThrow();
    });
  });
});
