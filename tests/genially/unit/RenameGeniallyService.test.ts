import RenameGeniallyService from "@application/RenameGeniallyService";
import Genially from "@domain/Genially";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import { createFixedClock } from "@tests/shared/clock";

describe("RenameGeniallyService", () => {
  it("delegates rename to the aggregate, updating modifiedAt with the aggregate clock", async () => {
    const fixedDate = new Date("2024-08-08T08:08:08.000Z");
    const clock = createFixedClock(fixedDate);
    const original = new Genially(clock, "rename-id", "old Name");
    const repository = new InMemoryGeniallyRepository();
    await repository.save(original);
    const service = new RenameGeniallyService(repository);

    const renamed = await service.execute({ id: "rename-id", name: "new Name" });

    expect(renamed.modifiedAt).toEqual(fixedDate);
    expect(renamed.name).toBe("new Name");
  });

  it("propagates GeniallyNotExist if repository throws", async () => {
    const repository = new InMemoryGeniallyRepository();
    const service = new RenameGeniallyService(repository);

    await expect(service.execute({ id: "missing-id", name: "Whatever" })).rejects.toThrow(GeniallyNotExist);
  });
});
