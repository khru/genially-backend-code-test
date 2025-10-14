import { mapGeniallyError } from "@controllers/genially-error-mapper";
import GeniallyValidationError from "@domain/exception/GeniallyValidationError";
import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";

describe("mapGeniallyError", () => {
  it("returns 400 with error message and details when GeniallyValidationError occurs", () => {
    const error = new GeniallyValidationError(["Name is invalid"]);

    const result = mapGeniallyError(error);

    expect(result).toEqual({ status: 400, body: { error: error.message, details: error.errors } });
  });

  it("returns 400 with error message when InvalidGeniallyNameError occurs", () => {
    const error = new InvalidGeniallyNameError("Name cannot be empty");

    const result = mapGeniallyError(error);

    expect(result).toEqual({ status: 400, body: { error: error.message } });
  });

  it("returns 404 with error message when GeniallyNotExist occurs", () => {
    const error = new GeniallyNotExist("missing-id");

    const result = mapGeniallyError(error);

    expect(result).toEqual({ status: 404, body: { error: error.message } });
  });

  it("returns 412 with error message when GeniallyAlreadyDeleted occurs", () => {
    const error = new GeniallyAlreadyDeleted("deleted-id");

    const result = mapGeniallyError(error);

    expect(result).toEqual({ status: 412, body: { error: error.message } });
  });

  it("returns null when error is unrecognized", () => {
    const result = mapGeniallyError(new Error("boom"));

    expect(result).toBeNull();
  });
});
