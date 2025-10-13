import request from "supertest";
import { createConfiguredApp } from "@api/create-configured-app";

let agent: ReturnType<typeof request.agent>;

export async function getAgent() {
  const { app, close } = await createConfiguredApp();
  try {
    if (!agent) {
      agent = request.agent(app);
    }
    return agent;
  } catch (error) {
    console.error("Error during the creation of the agent:", error);
    await close();
  }
}
