import request from "supertest";
import { createConfiguredApp } from "@api/create-configured-app";

describe("Health Controller", () => {
  describe("GET /", () => {
    it("should return 200 status with ok message", async () => {
      const {app, close} = await createConfiguredApp(undefined, {skipPersistence: true});
      const response = await request(app).get("/").expect("Content-Type", /json/).expect(200);

      expect(response.body).toEqual({
        status: "ok",
      });
      await close();
    });
  });
});
