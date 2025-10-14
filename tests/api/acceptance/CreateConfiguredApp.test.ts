import request from "supertest";
import { createConfiguredApp } from "@api/create-configured-app";

describe("CreateConfiguredApp", () => {
  it("when skipPersistence=true, /genially is not wired (404)", async () => {
    // Arrange
    const { app, close } = await createConfiguredApp(undefined, { skipPersistence: true });

    // Act & Assert
    await request(app).post("/genially").send({ id: "a-random-id", name: "with-a-random-name" }).expect(404);

    await close();
  });
});
