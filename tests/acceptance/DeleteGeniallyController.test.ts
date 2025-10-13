import { getAgent, stopAgent } from "@tests/helpers/http";

describe("Delete Genially Controller", () => {
  let agent: Awaited<ReturnType<typeof getAgent>>;

  beforeAll(async () => {
    agent = await getAgent();
  });

  afterAll(async () => {
    await stopAgent();
  });

  it("DELETE /genially/:id returns 204 when genially exists", async () => {
    await agent
      .post("/genially")
      .send({id: "delete-success-id", name: "To delete", description: "ok"})
      .expect(201);

    await agent
      .delete("/genially/delete-success-id")
      .expect(204);
  });

  it("DELETE /genially/:id returns 404 when id does not exist", async () => {
    const response = await agent
      .delete("/genially/non-existent-id")
      .expect("Content-Type", /json/)
      .expect(404);

    expect(response.body).toHaveProperty("error");
    expect(response.body.error).toMatch(/not.*found|does.*not.*exist/i);
  });

  it("DELETE /genially/:id returns 412 when already deleted", async () => {
    await agent
      .post("/genially")
      .send({id: "delete-already-deleted-id", name: "To delete twice"})
      .expect(201);

    await agent
      .delete("/genially/delete-already-deleted-id")
      .expect(204);

    const res = await agent
      .delete("/genially/delete-already-deleted-id")
      .expect("Content-Type", /json/)
      .expect(412);

    expect(res.body).toHaveProperty("error");
    expect(res.body.error).toMatch(/already.*deleted|precondition/i);
  });
});
