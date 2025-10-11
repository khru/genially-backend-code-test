// tests/acceptance/DeleteGeniallyController.test.ts
import { getAgent } from "../helpers/http";

describe("Delete Genially Controller", () => {
  let agent: Awaited<ReturnType<typeof getAgent>>;

  beforeAll(async () => {
    agent = await getAgent();
  });

  it("DELETE /genially/:id returns 204 when genially exists", async () => {
    // Arrange: create first
    await agent
      .post("/genially")
      .send({id: "delete-success-id", name: "To delete", description: "ok"})
      .expect(201);

    // Act
    await agent
      .delete("/genially/delete-success-id")
      .expect(204);
  });

});
