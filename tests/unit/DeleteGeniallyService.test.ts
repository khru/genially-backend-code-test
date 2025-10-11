import InMemoryGeniallyRepository from "../../src/contexts/core/genially/infrastructure/InMemoryGeniallyRepository";
import GeniallyNotExist from "../../src/contexts/core/genially/domain/exception/GeniallyNotExist";
import DeleteGeniallyService from "../../src/contexts/core/genially/application/DeleteGeniallyService";
import Genially from "../../src/contexts/core/genially/domain/Genially";
import GeniallyAlreadyDeleted from "../../src/contexts/core/genially/domain/exception/GeniallyAlreadyDeleted";

describe("DeleteGeniallyService", () => {
  let repository: InMemoryGeniallyRepository;
  beforeEach(() => {
    repository = new InMemoryGeniallyRepository();
  });

  it("soft deletes an existing genially", async () => {
    await repository.save(new Genially("delete-service-success-id", "Name"));

    const service = new DeleteGeniallyService(repository);
    await service.execute({id: "delete-service-success-id"});

    const deletedGenially = await repository.find("delete-service-success-id");
    expect(deletedGenially.deletedAt).toBeInstanceOf(Date);
  });

  it("throws GeniallyNotExist when id does not exist", async () => {
    const service = new DeleteGeniallyService(repository);

    await expect(service.execute({id: "missing-id"}))
      .rejects.toBeInstanceOf(GeniallyNotExist);
  });

  it("throws GeniallyAlreadyDeleted when deleting twice", async () => {
    await repository.save(new Genially("already-deleted-id", "Name"));
    await repository.delete("already-deleted-id");

    const service = new DeleteGeniallyService(repository);
    await expect(service.execute({id: "already-deleted-id"}))
      .rejects.toBeInstanceOf(GeniallyAlreadyDeleted);
  });
});
