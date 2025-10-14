import { Request, Response } from "express";
import { createGeniallyControllerFactory } from "@controllers/create-genially";
import { deleteGeniallyControllerFactory } from "@controllers/delete-genially";
import { renameGeniallyControllerFactory } from "@controllers/rename-genially";

type MockService<T extends (...args: never[]) => unknown> = {
  execute: T;
};

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
  res.contentType = jest.fn(() => res as Response) as Response["contentType"];
  res.send = jest.fn(() => res as Response) as Response["send"];
  return res as Response & { statusCode?: number; body?: unknown };
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
