jest.mock("crypto", () => ({
  randomUUID: jest.fn(),
}));

import { Request, Response } from "express";
import { correlationId } from "@api/middleware/correlation-id";
import { randomUUID } from "crypto";

const randomUUIDMock = randomUUID as jest.MockedFunction<typeof randomUUID>;

const createResponse = () => {
  const response: Partial<Response> & { locals: { correlationId?: string }; headers: Record<string, string> } = {
    locals: {},
    headers: {},
  };
  response.setHeader = jest.fn((key: string, value: string) => {
    response.headers[key] = value;
    return response as Response;
  }) as unknown as Response["setHeader"];
  return response as Response<unknown, { correlationId: string }> & {
    headers: Record<string, string>;
  };
};

const createRequest = (headerValue: string | undefined = undefined) =>
  ({
    header: jest.fn(() => headerValue),
  }) as unknown as Request;

afterEach(() => {
  randomUUIDMock.mockReset();
});

describe("correlationId middleware", () => {
  it("generates a correlation id when header is missing", () => {
    randomUUIDMock.mockReturnValue("12345678-1234-4321-abcd-123456789abc" as ReturnType<typeof randomUUID>);
    const req = createRequest();
    const res = createResponse();
    const next = jest.fn();

    correlationId(req, res, next);

    expect(randomUUIDMock).toHaveBeenCalled();
    expect(res.headers["x-correlation-id"]).toBe("12345678-1234-4321-abcd-123456789abc");
    expect(res.locals.correlationId).toBe("12345678-1234-4321-abcd-123456789abc");
    expect(next).toHaveBeenCalled();
  });

  it("uses the provided header when non-empty", () => {
    const req = createRequest("incoming-id");
    const res = createResponse();
    const next = jest.fn();

    correlationId(req, res, next);

    expect(randomUUIDMock).not.toHaveBeenCalled();
    expect(res.headers["x-correlation-id"]).toBe("incoming-id");
    expect(res.locals.correlationId).toBe("incoming-id");
    expect(next).toHaveBeenCalled();
  });

  it("drops whitespace-only header and generates a new id", () => {
    randomUUIDMock.mockReturnValue("12345678-1234-4321-abcd-123456789abd" as ReturnType<typeof randomUUID>);
    const req = createRequest("");
    const res = createResponse();
    const next = jest.fn();

    correlationId(req, res, next);

    expect(randomUUIDMock).toHaveBeenCalled();
    expect(res.headers["x-correlation-id"]).toBe("12345678-1234-4321-abcd-123456789abd");
    expect(res.locals.correlationId).toBe("12345678-1234-4321-abcd-123456789abd");
    expect(next).toHaveBeenCalled();
  });
});
