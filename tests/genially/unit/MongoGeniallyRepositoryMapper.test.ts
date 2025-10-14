import Genially from "@domain/Genially";
import { toDocument, fromDocument, type GeniallyDoc } from "@infrastructure/MongoGeniallyRepository";

describe("MongoGeniallyRepository mappers", () => {
  it("converts a genially into a persistence document", () => {
    const createdAt = new Date("2024-01-01T00:00:00.000Z");
    const modifiedAt = new Date("2024-02-01T00:00:00.000Z");
    const deletedAt = new Date("2024-03-01T00:00:00.000Z");
    const clock = { now: jest.fn() };
    clock.now.mockReturnValueOnce(createdAt);
    const genially = new Genially(clock, "doc-id", "Initial", "desc");
    clock.now.mockReturnValueOnce(modifiedAt);
    genially.rename("Renamed");
    clock.now.mockReturnValueOnce(deletedAt);
    genially.delete();

    const document = toDocument(genially);

    expect(document).toEqual({
      _id: "doc-id",
      name: "Renamed",
      description: "desc",
      createdAt,
      modifiedAt,
      deletedAt,
    });
  });

  it("maps null optional fields back to undefined", () => {
    const createdAt = new Date("2024-04-01T00:00:00.000Z");
    const doc: GeniallyDoc = {
      _id: "hydrated-id",
      name: "Hydrated",
      description: null,
      createdAt,
      modifiedAt: null,
      deletedAt: null,
    };
    const clock = { now: jest.fn(() => createdAt) };

    const genially = fromDocument(clock, doc);

    expect(genially.description).toBeUndefined();
    expect(genially.modifiedAt).toBeUndefined();
    expect(genially.deletedAt).toBeUndefined();
  });
});
