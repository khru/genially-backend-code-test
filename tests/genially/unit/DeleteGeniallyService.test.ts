import DeleteGeniallyService from "@application/DeleteGeniallyService";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import { createGeniallyRepositoryDouble } from "@tests/shared/geniallyRepositoryDouble";

describe("DeleteGeniallyService", () => {
  it("delegates deletion to the repository", async () => {
    const deleteFn = jest.fn().mockResolvedValue(undefined);
    const repository = createGeniallyRepositoryDouble({ delete: deleteFn });
    const service = new DeleteGeniallyService(repository);

    await service.execute({ id: "delete-id" });

    expect(deleteFn).toHaveBeenCalledWith("delete-id");
  });

  it("propagates GeniallyNotExist errors from the repository", async () => {
    const repository = createGeniallyRepositoryDouble({
      delete: jest.fn().mockRejectedValue(new GeniallyNotExist("missing-id")),
    });
    const service = new DeleteGeniallyService(repository);

    await expect(service.execute({ id: "missing-id" })).rejects.toThrow(GeniallyNotExist);
    expect(repository.delete).toHaveBeenCalledWith("missing-id");
  });

  it("propagates GeniallyAlreadyDeleted errors from the repository", async () => {
    const repository = createGeniallyRepositoryDouble({
      delete: jest.fn().mockRejectedValue(new GeniallyAlreadyDeleted("deleted-id")),
    });
    const service = new DeleteGeniallyService(repository);

    await expect(service.execute({ id: "deleted-id" })).rejects.toThrow(GeniallyAlreadyDeleted);
  });
});
