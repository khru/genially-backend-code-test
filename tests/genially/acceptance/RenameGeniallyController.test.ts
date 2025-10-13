import { getAgent, stopAgent } from "@tests/shared/http";

describe("Rename Genially Controller", () => {
  let agent: Awaited<ReturnType<typeof getAgent>>;

  beforeAll(async () => {
    agent = await getAgent();
  });

  afterAll(async () => {
    await stopAgent();
  });

  it("PATCH /genially/:id renames an existing genially and sets modifiedAt (200)", async () => {
    // Arrange
    await agent
      .post("/genially")
      .send({id: "rename-success-id", name: "Old Name", description: "ok"})
      .expect(201);

    // Act
    const response = await agent
      .patch("/genially/rename-success-id")
      .send({name: "New Name"})
      .expect("Content-Type", /json/)
      .expect(200);

    // Assert
    expect(response.body).toEqual(
      expect.objectContaining({
        id: "rename-success-id",
        name: "New Name",
        description: "ok",
        createdAt: expect.any(String),
        modifiedAt: expect.any(String),
        deletedAt: null,
      })
    );
  });

  it("PATCH /genially/:id returns 400 when name is missing", async () => {
    // Arrange
    await agent.post("/genially").send({id: "rename-missing-name-id", name: "Old Name"}).expect(201);

    // Act
    const response = await agent
      .patch("/genially/rename-missing-name-id")
      .send({})
      .expect("Content-Type", /json/)
      .expect(400);

    // Assert
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/Field 'name' is required/i);
  });

  it.each([
    {case: "too short", payload: {name: "ab"}, match: /3.*20/i},
    {case: "too long", payload: {name: "a".repeat(21)}, match: /3.*20/i},
    {case: "empty string", payload: {name: ""}, match: /empty|name/i},
    {case: "whitespace only", payload: {name: "   "}, match: /empty|name/i},
  ])("PATCH /genially/:id returns 400 when name is invalid ($case)", async ({payload, match}) => {
    // Arrange
    await agent
      .post("/genially")
      .send({id: `rename-invalid-${payload.name || "blank"}-id`, name: "Old Name"})
      .expect(201);

    // Act
    const response = await agent
      .patch(`/genially/rename-invalid-${payload.name || "blank"}-id`)
      .send(payload)
      .expect("Content-Type", /json/)
      .expect(400);

    // Assert
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(match);
  });

  it("PATCH /genially/:id returns 404 when id does not exist", async () => {
    // Act
    const response = await agent
      .patch("/genially/non-existent-id-for-rename")
      .send({name: "Whatever"})
      .expect("Content-Type", /json/)
      .expect(404);

    // Assert
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/not.*found|does.*not.*exist/i);
  });

  it("PATCH /genially/:id returns 412 when the genially is already deleted", async () => {
    // Arrange
    await agent
      .post("/genially")
      .send({id: "rename-deleted-id", name: "Old Name"})
      .expect(201);

    await agent
      .delete("/genially/rename-deleted-id")
      .expect(204);

    // Act
    const response = await agent
      .patch("/genially/rename-deleted-id")
      .send({name: "New Name"})
      .expect("Content-Type", /json/)
      .expect(412);

    // Assert
    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/deleted|precondition/i);
  });
});
