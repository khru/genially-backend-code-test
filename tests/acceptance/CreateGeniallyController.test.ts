import request from "supertest";
import app from "../../src/api/app";

describe("Create Genially Controller", () => {
  it("POST / should return 201 status with a genially", async () => {
    const geniallyPayload = {
      id: "a-random-id",
      name: "A random genially user name",
      description: "A random genially description"
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

  it("POST / should return 400 when id is missing", async () => {
    const geniallyPayload = {
      name: "A random genially user name",
      description: "A random genially description"
    };

    const response = await request(app)
      .post("/genially")
      .send(geniallyPayload)
      .expect("Content-Type", /json/)
      .expect(400);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toContain("id");
  });
});
