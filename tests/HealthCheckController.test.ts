
import request from "supertest";
import app from "../src/api/app";

describe("Health Controller", () => {
  describe("GET /", () => {
    it("should return 200 status with ok message", async () => {
      const response = await request(app)
        .get("/")
        .expect("Content-Type", /json/)
        .expect(200);

      expect(response.body).toEqual({
        status: "ok"
      });
    });
  });
});
