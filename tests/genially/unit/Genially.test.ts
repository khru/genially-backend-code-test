import Genially, { type UpdatableGenially } from "@domain/Genially";
import { Clock } from "@domain/Clock";
import GeniallyValidationError from "@domain/exception/GeniallyValidationError";
import { getError } from "@tests/shared/ErrorHandler";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";
import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";
import { createDynamicClock, createFixedClock } from "@tests/shared/clock";

describe("Genially validations", () => {
  describe("name", () => {
    it.each([
      { name: "Valid Name", case: "letters and spaces" },
      { name: "abc", case: "exact lower bound 3" },
      { name: "a".repeat(20), case: "exact upper bound 20" },
    ])("accepts valid name: $case", ({ name }) => {
      expect(() => new Genially(createDynamicClock(), "id", name)).not.toThrow();
    });

    it.each([
      { name: "", case: "empty" },
      { name: "   ", case: "whitespace only" },
      { name: "ab", case: "too short 2" },
      { name: "a".repeat(21), case: "too long 21" },
    ])("rejects invalid name: $case", ({ name }) => {
      expect(() => new Genially(createDynamicClock(), "id", name)).toThrow(GeniallyValidationError);
    });

    it.each([
      { name: "ab", case: "below min length" },
      { name: "a".repeat(21), case: "above max length" },
    ])("includes the length rule when $case", ({ name }) => {
      const error = getError<GeniallyValidationError>(() => new Genially(createDynamicClock(), "id", name));
      expect(error.errors).toEqual(expect.arrayContaining([expect.stringContaining("between 3 and 20 characters")]));
    });
  });

  describe("description", () => {
    it.each([
      { label: "omitted", create: () => new Genially(createDynamicClock(), "id", "ValidName") },
      { label: "empty string", create: () => new Genially(createDynamicClock(), "id", "ValidName", "") },
      { label: "exactly 125", create: () => new Genially(createDynamicClock(), "id", "ValidName", "a".repeat(125)) },
    ])("accepts description: $label", ({ create }) => {
      expect(create).not.toThrow();
    });

    it("rejects description longer than 125", () => {
      const error = getError<GeniallyValidationError>(
        () => new Genially(createDynamicClock(), "id", "ValidName", "a".repeat(126)),
      );
      expect(error.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("Description cannot exceed 125 characters")]),
      );
    });
  });

  describe("multiple violations", () => {
    it("aggregates messages without relying on order", () => {
      const error = getError<GeniallyValidationError>(
        () => new Genially(createDynamicClock(), "id", "ab", "a".repeat(126)),
      );

      expect(error.errors).toHaveLength(2);
      expect(error.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("between 3 and 20 characters"),
          expect.stringContaining("Description cannot exceed 125 characters"),
        ]),
      );
      expect(error.message).toContain("Validation failed:");
    });

    it("uses a comma separator in the message and stable error name", () => {
      const error = getError<GeniallyValidationError>(
        () => new Genially(createDynamicClock(), "id", "ab", "a".repeat(126)),
      );
      // Strong assertions to kill mutants removing comma or renaming error
      expect(error.name).toBe("GeniallyValidationError");
      expect(error.message).toMatch(/, /); // there is a comma+space between aggregated messages
    });
  });

  describe("Genially.delete", () => {
    it("does not have a delete date by default", () => {
      const genially = new Genially(createDynamicClock(), "delete-default-state-id", "Valid Name");
      expect(genially.deletedAt).toBeUndefined();
    });

    it("sets a deletion date on the first delete call", () => {
      const genially = new Genially(createDynamicClock(), "delete-first-call-id", "Valid Name");

      genially.delete();

      expect(genially.deletedAt).toBeInstanceOf(Date);
    });

    it("throws GeniallyAlreadyDeleted when called a second time", () => {
      const genially = new Genially(createDynamicClock(), "delete-second-call-id", "Valid Name");
      genially.delete();

      expect(() => genially.delete()).toThrow(GeniallyAlreadyDeleted);
    });

    it("does not change the deletion date when delete is called again", () => {
      const genially = new Genially(createDynamicClock(), "delete-does-not-change-id", "Valid Name");
      genially.delete();
      const firstDeletionDate = genially.deletedAt;

      expect(() => genially.delete()).toThrow(GeniallyAlreadyDeleted);
      expect(genially.deletedAt).toBe(firstDeletionDate);
    });
  });

  describe("Genially.rename", () => {
    it("changes the name and sets a modification date", () => {
      const fixedDate = new Date("2024-10-10T10:10:10.000Z");
      const renameClock = createFixedClock(fixedDate);
      const genially = new Genially(renameClock, "rename-domain-id", "Old Name");
      expect(genially.modifiedAt).toBeUndefined();

      genially.rename("New Name");

      expect(renameClock.now).toHaveBeenCalledTimes(2);
      expect(genially.name).toBe("New Name");
      expect(genially.modifiedAt).toEqual(fixedDate);
    });

    it.each([
      { case: "too short", newName: "ab" },
      { case: "too long", newName: "a".repeat(21) },
      { case: "empty", newName: "" },
      { case: "whitespace", newName: "   " },
    ])("throws InvalidGeniallyNameError when name is invalid ($case)", ({ newName }) => {
      const genially = new Genially(createDynamicClock(), "rename-domain-invalid-id", "Old Name");
      expect(() => genially.rename(newName)).toThrow(InvalidGeniallyNameError);
    });

    it("throws GeniallyAlreadyDeleted if the genially is deleted", () => {
      const genially = new Genially(createDynamicClock(), "rename-domain-deleted-id", "Old Name");
      genially.delete();

      expect(() => genially.rename("New Name")).toThrow(GeniallyAlreadyDeleted);
    });
  });

  describe("Genially serialization", () => {
    it("should be able to convert a genially into an UpdatableGenially", () => {
      const creationDate = new Date("2024-11-01T00:00:00.000Z");
      const renameDate = new Date("2024-11-02T00:00:00.000Z");
      const deleteDate = new Date("2024-11-03T00:00:00.000Z");
      const clock: jest.Mocked<Clock> = { now: jest.fn() };
      clock.now.mockReturnValueOnce(creationDate).mockReturnValueOnce(renameDate).mockReturnValueOnce(deleteDate);

      const genially = new Genially(clock, "serialize-id", "Original Name", "Original description");

      genially.rename("Serialized Name");
      genially.delete();

      expect(genially.toPrimitives()).toStrictEqual({
        id: "serialize-id",
        name: "Serialized Name",
        description: "Original description",
        createdAt: creationDate,
        modifiedAt: renameDate,
        deletedAt: deleteDate,
      });
    });

    it("rehydrates an aggregate from primitives without losing information", () => {
      const primitives: UpdatableGenially = {
        id: "rehydrate-id",
        name: "Rehydrated Name",
        description: "Rehydrated description",
        createdAt: new Date("2024-12-01T08:00:00.000Z"),
        modifiedAt: new Date("2024-12-02T09:00:00.000Z"),
        deletedAt: new Date("2024-12-03T10:00:00.000Z"),
      };

      const rehydrated = Genially.fromPrimitives(createDynamicClock(), primitives);

      expect(rehydrated.id).toBe(primitives.id);
      expect(rehydrated.name).toBe(primitives.name);
      expect(rehydrated.description).toBe(primitives.description);
      expect(rehydrated.createdAt).toEqual(primitives.createdAt);
      expect(rehydrated.modifiedAt).toEqual(primitives.modifiedAt);
      expect(rehydrated.deletedAt).toEqual(primitives.deletedAt);
    });

    it("preserves undefined optional fields when serializing", () => {
      const genially = new Genially(createDynamicClock(), "serialize-undefined-id", "No description");

      const primitives = genially.toPrimitives();

      expect(primitives.description).toBeUndefined();
      expect(primitives.modifiedAt).toBeUndefined();
      expect(primitives.deletedAt).toBeUndefined();
    });
  });
});
