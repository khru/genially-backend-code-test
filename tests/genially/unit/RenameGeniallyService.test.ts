import RenameGeniallyService from "@application/RenameGeniallyService";
import Genially from "@domain/Genially";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import { createGeniallyRepositoryDouble } from "@tests/shared/geniallyRepositoryDouble";
import { createFixedClock } from "@tests/shared/clock";

describe("RenameGeniallyService", () => {
  it("delegates rename to the aggregate, updating modifiedAt with the aggregate clock", async () => {
    const fixedDate = new Date("2024-08-08T08:08:08.000Z");
    const original = new Genially(createFixedClock(fixedDate), "rename-id", "old Name");
    const repository = createGeniallyRepositoryDouble({
      find: jest.fn().mockResolvedValue(original),
      save: jest.fn(),
    });
    const service = new RenameGeniallyService(repository);

    const renamed = await service.execute({ id: "rename-id", name: "new Name" });

    expect(repository.find).toHaveBeenCalledWith("rename-id");
    expect(repository.save).toHaveBeenCalledWith(original);
    expect(renamed.modifiedAt).toEqual(fixedDate);
    expect(renamed.name).toBe("new Name");
  });

  it("propagates GeniallyNotExist if repository throws", async () => {
    const missingId = "missing-id";
    const repository = createGeniallyRepositoryDouble({
      find: jest.fn().mockRejectedValue(new GeniallyNotExist(missingId)),
    });
    const service = new RenameGeniallyService(repository);

    await expect(service.execute({ id: missingId, name: "Whatever" })).rejects.toThrow(GeniallyNotExist);
  });
});
