import type { OpenAPIV3 } from "openapi-types";

export const openApiDocument: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Genially API",
    version: "1.0.0",
    description: "API for creating, renaming and (soft) deleting geniallys.",
  },
  servers: [{ url: "/" }],
  tags: [{ name: "Genially", description: "Operations on genially resources" }],
  paths: {
    "/genially": {
      post: {
        tags: ["Genially"],
        summary: "Create a new genially",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateGeniallyRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Genially" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
    "/genially/{id}": {
      delete: {
        tags: ["Genially"],
        summary: "Soft delete a genially",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": { description: "No Content" },
          "404": { $ref: "#/components/responses/NotFound" },
          "412": {
            description: "Precondition Failed (already deleted)",
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
      patch: {
        tags: ["Genially"],
        summary: "Rename an existing genially",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RenameGeniallyRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Genially" },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
          "412": {
            description: "Precondition Failed (already deleted)",
          },
          "500": { $ref: "#/components/responses/InternalError" },
        },
      },
    },
  },
  components: {
    schemas: {
      Genially: {
        type: "object",
        required: ["id", "name", "createdAt"],
        properties: {
          id: { type: "string", example: "a-random-id" },
          name: { type: "string", minLength: 3, maxLength: 20 },
          description: { type: "string", nullable: true, maxLength: 125 },
          createdAt: { type: "string", format: "date-time" },
          modifiedAt: { type: "string", format: "date-time", nullable: true },
          deletedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      CreateGeniallyRequest: {
        type: "object",
        required: ["id", "name"],
        properties: {
          id: { type: "string" },
          name: { type: "string", minLength: 3, maxLength: 20 },
          description: { type: "string", nullable: true, maxLength: 125 },
        },
      },
      RenameGeniallyRequest: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 3, maxLength: 20 },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: { type: "array", items: { type: "string" } },
        },
      },
    },
    responses: {
      BadRequest: {
        description: "Bad Request",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      NotFound: {
        description: "Not Found",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
      InternalError: {
        description: "Internal Server Error",
        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
      },
    },
  },
};
