import DeleteGeniallyService from "@application/DeleteGeniallyService";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import Genially from "@domain/Genially";
import { createFixedClock } from "@tests/shared/clock";

describe("DeleteGeniallyService", () => {
  it("delegates deletion to the repository", async () => {
    const repository = new InMemoryGeniallyRepository();
    const id = "delete-id";
    const genially = new Genially(createFixedClock(new Date("2024-05-05T12:34:56.789Z")), id, "Name");
    await repository.save(genially);
    const service = new DeleteGeniallyService(repository);

    await service.execute({ id: id });

    const stored = await repository.find(id);
    expect(stored.deletedAt).toBeInstanceOf(Date);
  });

  it("propagates GeniallyNotExist errors from the repository", async () => {
    const repository = new InMemoryGeniallyRepository();
    const service = new DeleteGeniallyService(repository);

    await expect(service.execute({ id: "missing-id" })).rejects.toThrow(GeniallyNotExist);
  });

  it("propagates GeniallyAlreadyDeleted errors from the repository", async () => {
    const repository = new InMemoryGeniallyRepository();
    const id = "deleted-id";
    const genially = new Genially(createFixedClock(new Date("2024-07-01T00:00:00.000Z")), id, "Name");
    await repository.save(genially);
    const service = new DeleteGeniallyService(repository);

    await service.execute({ id: id });

    await expect(service.execute({ id: id })).rejects.toThrow(GeniallyAlreadyDeleted);
  });
});
