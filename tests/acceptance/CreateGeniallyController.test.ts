import { getAgent } from "../helpers/http";

describe("Create Genially Controller", () => {
  let agent: Awaited<ReturnType<typeof getAgent>>;
  beforeAll(async () => {
    agent = await getAgent();
  });

  it("POST / should return 201 status with a genially", async () => {
    const geniallyPayload = {
      id: "a-random-id",
      name: "A random name",
      description: "A random genially description",
    };

    const response = await agent.post("/genially").send(geniallyPayload).expect("Content-Type", /json/).expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: geniallyPayload.name,
        description: geniallyPayload.description,
        createdAt: expect.any(String),
        modifiedAt: null,
        deletedAt: null,
      }),
    );
  });

  describe("POST / should return 400 when pre-conditions are broken", () => {
    it("id is missing", async () => {
      const geniallyPayload = {
        name: "A random name",
        description: "A random genially description",
      };

      const response = await agent.post("/genially").send(geniallyPayload).expect("Content-Type", /json/).expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("id");
    });

    it("name is missing", async () => {
      const geniallyPayload = {
        id: "a-random-id",
        description: "A random genially description",
      };

      const response = await agent.post("/genially").send(geniallyPayload).expect("Content-Type", /json/).expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("name");
    });
  });

  describe("POST / should return 400 when business rules are broken", () => {
    it.each([
      {
        case: "name too short less than 3",
        payload: {
          id: "name-too-short-less-than-3-id",
          name: "ab",
          description: "Valid description",
        },
        expectRegex: /name.*3.*20|length.*3.*20/i,
      },
      {
        case: "name too long greater than 20",
        payload: {
          id: "name-too-long-greater-than-20-id",
          name: "a".repeat(21),
          description: "Valid description",
        },
        expectRegex: /name.*3.*20|length.*3.*20/i,
      },
      {
        case: "name whitespace only",
        payload: {
          id: "name-whitespace-only-id",
          name: "   ",
          description: "Valid description",
        },
        expectRegex: /name/i,
      },
      {
        case: "name empty string",
        payload: {
          id: "name-empty-string-id",
          name: "",
          description: "Valid description",
        },
        expectRegex: /name/i,
      },
      {
        case: "description too long greater than 125",
        payload: {
          id: "description-too-long-greater-than-125-id",
          name: "Valid Name",
          description: "a".repeat(126),
        },
        expectRegex: /description.*125|exceed.*125/i,
      },
    ])("$case", async ({ payload, expectRegex }) => {
      const res = await agent.post("/genially").send(payload).expect("Content-Type", /json/).expect(400);

      expect(res.body).toHaveProperty("error");
      expect(res.body.error).toMatch(expectRegex);
    });
  });
});
