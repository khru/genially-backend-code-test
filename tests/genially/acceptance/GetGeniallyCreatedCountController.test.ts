import { getAgent, stopAgent } from "@tests/shared/http";

describe("Metrics genially counter", () => {
  let agent: Awaited<ReturnType<typeof getAgent>>;

  beforeAll(async () => {
    agent = await getAgent();
  });
  afterAll(async () => {
    await stopAgent();
  });

  it("should return 0 when there is no genially created", async () => {
    const res = await agent
      .get("/metrics/genially/created")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual({created: 0});
  });

  it("should count 2 genially even if one is deleted", async () => {
    const firstId = "first-genially-id";
    await agent.post("/genially")
      .send({id: firstId, name: "first genially name"})
      .expect(201);

    await agent.post("/genially")
      .send({id: "second-genially-id", name: "second genially name"})
      .expect(201);

    await agent
      .delete(`/genially/${firstId}`)
      .expect(204);

    const res = await agent
      .get("/metrics/genially/created")
      .expect(200)
      .expect("Content-Type", /json/);

    expect(res.body).toEqual({created: 2});
  });
});
