import CreateGeniallyService from "@application/CreateGeniallyService";
import { createGeniallyRepositoryDouble } from "@tests/shared/geniallyRepositoryDouble";

describe("CreateGeniallyService", () => {
  it("uses the provided clock to set createdAt and modifiedAt remains undefined", async () => {
    const repository = createGeniallyRepositoryDouble();
    const fixedDate = new Date("2024-01-01T00:00:00.000Z");
    const clock = { now: jest.fn(() => fixedDate) };
    const service = new CreateGeniallyService(clock, repository);

    const genially = await service.execute({ id: "id-clock", name: "Clock Name" });

    expect(genially.createdAt).toEqual(fixedDate);
    expect(genially.modifiedAt).toBeUndefined();
    expect(genially.deletedAt).toBeUndefined();
    expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ id: "id-clock" }));
  });

  it("accepts an optional description", async () => {
    const repository = createGeniallyRepositoryDouble();
    repository.save.mockImplementation(async () => Promise.resolve());
    const clock = { now: jest.fn(() => new Date("2024-02-02T00:00:00.000Z")) };
    const service = new CreateGeniallyService(clock, repository);

    const genially = await service.execute({ id: "id-optional-description", name: "Optional Description" });

    expect(genially.description).toBeUndefined();
  });
});
