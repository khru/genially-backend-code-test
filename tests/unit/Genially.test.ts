import Genially from "../../src/contexts/core/genially/domain/Genially";
import GeniallyValidationError from "../../src/contexts/core/genially/domain/GeniallyValidationError";

function getError<T extends Error>(fn: () => unknown): T {
  try {
    fn();
  } catch (e) {
    return e as T;
  }
  throw new Error("Expected function to throw");
}

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
      const err = getError<GeniallyValidationError>(() => new Genially("id", name));
      expect(err.errors).toEqual(
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
      const err = getError<GeniallyValidationError>(() =>
        new Genially("id", "ValidName", "a".repeat(126))
      );
      expect(err.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Description cannot exceed 125 characters"),
        ])
      );
    });
  });

  describe("multiple violations", () => {
    it("aggregates messages without relying on order", () => {
      const err = getError<GeniallyValidationError>(() =>
        new Genially("id", "ab", "a".repeat(126))
      );

      expect(err.errors).toHaveLength(2);
      expect(err.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("between 3 and 20 characters"),
          expect.stringContaining("Description cannot exceed 125 characters"),
        ])
      );
      expect(err.message).toContain("Validation failed:");
    });
  });
});
