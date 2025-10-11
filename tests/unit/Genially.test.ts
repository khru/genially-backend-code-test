import Genially from "../../src/contexts/core/genially/domain/Genially";
import { getError } from "../helpers/ErrorHandler";
import GeniallyValidationError from "../../src/contexts/core/genially/domain/exception/GeniallyValidationError";
import GeniallyAlreadyDeleted from "../../src/contexts/core/genially/domain/exception/GeniallyAlreadyDeleted";
import { InvalidGeniallyNameError } from "../../src/contexts/core/genially/domain/exception/InvalidGeniallyNameError";


describe("Genially validations", () => {
  describe("name", () => {
    it.each([
      {name: "Valid Name", case: "letters and spaces"},
      {name: "abc", case: "exact lower bound 3"},
      {name: "a".repeat(20), case: "exact upper bound 20"},
    ])("accepts valid name: $case", ({name}) => {
      expect(() => new Genially("id", name)).not.toThrow();
    });

    it.each([
      {name: "", case: "empty"},
      {name: "   ", case: "whitespace only"},
      {name: "ab", case: "too short 2"},
      {name: "a".repeat(21), case: "too long 21"},
    ])("rejects invalid name: $case", ({name}) => {
      expect(() => new Genially("id", name)).toThrow(GeniallyValidationError);
    });

    it.each([
      {name: "ab", case: "below min length"},
      {name: "a".repeat(21), case: "above max length"},
    ])("includes the length rule when $case", ({name}) => {
      const error = getError<GeniallyValidationError>(() => new Genially("id", name));
      expect(error.errors).toEqual(
        expect.arrayContaining([expect.stringContaining("between 3 and 20 characters")])
      );
    });
  });

  describe("description", () => {
    it.each([
      {label: "omitted", create: () => new Genially("id", "ValidName")},
      {label: "empty string", create: () => new Genially("id", "ValidName", "")},
      {label: "exactly 125", create: () => new Genially("id", "ValidName", "a".repeat(125))},
    ])("accepts description: $label", ({create}) => {
      expect(create).not.toThrow();
    });

    it("rejects description longer than 125", () => {
      const error = getError<GeniallyValidationError>(() =>
        new Genially("id", "ValidName", "a".repeat(126))
      );
      expect(error.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Description cannot exceed 125 characters"),
        ])
      );
    });
  });

  describe("multiple violations", () => {
    it("aggregates messages without relying on order", () => {
      const error = getError<GeniallyValidationError>(() =>
        new Genially("id", "ab", "a".repeat(126))
      );

      expect(error.errors).toHaveLength(2);
      expect(error.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("between 3 and 20 characters"),
          expect.stringContaining("Description cannot exceed 125 characters"),
        ])
      );
      expect(error.message).toContain("Validation failed:");
    });
  });

  describe("Genially.delete", () => {
    it("does not have a delete date by default", () => {
      const genially = new Genially("delete-default-state-id", "Valid Name");
      expect(genially.deletedAt).toBeUndefined();
    });

    it("sets a deletion date on the first delete call", () => {
      const genially = new Genially("delete-first-call-id", "Valid Name");

      genially.delete();

      expect(genially.deletedAt).toBeInstanceOf(Date);
    });

    it("throws GeniallyAlreadyDeleted when called a second time", () => {
      const genially = new Genially("delete-second-call-id", "Valid Name");
      genially.delete();

      expect(() => genially.delete()).toThrow(GeniallyAlreadyDeleted);
    });

    it("does not change the deletion date when delete is called again", () => {
      const genially = new Genially("delete-does-not-change-id", "Valid Name");
      genially.delete();
      const firstDeletionDate = genially.deletedAt;

      expect(() => genially.delete()).toThrow(GeniallyAlreadyDeleted);
      expect(genially.deletedAt).toBe(firstDeletionDate);
    });
  });

  describe("Genially.rename", () => {
    it("changes the name and sets a modification date", () => {
      const genially = new Genially("rename-domain-id", "Old Name");
      expect(genially.modifiedAt).toBeUndefined();

      genially.rename("New Name");

      expect(genially.name).toBe("New Name");
      expect(genially.modifiedAt).toBeInstanceOf(Date);
    });

    it.each([
      {case: "too short", newName: "ab"},
      {case: "too long", newName: "a".repeat(21)},
      {case: "empty", newName: ""},
      {case: "whitespace", newName: "   "},
    ])("throws InvalidGeniallyNameError when name is invalid ($case)", ({newName}) => {
      const genially = new Genially("rename-domain-invalid-id", "Old Name");
      expect(() => genially.rename(newName)).toThrow(InvalidGeniallyNameError);
    });

    it("throws GeniallyAlreadyDeleted if the genially is deleted", () => {
      const genially = new Genially("rename-domain-deleted-id", "Old Name");
      genially.delete();

      expect(() => genially.rename("New Name")).toThrow(GeniallyAlreadyDeleted);
    });
  });
});
