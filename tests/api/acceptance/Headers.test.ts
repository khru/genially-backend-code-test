import request from "supertest";
import { createConfiguredApp } from "@api/create-configured-app";

describe("Headers", () => {
  it("GET / returns X-Frame-Options: SAMEORIGIN and correlation", async () => {
    // Arrange
    const {app, close} = await createConfiguredApp(undefined, {skipPersistence: true});

    // Act
    const res = await request(app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200);

    // Assert
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["x-correlation-id"]).toBeDefined();

    await close();
  });
});
