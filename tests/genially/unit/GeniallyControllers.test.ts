import { Request, Response } from "express";
import { createGeniallyControllerFactory } from "@controllers/create-genially";
import { deleteGeniallyControllerFactory } from "@controllers/delete-genially";
import { renameGeniallyControllerFactory } from "@controllers/rename-genially";

type MockService<T extends (...args: never[]) => unknown> = {
  execute: T;
};

const createResponse = () => {
  const response: Partial<Response> & { statusCode?: number; body?: unknown } = {};
  response.status = jest.fn((code: number) => {
    response.statusCode = code;
    return response as Response;
  }) as Response["status"];
  response.json = jest.fn((payload: unknown) => {
    response.body = payload;
    return response as Response;
  }) as Response["json"];
  response.contentType = jest.fn(() => response as Response) as Response["contentType"];
  response.send = jest.fn(() => response as Response) as Response["send"];
  return response as Response & { statusCode?: number; body?: unknown };
};

describe("Genially controllers error handling", () => {
  it("CreateGeniallyController returns 500 on unexpected error", async () => {
    const service: MockService<(payload: unknown) => Promise<unknown>> = {
      execute: jest.fn().mockRejectedValue(new Error("boom")),
    };
    const controller = createGeniallyControllerFactory(service as never);

    const req = { body: { id: "id", name: "Name" } } as unknown as Request;
    const res = createResponse();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual(expect.objectContaining({ error: expect.stringContaining("Internal server error") }));
  });

  it("DeleteGeniallyController returns 500 on unexpected error", async () => {
    const service: MockService<(payload: unknown) => Promise<void>> = {
      execute: jest.fn().mockRejectedValue(new Error("boom")),
    };
    const controller = deleteGeniallyControllerFactory(service as never);

    const req = { params: { id: "id" } } as unknown as Request;
    const res = createResponse();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });

  it("RenameGeniallyController returns 500 on unexpected error", async () => {
    const service: MockService<(payload: unknown) => Promise<unknown>> = {
      execute: jest.fn().mockRejectedValue(new Error("boom")),
    };
    const controller = renameGeniallyControllerFactory(service as never);

    const req = { params: { id: "id" }, body: { name: "New Name" } } as unknown as Request;
    const res = createResponse();

    await controller(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.body).toEqual({ error: "Internal server error" });
  });
});
