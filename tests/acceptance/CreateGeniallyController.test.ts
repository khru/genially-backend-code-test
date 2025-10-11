import request from "supertest";
import app from "../../src/api/app";

describe("Create Genially Controller", () => {
    it("POST / should return 201 status with a genially", async () => {
      const geniallyPayload = {
        id: "a-random-id",
        name: "A random genially user name",
        description: "Una descripción de prueba para el genially"
      };

      const response = await request(app)
        .post("/genially")
        .send(geniallyPayload)
        .expect("Content-Type", /json/)
        .expect(201);

      expect(response.body).toEqual(expect.objectContaining({
        id: expect.any(String),
        name: geniallyPayload.name,
        description: geniallyPayload.description,
        createdAt: expect.any(String),
        modifiedAt: null,
        deletedAt: null
      }));

    });
});
