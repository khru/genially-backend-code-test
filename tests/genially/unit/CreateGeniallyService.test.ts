import CreateGeniallyService from "@application/CreateGeniallyService";
import { GeniallyFactory } from "@application/GeniallyFactory";
import InMemoryGeniallyRepository from "@infrastructure/InMemoryGeniallyRepository";
import { createDynamicClock, createFixedClock } from "@tests/shared/clock";

describe("CreateGeniallyService", () => {
  it("uses the provided clock to set createdAt and modifiedAt remains undefined", async () => {
    const fixedDate = new Date("2024-01-01T00:00:00.000Z");
    const clock = createFixedClock(fixedDate);
    const repository = new InMemoryGeniallyRepository();
    const service = new CreateGeniallyService(new GeniallyFactory(clock), repository);
    const id = "id-clock";

    const genially = await service.execute({ id: id, name: "Clock Name" });

    expect(genially.createdAt).toEqual(fixedDate);
    expect(genially.modifiedAt).toBeUndefined();
    expect(genially.deletedAt).toBeUndefined();
    expect(await repository.find(id)).toEqual(genially);
  });

  it("accepts an optional description", async () => {
    const repository = new InMemoryGeniallyRepository();
    const clock = createDynamicClock();
    const service = new CreateGeniallyService(new GeniallyFactory(clock), repository);
    const id = "id-optional-description";

    const genially = await service.execute({ id: id, name: "Optional Description" });

    expect(genially.description).toBeUndefined();
    expect(await repository.find(id)).toEqual(genially);
  });
});
