import { configFrom } from "@configuration/config-from-env";
import type { Env } from "@configuration/env";

describe("ConfigFactory.from", () => {
  const givenEnv = (partial: Partial<Env> = {}): Env => partial as Env;

  it("returns and builds local URI without credentials when env is empty", () => {
    const appConfig = configFrom(givenEnv());
    expect(appConfig).toEqual({
      database: {
        uri: "mongodb://localhost:27017/genially",
        dbName: "genially",
        collection: "geniallies",
      },
    });
  });

  it("trims whitespace-only values and falls back to defaults", () => {
    const appConfig = configFrom(
      givenEnv({
        PERSISTENCE: "   ",
        MONGO_PORT: "   ",
        MONGO_DATABASE: "   ",
        MONGO_COLLECTION: "   ",
        MONGO_HOST: "   ",
      }),
    );

    expect(appConfig).toEqual(
      expect.objectContaining({
        database: expect.objectContaining({
          uri: "mongodb://localhost:27017/genially",
          dbName: "genially",
          collection: "geniallies",
        }),
      }),
    );
  });

  it("uses provided dbName and collection when non-empty", () => {
    const appConfig = configFrom(
      givenEnv({
        MONGO_DATABASE: "appdb",
        MONGO_COLLECTION: "items",
      }),
    );
    expect(appConfig.database.dbName).toBe("appdb");
    expect(appConfig.database.collection).toBe("items");
  });

  it.each([
    {
      title: "uses MONGO_URI verbatim and still exposes dbName and collection",
      env: {
        PERSISTENCE: "mongo",
        MONGO_URI: "mongodb://example:27018/customdb?replicaSet=rs0",
        MONGO_DATABASE: "customdb",
        MONGO_COLLECTION: "gny",
      },
      expectedUri: "mongodb://example:27018/customdb?replicaSet=rs0",
      expectedDb: "customdb",
      expectedCol: "gny",
    },
    {
      title: "ignores whitespace-only MONGO_URI and builds from pieces",
      env: { MONGO_URI: "   " },
      expectedUri: "mongodb://localhost:27017/genially",
      expectedDb: "genially",
      expectedCol: "geniallies",
    },
    {
      title: "trims spaces around MONGO_URI and uses the trimmed value",
      env: { MONGO_URI: "  mongodb://h:27017/d?x=1  " },
      expectedUri: "mongodb://h:27017/d?x=1",
      expectedDb: "genially",
      expectedCol: "geniallies",
    },
  ])("MONGO_URI override: $title", ({ env, expectedUri, expectedDb, expectedCol }) => {
    const appConfig = configFrom(givenEnv(env));
    expect(appConfig.database.uri).toBe(expectedUri);
    expect(appConfig.database.dbName).toBe(expectedDb);
    expect(appConfig.database.collection).toBe(expectedCol);
  });

  it.each([
    {
      title: "uses explicit MONGO_HOST when provided",
      env: { MONGO_HOST: "db.internal" },
      expectedUri: "mongodb://db.internal:27017/genially",
    },
    {
      title: "uses explicit MONGO_CONTAINER_NAME when host is not provided",
      env: { MONGO_CONTAINER_NAME: "mongo-svc" },
      expectedUri: "mongodb://mongo-svc:27017/genially",
    },
    {
      title: "uses default host when neither host nor container are provided",
      env: {},
      expectedUri: "mongodb://localhost:27017/genially",
    },
    {
      title: "ignores whitespace-only host and container then uses default",
      env: { MONGO_HOST: "   ", MONGO_CONTAINER_NAME: "   " },
      expectedUri: "mongodb://localhost:27017/genially",
    },
  ])("host precedence: $title", ({ env, expectedUri }) => {
    const appConfig = configFrom(givenEnv(env));
    expect(appConfig.database.uri).toBe(expectedUri);
  });

  it.each([
    {
      title: "includes credentials and authSource when both username and password are explicitly provided",
      env: { PERSISTENCE: "mongo", MONGO_USERNAME: "u", MONGO_PASSWORD: "p", MONGO_HOST: "h", MONGO_DATABASE: "d" },
      expectedUri: "mongodb://u:p@h:27017/d?authSource=admin",
    },
    {
      title: "omits credentials and authSource when only username is provided",
      env: { PERSISTENCE: "mongo", MONGO_USERNAME: "u", MONGO_HOST: "h", MONGO_DATABASE: "d" },
      expectedUri: "mongodb://h:27017/d",
    },
    {
      title: "omits credentials and authSource when only password is provided",
      env: { PERSISTENCE: "mongo", MONGO_PASSWORD: "p", MONGO_HOST: "h", MONGO_DATABASE: "d" },
      expectedUri: "mongodb://h:27017/d",
    },
    {
      title: "trims username and password before deciding to include credentials",
      env: { MONGO_USERNAME: "  user  ", MONGO_PASSWORD: "  pass  ", MONGO_HOST: "h", MONGO_DATABASE: "d" },
      expectedUri: "mongodb://user:pass@h:27017/d?authSource=admin",
    },
  ])("auth decision: $title", ({ env, expectedUri }) => {
    const appConfig = configFrom(givenEnv(env));
    expect(appConfig.database.uri).toBe(expectedUri);
  });

  it.each([
    {
      title: "uses explicit MONGO_AUTH_SOURCE when credentials are used",
      env: {
        MONGO_USERNAME: "u",
        MONGO_PASSWORD: "p",
        MONGO_HOST: "h",
        MONGO_DATABASE: "d",
        MONGO_AUTH_SOURCE: "users",
      },
      expectedUri: "mongodb://u:p@h:27017/d?authSource=users",
    },
    {
      title: "falls back to default MONGO_AUTH_SOURCE when missing",
      env: { MONGO_USERNAME: "u", MONGO_PASSWORD: "p", MONGO_HOST: "h", MONGO_DATABASE: "d" },
      expectedUri: "mongodb://u:p@h:27017/d?authSource=admin",
    },
    {
      title: "falls back to default MONGO_AUTH_SOURCE when whitespace",
      env: { MONGO_USERNAME: "u", MONGO_PASSWORD: "p", MONGO_HOST: "h", MONGO_DATABASE: "d", MONGO_AUTH_SOURCE: "   " },
      expectedUri: "mongodb://u:p@h:27017/d?authSource=admin",
    },
    {
      title: "does not append authSource when credentials are not used",
      env: { MONGO_AUTH_SOURCE: "users", MONGO_HOST: "h", MONGO_DATABASE: "d" },
      expectedUri: "mongodb://h:27017/d",
    },
  ])("auth source: $title", ({ env, expectedUri }) => {
    const appConfig = configFrom(givenEnv(env));
    expect(appConfig.database.uri).toBe(expectedUri);
  });

  it("should encode username and password in the URI", () => {
    const appConfig = configFrom(
      givenEnv({
        PERSISTENCE: "mongo",
        MONGO_USERNAME: "user@corp.com",
        MONGO_PASSWORD: "p@$$:word",
        MONGO_HOST: "host",
        MONGO_DATABASE: "d",
      }),
    );

    expect(appConfig.database.uri).toBe("mongodb://user%40corp.com:p%40%24%24%3Aword@host:27017/d?authSource=admin");
  });

  it("should respect MONGO_PORT override when building the URI", () => {
    const appConfig = configFrom(givenEnv({ MONGO_HOST: "h", MONGO_PORT: "27018", MONGO_DATABASE: "d" }));
    expect(appConfig.database.uri).toBe("mongodb://h:27018/d");
  });
});
