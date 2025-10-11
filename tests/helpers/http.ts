import request from "supertest";
import app from "../../src/api/app";

let agent: ReturnType<typeof request.agent>;

export async function getAgent() {
  if (!agent) {
    agent = request.agent(app);
  }
  return agent;
}
