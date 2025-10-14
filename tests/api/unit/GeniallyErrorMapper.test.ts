import { Response } from "express";
import { handleGeniallyError } from "@controllers/genially-error-mapper";
import GeniallyValidationError from "@domain/exception/GeniallyValidationError";
import { InvalidGeniallyNameError } from "@domain/exception/InvalidGeniallyNameError";
import GeniallyNotExist from "@domain/exception/GeniallyNotExist";
import GeniallyAlreadyDeleted from "@domain/exception/GeniallyAlreadyDeleted";

const createResponse = () => {
  const res: Partial<Response> & { statusCode?: number; body?: unknown } = {};
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res as Response;
  }) as Response["status"];
  res.json = jest.fn((payload: unknown) => {
    res.body = payload;
    return res as Response;
  }) as Response["json"];
  return res as Response & { statusCode?: number; body?: unknown };
};

describe("handleGeniallyError", () => {
  it("handles GeniallyValidationError", () => {
    const res = createResponse();
    const error = new GeniallyValidationError(["Name is invalid"]);

    const handled = handleGeniallyError(res, error);

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: error.message, details: error.errors });
  });

  it("handles InvalidGeniallyNameError", () => {
    const res = createResponse();
    const error = new InvalidGeniallyNameError("Name cannot be empty");

    const handled = handleGeniallyError(res, error);

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  it("handles GeniallyNotExist", () => {
    const res = createResponse();
    const error = new GeniallyNotExist("missing-id");

    const handled = handleGeniallyError(res, error);

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  it("handles GeniallyAlreadyDeleted", () => {
    const res = createResponse();
    const error = new GeniallyAlreadyDeleted("deleted-id");

    const handled = handleGeniallyError(res, error);

    expect(handled).toBe(true);
    expect(res.status).toHaveBeenCalledWith(412);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  it("returns false for unknown errors", () => {
    const res = createResponse();

    const handled = handleGeniallyError(res, new Error("boom"));

    expect(handled).toBe(false);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
