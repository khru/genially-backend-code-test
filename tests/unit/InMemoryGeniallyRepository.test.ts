import InMemoryGeniallyRepository from "../../src/contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import Genially from "../../src/contexts/core/genially/domain/Genially";
import { getAsyncError } from "../helpers/ErrorHandler";
import GeniallyNotExist from "../../src/contexts/core/genially/domain/GeniallyNotExist";


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
      const error = await getAsyncError<GeniallyNotExist>(async () =>
        await repository.find("an-unexistent-id")
      );

      expect(error.message).toContain("an-unexistent-id");
    });
  });
});
